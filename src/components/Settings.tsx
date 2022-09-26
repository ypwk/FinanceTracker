import React, { Component } from 'react';
import StorageUtils from 'utils/storage';
import { Keys } from 'server/auth/config';

import styled from 'styled-components';

import Navi from './Navi';
import PlaidLink from './PlaidLink';

const VertJust = styled.div`
  display: flex;
  align-items: center;
`;

interface SettingsProps {
  storageUtil: StorageUtils;
}

interface SettingsState {
  data: string;
}
// eslint-disable-next-line react/prefer-stateless-function
class Settings extends Component<SettingsProps, SettingsState> {
  storageUtil: StorageUtils;

  PLAID_REDIRECT_URI: string;

  constructor(props: SettingsProps) {
    super(props);
    this.storageUtil = props.storageUtil;

    this.PLAID_REDIRECT_URI = Keys().PLAID_REDIRECT_URI;

    this.testAuth = this.testAuth.bind(this);
  }

  testAuth() {
    const getAccessToken = (ii: string) => {
      for (let x = 0; x < this.storageUtil.itemAccess.length; x += 1) {
        if (this.storageUtil.itemAccess[x].itemId === ii) {
          return this.storageUtil.itemAccess[x].accessToken;
        }
      }
      return '';
    };

    const setAccessDetails = async (at: string, ii: string) => {
      const selectedTokens = {
        access_token: at,
        item_id: ii,
      };
      const response = await fetch(`${this.PLAID_REDIRECT_URI}/api/info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedTokens),
      });
      const resJSON = await response.json();
      return resJSON;
    };

    const getIden = async () => {
      const response = await fetch(`${this.PLAID_REDIRECT_URI}/api/identity`, {
        method: 'GET',
      });
      const resJSON = await response.json();
      return resJSON;
    };

    for (let i = 0; i < this.storageUtil.finInfo.length; i += 1) {
      const currentAccessToken = getAccessToken(
        this.storageUtil.finInfo[i].itemId
      );
      setAccessDetails(currentAccessToken, this.storageUtil.finInfo[i].itemId);
      getIden()
        .then((identity) => {
          console.log(identity);
          return '200';
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  render() {
    return (
      <div>
        <Navi message="Settings" />
        <div className="container" style={{ marginTop: '35px' }}>
          <div className="row">
            <div className="one-half column">
              <PlaidLink storageUtil={this.storageUtil} />
            </div>
            <div className="one-half column">
              <VertJust />
              <p>Connect a financial institution to this app.</p>
            </div>
          </div>
          <div className="row">
            <div className="one-half column">
              <button type="button" onClick={this.testAuth}>
                hoho
              </button>
            </div>
            <div className="one-half column">
              <VertJust />
              <p>test</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Settings;
