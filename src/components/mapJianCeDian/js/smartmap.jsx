import {MonitorTarget, Targets} from './mon.jsx';
import * as ol from 'openlayers';
import * as SidebarCtrl from './ol3-sidebar.jsx';
import markersPng from "../images/markers.png";

function SmartMap(){
    this.m_map=null;
    this.m_view=null;
    this.myLayers=new Targets();
    this.m_overlay=new Object();
    this.popup=null;
    this.popuptip=null;
    this.popupcluster=null;
    this.alarmAnim = null;
    this.m_dCenterLat=37.444063;
    this.m_dCenterLon=116.368125;
    this.m_dPopupLat=40;
    this.m_dPopupLon=105;
    this.m_nCurscale=4;
    this.m_strepsg="EPSG:4326";
    this.m_oextent=[73.441277, 18.159829,135.08693, 53.561771];
    this.m_strmapserverip="47.92.133.164";
    this.m_strbackmap="smart:back-group";
    this.handlers = {};
    this.m_oTargets=new Targets();
    this.m_displaytype=0;
    this.clusters = null;
    this.trackid = null;
    this.p_mapdivname = null;
    this.m_zoom = 9;
    this.m_popuptid = null;
    this.m_distance = 0;
    this.m_level = 11;
    this.fence = null;
    this.measureTooltipElement1 = null;
    this.measureTooltipElement2 = null;
    this.draw = null;
  	this.mySource = null;
  	this.myClusterSource = null;
  	this.myFeatures = [];
    this.sidebar = null;
}

SmartMap.prototype = {
    constructor: SmartMap,
    addEvent: function(type, handler){
        if(typeof this.handlers[type] == 'undefined'){
            this.handlers[type] = [];
        }
        this.handlers[type].push(handler);
    },
    fireEvent: function(event){
        if(!event.target){
            event.target = this;
        }
        if(this.handlers[event.type] instanceof Array){
            var handlers = this.handlers[event.type];
             for(let i = 0; i < handlers.length; i++){
                  handlers[i](event);
              }
        }
    },
    removeEvent: function(type, handler){
        if(this.handlers[type] instanceof Array){
            var handlers = this.handlers[type];
            for(let i = 0; i < handlers.length; i++){
                if(handlers[i] == handler){
                    break;
                }
            }
            handlers.splice(i, 1);
        }
    }
};

