"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  __name: "register",
  setup(__props) {
    const form = common_vendor.ref({
      account: "",
      password: "",
      confirmPassword: "",
      nickname: "",
      verifyCode: ""
    });
    const verifyCodeTimer = common_vendor.ref(null);
    const verifyCodeTime = common_vendor.ref(0);
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
    const handleRegister = async () => {
      if (!form.value.account || !form.value.password || !form.value.confirmPassword || !form.value.nickname || !form.value.verifyCode) {
        common_vendor.index.showToast({
          title: "请填写完整信息",
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
      if (form.value.password !== form.value.confirmPassword) {
        common_vendor.index.showToast({
          title: "两次输入的密码不一致",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({
          title: "注册中..."
        });
        const checkRes = await common_vendor.er.callFunction({
          name: "checkAccountExists",
          data: {
            account: form.value.account
          }
        });
        if (checkRes.result.exists) {
          common_vendor.index.showToast({
            title: "该手机号已被注册",
            icon: "none"
          });
          return;
        }
        const { result } = await common_vendor.er.callFunction({
          name: "simpleRegister",
          data: {
            account: form.value.account,
            password: form.value.password,
            nickname: form.value.nickname
          }
        });
        if (result.code === 0) {
          common_vendor.index.showToast({
            title: "注册成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: result.msg || "注册失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/login/register.vue:196", e);
        common_vendor.index.showToast({
          title: "注册失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const goToLogin = () => {
      common_vendor.index.navigateBack();
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
        d: form.value.verifyCode,
        e: common_vendor.o(($event) => form.value.verifyCode = $event.detail.value),
        f: common_vendor.t(verifyCodeTime.value > 0 ? `${verifyCodeTime.value}s` : "获取验证码"),
        g: verifyCodeTime.value > 0,
        h: common_vendor.o(getVerifyCode),
        i: form.value.nickname,
        j: common_vendor.o(($event) => form.value.nickname = $event.detail.value),
        k: form.value.password,
        l: common_vendor.o(($event) => form.value.password = $event.detail.value),
        m: form.value.confirmPassword,
        n: common_vendor.o(($event) => form.value.confirmPassword = $event.detail.value),
        o: common_vendor.o(handleRegister),
        p: common_vendor.o(goToLogin)
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/register.js.map
