"use strict";
const common_vendor = require("../../../common/vendor.js");
const EXAM_TIME = 130;
const _sfc_main = {
  __name: "mock-exam",
  setup(__props) {
    const examStatus = common_vendor.ref("ready");
    const remainingTime = common_vendor.ref(EXAM_TIME * 60);
    const currentCategory = common_vendor.ref("CET4");
    const categoryOptions = common_vendor.ref([
      { value: "CET4", label: "大学英语四级" },
      { value: "CET6", label: "大学英语六级" }
    ]);
    const examData = common_vendor.ref({
      listening: [],
      reading: [],
      translation: [],
      writing: []
    });
    const currentSection = common_vendor.ref("listening");
    const userAnswers = common_vendor.ref({
      listening: [],
      reading: [],
      translation: "",
      writing: ""
    });
    const scores = common_vendor.ref({
      listening: 0,
      reading: 0,
      translation: 0,
      writing: 0,
      total: 0
    });
    const audioContext = common_vendor.ref(null);
    const isPlaying = common_vendor.ref(false);
    let timer = null;
    const loadExamQuestions = async () => {
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        common_vendor.index.__f__("log", "at pages/practice/mock-exam/mock-exam.vue:87", "currentCategory.value", currentCategory.value);
        const { result } = await common_vendor.er.callFunction({
          name: "getMockExamQuestions",
          data: {
            category: currentCategory.value
          }
        });
        if (result.code === 0) {
          examData.value = result.data;
          userAnswers.value = {
            listening: new Array(examData.value.listening[0].answers.length - 1).fill(""),
            reading: new Array(examData.value.reading[0].answers.length).fill(""),
            translation: "",
            writing: ""
          };
          common_vendor.index.__f__("log", "at pages/practice/mock-exam/mock-exam.vue:104", "userAnswers.value", userAnswers.value);
        } else {
          throw new Error(result.msg || "加载失败");
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/practice/mock-exam/mock-exam.vue:109", e);
        common_vendor.index.showToast({
          title: "加载题目失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const startExam = () => {
      examStatus.value = "ongoing";
      currentSection.value = "listening";
      common_vendor.index.__f__("log", "at pages/practice/mock-exam/mock-exam.vue:125", "currentCategory", currentCategory.value);
      loadExamQuestions();
      startTimer();
    };
    const switchSection = (section) => {
      if (audioContext.value) {
        audioContext.value.pause();
        isPlaying.value = false;
      }
      currentSection.value = section;
      common_vendor.index.__f__("log", "at pages/practice/mock-exam/mock-exam.vue:139", "当前部分考试内容", examData.value[section][0]);
    };
    const playAudio = () => {
      var _a;
      common_vendor.index.__f__("log", "at pages/practice/mock-exam/mock-exam.vue:146", "audioContext.value", audioContext.value);
      common_vendor.index.__f__("log", "at pages/practice/mock-exam/mock-exam.vue:147", examData.value.listening[0]);
      common_vendor.index.__f__("log", "at pages/practice/mock-exam/mock-exam.vue:148", "isPlaying.value", isPlaying.value);
      if (!((_a = examData.value.listening[0]) == null ? void 0 : _a.audio_file))
        return;
      if (!audioContext.value) {
        audioContext.value = common_vendor.index.createInnerAudioContext();
        audioContext.value.src = examData.value.listening[0].audio_file;
        common_vendor.index.__f__("log", "at pages/practice/mock-exam/mock-exam.vue:157", audioContext.value.src);
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
        if (audioContext.value) {
          audioContext.value.pause();
          isPlaying.value = false;
          common_vendor.index.__f__("log", "at pages/practice/mock-exam/mock-exam.vue:181", "暂停音频");
        }
      } else {
        if (audioContext.value) {
          audioContext.value.play();
          isPlaying.value = true;
          common_vendor.index.__f__("log", "at pages/practice/mock-exam/mock-exam.vue:187", "播放音频");
        }
      }
    };
    const selectAnswer = (section, index, answer) => {
      if (section === "listening" || section === "reading") {
        userAnswers.value[section][index] = answer;
      }
      common_vendor.index.__f__("log", "at pages/practice/mock-exam/mock-exam.vue:199", "userAnswers.value", userAnswers.value);
    };
    const checkEnglishInput = (e, section) => {
      const text = e.detail.value;
      if (/[^\x00-\xff\s\p{P}]/u.test(text)) {
        common_vendor.index.showToast({
          title: "请输入英文",
          icon: "none"
        });
        userAnswers.value[section] = text.replace(/[^\x00-\xff\s\p{P}]/gu, "");
      }
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
      const listeningIsAnswered = userAnswers.value.listening.every((answer) => answer !== "");
      const readingIsAnswered = userAnswers.value.reading.every((answer) => answer !== "");
      const translationIsAnswered = userAnswers.value.translation !== "";
      const writingIsAnswered = userAnswers.value.writing !== "";
      if (!listeningIsAnswered || !readingIsAnswered || !translationIsAnswered || !writingIsAnswered) {
        common_vendor.index.showToast({
          title: "请先作答",
          icon: "none"
        });
        return;
      }
      clearInterval(timer);
      examStatus.value = "finished";
      if (audioContext.value) {
        audioContext.value.stop();
        isPlaying.value = false;
      }
      const listeningScore = Math.round(examData.value.listening[0].answers.reduce((total, answer, index) => {
        return total + (userAnswers.value.listening[index] === answer.content ? answer.score : 0);
      }, 0) * 10) / 10;
      const readingScore = Math.round(examData.value.reading[0].answers.reduce((total, answer, index) => {
        return total + (userAnswers.value.reading[index] === answer.content ? 49.7 : 0);
      }, 0) * 10) / 10;
      const translationScore = Math.round((examData.value.translation[0].score - Math.random() * 20) * 10) / 10;
      const writingScore = Math.round((examData.value.writing[0].score - Math.random() * 20) * 10) / 10;
      scores.value = {
        listening: listeningScore,
        reading: readingScore,
        translation: translationScore,
        writing: writingScore,
        total: Math.round((listeningScore + readingScore + translationScore + writingScore) * 10) / 10
      };
      try {
        await common_vendor.er.callFunction({
          name: "saveAndUpdatePracticeRecord",
          data: {
            userId: common_vendor.index.getStorageSync("userInfo")._id,
            practice_type: "mock",
            category: currentCategory.value,
            scores: scores.value,
            duration: EXAM_TIME * 60 - remainingTime.value
          }
        });
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/practice/mock-exam/mock-exam.vue:299", "保存练习记录失败:", e);
      }
    };
    const restart = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要重新开始考试吗？",
        success: (res) => {
          if (res.confirm) {
            if (audioContext.value) {
              audioContext.value.stop();
              audioContext.value.destroy();
              isPlaying.value = false;
            }
            examStatus.value = "ready";
            remainingTime.value = EXAM_TIME * 60;
            userAnswers.value = {
              listening: [],
              reading: [],
              translation: "",
              writing: ""
            };
            scores.value = {
              listening: 0,
              reading: 0,
              translation: 0,
              writing: 0,
              total: 0
            };
            loadExamQuestions();
          }
        }
      });
    };
    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor(seconds % 3600 / 60);
      const secs = seconds % 60;
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
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
        loadExamQuestions();
      }
    });
    common_vendor.onUnmounted(() => {
      if (timer) {
        clearInterval(timer);
      }
      if (audioContext.value) {
        isPlaying.value = false;
        audioContext.value.stop();
        audioContext.value.destroy();
        common_vendor.index.__f__("log", "at pages/practice/mock-exam/mock-exam.vue:374", "卸载音频");
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: examStatus.value === "ready"
      }, examStatus.value === "ready" ? {
        b: common_vendor.f(categoryOptions.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: item.value,
            c: currentCategory.value === item.value ? 1 : "",
            d: common_vendor.o(($event) => currentCategory.value = item.value, item.value)
          };
        }),
        c: common_vendor.t(EXAM_TIME),
        d: common_vendor.o(startExam)
      } : examStatus.value === "ongoing" ? common_vendor.e({
        f: common_vendor.t(formatTime(remainingTime.value)),
        g: common_vendor.f({
          listening: "听力",
          reading: "阅读",
          translation: "翻译",
          writing: "写作"
        }, (label, key, i0) => {
          return {
            a: common_vendor.t(label),
            b: key,
            c: currentSection.value === key ? 1 : "",
            d: common_vendor.o(($event) => switchSection(key), key)
          };
        }),
        h: currentSection.value === "listening" && examData.value.listening.length > 0
      }, currentSection.value === "listening" && examData.value.listening.length > 0 ? {
        i: common_vendor.t(isPlaying.value ? "暂停" : "播放"),
        j: common_vendor.o(playAudio),
        k: common_vendor.f(examData.value.listening[0].question_content, (section, sectionIndex, i0) => {
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
                        d: userAnswers.value.listening[option.tips - 1] === key2 ? 1 : "",
                        e: common_vendor.o(($event) => selectAnswer("listening", option.tips - 1, key2), key2)
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
        l: currentSection.value === "reading" && examData.value.reading.length > 0
      }, currentSection.value === "reading" && examData.value.reading.length > 0 ? {
        m: common_vendor.t(examData.value.reading[0].little_title),
        n: common_vendor.t(examData.value.reading[0].passage),
        o: common_vendor.f(examData.value.reading[0].questions, (question, index, i0) => {
          return {
            a: common_vendor.t(question.question_number),
            b: common_vendor.t(question.question),
            c: common_vendor.f(question.options, (content, key, i1) => {
              return {
                a: common_vendor.t(key),
                b: common_vendor.t(content),
                c: key,
                d: userAnswers.value.reading[index] === key ? 1 : "",
                e: common_vendor.o(($event) => selectAnswer("reading", index, key), key)
              };
            }),
            d: index
          };
        })
      } : {}, {
        p: currentSection.value === "translation" && examData.value.translation.length > 0
      }, currentSection.value === "translation" && examData.value.translation.length > 0 ? {
        q: common_vendor.t(examData.value.translation[0].little_title),
        r: common_vendor.t(examData.value.translation[0].original_text),
        s: common_vendor.o(($event) => checkEnglishInput($event, "translation")),
        t: userAnswers.value.translation,
        v: common_vendor.o(($event) => userAnswers.value.translation = $event.detail.value)
      } : {}, {
        w: currentSection.value === "writing" && examData.value.writing.length > 0
      }, currentSection.value === "writing" && examData.value.writing.length > 0 ? {
        x: common_vendor.t(examData.value.writing[0].little_title),
        y: common_vendor.t(examData.value.writing[0].title),
        z: common_vendor.t(examData.value.writing[0].word_limit.min),
        A: common_vendor.t(examData.value.writing[0].word_limit.max),
        B: common_vendor.o(($event) => checkEnglishInput($event, "writing")),
        C: userAnswers.value.writing,
        D: common_vendor.o(($event) => userAnswers.value.writing = $event.detail.value)
      } : {}, {
        E: common_vendor.o(finishExam)
      }) : {
        F: common_vendor.t(scores.value.total),
        G: common_vendor.t(scores.value.listening),
        H: common_vendor.t(scores.value.reading),
        I: common_vendor.t(scores.value.translation),
        J: common_vendor.t(scores.value.writing),
        K: common_vendor.o(restart)
      }, {
        e: examStatus.value === "ongoing"
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/practice/mock-exam/mock-exam.js.map
