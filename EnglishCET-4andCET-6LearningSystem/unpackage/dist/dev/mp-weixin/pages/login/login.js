"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  __name: "login",
  setup(__props) {
    const form = common_vendor.ref({
      account: "",
      password: "",
      verifyCode: ""
    });
    const verifyCodeTimer = common_vendor.ref(null);
    const verifyCodeTime = common_vendor.ref(0);
    const VerifyCode = common_vendor.ref(0);
    const getVerifyCode = () => {
      if (!form.value.account) {
        common_vendor.index.showToast({
          title: "请输入手机号",
          icon: "none"
        });
        return;
      }
      if (!/^1[3-9]\d{9}$/.test(form.value.account)) {
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
    const handleLogin = async () => {
      if (!form.value.account || !form.value.password || !form.value.verifyCode) {
        common_vendor.index.showToast({
          title: "请填写完整信息",
          icon: "none"
        });
        return;
      }
      common_vendor.index.__f__("log", "at pages/login/login.vue:113", "VerifyCode.value", VerifyCode.value);
      common_vendor.index.__f__("log", "at pages/login/login.vue:114", "form.value.verifyCode", form.value.verifyCode);
      if (VerifyCode.value !== form.value.verifyCode) {
        common_vendor.index.showToast({
          title: "验证码错误",
          icon: "none"
        });
        return;
      }
      if (!/^1[3-9]\d{9}$/.test(form.value.account)) {
        common_vendor.index.showToast({
          title: "请输入正确的手机号",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({
          title: "登录中..."
        });
        const { result } = await common_vendor.er.callFunction({
          name: "simpleLogin",
          data: {
            account: form.value.account,
            password: form.value.password
          }
        });
        if (result.code === 0) {
          common_vendor.index.setStorageSync("userInfo", result.userInfo);
          common_vendor.index.showToast({
            title: "登录成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.switchTab({
              url: "/pages/index/index"
            });
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: result.msg || "登录失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:162", e);
        common_vendor.index.showToast({
          title: "登录失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const goToRegister = () => {
      common_vendor.index.navigateTo({
        url: "/pages/login/register"
      });
    };
    common_vendor.onUnmounted(() => {
      if (verifyCodeTimer.value) {
        clearInterval(verifyCodeTimer.value);
      }
    });
    return (_ctx, _cache) => {
      return {
        a: common_assets._imports_0$2,
        b: form.value.account,
        c: common_vendor.o(($event) => form.value.account = $event.detail.value),
        d: form.value.password,
        e: common_vendor.o(($event) => form.value.password = $event.detail.value),
        f: form.value.verifyCode,
        g: common_vendor.o(($event) => form.value.verifyCode = $event.detail.value),
        h: common_vendor.t(verifyCodeTime.value > 0 ? `${verifyCodeTime.value}s` : "获取验证码"),
        i: verifyCodeTime.value > 0,
        j: common_vendor.o(getVerifyCode),
        k: common_vendor.o(handleLogin),
        l: common_vendor.o(goToRegister)
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
