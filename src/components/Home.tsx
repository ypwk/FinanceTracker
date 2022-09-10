import StorageUtils from 'utils/storage';
import {
  Component,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactFragment,
  ReactPortal,
} from 'react';
import { Keys } from 'server/auth/config';
import { RevolvingDot } from 'react-loader-spinner';
import Navi from './Navi';

interface HomeProps {
  storageUtil: StorageUtils;
}

interface HomeState {
  transactions: object | null;
}

// interface LoginState {
//   any
// }

class Home extends Component<HomeProps, any> {
  storageUtil: StorageUtils;

  PLAID_REDIRECT_URI: string;

  constructor(props: HomeProps) {
    super(props);
    this.storageUtil = props.storageUtil;
    this.PLAID_REDIRECT_URI = Keys().PLAID_REDIRECT_URI;

    this.state = { transactions: null };

    this.getTransactions = this.getTransactions.bind(this);
  }

  getTransactions() {
    const setAccess = async () => {
      const selectedTokens = {
        access_token: this.storageUtil.itemAccess[0][1],
        item_id: this.storageUtil.itemAccess[0][0],
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

    const getTrans = async () => {
      const response = await fetch(
        `${this.PLAID_REDIRECT_URI}/api/transactions`,
        {
          method: 'GET',
        }
      );
      const resJSON = await response.json();
      return resJSON;
    };

    setAccess();
    getTrans()
      .then((transactions) => {
        this.setState({ transactions });
        return '200';
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    const { transactions } = this.state;

    const tableContents = () => {
      return (
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Amount</th>
              <th>Category</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {transactions.latest_transactions &&
              transactions.latest_transactions.map((trans: any) => (
                <tr key={trans.transaction_id}>
                  <td>{trans.amount}</td>
                  <td>{JSON.stringify(trans.category)}</td>
                  <td>{trans.name}</td>
                </tr>
              ))}
          </tbody>
        </table>
      );
    };

    return (
      <div>
        <Navi />
        <button type="button" onClick={this.getTransactions}>
          Get All Transactions
        </button>
        {transactions != null && tableContents()}
      </div>
    );
  }
}

export default Home;
