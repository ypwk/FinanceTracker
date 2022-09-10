import React, { Component } from 'react';
import StorageUtils from 'utils/storage';

import Navi from './Navi';
import PlaidLink from './PlaidLink';

interface LoginProps {
  storageUtil: StorageUtils;
}

interface LoginState {
  data: string;
}
// eslint-disable-next-line react/prefer-stateless-function
class Login extends Component<LoginProps, LoginState> {
  storageUtil: StorageUtils;

  constructor(props: LoginProps) {
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

export default Login;
