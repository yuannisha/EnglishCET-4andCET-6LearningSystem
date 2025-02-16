"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "practice",
  setup(__props) {
    const practiceTypes = common_vendor.ref([
      {
        id: 1,
        title: "模拟考试",
        desc: "完整模拟四六级考试流程",
        icon: "/static/icons/exam.png",
        path: "/pages/practice/mock-exam/mock-exam"
      },
      {
        id: 2,
        title: "真题练习",
        desc: "历年四六级真题训练",
        icon: "/static/icons/real-exam.png",
        path: "/pages/practice/real-exam/real-exam"
      }
    ]);
    const hasStudyDays = common_vendor.ref({
      days: common_vendor.index.getStorageSync("userInfo").study_days
    });
    const statistics = common_vendor.ref({
      todayQuestions: 0,
      correctRate: 0,
      studyDays: 0
    });
    const navigateToPage = (path) => {
      common_vendor.index.navigateTo({
        url: path
      });
    };
    const loadStatistics = async () => {
      try {
        const { result } = await common_vendor.er.callFunction({
          name: "getUserStatistics",
          data: {
            user_id: common_vendor.index.getStorageSync("userInfo")._id
          }
        });
        if (result.code === 0) {
          statistics.value = result.data.practice_record;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/practice/practice.vue:63", "获取统计数据失败", e);
      }
    };
    common_vendor.index.$on("practiceRecordUpdated", () => {
      loadStatistics();
    });
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
      } else {
        loadStatistics();
      }
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(statistics.value.total > 0 ? statistics.value.total : 0),
        b: common_vendor.t(hasStudyDays.value.days),
        c: common_vendor.f(practiceTypes.value, (item, k0, i0) => {
          return {
            a: item.icon,
            b: common_vendor.t(item.title),
            c: common_vendor.t(item.desc),
            d: item.id,
            e: common_vendor.o(($event) => navigateToPage(item.path), item.id)
          };
        })
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/practice/practice.js.map
