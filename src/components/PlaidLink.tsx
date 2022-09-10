import React, { useCallback, useState } from 'react';
import { usePlaidLink, PlaidLinkOnSuccess } from 'react-plaid-link';
import { Keys } from 'server/auth/config';
import StorageUtils from 'utils/storage';

interface PlaidLinkProps {
  storageUtil: StorageUtils;
}

/**
 * PlaidLink is a button that handles the initial verification process for registering items with Plaid.
 * It is written with a functional class structure.
 */
const PlaidLink = (props: PlaidLinkProps) => {
  const [token, setToken] = useState<string | null>(null);
  const { PLAID_REDIRECT_URI } = Keys();
  const { storageUtil } = props;

  /**
   * Get link token onComponentMount()
   */
  React.useEffect(() => {
    const createLinkToken = async () => {
      fetch(`${PLAID_REDIRECT_URI}/api/create_link_token`, {
        method: 'POST',
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Connection to Backend failed.');
        })
        .then((responseJSON) => {
          setToken(responseJSON.link_token);
          return '200';
        })
        .catch((error) => {
          console.log(error);
        });
    };
    createLinkToken();
  }, [PLAID_REDIRECT_URI]);

  /**
   * Use callback with public token to get persistent item_id and access_token for your financial institution.
   */
  const onSuccess = useCallback<PlaidLinkOnSuccess>(
    (publicToken, metadata) => {
      const sendPublicToken = async () => {
        console.log(publicToken);
        const response = await fetch(
          `${PLAID_REDIRECT_URI}/api/set_access_token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
            body: `public_token=${publicToken}`,
          }
        );
        const resJSON = await response.json();
        if (resJSON.item_id != null && resJSON.access_token != null) {
          storageUtil.itemAccess.push([resJSON.item_id, resJSON.access_token]);
          storageUtil.saveData();
        }
      };
      sendPublicToken();
    },
    [PLAID_REDIRECT_URI, storageUtil]
  );

  const { open, ready } = usePlaidLink({
    token,
    onSuccess,
    // onEvent
    // onExit
  });

  return (
    <div>
      <button type="button" onClick={() => open()} disabled={!ready}>
        Connect a bank account
      </button>
      <p>{JSON.stringify(storageUtil.itemAccess)}</p>
    </div>
  );
};

export default PlaidLink;
