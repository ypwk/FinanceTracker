const Keys = () => {
  return {
    PLAID_CLIENT_ID: '630d7f4f14acc700148c2545',
    PLAID_SECRET: '678dfc6196fa66f1a12f727dea1c04',
    PLAID_ENV: 'development',
    PLAID_PRODUCTS: 'auth,transactions,balance',
    PLAID_CLT_PRODUCTS: 'auth,transactions',
    PLAID_COUNTRY_CODES: 'US',
    PLAID_REDIRECT_URI: 'http://localhost:8000',
  };
};

exports.Keys = Keys;
