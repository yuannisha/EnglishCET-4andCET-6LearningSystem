"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  __name: "settings",
  setup(__props) {
    const settings = common_vendor.ref({
      notification: true,
      autoPlay: false,
      darkMode: false,
      fontSize: "medium"
    });
    const fontSizeOptions = [
      { value: "small", label: "小" },
      { value: "medium", label: "中" },
      { value: "large", label: "大" }
    ];
    const toggleSwitch = (key) => {
      settings.value[key] = !settings.value[key];
    };
    const selectFontSize = (size) => {
      settings.value.fontSize = size;
    };
    const logout = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.removeStorageSync("userInfo");
            common_vendor.index.reLaunch({
              url: "/pages/login/login"
            });
          }
        }
      });
    };
    const clearCache = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要清除缓存吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.clearStorageSync();
            common_vendor.index.showToast({
              title: "清除成功",
              icon: "success"
            });
          }
        }
      });
    };
    return (_ctx, _cache) => {
      return {
        a: settings.value.notification,
        b: common_vendor.o(($event) => toggleSwitch("notification")),
        c: settings.value.autoPlay,
        d: common_vendor.o(($event) => toggleSwitch("autoPlay")),
        e: settings.value.darkMode,
        f: common_vendor.o(($event) => toggleSwitch("darkMode")),
        g: common_vendor.f(fontSizeOptions, (option, k0, i0) => {
          return {
            a: common_vendor.t(option.label),
            b: option.value,
            c: settings.value.fontSize === option.value ? 1 : "",
            d: common_vendor.o(($event) => selectFontSize(option.value), option.value)
          };
        }),
        h: common_vendor.o(clearCache),
        i: common_vendor.o(logout)
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/mine/settings/settings.js.map