SmartMap.prototype.loadMap=function(p_mapdivname,p_maperverip) {
  var o_smartMap = this;
  this.m_strmapserverip=p_maperverip;
  this.InitMap(p_mapdivname);
  this.InitOverlay();

  // 地图基本设置
  var projection = ol.proj.get("EPSG:4326");
  var projectionExtent = projection.getExtent();
  var size = ol.extent.getWidth(projectionExtent) / 256;
  var resolutions = new Array(14);
  var matrixIds = new Array(14);
  for (var z = 0; z <= 22; ++z) {
    resolutions[z] = size / Math.pow(2, z);
    matrixIds[z] = z;
  }
  //天地图
  var tdmapIP = "http://t{0-6}.tianditu.com";
  var tdLayer4map = "vec";
  var tdLayer4text = "cva";

  // 天地图 底图
  var tianDiTuLayer = new ol.layer.Tile({
    source: new ol.source.WMTS({
        url: tdmapIP + "/" + tdLayer4map + "_c/wmts",
        layer: tdLayer4map,
          format:"tiles",
          tileGrid: new ol.tilegrid.WMTS({
            origin: ol.extent.getTopLeft(projectionExtent),
            resolutions: resolutions,
            matrixIds: matrixIds,
          }),
          matrixSet:"c",
          style:"default"
      }),
    name: 'Smart Map',
    id: 'smart_map'
  });

 // 天地图 Text
 var tianDiTuTextLayer = new ol.layer.Tile({
    source: new ol.source.WMTS({
      url: tdmapIP + "/" + tdLayer4text + "_c/wmts",
        layer: tdLayer4text,
          format:"tiles",
          tileGrid: new ol.tilegrid.WMTS({
            origin: ol.extent.getTopLeft(projectionExtent),
            resolutions: resolutions,
            matrixIds: matrixIds,
          }),
          matrixSet:"c",
          style:"default"
      }),
    name: 'Smart Map Text',
    id: 'smart_map_text'
  });

  this.addLayer("base","base",tianDiTuLayer);
  this.addLayer("base","base",tianDiTuTextLayer);

    /*
    new ol.style.Circle({
      radius: 10,
      stroke: new ol.style.Stroke({
        color: "#71C671"
      }),
      fill: new ol.style.Fill({
        color: "#66CD00"
      })
    })
    //color:'#1792ff'
    */
    //trains layers
    var styleCache = {};
    var ncount=0;
    this.mySource = new ol.source.Vector({
        features: null
    });

    this.myClusterSource = new ol.source.Cluster({
      distance: this.m_distance,
      source: this.mySource
    });

    this.clusters = new ol.layer.Vector({
    source: null,
    style: function(feature, resolution) {
      var size = feature.get("features").length;
      var style = styleCache[size];
      if(size>1){
        if (!style && size < 100) {
          style = [new ol.style.Style({
            image: new ol.style.Icon({
              anchorXUnits: 'pixels',
              anchorYUnits: 'pixels',
              src: markersPng,
              offset: [0,275],
              size: [22,25],
              anchor: [11,25],
            }),
            text: new ol.style.Text({
              offsetX: -1,
              offsetY: -15,
              text: size.toString(),
              scale: 0.8,
              fill: new ol.style.Fill({
                color: "#fff"
              })
            })
          })];
          styleCache[size] = style;
        }
        else if(!style && size >=100){
          style = [new ol.style.Style({
            image: new ol.style.Icon({
              anchorXUnits: 'pixels',
              anchorYUnits: 'pixels',
              src: markersPng,
              offset: [0,275],
              size: [22,25],
              anchor: [11,25],
              scale: 1.2
            }),
            text: new ol.style.Text({
              offsetX: -1,
              offsetY: -18,
              text: size.toString(),
              scale: 0.8,
              fill: new ol.style.Fill({
                color: "#fff"
              })
            })
          })];
          styleCache[size] = style;
        }
      } else {
          var id = feature.get("features")[0].get("id");
          var target = o_smartMap.m_oTargets.get_aMonitorTarget(id);
          var icon = target.m_iconpath;
          var bgcolor = target.m_bgcolor;
          var fontsize= target.m_fontsize;
          var text = "";
          if(fontsize == "" || fontsize == null || fontsize == undefined) {
            fontsize = "12px";
          }
          if(o_smartMap.m_displaytype == 0) {
            text = target.m_name;
          }
          else if(o_smartMap.m_displaytype == 1) {
            text = target.m_num.toString();
          }
          if(resolution > 0.01) {
            text = "";//resolution unit??
          }
          style = [new ol.style.Style({
            image: new ol.style.Icon({
              // anchor: [16, 8],
              // anchorXUnits: "pixels",
              // anchorYUnits: "pixels",
              //opacity: 0.75,
              //rotation: rad(angle),
              src: icon,
            }),
            text: new ol.style.Text({
              font: fontsize+' Calibri,sans-serif' ,//+"&nbsp;&nbsp;"+ "微软雅黑",//"Calibri,sans-serif",
              fill: new ol.style.Fill({ color: "#000" }),
              stroke: new ol.style.Stroke({
                color: bgcolor, width: 3
              }),
              offsetX: 10,
              textAlign: "left",
              //textBaseline: "bottom",
              // get the text from the feature - `this` is ol.Feature
              text: text
            })
          })];
          styleCache[size] = style;
        }
      return style;
    }
    });
    this.addLayer("train","train",this.clusters);


    this.fence = new ol.layer.Vector({
      source: null,
      style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new ol.style.Stroke({
        color: '#ffcc33',
        width: 2
      }),
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
          color: '#ffcc33'
        })
      })
    })
    });
    var fenceSource= new ol.source.Vector({
        features: null
    });
    this.fence.setSource(fenceSource);
    this.addLayer("fence","fence",this.fence);//电子围栏
};

SmartMap.prototype.InitMap=function(p_mapdivname) {
    this.p_mapdivname = p_mapdivname;
    this.m_map = new ol.Map({
        renderer: "canvas",
        target: p_mapdivname,
        ol3Logo: true,
        controls:ol.control.defaults({attribution: false}).extend([
            //new ol.control.ScaleLine({ }),
        ]),
        view: new ol.View({
            projection: ol.proj.get(this.m_strepsg),
            extent: this.m_oextent,
            center: [this.m_dCenterLon, this.m_dCenterLat],
            zoom: this.m_nCurscale,
            maxZoom: 22,
            minZoom: 4
        })
    });
};

SmartMap.prototype.showInfo=function(tid) {
  var o_smartMap = this;
  var oTargets = this.m_oTargets;
  var target = oTargets.get_aMonitorTarget(tid);
  this.m_dPopupLon = target.m_dX;
  this.m_dPopupLat = target.m_dY;

  o_smartMap.fireEvent({
      type: "clickTarget",
      param: tid
  });
};

SmartMap.prototype.fill=function(tidArr, nameArr){
  var o_smartMap = this;
  var info = '';
  var i = 0;
  var K = 4;
  if(tidArr.length <= 9) {
    K = 3;
  }
  else {
    K = 4;
  }
  for(i in tidArr){
      if(i%K == 0) {
        info += "<tr><td><a style='cursor:pointer' onclick='o_smartMap.showInfo("+tidArr[i]+")''>"+nameArr[i]+"&nbsp;&nbsp;&nbsp;&nbsp;</a></td>";
      }
      else if(i+1 %K ==0){
        info += "</tr>";
      }
      else {
        info += "<td><a style='cursor:pointer' onclick='o_smartMap.showInfo("+tidArr[i]+")''>"+nameArr[i]+"&nbsp;&nbsp;&nbsp;&nbsp;</a></td>";
      }
  }
  return info;
};


