import React, { Component } from 'react';
const ReactDOMServer = require('react-dom/server');

import { SmartMap } from  './js/smartmap.jsx';
let smartmap = new SmartMap();

import normalQSKPng from "./images/normalQSK.png";
import unNormalQSKPng from "./images/unNormalQSK.png";

import './css/lib.jsx';

const mapData = [
  {
    intCd: 'ZWNJQSKJK-34',
    intNm: '崔庄扬水站',
    lon: 116.441,
    lat: 37.567,
    type: 'normal',
  },
  {
    intCd: 'ZWNJQSKJK-33',
    intNm: '牟庄扬水站',
    lon: 116.49,
    lat: 37.599,
    type: 'normal',
  },
  {
    intCd: 'ZWNJQSKJK-14',
    intNm: '乜官屯二扬水站',
    lon: 116.289,
    lat: 37.337,
    type: 'normal',
  },
  {
    intCd: 'ZWNJQSKJK-13',
    intNm: '蔡村第五扬水站',
    lon: 116.269,
    lat: 37.337,
    type: 'normal',
  },
  {
    intCd: 'ZWNJQSKJK-24',
    intNm: '王营盘引水闸',
    lon: 116.704,
    lat: 37.737,
    type: 'normal',
  },
  {
    intCd: 'ZWNJQSKJK-12',
    intNm: '八屯扬水站',
    lon: 116.129,
    lat: 37.383,
    type: 'normal',
  },
  {
    intCd: 'ZWNJQSKJK-22',
    intNm: '和平引水闸',
    lon: 115.884,
    lat: 37.158,
    type: 'normal',
  },
  {
    intCd: 'ZWNJQSKJK-23',
    intNm: '曹寺引水闸',
    lon: 115.865,
    lat: 37.071,
    type: 'normal',
  },
  {
    intCd: 'ZWNJQSKJK-26',
    intNm: '寨子引水闸',
    lon: 115.868,
    lat: 37.076,
    type: 'normal',
  },
  {
    intCd: 'ZWNJQSKJK-30',
    intNm: '于仲举引水闸',
    lon: 115.856,
    lat: 37.06,
    type: 'normal',
  },
  {
    intCd: 'ZWNJQSKJK-10',
    intNm: '南李庄扬水站',
    lon: 115.773,
    lat: 36.988,
    type: 'normal',
  },
  {
    intCd: 'ZWNJQSKJK-16',
    intNm: '砥桥引水闸',
    lon: 116.824,
    lat: 37.844,
    type: 'normal',
  },
  {
    intCd: 'ZWNJQSKJK-21',
    intNm: '永丰引水闸',
    lon: 116.964,
    lat: 37.836,
    type: 'normal',
  },
  {
    intCd: 'ZWNJQSKJK-27',
    intNm: '前王引水闸',
    lon: 116.971,
    lat: 37.843,
    type: 'normal',
  },
  {
    intCd: 'ZWNJQSKJK-28',
    intNm: '反刘引水闸',
    lon: 117.154,
    lat: 37.839,
    type: 'normal',
  },
  {
    intCd: 'ZWNJQSKJK-29',
    intNm: '王信引水闸',
    lon: 117.333,
    lat: 37.866,
    type: 'normal',
  },
  {
    intCd: 'ZWNJQSKJK-18',
    intNm: '东王扬水站',
    lon: 117.466,
    lat: 37.895,
    type: 'normal',
  },
  {
    intCd: 'ZWNJQSKJK-17',
    intNm: '东忠扬水站',
    lon: 117.477,
    lat: 37.889,
    type: 'normal',
  },
  {
    intCd: 'ZWNJQSKJK-11',
    intNm: '尖冢扬水站',
    lon: 115.479,
    lat: 36.76,
    type: 'normal',
  },
  {
    intCd: 'ZWNJQSKJK-32',
    intNm: '辛集引水闸',
    lon: 117.585,
    lat: 38.074,
    type: 'normal',
  },
  {
    intCd: 'ZWNJQSKJK-31',
    intNm: '马庄引水闸',
    lon: 116.705,
    lat: 37.73,
    type: 'unNormal',
  },
  {
    intCd: 'ZWNJQSKJK-25',
    intNm: '小安引水闸',
    lon: 116.896,
    lat: 37.848,
    type: 'unNormal',
  },
];

export default class MapJianCeDian extends Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
    this._initMap();
  }

  _initMap() {
    //load map
    smartmap.loadMap("map","");
    //set zoom
    smartmap.setZoom(8);
    //add event
    smartmap.addEvent("clickTarget",this._mouseclick);

    const data = mapData;

    //load targets
    this._loadTargets(data);
    //refresh map
    smartmap.refreshMap();
  }

  //添加站点
  _loadTargets(data){
    for(let i in data){
      let obj = data[i];
      smartmap.setTarget(
        obj.intCd,
        Number(obj.lon),
        Number(obj.lat),
        obj.intNm,
        obj.intCd,
        'rgba(255,255,255,1)',
        normalQSKPng,
      );
      //修改异常站点图标
      if(obj.type === 'unNormal') {
        smartmap.setIcon(obj.intCd, unNormalQSKPng);
        // smartmap.addAlarmAnim(obj.intCd, Number(obj.lon), Number(obj.lat));
      }
    }
  }

  _mouseclick(info){
    layer.closeAll();
    const data = mapData;

    for(let i in data){
      if(data[i].intCd == info.param){
        let item = data[i];
        layer.open({
          // 设置弹层的类型（0表示信息框，1表示页面层，2表示加载层）
          type: 1,
          // 设置弹层内容
          content: '监测点名称：' + item.intNm,
          // 自定义层的样式
          style: 'width: 100%;bottom: 0;background-color: #fff;',
          // 设定弹层显示风格 footer（即底部对话框风格）、msg（普通提示）
          skin: 'footer',
          // 动画类型 scale（默认）、up（从下往上弹出）、false(不开启)
          anim: 'up',
          // 控制遮罩展现
          shade: false,
        });
        return;
      }
    }
  }

  render() {

    return (
      <div style={{ position: 'fixed', height: '100%', width: '100%', top: 0, left: 0 }}>
        <div id="map" className="sidebar-map" style={{height: '100%', width: '100%', position: 'fixed'}}>
          <div id="popup" className="smart-popup">
            <a href="#" id="popup-closer" className="smart-popup-closer"></a>
            <div id="popup-content"></div>
          </div>
          <div id="popuptip" className="smart-popup">
            <a href="#" id="popup-closertip" className="smart-popup-closer"></a>
            <div id="popup-contenttip"></div>
          </div>
          <div id="popupcluster" className="smart-popup">
            <a href="#" id="popup-closercluster" className="smart-popup-closer"></a>
            <div id="popup-contentcluster"></div>
          </div>
          <div id="alarmAnim" className="css_animation"></div>
        </div>
      </div>
    );
  }
}
