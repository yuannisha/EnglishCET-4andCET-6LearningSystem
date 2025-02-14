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
      { value: "CET4", label: "四级考试" },
      { value: "CET6", label: "六级考试" }
    ]);
    const examData = common_vendor.ref({
      listening: null,
      reading: null,
      translation: null,
      writing: null
    });
    const currentSection = common_vendor.ref("listening");
    const userAnswers = common_vendor.ref({
      listening: {},
      reading: {},
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
    let timer = null;
    const audioPlaying = common_vendor.ref(false);
    const audioContext = common_vendor.ref(null);
    const loadExamQuestions = async () => {
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        const listeningRes = await common_vendor.er.callFunction({
          name: "getListeningQuestions",
          data: {
            category: currentCategory.value,
            set_number: 1
          }
        });
        const readingRes = await common_vendor.er.callFunction({
          name: "getReadingQuestions",
          data: {
            category: currentCategory.value,
            set_number: 1
          }
        });
        const translationRes = await common_vendor.er.callFunction({
          name: "getTranslationQuestions",
          data: {
            category: currentCategory.value,
            set_number: 1
          }
        });
        const writingRes = await common_vendor.er.callFunction({
          name: "getWritingQuestions",
          data: {
            category: currentCategory.value,
            set_number: 1
          }
        });
        if (listeningRes.result.code === 0 && readingRes.result.code === 0 && translationRes.result.code === 0 && writingRes.result.code === 0) {
          examData.value = {
            listening: listeningRes.result.data.list[0],
            reading: readingRes.result.data.list[0],
            translation: translationRes.result.data.list[0],
            writing: writingRes.result.data.list[0]
          };
        } else {
          throw new Error("加载题目失败");
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/practice/mock-exam/mock-exam.vue:138", e);
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
      startTimer();
      playListeningAudio();
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
    const playListeningAudio = () => {
      if (audioPlaying.value)
        return;
      audioContext.value = common_vendor.index.createInnerAudioContext();
      audioContext.value.src = examData.value.listening.audio_file;
      audioContext.value.autoplay = true;
      audioContext.value.onPlay(() => {
        audioPlaying.value = true;
      });
      audioContext.value.onEnded(() => {
        audioPlaying.value = false;
      });
      audioContext.value.onError(() => {
        audioPlaying.value = false;
        common_vendor.index.showToast({
          title: "音频播放失败",
          icon: "none"
        });
      });
    };
    const switchSection = (section) => {
      if (section === currentSection.value)
        return;
      if (audioContext.value) {
        audioContext.value.stop();
        audioContext.value.destroy();
      }
      currentSection.value = section;
    };
    const selectAnswer = (section, questionNumber, answer) => {
      userAnswers.value[section][questionNumber] = answer;
    };
    const finishExam = async () => {
      clearInterval(timer);
      examStatus.value = "finished";
      try {
        common_vendor.index.showLoading({
          title: "正在评分..."
        });
        examData.value.listening.answers.forEach((answer) => {
          if (userAnswers.value.listening[answer.key] === answer.content) {
            scores.value.listening += answer.score;
          }
        });
        examData.value.reading.answers.forEach((answer) => {
          if (userAnswers.value.reading[answer.question_number] === answer.correct_answer) {
            scores.value.reading += answer.score;
          }
        });
        scores.value.translation = Math.round((examData.value.translation.score - Math.random() * 5) * 10) / 10;
        scores.value.writing = Math.round((examData.value.writing.score - Math.random() * 10) * 10) / 10;
        scores.value.total = Math.round((scores.value.listening + scores.value.reading + scores.value.translation + scores.value.writing) * 10) / 10;
        await common_vendor.er.callFunction({
          name: "saveAndUpdatePracticeRecord",
          data: {
            userId: common_vendor.index.getStorageSync("userInfo")._id,
            question_id: examData.value.listening._id,
            // 使用听力题目ID作为考试ID
            question_type: "mock",
            correctCount: 0,
            // 模拟考试不计算正确题目数
            correctRate: 0,
            // 模拟考试不计算正确率
            userScore: scores.value.total
          }
        });
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/practice/mock-exam/mock-exam.vue:287", e);
        common_vendor.index.showToast({
          title: "评分失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const restart = () => {
      examStatus.value = "ready";
      remainingTime.value = EXAM_TIME * 60;
      currentSection.value = "listening";
      userAnswers.value = {
        listening: {},
        reading: {},
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
    };
    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor(seconds % 3600 / 60);
      const remainingSeconds = seconds % 60;
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
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
        }, (label, section, i0) => {
          return {
            a: common_vendor.t(label),
            b: section,
            c: currentSection.value === section ? 1 : "",
            d: common_vendor.o(($event) => switchSection(section), section)
          };
        }),
        h: currentSection.value === "listening" && examData.value.listening
      }, currentSection.value === "listening" && examData.value.listening ? {
        i: common_vendor.f(examData.value.listening.question_content, (section, index, i0) => {
          return {
            a: common_vendor.t(section.section_name),
            b: common_vendor.t(section.description),
            c: common_vendor.f(section.questions, (question, k1, i1) => {
              return {
                a: common_vendor.t(question.description1),
                b: common_vendor.f(question.options.content, (content, key, i2) => {
                  return {
                    a: common_vendor.t(key),
                    b: common_vendor.t(content),
                    c: key,
                    d: userAnswers.value.listening[question.tips] === key ? 1 : "",
                    e: common_vendor.o(($event) => selectAnswer("listening", question.tips, key), key)
                  };
                }),
                c: question.description1
              };
            }),
            d: index
          };
        })
      } : {}, {
        j: currentSection.value === "reading" && examData.value.reading
      }, currentSection.value === "reading" && examData.value.reading ? {
        k: common_vendor.t(examData.value.reading.little_title),
        l: common_vendor.t(examData.value.reading.passage),
        m: common_vendor.f(examData.value.reading.questions, (question, k0, i0) => {
          return {
            a: common_vendor.t(question.question_number),
            b: common_vendor.t(question.question),
            c: common_vendor.f(question.options, (content, key, i1) => {
              return {
                a: common_vendor.t(key),
                b: common_vendor.t(content),
                c: key,
                d: userAnswers.value.reading[question.question_number] === key ? 1 : "",
                e: common_vendor.o(($event) => selectAnswer("reading", question.question_number, key), key)
              };
            }),
            d: question.question_number
          };
        })
      } : {}, {
        n: currentSection.value === "translation" && examData.value.translation
      }, currentSection.value === "translation" && examData.value.translation ? {
        o: common_vendor.t(examData.value.translation.little_title),
        p: common_vendor.t(examData.value.translation.original_text),
        q: userAnswers.value.translation,
        r: common_vendor.o(($event) => userAnswers.value.translation = $event.detail.value)
      } : {}, {
        s: currentSection.value === "writing" && examData.value.writing
      }, currentSection.value === "writing" && examData.value.writing ? {
        t: common_vendor.t(examData.value.writing.little_title),
        v: common_vendor.t(examData.value.writing.title),
        w: common_vendor.t(examData.value.writing.word_limit.min),
        x: common_vendor.t(examData.value.writing.word_limit.max),
        y: userAnswers.value.writing,
        z: common_vendor.o(($event) => userAnswers.value.writing = $event.detail.value)
      } : {}, {
        A: common_vendor.o(finishExam),
        B: !userAnswers.value.writing && currentSection.value === "writing"
      }) : {
        C: common_vendor.t(scores.value.total),
        D: common_vendor.t(scores.value.listening),
        E: common_vendor.t(scores.value.reading),
        F: common_vendor.t(scores.value.translation),
        G: common_vendor.t(scores.value.writing),
        H: common_vendor.o(restart),
        I: common_vendor.o(($event) => switchSection("listening"))
      }, {
        e: examStatus.value === "ongoing"
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/practice/mock-exam/mock-exam.js.map
