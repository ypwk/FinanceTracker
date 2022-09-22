import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import React, { Component } from 'react';
import { RevolvingDot } from 'react-loader-spinner';
import Home from 'components/Home';
import Settings from 'components/Settings';
import Summary from 'components/Summary';

import StorageUtils from 'utils/storage';

import './App.css';
import './Skeleton.css';

interface AppState {
  loading: boolean;
}

class App extends Component<any, AppState> {
  storageHelper: StorageUtils;

  constructor(props: any) {
    super(props);
    this.storageHelper = new StorageUtils();
    this.state = { loading: true };
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    await this.storageHelper.fetchData();
    this.setState({ loading: false });
  }

  render() {
    const { loading } = this.state;
    if (loading) {
      return (
        <div className="text-center">
          <RevolvingDot
            height="100"
            width="100"
            radius={6}
            color="Grey"
            ariaLabel="revolving-dot-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible
          />
        </div>
      );
    }
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Home storageUtil={this.storageHelper} />} />
          <Route
            path="/settings/"
            element={<Settings storageUtil={this.storageHelper} />}
          />
          <Route
            path="/summary/"
            element={<Summary storageUtil={this.storageHelper} />}
          />
        </Routes>
      </Router>
    );
  }
}

export default App;