SmartMap.prototype.InitOverlay=function() {
  var o_smartMap = this;
    this.m_overlay["container"] = document.getElementById("popup");
    this.m_overlay["content"] = document.getElementById("popup-content");
    this.m_overlay["closer"] = document.getElementById("popup-closer");
    this.m_overlay["containertip"] = document.getElementById("popuptip");
    this.m_overlay["contenttip"] = document.getElementById("popup-contenttip");
    this.m_overlay["closertip"] = document.getElementById("popup-closertip");
    this.m_overlay["containercluster"] = document.getElementById("popupcluster");
    this.m_overlay["contentcluster"] = document.getElementById("popup-contentcluster");
    this.m_overlay["closercluster"] = document.getElementById("popup-closercluster");
    this.m_overlay["containeralarmAnim"] = document.getElementById("alarmAnim");

    var container = this.m_overlay["container"];
    var content = this.m_overlay["content"];
    var closer = this.m_overlay["closer"];
    var containertip = this.m_overlay["containertip"];
    var contenttip = this.m_overlay["contenttip"];
    var closertip = this.m_overlay["closertip"];
    var containercluster = this.m_overlay["containercluster"];
    var contentcluster = this.m_overlay["contentcluster"];
    var closercluster = this.m_overlay["closercluster"];
    var containeralarmAnim = this.m_overlay["containeralarmAnim"];


    content.style.minWidth = "50px";
    //content.style.wordBreak= "break-all";
    container.style.zIndex = 2000;

    //set content width
    contenttip.style.minWidth = "50px";
    contenttip.style.textAlign ="center";
    //contenttip.style.wordBreak= "break-all";
    containertip.style.zIndex = 3000;

    containercluster.style.minWidth = "50px";
    contentcluster.style.maxHeight = "120px";
    contentcluster.style.overflow = "auto";
    contentcluster.style.textAlign ="left";
    containercluster.style.zIndex = 1000;

    containeralarmAnim.style.zIndex = 1000;

    closer.onclick = function() {
        container.style.display = "none";
        closer.blur();
        o_smartMap.m_popuptid = null;
        o_smartMap.fireEvent({
            type: "popupClosed",
        });
        return false;
    };
    closertip.onclick = function() {
        containertip.style.display = "none";
        closertip.blur();
        return false;
    };

    closercluster.onclick = function() {
        containercluster.style.display = "none";
        closercluster.blur();
        o_smartMap.fireEvent({
            type: "popupClusterClosed",
        });
        return false;
    };

    if(this.popup!=null){this.m_map.removeOverlay(this.popup);}
    this.popup = new ol.Overlay({
        element: container,
        positioning: "bottom-center",
        stopEvent: true
    });
    if(this.popuptip==null){this.m_map.removeOverlay(this.popuptip);}
    this.popuptip = new ol.Overlay({
        element: containertip,
        positioning: "bottom-center",
        stopEvent: true
    });
    if(this.popupcluster==null){this.m_map.removeOverlay(this.popupcluster);}
    this.popupcluster = new ol.Overlay({
        element: containercluster,
        positioning: "bottom-center",
        stopEvent: true
    });

    if(this.alarmAnim==null){this.m_map.removeOverlay(this.alarmAnim);}
    this.alarmAnim = new ol.Overlay({
        element: containeralarmAnim,
        positioning: "center-center"
    });

    this.m_map.addOverlay(this.popup);
    this.m_map.addOverlay(this.popuptip);
    this.m_map.addOverlay(this.popupcluster);
    this.m_map.addOverlay(this.alarmAnim);


    //events deal
    this.m_map.on("moveend", function(evt) {

    });
    var oTargets = this.m_oTargets;
    this.m_map.on("click", function(evt) {
      var pixel = evt.pixel;
      var feature = o_smartMap.m_map.forEachFeatureAtPixel(pixel, function(feature) {
        return feature;
      });
      var compare = function (prop) {
          return function (obj1, obj2) {
              var val1 = obj1.get(prop);
              var val2 = obj2.get(prop);
              if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
                  val1 = Number(val1);
                  val2 = Number(val2);
              }
              if (val1 < val2) {
                  return -1;
              } else if (val1 > val2) {
                  return 1;
              } else {
                  return 0;
              }
          }
      };
      if(feature){
        document.getElementById(o_smartMap.m_map.getTarget()).style.cursor = "pointer";
        var featuresArr = feature.get("features");
        if(featuresArr != null)
          var length = featuresArr.length;
        else {
          return;
        }
        var coord = new Array();
        if(length > 1) {
          var tidArr = new Array();
          var nameArr = new Array();
          var i;
          featuresArr.sort(compare('name'));
          for(i in featuresArr){
            var tid = featuresArr[i].get("id");
            // tid = o_smartMap.replaceAll(tid,' ','&nbsp;');
            // tid = o_smartMap.replaceAll(tid,'-','&#8209;');
            tidArr.push(tid);
            var name = featuresArr[i].get("name");
            // name = o_smartMap.replaceAll(name,' ','&nbsp;');
            // name = o_smartMap.replaceAll(name,'-','&#8209;');
            nameArr.push(name);
          }
          var htmlstr = "<table>"+o_smartMap.fill(tidArr,nameArr);+"</table>"
          //$("#popup-contentcluster").empty();
          //$("#popup-contentcluster").append(htmlstr);
          coord = o_smartMap.m_map.getCoordinateFromPixel(evt.pixel);
          o_smartMap.m_dPopupLon = coord[0];
          o_smartMap.m_dPopupLat = coord[1];
          var contentcluster = document.getElementById("popup-contentcluster");
          o_smartMap.showPopupCluster(contentcluster.innerHTML);
        }
        else {
          var tid = featuresArr[0].get("id");
          var name = featuresArr[0].get("name");
          var target = oTargets.get_aMonitorTarget(tid);
          o_smartMap.m_popuptid = tid;
          coord = [target.m_dX, target.m_dY];
          o_smartMap.m_dPopupLon = coord[0];
          o_smartMap.m_dPopupLat = coord[1];
          o_smartMap.fireEvent({
              type: "clickTarget",
              param: tid
          });
        }
      }else {
          document.getElementById(o_smartMap.m_map.getTarget()).style.cursor = "";
          if(popup.style.display == 'block' || popup.style.display == ' '){
            o_smartMap.m_popuptid = null;
            popup.style.display = "none";
            o_smartMap.fireEvent({
                type: "popupClosed",
            });
          }
          if(popupcluster.style.display == 'block' || popupcluster.style.display == ' '){
            popupcluster.style.display = "none";//关闭clusters弹窗
            o_smartMap.fireEvent({
                type: "popupClusterClosed",
            });
          }
          //o_smartMap.m_map.removeOverlay(o_smartMap.popup);
          //o_smartMap.m_map.removeOverlay(o_smartMap.popupcluster);
      }
    });
    this.m_map.on("pointermove", function(evt) {
      var pixel = evt.pixel;
      var feature = o_smartMap.m_map.forEachFeatureAtPixel(pixel, function(feature) {
        return feature;
      });
      if(feature){
        document.getElementById(o_smartMap.m_map.getTarget()).style.cursor = "pointer";
        var featuresArr = feature.get("features");
        if(featuresArr != null)
          var length = featuresArr.length;
        else {
          return;
        }
        if(length >1) return;
        var tid = featuresArr[0].get("id");
        var target = oTargets.get_aMonitorTarget(tid);
        o_smartMap.m_dPopupLon = target.m_dX;
        o_smartMap.m_dPopupLat = target.m_dY;
        var name = target.m_name;
        var lon = target.m_dX;
        var lat = target.m_dY;
        o_smartMap.fireEvent({
            type: "overTarget",
            name: name//+"(Lon:"+lon+"&nbsp;Lat:"+lat+")"
        });
      }else {
          document.getElementById(o_smartMap.m_map.getTarget()).style.cursor = "";
          o_smartMap.m_map.removeOverlay(o_smartMap.popuptip);
      }
    });

};


