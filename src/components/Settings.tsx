import React, { Component } from 'react';
import StorageUtils from 'utils/storage';

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

  constructor(props: SettingsProps) {
    super(props);
    this.storageUtil = props.storageUtil;
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
        </div>
      </div>
    );
  }
}

export default Settings;
