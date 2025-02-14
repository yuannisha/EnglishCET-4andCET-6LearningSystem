"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  __name: "mine",
  setup(__props) {
    const userInfo = common_vendor.ref({
      _id: "",
      nickname: "",
      avatar: "",
      level: "",
      study_days: 0,
      points: 0
    });
    const isLogin = common_vendor.ref(false);
    const avatarPreview = common_vendor.ref(false);
    const menuList = common_vendor.ref([
      {
        id: 1,
        title: "学习记录",
        icon: "/static/icons/record.png",
        path: "/pages/mine/study-record"
      },
      {
        id: 2,
        title: "我的收藏",
        icon: "/static/icons/favorite.png",
        path: "/pages/mine/favorites"
      },
      {
        id: 3,
        title: "学习计划",
        icon: "/static/icons/plan.png",
        path: "/pages/mine/study-plan"
      },
      {
        id: 4,
        title: "设置",
        icon: "/static/icons/settings.png",
        path: "/pages/mine/settings"
      }
    ]);
    const navigateToPage = (path) => {
      common_vendor.index.navigateTo({
        url: path
      });
    };
    const handleLogout = () => {
      common_vendor.index.removeStorageSync("userInfo");
      isLogin.value = false;
      userInfo.value = {
        _id: "",
        nickname: "",
        avatar: "",
        level: "",
        study_days: 0,
        points: 0
      };
      common_vendor.index.navigateTo({
        url: "/pages/login/login"
      });
    };
    const handleAvatarClick = () => {
      if (!isLogin.value) {
        common_vendor.index.navigateTo({
          url: "/pages/login/login"
        });
        return;
      }
      common_vendor.index.showActionSheet({
        itemList: ["查看头像", "更换头像"],
        success: (res) => {
          if (res.tapIndex === 0) {
            avatarPreview.value = true;
            common_vendor.index.__f__("log", "at pages/mine/mine.vue:95", "userInfo.value.avatar", userInfo.value.avatar);
          } else {
            common_vendor.index.chooseImage({
              count: 1,
              sizeType: ["compressed"],
              sourceType: ["album", "camera"],
              success: async (res2) => {
                const tempFilePath = res2.tempFilePaths[0];
                try {
                  common_vendor.index.showLoading({ title: "上传中..." });
                  const uploadRes = await common_vendor.er.uploadFile({
                    filePath: tempFilePath,
                    cloudPath: `avatar/${Date.now()}-${Math.random().toString(36).substr(2)}.jpg`
                  });
                  const { result } = await common_vendor.er.callFunction({
                    name: "updateUserInfo",
                    data: {
                      userId: userInfo.value._id,
                      avatar: uploadRes.fileID
                    }
                  });
                  if (result.code === 0) {
                    userInfo.value.avatar = uploadRes.fileID;
                    const storedUserInfo = common_vendor.index.getStorageSync("userInfo");
                    storedUserInfo.avatar = uploadRes.fileID;
                    common_vendor.index.setStorageSync("userInfo", storedUserInfo);
                    common_vendor.index.showToast({
                      title: "更新成功",
                      icon: "success"
                    });
                  }
                } catch (e) {
                  common_vendor.index.showToast({
                    title: "更新失败",
                    icon: "none"
                  });
                } finally {
                  common_vendor.index.hideLoading();
                }
              }
            });
          }
        }
      });
    };
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/mine/mine.vue:150", "storedUserInfo", common_vendor.index.getStorageSync("userInfo"));
      common_vendor.index.__f__("log", "at pages/mine/mine.vue:151", "userInfo", userInfo.value);
      const storedUserInfo = common_vendor.index.getStorageSync("userInfo");
      if (!storedUserInfo) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none",
          duration: 2e3
        });
        common_vendor.index.navigateTo({
          url: "/pages/login/login"
        });
      } else {
        isLogin.value = true;
        userInfo.value = storedUserInfo;
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userInfo.value.avatar || "/static/avatar/default.png",
        b: common_vendor.t(userInfo.value.nickname || "未登录"),
        c: common_vendor.t(userInfo.value.level || "英语小白"),
        d: common_vendor.o(handleAvatarClick),
        e: isLogin.value
      }, isLogin.value ? {
        f: common_vendor.t(userInfo.value.study_days || 0),
        g: common_vendor.t(userInfo.value.points || 0)
      } : {}, {
        h: isLogin.value
      }, isLogin.value ? {
        i: common_vendor.f(menuList.value, (item, k0, i0) => {
          return {
            a: item.icon,
            b: common_vendor.t(item.title),
            c: item.id,
            d: common_vendor.o(($event) => navigateToPage(item.path), item.id)
          };
        })
      } : {}, {
        j: isLogin.value
      }, isLogin.value ? {
        k: common_assets._imports_0,
        l: common_vendor.o(($event) => navigateToPage("/pages/mine/center"))
      } : {}, {
        m: isLogin.value
      }, isLogin.value ? {
        n: common_assets._imports_1,
        o: common_vendor.o(handleLogout)
      } : {}, {
        p: isLogin.value && userInfo.value.avatar && avatarPreview.value
      }, isLogin.value && userInfo.value.avatar && avatarPreview.value ? {
        q: userInfo.value.avatar,
        r: common_vendor.o(($event) => avatarPreview.value = false)
      } : {});
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/mine.js.map
