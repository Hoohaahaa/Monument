(function(root){
'use strict';
const DATUMS=new Set(['MSL','WGS84_ELLIPSOID','AGL','VENUE_LOCAL']);
function finite(v){return typeof v==='number'&&Number.isFinite(v);}
function convertAltitude(input={}){
 const errors=[];
 if(!finite(input.value))errors.push('altitude_value_invalid');
 if(!DATUMS.has(input.sourceDatum))errors.push('source_datum_invalid');
 if(!DATUMS.has(input.targetDatum))errors.push('target_datum_invalid');
 if(errors.length)return {valid:false,errors,value:null,datum:null,method:null};
 const source=input.sourceDatum,target=input.targetDatum,value=input.value;
 if(source===target)return {valid:true,errors:[],value,datum:target,method:'identity'};
 const terrain= input.terrainElevationMsl;
 const geoid= input.geoidSeparationMeters;
 const venue= input.venueOriginAltitudeM;
 if((source==='AGL'||target==='AGL')&&!finite(terrain))return {valid:false,errors:['terrain_elevation_required'],value:null,datum:null,method:null};
 if((source==='WGS84_ELLIPSOID'||target==='WGS84_ELLIPSOID')&&!finite(geoid))return {valid:false,errors:['geoid_separation_required'],value:null,datum:null,method:null};
 if((source==='VENUE_LOCAL'||target==='VENUE_LOCAL')&&!finite(venue))return {valid:false,errors:['venue_origin_altitude_required'],value:null,datum:null,method:null};
 let msl;
 if(source==='MSL')msl=value;
 else if(source==='AGL')msl=terrain+value;
 else if(source==='WGS84_ELLIPSOID')msl=value-geoid;
 else msl=venue+value;
 let converted;
 if(target==='MSL')converted=msl;
 else if(target==='AGL')converted=msl-terrain;
 else if(target==='WGS84_ELLIPSOID')converted=msl+geoid;
 else converted=msl-venue;
 if(!finite(converted))return {valid:false,errors:['altitude_conversion_non_finite'],value:null,datum:null,method:null};
 return {valid:true,errors:[],value:converted,datum:target,method:source+'_to_'+target};
}
const api={DATUMS,convertAltitude};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MonumentVerticalDatum=api;
})(typeof globalThis!=='undefined'?globalThis:this);
