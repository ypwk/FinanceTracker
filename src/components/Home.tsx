import StorageUtils from 'utils/storage';
import { Component } from 'react';
import { Keys } from 'server/auth/config';
import styled from 'styled-components';

import Navi from './Navi';

const Header = styled.h4`
  text-transform: uppercase;
  text-decoration: none;
  margin: 5rem 0 1rem 2rem;
`;

interface HomeProps {
  storageUtil: StorageUtils;
}

interface HomeState {
  transactions: object | null;
  balance: object | null;
}

class Home extends Component<HomeProps, any> {
  storageUtil: StorageUtils;

  PLAID_REDIRECT_URI: string;

  constructor(props: HomeProps) {
    super(props);
    this.storageUtil = props.storageUtil;
    this.PLAID_REDIRECT_URI = Keys().PLAID_REDIRECT_URI;
  }

  render() {
    return (
      <div>
        <Navi message="time to find out where my money is going" />
        <div className="container">
          <Header>Kevin Wu&#39;s Finance Tracker</Header>
          <p>
            This app helps you track your finances: how much you&#39;ve spent,
            and on what categories.
          </p>
        </div>
      </div>
    );
  }
}

export default Home;
