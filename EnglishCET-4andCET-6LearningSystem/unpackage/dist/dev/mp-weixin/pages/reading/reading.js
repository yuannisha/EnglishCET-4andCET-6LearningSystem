"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "reading",
  setup(__props) {
    const currentCategory = common_vendor.ref("CET4");
    const categoryOptions = common_vendor.ref([
      { value: "CET4", label: "四级阅读" },
      { value: "CET6", label: "六级阅读" }
    ]);
    const currentSet = common_vendor.ref(1);
    const totalSets = common_vendor.ref(0);
    const questionId = common_vendor.ref("");
    const questionList = common_vendor.ref([]);
    const userAnswers = common_vendor.ref({});
    const userScore = common_vendor.ref(0);
    const correctRate = common_vendor.ref(0);
    const correctCount = common_vendor.ref(0);
    const showAnswers = common_vendor.ref(false);
    const hasAnsweredAll = common_vendor.ref(false);
    const loadQuestions = async () => {
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        const { result } = await common_vendor.er.callFunction({
          name: "getReadingQuestions",
          data: {
            category: currentCategory.value,
            set_number: currentSet.value
          }
        });
        common_vendor.index.__f__("log", "at pages/reading/reading.vue:84", "result", result);
        if (result.code === 0) {
          questionList.value = result.data.list;
          totalSets.value = result.data.total_sets.total;
          questionId.value = questionList.value[0]._id;
          userAnswers.value = {};
          showAnswers.value = false;
          hasAnsweredAll.value = false;
        } else {
          common_vendor.index.showToast({
            title: result.msg || "加载失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/reading/reading.vue:102", "加载题目失败:", e);
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
      userAnswers.value = {};
      showAnswers.value = false;
      correctCount.value = 0;
      correctRate.value = 0;
      userScore.value = 0;
      hasAnsweredAll.value = false;
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
    const selectAnswer = (questionNumber, answer) => {
      if (showAnswers.value) {
        common_vendor.index.showToast({
          title: "答案已提交，请勿重复作答",
          icon: "none"
        });
        return;
      }
      userAnswers.value[`${questionNumber}`] = answer;
      if (Object.keys(userAnswers.value).length === questionList.value[0].questions.length) {
        hasAnsweredAll.value = true;
      } else {
        hasAnsweredAll.value = false;
      }
    };
    const submitAnswers = async () => {
      if (Object.keys(userAnswers.value).length === 0) {
        common_vendor.index.showToast({
          title: "请先作答",
          icon: "none"
        });
        return;
      }
      if (showAnswers.value) {
        common_vendor.index.showToast({
          title: "答案已提交，请勿重复作答",
          icon: "none"
        });
        return;
      }
      try {
        questionList.value[0].answers.forEach((answer, index) => {
          if (userAnswers.value[`${index + 1}`] === answer.content) {
            userScore.value += answer.score;
            correctCount.value++;
          }
        });
        correctRate.value = Math.round(correctCount.value / questionList.value[0].questions.length * 100);
        const user_id = common_vendor.index.getStorageSync("userInfo")._id;
        common_vendor.index.__f__("log", "at pages/reading/reading.vue:210", "user_id", user_id);
        common_vendor.index.__f__("log", "at pages/reading/reading.vue:211", "questionId.value", questionId.value);
        common_vendor.index.__f__("log", "at pages/reading/reading.vue:212", "correctCount.value", correctCount.value);
        common_vendor.index.__f__("log", "at pages/reading/reading.vue:213", "correctRate.value", correctRate.value);
        common_vendor.index.__f__("log", "at pages/reading/reading.vue:214", "userScore.value", userScore.value);
        await common_vendor.er.callFunction({
          name: "saveAndUpdatePracticeRecord",
          data: {
            userId: user_id,
            question_id: questionId.value,
            practice_type: "reading",
            correctCount: correctCount.value,
            correctRate: correctRate.value,
            userScore: userScore.value
          }
        });
        showAnswers.value = true;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/reading/reading.vue:230", e);
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
            userAnswers.value = {};
            correctCount.value = 0;
            correctRate.value = 0;
            userScore.value = 0;
            showAnswers.value = false;
            hasAnsweredAll.value = false;
            loadQuestions();
          }
        }
      });
    };
    const resetAnswers = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要重置所有答案吗？",
        success: (res) => {
          if (res.confirm) {
            userAnswers.value = {};
            showAnswers.value = false;
            hasAnsweredAll.value = false;
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
        b: showAnswers.value
      }, showAnswers.value ? {
        c: common_vendor.t(correctRate.value),
        d: common_vendor.t(userScore.value),
        e: common_vendor.t(correctCount.value),
        f: common_vendor.o(restartPractice)
      } : {}, {
        g: common_vendor.t(currentSet.value),
        h: common_vendor.t(totalSets.value),
        i: common_vendor.o(prevSet),
        j: currentSet.value <= 1,
        k: common_vendor.o(nextSet),
        l: currentSet.value >= totalSets.value,
        m: questionList.value && questionList.value.length > 0
      }, questionList.value && questionList.value.length > 0 ? {
        n: common_vendor.t(questionList.value[0].passage),
        o: common_vendor.f(questionList.value[0].questions, (question, index, i0) => {
          return {
            a: common_vendor.t(index + 1),
            b: common_vendor.t(question.question),
            c: common_vendor.f(question.options, (content, key, i1) => {
              return {
                a: common_vendor.t(key),
                b: common_vendor.t(content),
                c: key,
                d: userAnswers.value[`${index + 1}`] === key ? 1 : "",
                e: showAnswers.value && questionList.value[0].answers[index].content === key ? 1 : "",
                f: showAnswers.value && userAnswers.value[`${index + 1}`] === key && questionList.value[0].answers[index].content !== key ? 1 : "",
                g: common_vendor.o(($event) => selectAnswer(index + 1, key), key)
              };
            }),
            d: index
          };
        })
      } : {}, {
        p: common_vendor.o(resetAnswers),
        q: !Object.keys(userAnswers.value).length,
        r: common_vendor.o(submitAnswers),
        s: !hasAnsweredAll.value || showAnswers.value
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/reading/reading.js.map
