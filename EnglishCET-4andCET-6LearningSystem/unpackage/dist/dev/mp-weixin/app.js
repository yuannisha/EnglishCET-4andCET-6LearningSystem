"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/words/words.js";
  "./pages/practice/practice.js";
  "./pages/mine/mine.js";
  "./pages/mine/center.js";
  "./pages/practice/mock-exam/mock-exam.js";
  "./pages/practice/real-exam/real-exam.js";
  "./pages/practice/wrong-questions/wrong-questions.js";
  "./pages/login/login.js";
  "./pages/login/register.js";
  "./pages/listening/listening.js";
  "./pages/reading/reading.js";
  "./pages/writing/writing.js";
  "./pages/translation/translation.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:4", "App Launch");
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:7", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:10", "App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
