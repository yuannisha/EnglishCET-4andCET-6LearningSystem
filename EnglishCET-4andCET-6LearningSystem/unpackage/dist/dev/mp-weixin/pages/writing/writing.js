"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "writing",
  setup(__props) {
    const currentCategory = common_vendor.ref("CET4");
    const categoryOptions = common_vendor.ref([
      { value: "CET4", label: "四级写作" },
      { value: "CET6", label: "六级写作" }
    ]);
    const currentSet = common_vendor.ref(1);
    const totalSets = common_vendor.ref(0);
    const questionId = common_vendor.ref("");
    const questionList = common_vendor.ref([]);
    const userAnswer = common_vendor.ref("");
    const userScore = common_vendor.ref(0);
    const showReference = common_vendor.ref(false);
    const currentWordCount = common_vendor.ref(0);
    const loadQuestions = async () => {
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        const { result } = await common_vendor.er.callFunction({
          name: "getWritingQuestions",
          data: {
            category: currentCategory.value,
            set_number: currentSet.value
          }
        });
        if (result.code === 0) {
          questionList.value = result.data.list;
          totalSets.value = result.data.total_sets.total;
          questionId.value = questionList.value[0]._id;
          userAnswer.value = "";
          showReference.value = false;
          currentWordCount.value = 0;
        } else {
          common_vendor.index.showToast({
            title: result.msg || "加载失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/writing/writing.vue:91", "加载题目失败:", e);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const handleCategoryChange = (category) => {
      currentCategory.value = category;
      currentSet.value = 1;
      questionChange();
      loadQuestions();
    };
    const questionChange = () => {
      userAnswer.value = "";
      showReference.value = false;
      userScore.value = 0;
      currentWordCount.value = 0;
    };
    const prevSet = () => {
      if (currentSet.value > 1) {
        currentSet.value--;
        questionChange();
        loadQuestions();
      }
    };
    const nextSet = () => {
      if (currentSet.value < totalSets.value) {
        currentSet.value++;
        questionChange();
        loadQuestions();
      }
    };
    const updateWordCount = (e) => {
      const text = e.detail.value;
      userAnswer.value = text;
      currentWordCount.value = text.trim() ? text.trim().split(/\s+/).length : 0;
    };
    const checkInput = (e) => {
      const text = e.detail.value;
      if (/[^\x00-\xff\s\p{P}]/u.test(text)) {
        common_vendor.index.showToast({
          title: "请输入英文",
          icon: "none"
        });
        userAnswer.value = text.replace(/[^\x00-\xff\s\p{P}]/gu, "");
        return;
      }
    };
    const submitAnswer = async () => {
      if (!userAnswer.value.trim()) {
        common_vendor.index.showToast({
          title: "请先完成写作",
          icon: "none"
        });
        return;
      }
      const wordLimit = questionList.value[0].word_limit;
      if (currentWordCount.value < wordLimit.min || currentWordCount.value > wordLimit.max) {
        common_vendor.index.showToast({
          title: `字数应在${wordLimit.min}-${wordLimit.max}之间`,
          icon: "none"
        });
        return;
      }
      try {
        const maxScore = questionList.value[0].score;
        userScore.value = Math.round((maxScore - Math.random() * 20) * 10) / 10;
        const user_id = common_vendor.index.getStorageSync("userInfo")._id;
        await common_vendor.er.callFunction({
          name: "saveAndUpdatePracticeRecord",
          data: {
            userId: user_id,
            question_id: questionId.value,
            question_type: "writing",
            userScore: userScore.value
          }
        });
        showReference.value = true;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/writing/writing.vue:211", e);
        common_vendor.index.showToast({
          title: "提交失败",
          icon: "none"
        });
      }
    };
    const restartPractice = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要重新开始练习吗？",
        success: (res) => {
          if (res.confirm) {
            userAnswer.value = "";
            userScore.value = 0;
            showReference.value = false;
            currentWordCount.value = 0;
            loadQuestions();
          }
        }
      });
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
        loadQuestions();
      }
    });
    common_vendor.onShow(() => {
      if (common_vendor.index.getStorageSync("userInfo")) {
        loadQuestions();
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
        b: showReference.value
      }, showReference.value ? {
        c: common_vendor.t(userScore.value),
        d: common_vendor.o(restartPractice)
      } : {}, {
        e: common_vendor.t(currentSet.value),
        f: common_vendor.t(totalSets.value),
        g: common_vendor.o(prevSet),
        h: currentSet.value <= 1,
        i: common_vendor.o(nextSet),
        j: currentSet.value >= totalSets.value,
        k: questionList.value && questionList.value.length > 0
      }, questionList.value && questionList.value.length > 0 ? common_vendor.e({
        l: common_vendor.t(questionList.value[0].title),
        m: common_vendor.t(questionList.value[0].description),
        n: common_vendor.t(questionList.value[0].word_limit.min),
        o: common_vendor.t(questionList.value[0].word_limit.max),
        p: showReference.value,
        q: common_vendor.o([($event) => userAnswer.value = $event.detail.value, updateWordCount]),
        r: common_vendor.o(checkInput),
        s: userAnswer.value,
        t: common_vendor.t(currentWordCount.value),
        v: currentWordCount.value < questionList.value[0].word_limit.min || currentWordCount.value > questionList.value[0].word_limit.max ? 1 : "",
        w: showReference.value
      }, showReference.value ? {
        x: common_vendor.t(questionList.value[0].reference_answer)
      } : {}) : {}, {
        y: common_vendor.o(submitAnswer),
        z: showReference.value
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/writing/writing.js.map