SmartMap.prototype.addLayer=function(p_oName,p_oCaption,p_oLayer) {
    var oLayer=this.myLayers.get_aMonitorTarget(p_oName);
    if(oLayer==null){
        oLayer=this.myLayers.AddMonitorTarget(p_oName);
    }
    oLayer.m_strTargetID=p_oName;
    oLayer.m_strTargetLabel=p_oCaption;
    oLayer.m_oObject=p_oLayer;
    this.m_map.addLayer(oLayer.m_oObject);
};

SmartMap.prototype.removeLayer=function(p_oName) {
    var oLayer=this.myLayers.get_aMonitorTarget(p_oName);
    if(oLayer!=null){
        this.m_map.removeLayer(oLayer.m_oObject);
        this.myLayers.RemoveMonitorTarget(p_oName);
    }
};

SmartMap.prototype.showPopup=function(p_strContent){
    if(this.popup!=null){this.m_map.removeOverlay(this.popup);}
    this.popup = new ol.Overlay({
        element: this.m_overlay["container"],
        positioning: "bottom-center",
        stopEvent: true,
        offset: [0,-5],
    });
    this.m_map.addOverlay(this.popup);
    this.popup.setPosition([this.m_dPopupLon,this.m_dPopupLat]);
    this.m_overlay["content"].innerHTML="<div>"+p_strContent+"</div>";
    this.m_overlay["container"].style.display = "block";

    if(this.trackid != null){
        this.setCenter(this.m_dPopupLon,this.m_dPopupLat);
        //this.setZoom(this.m_zoom);
    }
    else this.adjustMap(this.popup,this.m_dPopupLon,this.m_dPopupLat);
};

SmartMap.prototype.closePopup = function(){
    popup.style.display = 'none';
};

