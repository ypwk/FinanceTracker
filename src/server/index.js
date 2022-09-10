// Imports
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const util = require('util');
const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const cors = require('cors');
const fs = require('fs');
const { Keys } = require('./auth/config');

// Variable Initialization
const { PLAID_CLIENT_ID } = Keys();
const { PLAID_SECRET } = Keys();
const { PLAID_ENV } = Keys();
const PLAID_PRODUCTS = Keys().PLAID_PRODUCTS.split(',');
const PLAID_COUNTRY_CODES = Keys().PLAID_COUNTRY_CODES.split(',');
const { PLAID_REDIRECT_URI } = Keys();
const PLAID_CLT_PRODUCTS = Keys().PLAID_CLT_PRODUCTS.split(',');
const APP_PORT = PLAID_REDIRECT_URI.split(':')[2];

let ACCESS_TOKEN = null;
let PUBLIC_TOKEN = null;
let ITEM_ID = null;

let count = 0;

// Plaid Client Initialization
const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
      'Plaid-Version': '2020-09-14',
    },
  },
});
const client = new PlaidApi(configuration);

const app = express();
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());
app.use(cors());

// Util Functions
const prettyPrintResponse = (response) => {
  console.log(util.inspect(response.data, { colors: true, depth: 4 }));
};

const formatError = (error) => {
  return {
    error: { ...error.data, status_code: error.status },
  };
};

// This is a helper function to poll for the completion of an Asset Report and
// then send it in the response to the client. Alternatively, you can provide a
// webhook in the `options` object in your `/asset_report/create` request to be
// notified when the Asset Report is finished being generated.

const getAssetReportWithRetries = (
  plaidClient,
  asset_report_token,
  ms = 1000,
  retriesLeft = 20
) =>
  new Promise((resolve, reject) => {
    const request = {
      asset_report_token,
    };

    plaidClient
      .assetReportGet(request)
      .then(resolve)
      .catch(() => {
        setTimeout(() => {
          if (retriesLeft === 1) {
            reject(
              new Error('Ran out of retries while polling for asset report')
            );
            return;
          }
          // eslint-disable-next-line promise/no-nesting
          getAssetReportWithRetries(
            plaidClient,
            asset_report_token,
            ms,
            retriesLeft - 1
          )
            .then(resolve)
            .catch((e) => {
              return formatError(e);
            });
        }, ms);
      });
  });

// Server Endpoints
app.get('/', function (request, response, next) {
  response.send({
    express: count,
  });
  count += 1;
});

app.post('/api/info', function (request, response, next) {
  console.log(request.body);
  ACCESS_TOKEN = request.body.access_token;
  ITEM_ID = request.body.item_id;
  console.log(`set access token: ${ACCESS_TOKEN}, ${ITEM_ID}`);
  response.json({
    item_id: ITEM_ID,
    access_token: ACCESS_TOKEN,
    products: PLAID_PRODUCTS,
  });
});

// Create a link token with configs which we can then use to initialize Plaid Link client-side.
// See https://plaid.com/docs/#create-link-token
app.post('/api/create_link_token', function (request, response, next) {
  Promise.resolve()
    .then(async function createToken() {
      const configs = {
        user: {
          // This field corresponds to a unique identifier for a user.
          // It is just me, so this is fine.
          client_user_id: 'kwu-user',
        },
        client_name: 'YPWK Finance App',
        products: PLAID_CLT_PRODUCTS,
        country_codes: PLAID_COUNTRY_CODES,
        language: 'en',
      };

      const createTokenResponse = await client.linkTokenCreate(configs);
      prettyPrintResponse(createTokenResponse);
      response.json(createTokenResponse.data);
      return '200';
    })
    .catch(next);
});

// Exchange token flow - exchange a Link public_token for
// an API access_token
// https://plaid.com/docs/#exchange-token-flow
app.post('/api/set_access_token', function (request, response, next) {
  PUBLIC_TOKEN = request.body.public_token;
  Promise.resolve()
    .then(async function () {
      const tokenResponse = await client.itemPublicTokenExchange({
        public_token: PUBLIC_TOKEN,
      });
      prettyPrintResponse(tokenResponse);
      ACCESS_TOKEN = tokenResponse.data.access_token;
      ITEM_ID = tokenResponse.data.item_id;
      response.json({
        access_token: tokenResponse.data.access_token,
        item_id: tokenResponse.data.item_id,
        error: null,
      });
      return '200';
    })
    .catch(next);
});

