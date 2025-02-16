"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  __name: "favorites",
  setup(__props) {
    const typeOptions = common_vendor.ref([
      { value: "word", label: "单词" },
      { value: "listening", label: "听力" },
      { value: "reading", label: "阅读" },
      { value: "translation", label: "翻译" },
      { value: "writing", label: "写作" }
    ]);
    const currentType = common_vendor.ref("word");
    const handleTypeChange = (type) => {
      currentType.value = type;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(typeOptions.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: item.value,
            c: currentType.value === item.value ? 1 : "",
            d: common_vendor.o(($event) => handleTypeChange(item.value), item.value)
          };
        }),
        b: currentType.value === "word"
      }, currentType.value === "word" ? {} : {}, {
        c: currentType.value === "listening"
      }, currentType.value === "listening" ? {} : {}, {
        d: currentType.value === "reading"
      }, currentType.value === "reading" ? {} : {}, {
        e: currentType.value === "translation"
      }, currentType.value === "translation" ? {} : {}, {
        f: currentType.value === "writing"
      }, currentType.value === "writing" ? {} : {});
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/mine/favorites/favorites.js.map