SmartMap.prototype.showPopupTip=function(p_strContent){
    if(this.popuptip!=null){this.m_map.removeOverlay(this.popuptip);}
    this.popuptip = new ol.Overlay({
        element: this.m_overlay["containertip"],
        positioning: "bottom-center",
        stopEvent: true,
        offset: [0,-5],
        autoPanAnimation: {
          duration: 250
        }
    });
    this.m_map.addOverlay(this.popuptip);
    this.popuptip.setPosition([this.m_dPopupLon,this.m_dPopupLat]);
    this.m_overlay["contenttip"].innerHTML="<nobr>"+p_strContent+"</nobr>";
    this.m_overlay["containertip"].style.display = "block";
    this.adjustMap(this.popuptip,this.m_dPopupLon,this.m_dPopupLat);
};

SmartMap.prototype.showPopupCluster=function(p_strContent){
    if(this.popupcluster!=null){this.m_map.removeOverlay(this.popupcluster);}
    this.popupcluster = new ol.Overlay({
        element: this.m_overlay["containercluster"],
        positioning: "bottom-center",
        stopEvent: true,
        autoPanAnimation: {
          duration: 250
        }
    });
    this.m_overlay["contentcluster"].innerHTML="<nobr>"+p_strContent+"</nobr>";
    this.m_map.addOverlay(this.popupcluster);
    this.popupcluster.setPosition([this.m_dPopupLon,this.m_dPopupLat]);
    this.m_overlay["containercluster"].style.display = "block";
    this.adjustMap(this.popupcluster,this.m_dPopupLon,this.m_dPopupLat);
};

SmartMap.prototype.showAlarmAnim=function(){
    if(this.alarmAnim!=null){this.m_map.removeOverlay(this.alarmAnim);}
    this.alarmAnim = new ol.Overlay({
        element: this.m_overlay["containeralarmAnim"],
        positioning: "center-center"
    });
    this.m_map.addOverlay(this.alarmAnim);
    this.alarmAnim.setPosition([this.m_dPopupLon,this.m_dPopupLat]);
    this.m_overlay["containeralarmAnim"].style.display = "block";
    //this.adjustMap(this.alarmAnim,this.m_dPopupLon,this.m_dPopupLat);
};

SmartMap.prototype.addAlarmAnim=function(id, lon, lat){
  var o_smartMap = this;
    var overlay = this.m_map.getOverlayById(id);
    if(overlay!=null) {this.m_map.removeOverlay(overlay);}
    var point_div = document.createElement('div');
    point_div.id = id;
    point_div.style.zIndex = 1000;
    point_div.className="css_animation";
    var point_overlay = new ol.Overlay({
         id: id,
         element: point_div,
         positioning: 'center-center',
         offset: [-12,-12]
     });
     this.m_map.addOverlay(point_overlay);
     point_overlay.setPosition([lon, lat]);
     point_div.style.display = "block";
     point_div.onclick= function(){
       o_smartMap.fireEvent({
           type: "clickTarget",
           param: id
       });
     };
};

SmartMap.prototype.removeAlarmAnim=function(id){
  var overlay = this.m_map.getOverlayById(id);
  if(overlay){
    this.m_map.removeOverlay(overlay);
  }
};

// SmartMap.prototype.replaceAll=function(str, sptr, sptr1){
//   str = str.toString();
//   while (str.indexOf(sptr) >= 0){
//      str = str.replace(sptr, sptr1);
//   }
//   return str;
// };

SmartMap.prototype.setCenter = function(lon,lat) {
    this.m_map.getView().setCenter([lon, lat]);
};

SmartMap.prototype.setZoom = function(level) {
    this.m_map.getView().setZoom(level);
};

SmartMap.prototype.getZoom = function() {
    return this.m_map.getView().getZoom();
};

SmartMap.prototype.zoomToExtent = function(ext){
    this.m_map.getView().fit(ext, this.m_map.getSize());
};

SmartMap.prototype.adjustMap = function(pop,lon,lat){
  var element = pop.getElement();
  var coordinate = [lon, lat];
  var map = this.m_map;
  var view = this.m_view;
  var mapdiv_width = document.getElementById(this.p_mapdivname).offsetWidth;
  var offset_height = 20;
  var offset_width = 50;
  // get computed popup height and add some offset
  var popup_height = element.offsetHeight + offset_height;
  var popup_width = element.offsetWidth - offset_width;
  var clicked_pixel = map.getPixelFromCoordinate(coordinate);
  // how much space (height) left between clicked pixel and top
  var height_left = clicked_pixel[1] - popup_height;
  var width_left = mapdiv_width - clicked_pixel[0];
  var view = map.getView();
  // get the actual center
  var center = view.getCenter();
  var center_px = map.getPixelFromCoordinate(center);
  var new_lon_pixel;
  var new_lat_pixel;
  new_lon_pixel = center_px[0];
  new_lat_pixel = center_px[1];

  if(width_left <  popup_width){
    var need = popup_width - width_left;
    new_lon_pixel = new_lon_pixel  + need;
  }
  if (height_left < 0 ) {
      new_lat_pixel = new_lat_pixel + height_left;
  }
  var new_center_px = [new_lon_pixel, new_lat_pixel];
  view.setCenter(map.getCoordinateFromPixel(new_center_px));
};

 SmartMap.prototype.setTarget = function(tid, lon, lat, name, num, bgcolor, iconpath){
    var oTargets = this.m_oTargets;
    var target = oTargets.AddMonitorTarget(tid);
    target.m_dX = lon;
    target.m_dY = lat;
    target.m_name = name;
    target.m_num = num;
    target.m_bgcolor = bgcolor;
    target.m_iconpath = iconpath;
    target.m_fontsize = "12px";
    target.m_oObject = new ol.Feature({
      id: tid,
      name: name,
      icon: iconpath,
      geometry: new ol.geom.Point([lon,lat]),
    });
};

