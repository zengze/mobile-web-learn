import React, { Component } from 'react';

import { TabBar } from 'antd-mobile';

export default class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedTab: 'homeTab',
    };
  }

  render() {

    return (
      <div>
        <TabBar
          unselectedTintColor="#949494"
          tintColor="#33A3F4"
          barTintColor="white"
        >
          <TabBar.Item
            key="home"
            title="首页"
            icon={<div style={{
              width: '50px',
              height: '50px',
              background: 'url(https://zos.alipayobjects.com/rmsportal/sifuoDUQdAFKAVcFGROC.svg) center center /  50px 50px no-repeat' }}
            />}
            selectedIcon={<div style={{
              width: '50px',
              height: '50px',
              background: 'url(https://zos.alipayobjects.com/rmsportal/iSrlOTqrKddqbOmlvUfq.svg) center center /  50px 50px no-repeat' }}
            />}
            selected={this.state.selectedTab === 'homeTab'}
            onPress={() => {
              this.setState({
                selectedTab: 'homeTab',
              });
            }}
            >
              我是首页
          </TabBar.Item>
          <TabBar.Item
            key="work"
            title="工作"
            icon={<div style={{
              width: '50px',
              height: '50px',
              background: 'url(https://zos.alipayobjects.com/rmsportal/BTSsmHkPsQSPTktcXyTV.svg) center center /  50px 50px no-repeat' }}
            />}
            selectedIcon={<div style={{
              width: '50px',
              height: '50px',
              background: 'url(https://zos.alipayobjects.com/rmsportal/ekLecvKBnRazVLXbWOnE.svg) center center /  50px 50px no-repeat' }}
            />}
            selected={this.state.selectedTab === 'workTab'}
            onPress={() => {
              this.setState({
                selectedTab: 'workTab',
              });
            }}
            >
              我是工作
          </TabBar.Item>
          <TabBar.Item
            key="mine"
            title="我的"
            icon={<div style={{
              width: '50px',
              height: '50px',
              background: 'url(https://zos.alipayobjects.com/rmsportal/psUFoAMjkCcjqtUCNPxB.svg) center center /  50px 50px no-repeat' }}
            />}
            selectedIcon={<div style={{
              width: '50px',
              height: '50px',
              background: 'url(https://zos.alipayobjects.com/rmsportal/IIRLrXXrFAhXVdhMWgUI.svg) center center /  50px 50px no-repeat' }}
            />}
            selected={this.state.selectedTab === 'mineTab'}
            onPress={() => {
              this.setState({
                selectedTab: 'mineTab',
              });
            }}
            >
              我是我的
          </TabBar.Item>
        </TabBar>
      </div>
    );
  }
}
