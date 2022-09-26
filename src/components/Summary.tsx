import React, { ChangeEvent, Component } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
} from 'recharts';

import styled from 'styled-components';
import StorageUtils from 'utils/storage';
import { Keys } from 'server/auth/config';

import LabelPie from './LabelPie';
import Navi from './Navi';
import DropDown from './DropDown';

const ChartContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PieContainer = styled.div`
  display: block;
  align-items: center;
  justify-content: center;
`;

const TableContainer = styled.div`
  margin: 0 0 0 3rem;
`;

const Header = styled.h4`
  text-transform: uppercase;
  text-decoration: none;
  margin: 5rem 0 1rem 2rem;
`;

interface SummaryProps {
  storageUtil: StorageUtils;
}

interface SummaryState {
  currBank: number;
  transactions: any | null;
  balance: any | null;
}
// eslint-disable-next-line react/prefer-stateless-function
class Summary extends Component<SummaryProps, SummaryState> {
  static categoryInvCompare(
    a: { name: string; value: number },
    b: { name: string; value: number }
  ) {
    if (a.value < b.value) {
      return 1;
    }
    if (a.value > b.value) {
      return -1;
    }
    return 0;
  }

  storageUtil: StorageUtils;

  PLAID_REDIRECT_URI: string;

  constructor(props: SummaryProps) {
    super(props);

    this.PLAID_REDIRECT_URI = Keys().PLAID_REDIRECT_URI;
    this.storageUtil = props.storageUtil;

    this.state = {
      currBank: 0,
      transactions: this.storageUtil.finInfo[0].transactionHistory,
      balance: this.storageUtil.finInfo[0].balance,
    };

    this.fetchUpdate = this.fetchUpdate.bind(this);
    this.setCurrentBank = this.setCurrentBank.bind(this);
  }

  componentDidMount(): void {
    this.fetchUpdate();
  }

  setCurrentBank(event: ChangeEvent<HTMLSelectElement>) {
    if (event.target) {
      const evtInfo = parseInt(event.target.value, 10);
      this.setState({
        currBank: evtInfo,
        transactions: this.storageUtil.finInfo[evtInfo].transactionHistory,
        balance: this.storageUtil.finInfo[evtInfo].balance,
      });
    }
  }

