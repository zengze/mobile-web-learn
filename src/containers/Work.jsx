import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { Grid, List, PullToRefresh } from 'antd-mobile';
const Item = List.Item;
const Brief = Item.Brief;

export class Work extends Component {

  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
      down: true,
      height: document.documentElement.clientHeight,
    };
  }

  componentDidMount() {
    const hei = this.state.height - ReactDOM.findDOMNode(this.ptr).offsetTop;
    setTimeout(() => this.setState({
      height: hei,
    }), 0);
  }

  render() {

    const gridData = [
      {
        icon: 'https://gw.alipayobjects.com/zos/rmsportal/sifuoDUQdAFKAVcFGROC.svg',
        text: '任务中心',
      },
      {
        icon: 'https://gw.alipayobjects.com/zos/rmsportal/sifuoDUQdAFKAVcFGROC.svg',
        text: '工作报告',
      },
      {
        icon: 'https://gw.alipayobjects.com/zos/rmsportal/sifuoDUQdAFKAVcFGROC.svg',
        text: '通知中心',
      },
      {
        icon: 'https://gw.alipayobjects.com/zos/rmsportal/sifuoDUQdAFKAVcFGROC.svg',
        text: '我的评分',
      },
    ];

    return (
      <div>
        <PullToRefresh
          ref={el => this.ptr = el}
          style={{
            height: this.state.height,
            overflow: 'auto',
          }}
          indicator={this.state.down ? {} : { deactivate: '上拉可以刷新' }}
          direction={this.state.down ? 'down' : 'up'}
          refreshing={this.state.refreshing}
          onRefresh={() => {
            this.setState({ refreshing: true });
            setTimeout(() => {
              this.setState({ refreshing: false });
            }, 1000);
          }}
        >
          <Grid data={gridData} columnNum={4} hasLine={false} />
          <List renderHeader={() => '我的工作'}>
            <Item extra={'extra content'}>
              工作1
              <Brief>类型：巡检工作</Brief>
              <Brief>状态：未接受</Brief>
              <Brief>时间：2017-11-18 13:32:43</Brief>
            </Item>
            <Item extra={'extra content'}>
              工作2
              <Brief>类型：巡检工作</Brief>
              <Brief>状态：未接受</Brief>
              <Brief>时间：2017-11-18 13:32:43</Brief>
            </Item>
            <Item extra={'extra content'}>
              工作3
              <Brief>类型：巡检工作</Brief>
              <Brief>状态：未接受</Brief>
              <Brief>时间：2017-11-18 13:32:43</Brief>
            </Item>
            <Item extra={'extra content'}>
              工作4
              <Brief>类型：巡检工作</Brief>
              <Brief>状态：未接受</Brief>
              <Brief>时间：2017-11-18 13:32:43</Brief>
            </Item>
            <Item extra={'extra content'}>
              工作5
              <Brief>类型：巡检工作</Brief>
              <Brief>状态：未接受</Brief>
              <Brief>时间：2017-11-18 13:32:43</Brief>
            </Item>
            <Item extra={'extra content'}>
              工作6
              <Brief>类型：巡检工作</Brief>
              <Brief>状态：未接受</Brief>
              <Brief>时间：2017-11-18 13:32:43</Brief>
            </Item>
            <Item extra={'extra content'}>
              工作7
              <Brief>类型：巡检工作</Brief>
              <Brief>状态：未接受</Brief>
              <Brief>时间：2017-11-18 13:32:43</Brief>
            </Item>
            <Item extra={'extra content'}>
              工作8
              <Brief>类型：巡检工作</Brief>
              <Brief>状态：未接受</Brief>
              <Brief>时间：2017-11-18 13:32:43</Brief>
            </Item>
            <Item extra={'extra content'}>
              工作9
              <Brief>类型：巡检工作</Brief>
              <Brief>状态：未接受</Brief>
              <Brief>时间：2017-11-18 13:32:43</Brief>
            </Item>
            <Item extra={'extra content'}>
              工作10
              <Brief>类型：巡检工作</Brief>
              <Brief>状态：未接受</Brief>
              <Brief>时间：2017-11-18 13:32:43</Brief>
            </Item>
            <Item extra={'extra content'}>
              工作11
              <Brief>类型：巡检工作</Brief>
              <Brief>状态：未接受</Brief>
              <Brief>时间：2017-11-18 13:32:43</Brief>
            </Item>
          </List>
        </PullToRefresh>
      </div>
    );
  }
}
