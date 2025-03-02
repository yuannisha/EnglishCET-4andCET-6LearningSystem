"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  __name: "learning-records",
  setup(__props) {
    const recordList = common_vendor.ref([]);
    const pagination = common_vendor.ref({
      current: 1,
      pageSize: 10,
      total: 0
    });
    const currentCategory = common_vendor.ref("CET4");
    const categoryOptions = common_vendor.ref([
      { value: "CET4", label: "大学英语四级" },
      { value: "CET6", label: "大学英语六级" }
    ]);
    const currentType = common_vendor.ref("all");
    const typeOptions = common_vendor.ref([
      { value: "all", label: "全部" },
      { value: "mock", label: "模拟考试" },
      { value: "real", label: "真题练习" },
      { value: "listening", label: "听力练习" },
      { value: "reading", label: "阅读练习" },
      { value: "writing", label: "写作练习" },
      { value: "translation", label: "翻译练习" },
      { value: "real_listening", label: "听力真题" },
      { value: "real_reading", label: "阅读真题" },
      { value: "real_translation", label: "翻译真题" },
      { value: "real_writing", label: "写作真题" }
    ]);
    const loadRecords = async () => {
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        const { result } = await common_vendor.er.callFunction({
          name: "getPracticeRecords",
          data: {
            user_id: common_vendor.index.getStorageSync("userInfo")._id,
            category: currentCategory.value,
            practice_type: currentType.value === "all" ? void 0 : currentType.value,
            page: pagination.value.current,
            pageSize: pagination.value.pageSize
          }
        });
        if (result.code === 0) {
          recordList.value = result.data.list;
          pagination.value.total = result.data.total;
          common_vendor.index.__f__("log", "at pages/mine/learning-records/learning-records.vue:75", "recordList", recordList.value);
        } else {
          throw new Error(result.msg);
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: "加载记录失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const handleCategoryChange = (category) => {
      currentCategory.value = category;
      pagination.value.current = 1;
      loadRecords();
    };
    const handleTypeChange = (type) => {
      currentType.value = type;
      pagination.value.current = 1;
      loadRecords();
    };
    const handlePageChange = (page) => {
      pagination.value.current = page;
      loadRecords();
    };
    const formatDate = (timestamp) => {
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    };
    const formatType = (type) => {
      const option = typeOptions.value.find((item) => item.value === type);
      return option ? option.label : type;
    };
    const formatDuration = (duration) => {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      return `${minutes}分${seconds}秒`;
    };
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
        loadRecords();
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(categoryOptions.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: item.value,
            c: currentCategory.value === item.value ? 1 : "",
            d: common_vendor.o(($event) => handleCategoryChange(item.value), item.value)
          };
        }),
        b: common_vendor.f(typeOptions.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: item.value,
            c: currentType.value === item.value ? 1 : "",
            d: common_vendor.o(($event) => handleTypeChange(item.value), item.value)
          };
        }),
        c: recordList.value.length > 0
      }, recordList.value.length > 0 ? {
        d: common_vendor.f(recordList.value, (record, index, i0) => {
          var _a, _b, _c, _d, _e;
          return common_vendor.e({
            a: common_vendor.t(formatType(record.practice_type)),
            b: common_vendor.t(formatDate(record.create_date)),
            c: common_vendor.t(((_a = record.scores) == null ? void 0 : _a.total) || record.lastScore),
            d: record.practice_type === "mock" || record.practice_type === "real"
          }, record.practice_type === "mock" || record.practice_type === "real" ? {
            e: common_vendor.t(((_b = record.scores) == null ? void 0 : _b.listening) || 0)
          } : {}, {
            f: record.practice_type === "mock" || record.practice_type === "real"
          }, record.practice_type === "mock" || record.practice_type === "real" ? {
            g: common_vendor.t(((_c = record.scores) == null ? void 0 : _c.reading) || 0)
          } : {}, {
            h: record.practice_type === "mock" || record.practice_type === "real"
          }, record.practice_type === "mock" || record.practice_type === "real" ? {
            i: common_vendor.t(((_d = record.scores) == null ? void 0 : _d.translation) || 0)
          } : {}, {
            j: record.practice_type === "mock" || record.practice_type === "real"
          }, record.practice_type === "mock" || record.practice_type === "real" ? {
            k: common_vendor.t(((_e = record.scores) == null ? void 0 : _e.writing) || 0)
          } : {}, {
            l: record.duration
          }, record.duration ? {
            m: common_vendor.t(formatDuration(record.duration))
          } : {}, {
            n: record.practice_type !== "mock" && record.practice_type !== "translation" && record.practice_type !== "writing" && record.practice_type !== "real_translation" && record.practice_type !== "real_writing"
          }, record.practice_type !== "mock" && record.practice_type !== "translation" && record.practice_type !== "writing" && record.practice_type !== "real_translation" && record.practice_type !== "real_writing" ? {
            o: common_vendor.t(record.lastCorrectRate)
          } : {}, {
            p: record.practice_type !== "mock" && record.practice_type !== "translation" && record.practice_type !== "writing" && record.practice_type !== "real_translation" && record.practice_type !== "real_writing"
          }, record.practice_type !== "mock" && record.practice_type !== "translation" && record.practice_type !== "writing" && record.practice_type !== "real_translation" && record.practice_type !== "real_writing" ? common_vendor.e({
            q: record.practice_type === "real_listening" || record.practice_type === "listening"
          }, record.practice_type === "real_listening" || record.practice_type === "listening" ? {
            r: common_vendor.t(record.lastCorrectCount)
          } : {}, {
            s: record.practice_type === "real_reading" || record.practice_type === "reading"
          }, record.practice_type === "real_reading" || record.practice_type === "reading" ? {
            t: common_vendor.t(record.lastCorrectCount)
          } : {}) : {}, {
            v: record.practice_type === "translation" || record.practice_type === "writing" || record.practice_type === "real_translation" || record.practice_type === "real_writing"
          }, record.practice_type === "translation" || record.practice_type === "writing" || record.practice_type === "real_translation" || record.practice_type === "real_writing" ? {} : {}, {
            w: record._id
          });
        })
      } : {}, {
        e: recordList.value.length > 0
      }, recordList.value.length > 0 ? {
        f: common_vendor.t(pagination.value.total),
        g: pagination.value.current <= 1,
        h: common_vendor.o(($event) => handlePageChange(pagination.value.current - 1)),
        i: common_vendor.t(pagination.value.current),
        j: pagination.value.current >= Math.ceil(pagination.value.total / pagination.value.pageSize),
        k: common_vendor.o(($event) => handlePageChange(pagination.value.current + 1))
      } : {});
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/mine/learning-records/learning-records.js.map
