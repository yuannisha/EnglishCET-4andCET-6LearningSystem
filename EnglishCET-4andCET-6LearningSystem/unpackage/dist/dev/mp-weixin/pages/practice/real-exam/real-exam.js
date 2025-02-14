"use strict";
const common_vendor = require("../../../common/vendor.js");
const EXAM_TIME = 45;
const _sfc_main = {
  __name: "real-exam",
  setup(__props) {
    const examStatus = common_vendor.ref("ready");
    const remainingTime = common_vendor.ref(EXAM_TIME * 60);
    const questionList = common_vendor.ref([]);
    const currentIndex = common_vendor.ref(0);
    const userAnswers = common_vendor.ref([]);
    let timer = null;
    const score = common_vendor.ref(0);
    const showAnalysis = common_vendor.ref(false);
    const currentCategory = common_vendor.ref("CET4");
    common_vendor.ref([
      { value: "CET4", label: "四级真题" },
      { value: "CET6", label: "六级真题" }
    ]);
    const yearList = common_vendor.ref([]);
    const currentYear = common_vendor.ref("");
    const currentMonth = common_vendor.ref("");
    common_vendor.ref(null);
    const startExam = () => {
      examStatus.value = "ongoing";
      startTimer();
    };
    const startTimer = () => {
      timer = setInterval(() => {
        if (remainingTime.value > 0) {
          remainingTime.value--;
        } else {
          finishExam();
        }
      }, 1e3);
    };
    const finishExam = async () => {
      clearInterval(timer);
      examStatus.value = "finished";
      showAnalysis.value = true;
      try {
        common_vendor.index.showLoading({
          title: "正在提交..."
        });
        const { result } = await common_vendor.er.callFunction({
          name: "savePracticeRecord",
          data: {
            practice_type: "real",
            answers: userAnswers.value.map((answer, index) => ({
              questionId: questionList.value[index]._id,
              answer,
              isCorrect: answer === questionList.value[index].answer
            })),
            duration: EXAM_TIME * 60 - remainingTime.value
          }
        });
        if (result.code === 0) {
          score.value = result.data.score;
        } else {
          common_vendor.index.showToast({
            title: result.msg || "提交失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/practice/real-exam/real-exam.vue:175", "保存练习记录失败", e);
        common_vendor.index.showToast({
          title: "提交失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const selectAnswer = (answer) => {
      userAnswers.value[currentIndex.value] = answer;
    };
    const nextQuestion = () => {
      if (currentIndex.value < questionList.value.length - 1) {
        currentIndex.value++;
      }
    };
    const prevQuestion = () => {
      if (currentIndex.value > 0) {
        currentIndex.value--;
      }
    };
    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    };
    const loadYearList = async () => {
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        const { result } = await common_vendor.er.callFunction({
          name: "getRealExamYears",
          data: {
            category: currentCategory.value
          }
        });
        if (result.code === 0) {
          yearList.value = result.data;
          if (yearList.value.length > 0) {
            currentYear.value = yearList.value[0].year;
            currentMonth.value = yearList.value[0].months[0];
          }
        } else {
          throw new Error("加载年份列表失败");
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/practice/real-exam/real-exam.vue:245", e);
        common_vendor.index.showToast({
          title: "加载年份列表失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
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
        loadYearList();
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: examStatus.value === "ready"
      }, examStatus.value === "ready" ? {
        b: common_vendor.t(EXAM_TIME),
        c: common_vendor.t(questionList.value.length),
        d: common_vendor.o(startExam)
      } : examStatus.value === "ongoing" ? common_vendor.e({
        f: common_vendor.t(currentIndex.value + 1),
        g: common_vendor.t(questionList.value.length),
        h: common_vendor.t(formatTime(remainingTime.value)),
        i: questionList.value[currentIndex.value]
      }, questionList.value[currentIndex.value] ? {
        j: common_vendor.t(questionList.value[currentIndex.value].title),
        k: common_vendor.f(questionList.value[currentIndex.value].options, (option, k0, i0) => {
          return {
            a: common_vendor.t(option.key),
            b: common_vendor.t(option.content),
            c: option.key,
            d: userAnswers.value[currentIndex.value] === option.key ? 1 : "",
            e: common_vendor.o(($event) => selectAnswer(option.key), option.key)
          };
        })
      } : {}, {
        l: common_vendor.o(prevQuestion),
        m: common_vendor.o(nextQuestion),
        n: common_vendor.o(finishExam)
      }) : common_vendor.e({
        o: common_vendor.t(EXAM_TIME * 60 - remainingTime.value),
        p: common_vendor.t(score.value),
        q: showAnalysis.value
      }, showAnalysis.value ? {
        r: common_vendor.f(questionList.value, (question, index, i0) => {
          return {
            a: common_vendor.t(index + 1),
            b: common_vendor.t(userAnswers.value[index] === question.answer ? "正确" : "错误"),
            c: common_vendor.n(userAnswers.value[index] === question.answer ? "correct" : "wrong"),
            d: common_vendor.t(question.title),
            e: common_vendor.t(question.answer),
            f: common_vendor.t(question.analysis),
            g: index
          };
        })
      } : {}, {
        s: common_vendor.o(($event) => _ctx.navigateToPage("/pages/practice/practice"))
      }), {
        e: examStatus.value === "ongoing"
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/practice/real-exam/real-exam.js.map
