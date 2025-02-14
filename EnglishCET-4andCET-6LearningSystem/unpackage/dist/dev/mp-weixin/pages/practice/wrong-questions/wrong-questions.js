"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  __name: "wrong-questions",
  setup(__props) {
    const currentCategory = common_vendor.ref("all");
    const categoryOptions = common_vendor.ref([
      { value: "all", label: "全部" },
      { value: "listening", label: "听力" },
      { value: "reading", label: "阅读" },
      { value: "translation", label: "翻译" },
      { value: "writing", label: "写作" }
    ]);
    const wrongQuestionList = common_vendor.ref([]);
    const showAnswers = common_vendor.ref(false);
    const audioPlaying = common_vendor.ref(false);
    const audioContext = common_vendor.ref(null);
    const loadWrongQuestions = async () => {
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        const { result } = await common_vendor.er.callFunction({
          name: "getWrongQuestions",
          data: {
            userId: common_vendor.index.getStorageSync("userInfo")._id,
            category: currentCategory.value === "all" ? null : currentCategory.value
          }
        });
        if (result.code === 0) {
          wrongQuestionList.value = result.data;
        } else {
          throw new Error("加载错题失败");
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/practice/wrong-questions/wrong-questions.vue:59", e);
        common_vendor.index.showToast({
          title: "加载错题失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const playAudio = (audioUrl) => {
      if (audioPlaying.value) {
        audioContext.value.stop();
        audioContext.value.destroy();
      }
      audioContext.value = common_vendor.index.createInnerAudioContext();
      audioContext.value.src = audioUrl;
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
    const handleCategoryChange = (category) => {
      currentCategory.value = category;
      loadWrongQuestions();
    };
    const removeWrongQuestion = async (questionId) => {
      try {
        common_vendor.index.showLoading({
          title: "移除中..."
        });
        const { result } = await common_vendor.er.callFunction({
          name: "removeWrongQuestion",
          data: {
            userId: common_vendor.index.getStorageSync("userInfo")._id,
            questionId
          }
        });
        if (result.code === 0) {
          wrongQuestionList.value = wrongQuestionList.value.filter(
            (item) => item._id !== questionId
          );
          common_vendor.index.showToast({
            title: "移除成功",
            icon: "success"
          });
        } else {
          throw new Error("移除失败");
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/practice/wrong-questions/wrong-questions.vue:136", e);
        common_vendor.index.showToast({
          title: "移除失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const startPractice = () => {
      if (wrongQuestionList.value.length === 0) {
        common_vendor.index.showToast({
          title: "暂无错题",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/practice/mock-exam/mock-exam?type=wrong&category=${currentCategory.value}`
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
        loadWrongQuestions();
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
        b: common_vendor.t(showAnswers.value ? "隐藏答案" : "显示答案"),
        c: common_vendor.o(($event) => showAnswers.value = !showAnswers.value),
        d: common_vendor.o(startPractice),
        e: wrongQuestionList.value.length > 0
      }, wrongQuestionList.value.length > 0 ? {
        f: common_vendor.f(wrongQuestionList.value.filter((q) => q.type === "listening"), (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.create_date),
            b: common_vendor.o(($event) => playAudio(item.audio_file), item._id),
            c: common_vendor.t(item.question),
            d: common_vendor.f(item.options, (content, key, i1) => {
              return {
                a: common_vendor.t(key),
                b: common_vendor.t(content),
                c: key,
                d: item.user_answer === key && key !== item.correct_answer ? 1 : "",
                e: showAnswers.value && key === item.correct_answer ? 1 : ""
              };
            })
          }, showAnswers.value ? {
            e: common_vendor.t(item.analysis)
          } : {}, {
            f: common_vendor.o(($event) => removeWrongQuestion(item._id), item._id),
            g: item._id
          });
        }),
        g: common_vendor.t(audioPlaying.value ? "暂停" : "播放"),
        h: showAnswers.value,
        i: common_vendor.f(wrongQuestionList.value.filter((q) => q.type === "reading"), (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.create_date),
            b: common_vendor.t(item.title),
            c: common_vendor.t(item.passage),
            d: common_vendor.t(item.question),
            e: common_vendor.f(item.options, (content, key, i1) => {
              return {
                a: common_vendor.t(key),
                b: common_vendor.t(content),
                c: key,
                d: item.user_answer === key && key !== item.correct_answer ? 1 : "",
                e: showAnswers.value && key === item.correct_answer ? 1 : ""
              };
            })
          }, showAnswers.value ? {
            f: common_vendor.t(item.analysis)
          } : {}, {
            g: common_vendor.o(($event) => removeWrongQuestion(item._id), item._id),
            h: item._id
          });
        }),
        j: showAnswers.value,
        k: common_vendor.f(wrongQuestionList.value.filter((q) => q.type === "translation"), (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.create_date),
            b: common_vendor.t(item.original_text),
            c: common_vendor.t(item.user_translation)
          }, showAnswers.value ? {
            d: common_vendor.t(item.reference_translation)
          } : {}, showAnswers.value ? {
            e: common_vendor.t(item.scoring_points)
          } : {}, {
            f: common_vendor.o(($event) => removeWrongQuestion(item._id), item._id),
            g: item._id
          });
        }),
        l: showAnswers.value,
        m: showAnswers.value,
        n: common_vendor.f(wrongQuestionList.value.filter((q) => q.type === "writing"), (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.create_date),
            b: common_vendor.t(item.title),
            c: common_vendor.t(item.requirements),
            d: common_vendor.t(item.user_essay)
          }, showAnswers.value ? {
            e: common_vendor.t(item.model_essay)
          } : {}, showAnswers.value ? {
            f: common_vendor.t(item.scoring_points)
          } : {}, {
            g: common_vendor.o(($event) => removeWrongQuestion(item._id), item._id),
            h: item._id
          });
        }),
        o: showAnswers.value,
        p: showAnswers.value
      } : {
        q: common_assets._imports_0$1
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/practice/wrong-questions/wrong-questions.js.map