  fetchUpdate() {
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

    const getBal = async () => {
      const response = await fetch(`${this.PLAID_REDIRECT_URI}/api/balance`, {
        method: 'GET',
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

    for (let i = 0; i < this.storageUtil.finInfo.length; i += 1) {
      if (Date.now() - this.storageUtil.finInfo[i].dateLastAccess > 86400000) {
        // refresh if data is over a day old.
        this.storageUtil.finInfo[i].dateLastAccess = Date.now();
        const currentAccessToken = getAccessToken(
          this.storageUtil.finInfo[i].itemId
        );
        setAccessDetails(
          currentAccessToken,
          this.storageUtil.finInfo[i].itemId
        );
        getBal()
          .then((balance) => {
            this.storageUtil.finInfo[i].balance = balance.accounts[0].balances; // is just choosing the first accounts OK? idk
            this.storageUtil.saveData('fininfo');
            return '200';
          })
          .catch((err) => {
            console.log(err);
          });
        getTrans()
          .then((transactions) => {
            let idx = transactions.length - 1;
            let diff = [];
            if (this.storageUtil.finInfo[i].transactionHistory.length > 0) {
              const lastID =
                this.storageUtil.finInfo[i].transactionHistory.at(-1);
              while (
                transactions.latest_transactions[idx].transaction_id !== lastID
              ) {
                idx -= 1;
                diff.push(transactions.latest_transactions[idx]);
              }
            } else {
              diff = transactions.latest_transactions;
            }
            this.storageUtil.finInfo[i].transactionHistory.push(...diff);
            this.storageUtil.saveData('fininfo');
            return '200';
          })
          .catch((err) => {
            console.log(err);
          });
        this.setState({
          transactions: this.storageUtil.finInfo[0].transactionHistory,
          balance: this.storageUtil.finInfo[0].balance,
        });
      }
    }
    this.storageUtil.saveData('fininfo');
  }

  render() {
    const { transactions, balance, currBank } = this.state;
    if (transactions === null || balance === null) {
      return (
        <div>
          <Navi message="Spend Summary" />
          <div>
            <div className="row">
              <div className="one-half column">
                <Header>Please add a bank account</Header>
              </div>
            </div>
            <p>
              Uhoh, it looks like you have yet to add a bank account. Please do
              so and then return to this page.
            </p>
          </div>
        </div>
      );
    }
    let tbal = 0;
    let cumulativeBalance = [];
    const spendCategoryDict: {
      [name: string]: { name: string; value: number };
    } = {};
    const depositCategoryDict: {
      [name: string]: { name: string; value: number };
    } = {};
    if (transactions && transactions.length > 0) {
      tbal = transactions.reduce(
        (ps: number, a: { amount: number }) => ps - a.amount,
        0
      );
      let s = balance.available - tbal;
      // deep copy for data integrity
      cumulativeBalance = JSON.parse(JSON.stringify(transactions));
      for (let i = 0; i < cumulativeBalance.length; i += 1) {
        cumulativeBalance[i].amount =
          Math.round(cumulativeBalance[i].amount * 100) / 100;
        s -= cumulativeBalance[i].amount;
        s = Math.round(s * 100) / 100;
        cumulativeBalance[i].balance = s;
        // eslint-disable-next-line prefer-destructuring
        if (cumulativeBalance[i].amount > 0) {
          if (!(cumulativeBalance[i].category.at(-1) in spendCategoryDict)) {
            spendCategoryDict[cumulativeBalance[i].category.at(-1)] = {
              name: cumulativeBalance[i].category.at(-1),
              value: 0,
            };
          }
          spendCategoryDict[cumulativeBalance[i].category.at(-1)].value +=
            cumulativeBalance[i].amount;
        } else {
          if (!(cumulativeBalance[i].category.at(-1) in depositCategoryDict)) {
            depositCategoryDict[cumulativeBalance[i].category.at(-1)] = {
              name: cumulativeBalance[i].category.at(-1),
              value: 0,
            };
          }
          depositCategoryDict[cumulativeBalance[i].category.at(-1)].value -=
            cumulativeBalance[i].amount;
        }
      }
    }
    let spendCategoryData = Object.values(spendCategoryDict);
    spendCategoryData.sort(Summary.categoryInvCompare);
    spendCategoryData.forEach((v) => {
      v.value = Math.round(v.value * 100) / 100;
    });
    if (spendCategoryData.length > 9) {
      const tmp = spendCategoryData.slice(0, 8);
      const sum = spendCategoryData.slice(9).reduce((pv, cv, ci) => {
        cv.value += pv.value;
        return cv;
      });
      sum.name = 'Other';
      tmp.push(sum);
      spendCategoryData = tmp;
    }

    let depositCategoryData = Object.values(depositCategoryDict);
    depositCategoryData.sort(Summary.categoryInvCompare);
    depositCategoryData.forEach((v) => {
      v.value = Math.round(v.value * 100) / 100;
    });
    if (depositCategoryData.length > 9) {
      const tmp = depositCategoryData.slice(0, 8);
      const sum = depositCategoryData.slice(9).reduce((pv, cv, ci) => {
        cv.value += pv.value;
        return cv;
      });
      sum.name = 'Other';
      tmp.push(sum);
      depositCategoryData = tmp;
    }

    return (
      <div>
        <Navi message="Spend Summary" />
        <div>
          <div className="row">
            <DropDown
              label="Select a financial institution: "
              options={this.storageUtil.itemAccess.map((v, i) => {
                return { label: `Institution ${i}`, value: i };
              })}
              value={currBank}
              onChange={this.setCurrentBank}
            />
          </div>
          <div className="row">
            <div className="one-half column">
              <Header>Balance History</Header>
            </div>
            <div className="one-half column">
              <Header className="u-pull-right">
                Current balance: {balance.available}
              </Header>
            </div>
          </div>

          <ChartContainer>
            <ResponsiveContainer width="95%" height={400}>
              <AreaChart data={cumulativeBalance}>
                <Tooltip />
                <XAxis dataKey="date" />
                <YAxis />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#7094db"
                  fill="#7094db"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>

          <div className="row">
            <div className="one-third column">
              <Header>Spend by Category</Header>
              <TableContainer>
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr>
                      <th>Amount</th>
                      <th>Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spendCategoryData &&
                      spendCategoryData.map((category: any) => (
                        <tr key={category.name}>
                          <td>{category.value}</td>
                          <td>{category.name}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </TableContainer>
            </div>
            <div className="two-thirds column">
              <PieContainer>
                <LabelPie data={spendCategoryData} color="#ff8c66" />
              </PieContainer>
            </div>
          </div>
          <div className="row">
            <div className="one-third column">
              <Header>Deposit by Category</Header>
              <TableContainer>
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr>
                      <th>Amount</th>
                      <th>Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {depositCategoryData &&
                      depositCategoryData.map((category: any) => (
                        <tr key={category.name}>
                          <td>{category.value}</td>
                          <td>{category.name}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </TableContainer>
            </div>
            <div className="two-thirds column">
              <PieContainer>
                <LabelPie data={depositCategoryData} color="#7094db" />
              </PieContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Summary;