SmartMap.prototype.locTarget = function(tid, content){
    //check map had features
    var layers = this.m_map.getLayers().getArray();
    if(layers[1].getSource() == null){
        alert("No Features on Map");
        return;
    }

    var oTargets = this.m_oTargets;
    var target = oTargets.get_aMonitorTarget(tid);
    if(target == null) {
      alert("No Target");
      return;
    }
    this.m_popuptid = tid;
    this.m_dPopupLon = target.m_dX;
    this.m_dPopupLat = target.m_dY;
    if(this.m_dPopupLon!=undefined && this.m_dPopupLat !=undefined){
      this.showPopup(content);
      this.setCenter(this.m_dPopupLon,this.m_dPopupLat);
      this.setZoom(this.m_level);
    }
};

SmartMap.prototype.trackTarget=function(tid, content){
    //check map had features
    var layers = this.m_map.getLayers().getArray();
    if(layers[1].getSource() == null){
        alert("No Features on Map");
        return;
    }
    var oTargets = this.m_oTargets;
    var target = oTargets.get_aMonitorTarget(tid);
    if(target ==null) {
      alert("No Target");
      return;
    }
    target.m_ontrack = true;
    this.m_dPopupLon = target.m_dX;
    this.m_dPopupLat = target.m_dY;
    this.trackid = tid;
    if(this.m_dPopupLon!=undefined && this.m_dPopupLat !=undefined){
       this.locTarget(tid,content);
    }
};

SmartMap.prototype.cancelTrack = function(){
    var oTargets = this.m_oTargets;
    var targets = oTargets.m_aMonitorTarget;
    var trainfinded = false;
    var i;
    for(i in targets){
      var target = targets[i];
      if(target.m_ontrack){
        trainfinded = true;
        target.m_ontrack = false;
        //this.m_map.removeOverlay(this.popup);
        this.closePopup();
        alert("已成功取消跟踪服务");
        this.trackid = null;
        break;
      }
    }
    if(!trainfinded)  {
      alert("暂无跟踪车次");
    }
};

SmartMap.prototype.refreshMap = function() {
  var o_smartMap = this;
    var oTargets = this.m_oTargets;
    var targets = oTargets.m_aMonitorTarget;
	  this.myFeatures.length = 0;
    var strKey;
    for (strKey in targets)
    {
      this.myFeatures.push(targets[strKey].m_oObject);
    }
	this.mySource.clear();
	this.mySource.addFeatures(this.myFeatures);

	//console.log(features, source, clusterSource);
    this.clusters.setSource(null);
    this.clusters.setSource(this.myClusterSource);
	//source.clear();
	//clusterSource.clear();
    // this.m_overlay["containercluster"].style.display = 'none';
    if(this.trackid != null){//have tracing target
        var target = oTargets.get_aMonitorTarget(this.trackid);
        this.m_dPopupLon =  target.m_dX;
        this.m_dPopupLat =  target.m_dY;
        o_smartMap.fireEvent({
            type: "updateTrackPopUpContent",
            trackid: this.trackid,
            lonlat: [this.m_dPopupLon,this.m_dPopupLat]
        });
    }
    else if(this.m_popuptid != null){
        var target = oTargets.get_aMonitorTarget(this.m_popuptid);
        this.m_dPopupLon =  target.m_dX;
        this.m_dPopupLat =  target.m_dY;
        o_smartMap.fireEvent({
            type: "updatePopUpContent",
            popuptid: this.m_popuptid,
            lonlat: [this.m_dPopupLon,this.m_dPopupLat]
        });
    }
};

SmartMap.prototype.clearAll = function() {
      this.clusters.setSource(null);
      this.m_oTargets.DeleteAll();
      this.m_oTargets.m_aMonitorTarget.length = 0;
      //this.m_map.removeOverlay(this.popup);
      this.closePopup();
      this.m_popuptid=null;
};


SmartMap.prototype.setDisplayType = function(type) {
    this.m_displaytype = type;
    //this.refreshMap();
    var oTargets = this.m_oTargets;
    var targets = oTargets.m_aMonitorTarget;
    this.refreshMap();
};