// Retrieve ACH or ETF Auth data for an Item's accounts
// https://plaid.com/docs/#auth
app.get('/api/auth', function (request, response, next) {
  Promise.resolve()
    .then(async function () {
      const authResponse = await client.authGet({
        access_token: ACCESS_TOKEN,
      });
      prettyPrintResponse(authResponse);
      response.json(authResponse.data);
      return '200';
    })
    .catch(next);
});

// Retrieve Transactions for an Item
// https://plaid.com/docs/#transactions
app.get('/api/transactions', function (request, response, next) {
  Promise.resolve()
    .then(async function () {
      // Set cursor to empty to receive all historical updates
      let cursor = null;

      // New transaction updates since "cursor"
      let added = [];
      let modified = [];
      // Removed transaction ids
      let removed = [];
      let hasMore = true;
      // Iterate through each page of new transaction updates for item
      while (hasMore) {
        const transactionSyncRequest = {
          access_token: ACCESS_TOKEN,
          cursor,
        };
        // eslint-disable-next-line no-await-in-loop
        const transactionSyncResponse = await client.transactionsSync(
          transactionSyncRequest
        );
        const { data } = transactionSyncResponse;
        // Add this page of results
        added = added.concat(data.added);
        modified = modified.concat(data.modified);
        removed = removed.concat(data.removed);
        hasMore = data.has_more;
        // Update cursor to the next cursor
        cursor = data.next_cursor;
        prettyPrintResponse(transactionSyncResponse);
      }

      const compareTxnsByDateAscending = (a, b) =>
        (a.date > b.date) - (a.date < b.date);
      // Return the 8 most recent transactions
      const recentlyAdded = [...added].sort(compareTxnsByDateAscending);
      response.json({ latest_transactions: recentlyAdded });

      return '200';
    })
    .catch(next);
});

// Retrieve Identity for an Item
// https://plaid.com/docs/#identity
app.get('/api/identity', function (request, response, next) {
  Promise.resolve()
    .then(async function () {
      const identityResponse = await client.identityGet({
        access_token: ACCESS_TOKEN,
      });
      prettyPrintResponse(identityResponse);
      response.json({ identity: identityResponse.data.accounts });
      return '200';
    })
    .catch(next);
});

// Retrieve real-time Balances for each of an Item's accounts
// https://plaid.com/docs/#balance
app.get('/api/balance', function (request, response, next) {
  Promise.resolve()
    .then(async function () {
      const balanceResponse = await client.accountsBalanceGet({
        access_token: ACCESS_TOKEN,
      });
      prettyPrintResponse(balanceResponse);
      response.json(balanceResponse.data);
      return '200';
    })
    .catch(next);
});

// Retrieve information about an Item
// https://plaid.com/docs/#retrieve-item
app.get('/api/item', function (request, response, next) {
  Promise.resolve()
    .then(async function () {
      // Pull the Item - this includes information about available products,
      // billed products, webhook information, and more.
      const itemResponse = await client.itemGet({
        access_token: ACCESS_TOKEN,
      });
      // Also pull information about the institution
      const configs = {
        institution_id: itemResponse.data.item.institution_id,
        country_codes: ['US'],
      };
      const instResponse = await client.institutionsGetById(configs);
      prettyPrintResponse(itemResponse);
      response.json({
        item: itemResponse.data.item,
        institution: instResponse.data.institution,
      });
      return '200';
    })
    .catch(next);
});

// Retrieve an Item's accounts
// https://plaid.com/docs/#accounts
app.get('/api/accounts', function (request, response, next) {
  Promise.resolve()
    .then(async function () {
      const accountsResponse = await client.accountsGet({
        access_token: ACCESS_TOKEN,
      });
      prettyPrintResponse(accountsResponse);
      response.json(accountsResponse.data);
      return '200';
    })
    .catch(next);
});

app.use('/api', function (error, request, response, next) {
  prettyPrintResponse(error.response);
  response.json(formatError(error.response));
});

const server = app.listen(APP_PORT, function () {
  console.log(`Backend listening on port ${APP_PORT}`);
});
