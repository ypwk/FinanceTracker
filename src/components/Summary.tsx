import React, { Component } from 'react';
import StorageUtils from 'utils/storage';

import Navi from './Navi';

interface SummaryProps {
  storageUtil: StorageUtils;
}

interface SummaryState {
  data: string;
}
// eslint-disable-next-line react/prefer-stateless-function
class Summary extends Component<SummaryProps, SummaryState> {
  storageUtil: StorageUtils;

  constructor(props: SummaryProps) {
    super(props);
    this.storageUtil = props.storageUtil;
  }

  render() {
    return (
      <div>
        <Navi />
        <p>haha</p>
      </div>
    );
  }
}

export default Summary;