SmartMap.prototype.setIcon = function(tid, iconpath) {
    var oTargets = this.m_oTargets;
    var target = oTargets.get_aMonitorTarget(tid);
    if(target ==null) {
      alert("No Target");
      return;
    }
    target.m_iconpath = iconpath;
    target.m_oObject.changed();
};

SmartMap.prototype.setBgcolor=function(tid, bgcolor){
    var oTargets = this.m_oTargets;
    var target = oTargets.get_aMonitorTarget(tid);
    if(target ==null) {
      alert("No Target");
      return;
    }
    target.m_bgcolor = bgcolor;
    target.m_oObject.changed();
};

  //url:"http://localhost:8080/train-map/trainsite/getsites",
SmartMap.prototype.queryStation = function(name,callback){
        $.ajax({
              url: "http://"+this.m_strmapserverip+":8080/train-map/trainsite/getsites",
              data:{name: name},
              type: "get",
              async: false,
              dataType: "jsonp",
              jsonp: "callback", //服务端用于接收callback调用的function名的参数
              jsonpCallback: "success_jsonpCallback", //callback的function名称,服务端会把名称和data一起传递回来
              success: function(data) {
                  callback(data);
              },
              error: function(){}
      });
  };

SmartMap.prototype.locStation = function(name, lon, lat) {
      this.m_dPopupLon =  lon;
      this.m_dPopupLat =  lat;
      this.showPopup(name);
      this.setCenter(this.m_dPopupLon,this.m_dPopupLat);
      this.setZoom(this.m_level);
      // var point = new ol.Feature({
      //   geometry: new ol.geom.Point([lon,lat]),
      // });
      // var ext = point.getGeometry().getExtent();
      // this.zoomToExtent(ext);
};

SmartMap.prototype.setFontSize = function(tid, fontsize) {
    var oTargets = this.m_oTargets;
    var target = oTargets.get_aMonitorTarget(tid);
    if(target ==null) {
      alert("No Target");
      return;
    }
    target.m_fontsize = fontsize;
    target.m_oObject.changed();
  };

SmartMap.prototype.setDistance=function(distance){
      this.m_distance = distance;
      this.refreshMap();
};

//设置定位和跟踪状态时的zoom级别
SmartMap.prototype.setTrackAndLocZoom=function(level){
      if(level != null){
        this.m_level = level;
        this.refreshMap();
      }
};

//绘制电子地图围栏
SmartMap.prototype.drawFenceCustomize=function(uid,name,callback){
      if(uid == null || uid == undefined) return;
      var coords;
      var polygon_extent;
      var center;
      var source = this.fence.getSource();
      var measureTooltip;
      var sourceProj = o_smartMap.m_map.getView().getProjection();
      var wgs84Sphere = new ol.Sphere(6378137);
      o_smartMap.draw = new ol.interaction.Draw({
            source: source,
            type: 'Polygon',
            style: new ol.style.Style({
            fill: new ol.style.Fill({
              color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
              color: 'rgba(0, 0, 0, 0.5)',
              lineDash: [10, 10],
              width: 2
            }),
            image: new ol.style.Circle({
              radius: 5,
              stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 0, 0.7)'
              }),
              fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
              })
            })
          })
          });
      o_smartMap.m_map.addInteraction(this.draw);
      //创建面积div
      o_smartMap.measureTooltipElement1 = document.createElement('div');
      o_smartMap.measureTooltipElement1.className = 'tooltip-measure';
      measureTooltip = new ol.Overlay({
        element: o_smartMap.measureTooltipElement1,
        offset: [0, -15],
        positioning: 'bottom-center'
      });
      o_smartMap.m_map.addOverlay(measureTooltip);
      //drawstart
      o_smartMap.draw.on('drawstart',drawStart=function(evt) {
        var sketch = evt.feature;
        var listener;
        var tooltipCoord = evt.coordinate;
        listener = sketch.getGeometry().on('change', function(evt) {
          var geom = evt.target;
          var output;
          if (geom instanceof ol.geom.Polygon) {
            geom = /** @type {ol.geom.Polygon} */(geom.clone().transform(
                sourceProj, 'EPSG:4326'));
            var coordinates = geom.getLinearRing(0).getCoordinates();
            var area = Math.abs(wgs84Sphere.geodesicArea(coordinates));
            if (area > 10000) {
              output = (Math.round(area / 1000000 * 100) / 100) +
                  ' ' + 'km<sup>2</sup>';
            } else {
              output = (Math.round(area * 100) / 100) +
                  ' ' + 'm<sup>2</sup>';
            }
            tooltipCoord = geom.getInteriorPoint().getCoordinates();
          }
          if(o_smartMap.measureTooltipElement1!=null) o_smartMap.measureTooltipElement1.innerHTML = name;//output;
          measureTooltip.setPosition(tooltipCoord);
          // measureTooltip.setProperties({
          //     'id': uid
          // });
        });
      },o_smartMap);
      //drawend
      o_smartMap.draw.on('drawend', drawEnd=function(evt){
          if(o_smartMap.draw!=null) o_smartMap.draw.setActive(false);
          evt.feature.setProperties({
            'id': uid
          });
          //change style
          o_smartMap.measureTooltipElement1.className = 'tooltip-static';
          measureTooltip.setOffset([0, -7]);
          measureTooltip.setProperties({
              'id': uid
          });
          o_smartMap.measureTooltipElement1 = null;
          //return coords
          var coords = evt.feature.getGeometry().getCoordinates();
          callback(coords);
          //获取center坐标
          // coords = evt.feature.getGeometry().getCoordinates();
          // polygon_extent = evt.feature.getGeometry().getExtent();
          // // center = o_smartMap.getCenterOfExtent(polygon_extent);
        },o_smartMap);
};

