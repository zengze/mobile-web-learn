import React, { Component } from 'react';

import { Button, Toast } from 'antd-mobile';

export class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {

    return (
      <div>
        我是首页
        <Button type="primary"
          onClick={() => Toast.info('This is a toast tips !!!', 1)}>primary</Button>
      </div>
    );
  }
}
