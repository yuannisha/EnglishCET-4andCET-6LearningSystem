"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "listening",
  setup(__props) {
    const currentCategory = common_vendor.ref("CET4");
    const categoryOptions = common_vendor.ref([
      { value: "CET4", label: "四级听力" },
      { value: "CET6", label: "六级听力" }
    ]);
    const currentSet = common_vendor.ref(1);
    const hasAnsweredAll = common_vendor.ref(false);
    const totalSets = common_vendor.ref(0);
    const questionId = common_vendor.ref("");
    const questionList = common_vendor.ref([]);
    const userAnswers = common_vendor.ref({});
    const userScore = common_vendor.ref(0);
    const correctRate = common_vendor.ref(0);
    const correctCount = common_vendor.ref(0);
    const showAnswers = common_vendor.ref(false);
    const answers = common_vendor.ref([]);
    const isPlaying = common_vendor.ref(false);
    const audioContext = common_vendor.ref(null);
    const audioPlayed = common_vendor.ref(false);
    const loadQuestions = async () => {
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        const { result } = await common_vendor.er.callFunction({
          name: "getListeningQuestions",
          data: {
            category: currentCategory.value,
            set_number: currentSet.value
          }
        });
        common_vendor.index.__f__("log", "at pages/listening/listening.vue:105", "题目数据:", result);
        if (result.code === 0) {
          common_vendor.index.__f__("log", "at pages/listening/listening.vue:108", "题目数据:", result.data);
          questionList.value = result.data.list;
          totalSets.value = result.data.total_sets.total;
          answers.value = questionList.value[0].answers;
          questionId.value = questionList.value[0]._id;
          common_vendor.index.__f__("log", "at pages/listening/listening.vue:113", "questionId.value", questionId.value);
          userAnswers.value = {};
          showAnswers.value = false;
          hasAnsweredAll.value = false;
          if (audioContext.value) {
            audioContext.value.destroy();
            audioContext.value = null;
          }
          isPlaying.value = false;
          audioPlayed.value = false;
        } else {
          common_vendor.index.showToast({
            title: result.msg || "加载失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/listening/listening.vue:133", "加载题目失败:", e);
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
      answers.value = [];
      userAnswers.value = {};
      showAnswers.value = false;
      isPlaying.value = false;
      audioPlayed.value = false;
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
      common_vendor.index.__f__("log", "at pages/listening/listening.vue:195", "answers[questionNumber - 1]?.key", answers.value[questionNumber - 1].key);
      if (showAnswers.value) {
        common_vendor.index.showToast({
          title: "答案已提交，请勿重复作答",
          icon: "none"
        });
        return;
      }
      userAnswers.value[`${questionNumber}`] = answer;
      common_vendor.index.__f__("log", "at pages/listening/listening.vue:204", "userAnswers.value", userAnswers.value);
      common_vendor.index.__f__("log", "at pages/listening/listening.vue:205", "userAnswers.value.length", Object.keys(userAnswers.value).length);
      common_vendor.index.__f__("log", "at pages/listening/listening.vue:206", "questionList.value[0].answers.length", questionList.value[0].answers.length);
      if (Object.keys(userAnswers.value).length === questionList.value[0].answers.length) {
        hasAnsweredAll.value = true;
      } else {
        hasAnsweredAll.value = false;
      }
      common_vendor.index.__f__("log", "at pages/listening/listening.vue:212", "hasAnsweredAll.value", hasAnsweredAll.value);
    };
    const playAudio = () => {
      if (!questionList.value.length)
        return;
      if (!audioContext.value) {
        audioContext.value = common_vendor.index.createInnerAudioContext();
        audioContext.value.src = questionList.value[0].audio_file;
        audioContext.value.onPlay(() => {
          isPlaying.value = true;
          audioPlayed.value = true;
        });
        audioContext.value.onPause(() => {
          isPlaying.value = false;
        });
        audioContext.value.onEnded(() => {
          isPlaying.value = false;
          audioPlayed.value = true;
        });
        audioContext.value.onError((err) => {
          common_vendor.index.__f__("error", "at pages/listening/listening.vue:240", "音频播放错误:", err);
          isPlaying.value = false;
          common_vendor.index.showToast({
            title: "音频播放失败",
            icon: "none"
          });
        });
      }
      if (isPlaying.value) {
        audioContext.value.pause();
      } else {
        audioContext.value.play();
      }
    };
    const restartAudio = () => {
      if (!audioContext.value)
        return;
      audioContext.value.stop();
      audioContext.value.seek(0);
      setTimeout(() => {
        audioContext.value.play();
      }, 100);
    };
    const submitAnswers = async () => {
      common_vendor.index.__f__("log", "at pages/listening/listening.vue:273", userAnswers.value);
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
        Object.entries(userAnswers.value).map(([key, value]) => {
          var _a, _b, _c;
          common_vendor.index.__f__("log", "at pages/listening/listening.vue:292", "answers.value[key - 1].content", (_a = answers == null ? void 0 : answers.value[key - 1]) == null ? void 0 : _a.content);
          common_vendor.index.__f__("log", "at pages/listening/listening.vue:293", "key", key);
          common_vendor.index.__f__("log", "at pages/listening/listening.vue:294", "value", value);
          if (value === ((_b = answers == null ? void 0 : answers.value[key - 1]) == null ? void 0 : _b.content)) {
            userScore.value += Math.round(((_c = answers == null ? void 0 : answers.value[key - 1]) == null ? void 0 : _c.score) * 10) / 10;
            correctCount.value++;
          }
        });
        userScore.value = Math.round(userScore.value * 10) / 10;
        correctRate.value = Math.round(correctCount.value / Object.keys(userAnswers.value).length * 100) / 100 * 100;
        common_vendor.index.__f__("log", "at pages/listening/listening.vue:303", "correctCount", correctCount.value);
        common_vendor.index.__f__("log", "at pages/listening/listening.vue:304", "correctRate.value", correctRate.value);
        common_vendor.index.__f__("log", "at pages/listening/listening.vue:305", "userScore.value", userScore.value);
        common_vendor.index.__f__("log", "at pages/listening/listening.vue:307", "correctCount", correctCount.value);
        const user_id = common_vendor.index.getStorageSync("userInfo")._id;
        await common_vendor.er.callFunction({
          name: "saveAndUpdatePracticeRecord",
          data: {
            userId: user_id,
            question_id: questionId.value,
            question_type: "listening",
            correctCount: correctCount.value,
            correctRate: correctRate.value,
            userScore: userScore.value
          }
        });
        common_vendor.index.__f__("log", "at pages/listening/listening.vue:322", "showAnswers.value,到这里了！！111111", showAnswers.value);
        showAnswers.value = true;
        common_vendor.index.__f__("log", "at pages/listening/listening.vue:324", "showAnswers.value,到这里了！！", showAnswers.value);
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/listening/listening.vue:326", e);
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
      common_vendor.index.__f__("log", "at pages/listening/listening.vue:376", "onMounted triggered");
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
      common_vendor.index.__f__("log", "at pages/listening/listening.vue:392", "onShow triggered");
      if (common_vendor.index.getStorageSync("userInfo")) {
        loadQuestions();
      }
    });
    common_vendor.onHide(() => {
      common_vendor.index.__f__("log", "at pages/listening/listening.vue:399", "onHide triggered");
      if (audioContext.value) {
        audioContext.value.pause();
        isPlaying.value = false;
      }
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.__f__("log", "at pages/listening/listening.vue:407", "onUnmounted triggered");
      if (audioContext.value) {
        audioContext.value.destroy();
        isPlaying.value = false;
        audioPlayed.value = false;
      }
    });
    return (_ctx, _cache) => {
      var _a;
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
        n: common_vendor.f((_a = questionList.value[0]) == null ? void 0 : _a.question_content, (section, sectionIndex, i0) => {
          return {
            a: common_vendor.t(section.section_name),
            b: common_vendor.t(section.description),
            c: common_vendor.f(section.questions, (question, questionIndex, i1) => {
              return {
                a: common_vendor.t(question.description1),
                b: common_vendor.f(question.options, (option, k2, i2) => {
                  return {
                    a: common_vendor.t(option.tips),
                    b: common_vendor.f(option.content, (content, key, i3) => {
                      var _a2, _b;
                      return {
                        a: common_vendor.t(key),
                        b: common_vendor.t(content),
                        c: key,
                        d: userAnswers.value[`${option.tips}`] === key ? 1 : "",
                        e: showAnswers.value && ((_a2 = answers.value[option.tips - 1]) == null ? void 0 : _a2.content) === key ? 1 : "",
                        f: showAnswers.value && userAnswers.value[`${option.tips}`] === key && ((_b = answers.value[option.tips - 1]) == null ? void 0 : _b.content) !== key ? 1 : "",
                        g: common_vendor.o(($event) => selectAnswer(option.tips, key), key)
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
        o: common_vendor.t(isPlaying.value ? "暂停" : audioPlayed.value ? "继续" : "播放"),
        p: common_vendor.o(playAudio),
        q: !questionList.value.length,
        r: common_vendor.o(restartAudio),
        s: !questionList.value.length || !audioPlayed.value,
        t: common_vendor.o(resetAnswers),
        v: !Object.keys(userAnswers.value).length,
        w: common_vendor.o(submitAnswers),
        x: !hasAnsweredAll.value || showAnswers.value
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/listening/listening.js.map
