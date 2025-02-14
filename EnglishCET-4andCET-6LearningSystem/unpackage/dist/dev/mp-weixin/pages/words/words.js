"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "words",
  setup(__props) {
    const wordList = common_vendor.ref([]);
    const currentIndex = common_vendor.ref(0);
    const audioIsPlaying = common_vendor.ref(false);
    const currentCategory = common_vendor.ref("CET4");
    const categoryOptions = common_vendor.ref([
      { value: "CET4", label: "四级词汇" },
      { value: "CET6", label: "六级词汇" }
    ]);
    const showMeaning = common_vendor.ref(false);
    const wordStatus = common_vendor.ref("new");
    const progressStats = common_vendor.ref({
      total: 0,
      learned: 0,
      learning: 0,
      new: 0
    });
    const loadWordList = async () => {
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        const { result } = await common_vendor.er.callFunction({
          name: "getWordList",
          data: {
            category: currentCategory.value,
            page: 1,
            pageSize: 50
          }
        });
        if (result.code === 0) {
          wordList.value = result.data.list;
          currentIndex.value = 0;
          showMeaning.value = false;
          await loadWordProgress();
        } else {
          common_vendor.index.showToast({
            title: result.msg || "加载单词失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/words/words.vue:85", e);
        common_vendor.index.showToast({
          title: "加载单词失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const loadWordProgress = async () => {
      try {
        const { result } = await common_vendor.er.callFunction({
          name: "getWordProgress",
          data: {
            user_id: common_vendor.index.getStorageSync("userInfo")._id,
            word_ids: wordList.value.map((word) => word._id)
          }
        });
        if (result.code === 0) {
          wordList.value = wordList.value.map((word) => {
            const progress = result.data.find((p) => p.word_id === word._id);
            return {
              ...word,
              status: progress ? progress.status : "new",
              review_times: progress ? progress.review_times : 0
            };
          });
          updateCurrentWordStatus();
          progressStats.value = {
            total: wordList.value.length,
            learned: wordList.value.filter((w) => w.status === "learned").length,
            learning: wordList.value.filter((w) => w.status === "learning").length,
            new: wordList.value.filter((w) => w.status === "new").length
          };
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/words/words.vue:131", "加载单词进度失败", e);
      }
    };
    const updateCurrentWordStatus = () => {
      if (wordList.value[currentIndex.value]) {
        wordStatus.value = wordList.value[currentIndex.value].status;
      }
    };
    const handleCategoryChange = (value) => {
      currentCategory.value = value;
      loadWordList();
    };
    const playAudio = () => {
      if (audioIsPlaying.value)
        return;
      const audio = common_vendor.index.createInnerAudioContext();
      audio.autoplay = true;
      audio.src = "https://dict.youdao.com/dictvoice?type=1&audio=" + wordList.value[currentIndex.value].word;
      audio.play();
      audioIsPlaying.value = true;
      audio.onEnded(() => {
        audioIsPlaying.value = false;
      });
      audio.onError(() => {
        audioIsPlaying.value = false;
        common_vendor.index.showToast({
          title: "播放失败",
          icon: "none"
        });
      });
    };
    const nextWord = async () => {
      if (currentIndex.value < wordList.value.length - 1) {
        if (wordList.value[currentIndex.value].status === "new") {
          await updateWordProgress("learning");
        }
        currentIndex.value++;
        showMeaning.value = false;
        updateCurrentWordStatus();
      } else {
        common_vendor.index.showToast({
          title: "已经是最后一个单词了",
          icon: "none"
        });
      }
    };
    const prevWord = () => {
      if (currentIndex.value > 0) {
        currentIndex.value--;
        showMeaning.value = false;
        updateCurrentWordStatus();
      } else {
        common_vendor.index.showToast({
          title: "已经是第一个单词了",
          icon: "none"
        });
      }
    };
    const toggleMeaning = () => {
      showMeaning.value = !showMeaning.value;
    };
    const markWordStatus = async (status) => {
      await updateWordProgress(status);
      common_vendor.index.showToast({
        title: status === "learned" ? "已掌握" : "继续学习",
        icon: "success"
      });
    };
    const updateWordProgress = async (status) => {
      try {
        const currentWord = wordList.value[currentIndex.value];
        await common_vendor.er.callFunction({
          name: "updateWordProgress",
          data: {
            user_id: common_vendor.index.getStorageSync("userInfo")._id,
            word_id: currentWord._id,
            status
          }
        });
        currentWord.status = status;
        wordStatus.value = status;
        progressStats.value = {
          ...progressStats.value,
          learned: wordList.value.filter((w) => w.status === "learned").length,
          learning: wordList.value.filter((w) => w.status === "learning").length,
          new: wordList.value.filter((w) => w.status === "new").length
        };
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/words/words.vue:260", "更新进度失败", e);
        common_vendor.index.showToast({
          title: "更新进度失败",
          icon: "none"
        });
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
        loadWordList();
      }
    });
    common_vendor.onShow(() => {
      loadWordList();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(progressStats.value.learned),
        b: common_vendor.t(progressStats.value.learning),
        c: common_vendor.t(progressStats.value.new),
        d: common_vendor.f(categoryOptions.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: item.value,
            c: currentCategory.value === item.value ? 1 : "",
            d: common_vendor.o(($event) => handleCategoryChange(item.value), item.value)
          };
        }),
        e: wordList.value.length > 0
      }, wordList.value.length > 0 ? common_vendor.e({
        f: common_vendor.t(wordStatus.value === "learned" ? "已掌握" : wordStatus.value === "learning" ? "学习中" : "未学习"),
        g: common_vendor.n(wordStatus.value),
        h: common_vendor.t(wordList.value[currentIndex.value].word),
        i: common_vendor.t(wordList.value[currentIndex.value].phonetic),
        j: common_vendor.o(playAudio),
        k: showMeaning.value
      }, showMeaning.value ? {
        l: common_vendor.t(wordList.value[currentIndex.value].meaning),
        m: common_vendor.t(wordList.value[currentIndex.value].example)
      } : {}, {
        n: common_vendor.o(prevWord),
        o: common_vendor.t(showMeaning.value ? "隐藏释义" : "显示释义"),
        p: common_vendor.o(toggleMeaning),
        q: common_vendor.o(nextWord),
        r: wordStatus.value === "learned" ? 1 : "",
        s: common_vendor.o(($event) => markWordStatus("learned")),
        t: wordStatus.value === "learning" ? 1 : "",
        v: common_vendor.o(($event) => markWordStatus("learning"))
      }) : {});
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/words/words.js.map
