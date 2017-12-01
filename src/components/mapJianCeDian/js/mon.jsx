/*
 target
 */
function MonitorTarget(p_strTargetID){
	this.m_dX = 0;//经度
	this.m_dY = 0;//纬度
	this.m_dTime=0;
    this.m_lastPoint = new Object();
	this.m_strTargetID = p_strTargetID;//设备ID
	this.m_bShowLabel=false;
	this.m_strTargetLabel = "";
	this.m_bDataChange = false;
	this.m_bVisible = false;
    this.m_bOnline=false;
	this.m_nAlarmState = 0;
	this.m_nFocus=0;
	this.m_infojson=null;
	this.m_datajson=null;
	this.m_stricon="";
	this.m_ticonsize=16;
	this.m_oObject=null;
	this.m_name = "";//机车号
	this.m_num = 0;//车次号
	this.m_bgcolor="";//背景色
	this.m_iconpath="";//iconpath
	this.m_ontrack=false;//
	this.m_fontsize = "12px";//字体颜色
};

MonitorTarget.prototype.Error = function(p_strText,p_oFailValue)
{
	alert(p_strText);
	return p_oFailValue;
};



/*
   target list
 */

function Targets( ){
	this.m_aMonitorTarget = new Array();
	this.m_pGPSManager = "fake manager";
	this.m_bShowTail = false;
	this.m_bShowTailPoint = false;
	this.m_bDataChange = false;
};

Targets.prototype.put_DataChanged = function(p_bChanged){
	this.m_bDataChange = p_bChanged;
};
Targets.prototype.get_DataChanged = function(){
	return  this.m_bDataChange;
};
Targets.prototype.Error = function(p_strText,p_oFailValue)
{
	alert(p_strText);
	return p_oFailValue;
};

Targets.prototype.ASSERT = function(p_oValue)
{
	if(p_oValue)
		alert("FAIL VALUE:"+p_oValue);
};

Targets.prototype.get_aMonitorTarget = function(p_bstrTargetID)
{
	var oTarget;
	oTarget = this.m_aMonitorTarget[p_bstrTargetID];
	if(typeof(oTarget) == "undefined" )
	 	return null;
 return oTarget;
};

Targets.prototype.AddMonitorTarget = function(p_bstrTargetID){
	try
	{
		if( this.m_pGPSManager == null)
			return Error("m_pGPSManager == null",null);
		if(p_bstrTargetID.length == 0 )
			return Error("",null);
		var oTarget;
		oTarget = this.get_aMonitorTarget(p_bstrTargetID);

		if( oTarget != null)
			return oTarget;

		oTarget = new MonitorTarget(p_bstrTargetID);

		this.m_aMonitorTarget[p_bstrTargetID]	= oTarget;
		this.m_bDataChange = true;
		return oTarget;
	}
	catch(E)
	{
		return Error(E,null);
	}
};


Targets.prototype.RemoveMonitorTarget = function(p_bstrTargetID){
	try
	{
		if( this.m_pGPSManager == null)
			return Error("m_pGPSManager == null",null);
		if(p_bstrTargetID.length == 0 )
			return Error("",null);
		var oTarget;
		oTarget = this.get_aMonitorTarget(p_bstrTargetID);
		if( oTarget == null)
			return Error("",null);
		delete this.m_aMonitorTarget[p_bstrTargetID];
	}
	catch(E)
	{
		return Error(E,null);
	}
};

Targets.prototype.DeleteAll=function(){
    var oTarget;
	for (var strKey in this.m_aMonitorTarget)
	{

	   oTarget = this.get_aMonitorTarget(strKey);
	   if (oTarget!=null){
		   this.RemoveMonitorTarget(oTarget.m_strTargetID);
       }
	}
};


Targets.prototype.GetAllTargetID=function(){
    var oTarget;
	  var strKey;
	  var strTargets="";
		for (strKey in this.m_aMonitorTarget)
		{
		   oTarget = this.get_aMonitorTarget(strKey);
			if (strTargets.length==0) strTargets=oTarget.m_strTargetID;
		      else strTargets=strTargets+","+oTarget.m_strTargetID;
		}
		return strTargets;

};

export{
	MonitorTarget,
	Targets
};
