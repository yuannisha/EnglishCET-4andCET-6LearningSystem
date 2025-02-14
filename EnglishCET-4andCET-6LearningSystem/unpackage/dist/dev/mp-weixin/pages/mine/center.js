"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "center",
  setup(__props) {
    const userInfo = common_vendor.ref({
      _id: "",
      account: "",
      nickname: "",
      avatar: ""
    });
    const formData = common_vendor.ref({
      account: "",
      nickname: "",
      verifyCode: ""
    });
    const isEditing = common_vendor.ref(false);
    const verifyCodeTime = common_vendor.ref(0);
    const verifyCodeTimer = common_vendor.ref(null);
    const VerifyCode = common_vendor.ref(0);
    const getVerifyCode = () => {
      if (!formData.value.account) {
        common_vendor.index.showToast({
          title: "请输入手机号",
          icon: "none"
        });
        return;
      }
      if (!/^1[3-9]\d{9}$/.test(formData.value.account)) {
        common_vendor.index.showToast({
          title: "请输入正确的手机号",
          icon: "none"
        });
        return;
      }
      const code = Math.floor(Math.random() * 9e5 + 1e5);
      VerifyCode.value = code.toString();
      common_vendor.index.showModal({
        title: "模拟验证码",
        content: `您的验证码是：${code}`,
        showCancel: false
      });
      verifyCodeTime.value = 60;
      verifyCodeTimer.value = setInterval(() => {
        verifyCodeTime.value--;
        if (verifyCodeTime.value <= 0) {
          clearInterval(verifyCodeTimer.value);
        }
      }, 1e3);
    };
    const loadUserInfo = () => {
      const storedUserInfo = common_vendor.index.getStorageSync("userInfo");
      if (storedUserInfo) {
        userInfo.value = storedUserInfo;
        formData.value.account = storedUserInfo.account;
        formData.value.nickname = storedUserInfo.nickname;
      }
    };
    const handleSubmit = async () => {
      common_vendor.index.__f__("log", "at pages/mine/center.vue:73", "formData.value", formData.value);
      if (!formData.value.account || !formData.value.nickname || !formData.value.verifyCode) {
        common_vendor.index.showToast({
          title: "请填写完整信息",
          icon: "none"
        });
        return;
      }
      if (VerifyCode.value !== formData.value.verifyCode) {
        common_vendor.index.showToast({
          title: "验证码错误",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "保存中..." });
        const { result } = await common_vendor.er.callFunction({
          name: "updateUserInfo",
          data: {
            userId: userInfo.value._id,
            account: formData.value.account,
            nickname: formData.value.nickname
          }
        });
        if (result.code === 0) {
          const storedUserInfo = common_vendor.index.getStorageSync("userInfo");
          storedUserInfo.account = formData.value.account;
          storedUserInfo.nickname = formData.value.nickname;
          common_vendor.index.setStorageSync("userInfo", storedUserInfo);
          userInfo.value = storedUserInfo;
          isEditing.value = false;
          common_vendor.index.showToast({
            title: "保存成功",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: result.msg || "保存失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/mine/center.vue:124", e);
        common_vendor.index.showToast({
          title: "保存失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const startEdit = () => {
      isEditing.value = true;
    };
    const cancelEdit = () => {
      formData.value.account = userInfo.value.account;
      formData.value.nickname = userInfo.value.nickname;
      formData.value.verifyCode = "";
      isEditing.value = false;
    };
    common_vendor.onMounted(() => {
      loadUserInfo();
    });
    common_vendor.onUnmounted(() => {
      if (verifyCodeTimer.value) {
        clearInterval(verifyCodeTimer.value);
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userInfo.value.avatar || "/static/avatar/default.png",
        b: !isEditing.value
      }, !isEditing.value ? {
        c: common_vendor.t(userInfo.value.account)
      } : {}, {
        d: !isEditing.value
      }, !isEditing.value ? {
        e: common_vendor.t(userInfo.value.nickname)
      } : {}, {
        f: isEditing.value
      }, isEditing.value ? {
        g: formData.value.account,
        h: common_vendor.o(($event) => formData.value.account = $event.detail.value),
        i: formData.value.verifyCode,
        j: common_vendor.o(($event) => formData.value.verifyCode = $event.detail.value),
        k: common_vendor.t(verifyCodeTime.value > 0 ? `${verifyCodeTime.value}s` : "获取验证码"),
        l: verifyCodeTime.value > 0,
        m: common_vendor.o(getVerifyCode),
        n: formData.value.nickname,
        o: common_vendor.o(($event) => formData.value.nickname = $event.detail.value)
      } : {}, {
        p: !isEditing.value
      }, !isEditing.value ? {
        q: common_vendor.o(startEdit)
      } : {
        r: common_vendor.o(cancelEdit),
        s: common_vendor.o(handleSubmit)
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/center.js.map
