import React, { Component } from 'react';
import StorageUtils from 'utils/storage';

import Navi from './Navi';
import PlaidLink from './PlaidLink';

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
        <Navi />
        <PlaidLink storageUtil={this.storageUtil} />
      </div>
    );
  }
}

export default Settings;
