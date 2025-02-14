"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const functionBlocks = common_vendor.ref([
      {
        id: 1,
        title: "单词学习",
        icon: "/static/icons/word.png",
        path: "/pages/words/words"
      },
      {
        id: 2,
        title: "听力训练",
        icon: "/static/icons/listening.png",
        path: "/pages/listening/listening"
      },
      {
        id: 3,
        title: "阅读理解",
        icon: "/static/icons/reading.png",
        path: "/pages/reading/reading"
      },
      {
        id: 4,
        title: "写作练习",
        icon: "/static/icons/writing.png",
        path: "/pages/writing/writing"
      },
      {
        id: 5,
        title: "翻译练习",
        icon: "/static/icons/translation.png",
        path: "/pages/translation/translation"
      }
    ]);
    common_vendor.onMounted(() => {
      if (!common_vendor.index.getStorageSync("userInfo")) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none",
          duration: 2e3
        });
        common_vendor.index.navigateTo({
          url: "/pages/login/login"
        });
      }
    });
    const navigateToPage = (path) => {
      if (path === "/pages/words/words") {
        common_vendor.index.switchTab({
          url: path
        });
      } else {
        common_vendor.index.navigateTo({
          url: path
        });
      }
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(functionBlocks.value, (item, k0, i0) => {
          return {
            a: item.icon,
            b: common_vendor.t(item.title),
            c: item.id,
            d: common_vendor.o(($event) => navigateToPage(item.path), item.id)
          };
        })
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