SmartMap.prototype.drawFenceFromCoords = function(uid, name, coords) {
  var o_smartMap = this;
      if(o_smartMap.draw!=null) o_smartMap.draw.setActive(false);
      $('.tooltip-measure').remove();
      if(coords == null || coords == undefined) return;
      if(uid == null || uid == undefined) return;
      var source = o_smartMap.fence.getSource();
      var polyCoords = [];
      var polygon_extent;
      var center;
      var sourceProj = o_smartMap.m_map.getView().getProjection();
      var wgs84Sphere = new ol.Sphere(6378137);
      for (var i in coords) {
        polyCoords.push([coords[i][0].toString(),coords[i][1].toString()]);
      }
      var feature = new ol.Feature({
          id : uid,
          geometry: new ol.geom.Polygon([polyCoords])
      });
      //创建面积div
      o_smartMap.measureTooltipElement2 = document.createElement('div');
      o_smartMap.measureTooltipElement2.className = 'tooltip-static';
      measureTooltip = new ol.Overlay({
        element: o_smartMap.measureTooltipElement2,
        offset: [0, -15],
        positioning: 'bottom-center'
      });
      measureTooltip.setProperties({
          'id': uid
      });
      o_smartMap.m_map.addOverlay(measureTooltip);
      source.addFeature(feature);
      polygon_extent = feature.getGeometry().getExtent();
      center = o_smartMap.getCenterOfExtent(polygon_extent);
      var geom = feature.getGeometry();
      var output;
      if (geom instanceof ol.geom.Polygon) {
        geom = /** @type {ol.geom.Polygon} */(geom.clone().transform(
            sourceProj, 'EPSG:4326'));
        var coordinates = geom.getLinearRing(0).getCoordinates();
        var area = Math.abs(wgs84Sphere.geodesicArea(coordinates));
        if (area > 10000) {
          output = (Math.round(area / 1000000 * 100) / 100) +
              ' ' + 'km<sup>2</sup>';
        } else {
          output = (Math.round(area * 100) / 100) +
              ' ' + 'm<sup>2</sup>';
        }
        tooltipCoord = geom.getInteriorPoint().getCoordinates();
      }
      if(o_smartMap.measureTooltipElement2!=null) {
        o_smartMap.measureTooltipElement2.innerHTML = name;//output;
      }
      measureTooltip.setPosition(tooltipCoord);
};

//清除电子围栏
SmartMap.prototype.clearFenceById = function(id) {
    if(this.draw!=null) this.draw.setActive(false);
    $('.tooltip-measure').remove();
    if(id == null || id == undefined) return;
    var source = this.fence.getSource();
    var features = source.getFeatures();
    var map = this.m_map;
    var overlays = map.getOverlays().getArray();
     if (features != null && features.length > 0) {
         for (x in features) {
            var properties = features[x].getProperties();
            var featureID = properties.id;
            if (featureID == id) {
              source.removeFeature(features[x]);
              break;
            }
          }
      }
      if(overlays !=null) {
        for (x in overlays) {
           var properties = overlays[x].getProperties();
           var overlayID = properties.id;
           if (overlayID == id) {
             map.removeOverlay(overlays[x]);
             break;
           }
         }
      }

};

//清除所有电子围栏
SmartMap.prototype.clearAllFence=function(id){
    if(this.draw!=null) this.draw.setActive(false);
    $('.tooltip-measure').remove();
    if(id == null || id == undefined) return;
    var source = this.fence.getSource();
    var features = source.getFeatures();
    var map = this.m_map;
    var overlays = map.getOverlays().getArray();
     if (features != null && features.length > 0) {
         for (x in features) {
              source.removeFeature(features[x]);
          }
      }
    if(overlays !=null) {
      for (x in overlays) {
           map.removeOverlay(overlays[x]);
       }
    }
  };

SmartMap.prototype.getCenterOfExtent = function(Extent){
    var X = Extent[0] + (Extent[2]-Extent[0])/2;
    var Y = Extent[1] + (Extent[3]-Extent[1])/2;
    return [X, Y];
};

SmartMap.prototype.addSideBar = function(element, position){
      this.sidebar = new ol.control.Sidebar({
      element: element,
      position: position
    });
    this.m_map.addControl(this.sidebar);
};

SmartMap.prototype.openSideBar = function(id){
  this.sidebar.open(id);
};

export {
  SmartMap
};
