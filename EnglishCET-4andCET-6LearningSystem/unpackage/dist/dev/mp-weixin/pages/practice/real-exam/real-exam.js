"use strict";
const common_vendor = require("../../../common/vendor.js");
const EXAM_TIME = 45;
const _sfc_main = {
  __name: "real-exam",
  setup(__props) {
    common_vendor.ref("ready");
    const remainingTime = common_vendor.ref(EXAM_TIME * 60);
    const questionList = common_vendor.ref([]);
    const currentIndex = common_vendor.ref(0);
    const userAnswers = common_vendor.ref([]);
    const score = common_vendor.ref(0);
    const correctRate = common_vendor.ref(0);
    const correctCount = common_vendor.ref(0);
    const showAnalysis = common_vendor.ref(false);
    const currentCategory = common_vendor.ref("CET4");
    const categoryOptions = common_vendor.ref([
      { value: "CET4", label: "大学英语四级" },
      { value: "CET6", label: "大学英语六级" }
    ]);
    const yearList = common_vendor.ref([]);
    const currentYear = common_vendor.ref("");
    const currentMonth = common_vendor.ref("");
    const monthList = common_vendor.ref([]);
    const currentType = common_vendor.ref("listening");
    const typeOptions = common_vendor.ref([
      { value: "listening", label: "听力" },
      { value: "reading", label: "阅读" },
      { value: "translation", label: "翻译" },
      { value: "writing", label: "写作" }
    ]);
    const paperData = common_vendor.ref(null);
    const audioContext = common_vendor.ref(null);
    const isPlaying = common_vendor.ref(false);
    const loadQuestions = async () => {
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        userAnswers.value = [];
        correctCount.value = 0;
        correctRate.value = 0;
        score.value = 0;
        showAnalysis.value = false;
        currentIndex.value = 0;
        remainingTime.value = EXAM_TIME * 60;
        isPlaying.value = false;
        if (audioContext.value) {
          audioContext.value.pause();
          audioContext.value.destroy();
          audioContext.value = null;
        }
        const { result } = await common_vendor.er.callFunction({
          name: "getRealExamQuestions",
          data: {
            category: currentCategory.value,
            type: currentType.value,
            year: currentYear.value,
            month: currentMonth.value
          }
        });
        if (result.code === 0) {
          questionList.value = result.data.list;
          initAnswers();
          showAnalysis.value = false;
          score.value = 0;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/practice/real-exam/real-exam.vue:160", e);
        common_vendor.index.showToast({
          title: "加载题目失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const initAnswers = () => {
      common_vendor.index.__f__("log", "at pages/practice/real-exam/real-exam.vue:174", "questionList", questionList.value);
      if (currentType.value === "listening" || currentType.value === "reading") {
        userAnswers.value = new Array(questionList.value[0].answers.length).fill("");
      } else {
        userAnswers.value = "";
      }
      common_vendor.index.__f__("log", "at pages/practice/real-exam/real-exam.vue:180", "userAnswers", userAnswers.value);
    };
    const selectAnswer = (index, answer) => {
      userAnswers.value[index] = answer;
    };
    const loadYearList = async () => {
      try {
        const { result } = await common_vendor.er.callFunction({
          name: "getRealExamQuestions",
          data: {
            category: currentCategory.value,
            type: currentType.value
          }
        });
        if (result.code === 0) {
          yearList.value = result.data.years;
          if (yearList.value.length > 0) {
            currentYear.value = yearList.value[0];
            loadMonthList();
          }
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/practice/real-exam/real-exam.vue:304", e);
        common_vendor.index.showToast({
          title: "加载年份失败",
          icon: "none"
        });
      }
    };
    const loadMonthList = async () => {
      try {
        const { result } = await common_vendor.er.callFunction({
          name: "getRealExamQuestions",
          data: {
            category: currentCategory.value,
            type: currentType.value,
            year: currentYear.value
          }
        });
        if (result.code === 0) {
          monthList.value = result.data.months;
          if (monthList.value.length > 0) {
            currentMonth.value = monthList.value[0];
            loadQuestions();
          }
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/practice/real-exam/real-exam.vue:334", e);
        common_vendor.index.showToast({
          title: "加载月份失败",
          icon: "none"
        });
      }
    };
    const handleCategoryChange = (category) => {
      currentCategory.value = category;
      currentYear.value = "";
      currentMonth.value = "";
      paperData.value = null;
      loadYearList();
    };
    const handleYearChange = (year) => {
      currentYear.value = year;
      loadMonthList();
    };
    const handleMonthChange = (month) => {
      currentMonth.value = month;
      loadQuestions();
    };
    const handleTypeChange = (type) => {
      currentType.value = type;
      loadYearList();
    };
    const playAudio = () => {
      var _a;
      if (!((_a = questionList.value[0]) == null ? void 0 : _a.audio_file))
        return;
      if (!audioContext.value) {
        audioContext.value = common_vendor.index.createInnerAudioContext();
        audioContext.value.src = questionList.value[0].audio_file;
        audioContext.value.onPlay(() => {
          isPlaying.value = true;
        });
        audioContext.value.onEnded(() => {
          isPlaying.value = false;
        });
        audioContext.value.onError(() => {
          isPlaying.value = false;
          common_vendor.index.showToast({
            title: "音频播放失败",
            icon: "none"
          });
        });
      }
      if (isPlaying.value) {
        audioContext.value.pause();
        isPlaying.value = false;
        common_vendor.index.__f__("log", "at pages/practice/real-exam/real-exam.vue:409", "暂停音频");
      } else {
        audioContext.value.play();
        isPlaying.value = true;
        common_vendor.index.__f__("log", "at pages/practice/real-exam/real-exam.vue:414", "播放音频");
      }
    };
    const checkEnglishInput = (e) => {
      const text = e.detail.value;
      if (/[^\x00-\xff\s\p{P}]/u.test(text)) {
        common_vendor.index.showToast({
          title: "请输入英文",
          icon: "none"
        });
        userAnswers.value = text.replace(/[^\x00-\xff\s\p{P}]/gu, "");
      }
    };
    const submitAnswer = async () => {
      if (currentType.value === "listening" || currentType.value === "reading") {
        if (userAnswers.value.includes("")) {
          common_vendor.index.showToast({
            title: "请完成所有题目",
            icon: "none"
          });
          return;
        }
      } else if (!userAnswers.value.trim()) {
        common_vendor.index.showToast({
          title: "请输入答案",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({
          title: "提交中..."
        });
        common_vendor.index.__f__("log", "at pages/practice/real-exam/real-exam.vue:456", "userAnswers", userAnswers.value);
        let practiceType = "";
        if (currentType.value === "listening") {
          practiceType = "real_listening";
        } else if (currentType.value === "reading") {
          practiceType = "real_reading";
        } else if (currentType.value === "translation") {
          practiceType = "real_translation";
        } else if (currentType.value === "writing") {
          practiceType = "real_writing";
        }
        if (currentType.value === "listening" || currentType.value === "reading") {
          correctCount.value = questionList.value[0].answers.reduce((total, answer, index) => {
            common_vendor.index.__f__("log", "at pages/practice/real-exam/real-exam.vue:470", "userAnswers.value[index]", userAnswers.value[index]);
            common_vendor.index.__f__("log", "at pages/practice/real-exam/real-exam.vue:471", "answer.content", answer.content);
            return total + (userAnswers.value[index] === answer.content ? 1 : 0);
          }, 0);
          correctRate.value = Math.round(correctCount.value / questionList.value[0].answers.length * 100);
          score.value = Math.round(questionList.value[0].answers.reduce((total, answer, index) => {
            return total + (userAnswers.value[index] === answer.content ? answer.score : 0);
          }, 0) * 10) / 10;
          await common_vendor.er.callFunction({
            name: "saveAndUpdatePracticeRecord",
            data: {
              userId: common_vendor.index.getStorageSync("userInfo")._id,
              question_id: questionList.value[0]._id,
              practice_type: practiceType,
              year: currentYear.value,
              month: currentMonth.value,
              userScore: score.value,
              correctCount: correctCount.value,
              correctRate: correctRate.value
            }
          });
        } else {
          score.value = Math.round((questionList.value[0].score - Math.random() * 20) * 10) / 10;
          await common_vendor.er.callFunction({
            name: "saveAndUpdatePracticeRecord",
            data: {
              userId: common_vendor.index.getStorageSync("userInfo")._id,
              question_id: questionList.value[0]._id,
              practice_type: practiceType,
              year: currentYear.value,
              month: currentMonth.value,
              userScore: score.value
            }
          });
        }
        showAnalysis.value = true;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/practice/real-exam/real-exam.vue:514", e);
        common_vendor.index.showToast({
          title: "提交失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const restartPractice = () => {
      initAnswers();
      showAnalysis.value = false;
      score.value = 0;
      if (currentType.value === "listening") {
        playAudio();
      }
    };
    common_vendor.onUnmounted(() => {
      if (audioContext.value) {
        audioContext.value.pause();
        isPlaying.value = false;
        common_vendor.index.__f__("log", "at pages/practice/real-exam/real-exam.vue:540", "卸载音频");
        audioContext.value.destroy();
      }
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
        loadYearList();
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
        c: common_vendor.f(yearList.value, (year, k0, i0) => {
          return {
            a: common_vendor.t(year),
            b: year,
            c: currentYear.value === year ? 1 : "",
            d: common_vendor.o(($event) => handleYearChange(year), year)
          };
        }),
        d: common_vendor.f(monthList.value, (month, k0, i0) => {
          return {
            a: common_vendor.t(month),
            b: month,
            c: currentMonth.value === month ? 1 : "",
            d: common_vendor.o(($event) => handleMonthChange(month), month)
          };
        }),
        e: questionList.value.length > 0
      }, questionList.value.length > 0 ? common_vendor.e({
        f: currentType.value === "listening"
      }, currentType.value === "listening" ? {
        g: common_vendor.t(isPlaying.value ? "暂停" : "播放"),
        h: common_vendor.o(playAudio),
        i: common_vendor.f(questionList.value[0].question_content, (section, sectionIndex, i0) => {
          return {
            a: common_vendor.t(section.section_name),
            b: common_vendor.t(section.description),
            c: common_vendor.f(section.questions, (question, questionIndex, i1) => {
              return {
                a: common_vendor.t(question.description1),
                b: common_vendor.f(question.options, (option, key, i2) => {
                  return {
                    a: common_vendor.t(option.tips),
                    b: common_vendor.f(option.content, (content, key2, i3) => {
                      return {
                        a: common_vendor.t(key2),
                        b: common_vendor.t(content),
                        c: key2,
                        d: userAnswers.value[option.tips - 1] === key2 ? 1 : "",
                        e: common_vendor.o(($event) => selectAnswer(option.tips - 1, key2), key2)
                      };
                    }),
                    c: option.tips
                  };
                }),
                c: questionIndex
              };
            }),
            d: sectionIndex
          };
        })
      } : {}, {
        j: currentType.value === "reading"
      }, currentType.value === "reading" ? {
        k: common_vendor.t(questionList.value[0].little_title),
        l: common_vendor.t(questionList.value[0].passage),
        m: common_vendor.f(questionList.value[0].questions, (question, index, i0) => {
          return {
            a: common_vendor.t(question.question_number),
            b: common_vendor.t(question.question),
            c: common_vendor.f(question.options, (content, key, i1) => {
              return {
                a: common_vendor.t(key),
                b: common_vendor.t(content),
                c: key,
                d: userAnswers.value[index] === key ? 1 : "",
                e: common_vendor.o(($event) => selectAnswer(index, key), key)
              };
            }),
            d: index
          };
        })
      } : {}, {
        n: currentType.value === "translation"
      }, currentType.value === "translation" ? common_vendor.e({
        o: common_vendor.t(questionList.value[0].little_title),
        p: common_vendor.t(questionList.value[0].original_text),
        q: showAnalysis.value,
        r: common_vendor.o(checkEnglishInput),
        s: userAnswers.value,
        t: common_vendor.o(($event) => userAnswers.value = $event.detail.value),
        v: showAnalysis.value
      }, showAnalysis.value ? {
        w: common_vendor.t(questionList.value[0].reference_translation)
      } : {}) : {}, {
        x: currentType.value === "writing"
      }, currentType.value === "writing" ? common_vendor.e({
        y: common_vendor.t(questionList.value[0].little_title),
        z: common_vendor.t(questionList.value[0].title),
        A: common_vendor.t(questionList.value[0].word_limit.min),
        B: common_vendor.t(questionList.value[0].word_limit.max),
        C: showAnalysis.value,
        D: common_vendor.o(checkEnglishInput),
        E: userAnswers.value,
        F: common_vendor.o(($event) => userAnswers.value = $event.detail.value),
        G: showAnalysis.value
      }, showAnalysis.value ? {
        H: common_vendor.t(questionList.value[0].reference_answer)
      } : {}) : {}) : {}, {
        I: showAnalysis.value
      }, showAnalysis.value ? {
        J: common_vendor.t(score.value)
      } : {}, {
        K: showAnalysis.value
      }, showAnalysis.value ? {
        L: common_vendor.o(restartPractice)
      } : {
        M: common_vendor.o(submitAnswer)
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/practice/real-exam/real-exam.js.map
