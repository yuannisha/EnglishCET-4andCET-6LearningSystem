"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  __name: "study-plan",
  setup(__props) {
    const planList = common_vendor.ref([
      {
        title: "单词学习",
        target: "每天50个单词",
        progress: 30,
        icon: "📚"
      },
      {
        title: "听力练习",
        target: "每周3次",
        progress: 66,
        icon: "🎧"
      },
      {
        title: "阅读练习",
        target: "每周2篇",
        progress: 50,
        icon: "📖"
      },
      {
        title: "翻译练习",
        target: "每周2篇",
        progress: 0,
        icon: "✍️"
      },
      {
        title: "写作练习",
        target: "每周1篇",
        progress: 100,
        icon: "📝"
      }
    ]);
    const statistics = common_vendor.ref({
      totalDays: 30,
      continuousDays: 7,
      totalTime: 45,
      averageScore: 85
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(statistics.value.totalDays),
        b: common_vendor.t(statistics.value.continuousDays),
        c: common_vendor.t(statistics.value.totalTime),
        d: common_vendor.t(statistics.value.averageScore),
        e: common_vendor.f(planList.value, (plan, index, i0) => {
          return {
            a: common_vendor.t(plan.icon),
            b: common_vendor.t(plan.title),
            c: common_vendor.t(plan.target),
            d: plan.progress + "%",
            e: common_vendor.t(plan.progress),
            f: index
          };
        })
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/mine/study-plan/study-plan.js.map
