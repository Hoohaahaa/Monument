(function(){
  "use strict";
  const NativeAR = {
    version: 1,
    available: () => !!(window.MonumentAR && typeof window.MonumentAR.startGeospatial === "function"),
    info: () => {
      if (!window.MonumentAR || typeof window.MonumentAR.getRuntimeInfo !== "function") return null;
      try { return JSON.parse(window.MonumentAR.getRuntimeInfo()); } catch (_) { return null; }
    },
    start: () => {
      if (!NativeAR.available()) return {ok:false, reason:"native-bridge-unavailable"};
      window.MonumentAR.startGeospatial();
      return {ok:true, state:"requested"};
    },
    stop: () => {
      if (!NativeAR.available()) return {ok:false, reason:"native-bridge-unavailable"};
      window.MonumentAR.stopGeospatial();
      return {ok:true, state:"stop-requested"};
    }
  };
  window.MonumentNativeAR = NativeAR;
  window.addEventListener("monument:arcore", event => {
    const detail = event && event.detail ? event.detail : {};
    const name = detail.type === "pose" ? "monument:native-pose" :
      detail.type === "capabilities" ? "monument:native-capabilities" : "monument:native-state";
    window.dispatchEvent(new CustomEvent(name, {detail}));
  });
  window.dispatchEvent(new CustomEvent("monument:native-bridge-ready", {
    detail:{available:NativeAR.available(), info:NativeAR.info(), bridgeVersion:1}
  }));
})();
