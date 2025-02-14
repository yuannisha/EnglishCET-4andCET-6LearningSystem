<template>
  <view class="container">
    <view class="logo">
      <image src="/static/logo.png" mode="aspectFit"></image>
    </view>
    
    <view class="form">
      <view class="form-item">
        <input 
          class="input" 
          type="number" 
          v-model="form.account" 
          placeholder="请输入手机号"
          maxlength="11"
        />
      </view>
      
      <view class="form-item">
        <input 
          class="input" 
          type="password" 
          v-model="form.password" 
          placeholder="请输入密码"
          password
        />
      </view>
      
      <view class="form-item verify-code">
        <input 
          class="input" 
          type="number" 
          v-model="form.verifyCode" 
          placeholder="请输入验证码"
          maxlength="6"
        />
        <button 
          class="verify-btn" 
          :disabled="verifyCodeTime > 0"
          @tap="getVerifyCode"
        >
          {{ verifyCodeTime > 0 ? `${verifyCodeTime}s` : '获取验证码' }}
        </button>
      </view>
      
      <button class="submit-btn" @tap="handleLogin">登录</button>
      
      <view class="actions">
        <text class="link" @tap="goToRegister">还没有账号？立即注册</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

const form = ref({
  account: '',
  password: '',
  verifyCode: ''
})

const verifyCodeTimer = ref(null)
const verifyCodeTime = ref(0)
const VerifyCode = ref(0)

// 获取验证码
const getVerifyCode = () => {
  if (!form.value.account) {
    uni.showToast({
      title: '请输入手机号',
      icon: 'none'
    })
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(form.value.account)) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    })
    return
  }
  
  // 模拟发送验证码
  const code = Math.floor(Math.random() * 900000 + 100000)
  VerifyCode.value = code.toString()
  uni.showModal({
    title: '模拟验证码',
    content: `您的验证码是：${code}`,
    showCancel: false
  })
  
  // 开始倒计时
  verifyCodeTime.value = 60
  verifyCodeTimer.value = setInterval(() => {
    verifyCodeTime.value--
    if (verifyCodeTime.value <= 0) {
      clearInterval(verifyCodeTimer.value)
    }
  }, 1000)
}

// 处理登录
const handleLogin = async () => {
  if (!form.value.account || !form.value.password || !form.value.verifyCode) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }
  console.log("VerifyCode.value",VerifyCode.value)
  console.log("form.value.verifyCode",form.value.verifyCode)
  if (VerifyCode.value !== form.value.verifyCode) {
    uni.showToast({
      title: '验证码错误',
      icon: 'none'
    })
    return
  } 
  if (!/^1[3-9]\d{9}$/.test(form.value.account)) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    })
    return
  }
  
  try {
    uni.showLoading({
      title: '登录中...'
    })
    
    const { result } = await uniCloud.callFunction({
      name: 'simpleLogin',
      data: {
        account: form.value.account,
        password: form.value.password
      }
    })
    
    if (result.code === 0) {
      uni.setStorageSync('userInfo', result.userInfo)
      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)
    } else {
      uni.showToast({
        title: result.msg || '登录失败',
        icon: 'none'
      })
    }
  } catch (e) {
    console.error(e)
    uni.showToast({
      title: '登录失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 跳转到注册页
const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/login/register'
  })
}

// 组件销毁时清除定时器
onUnmounted(() => {
  if (verifyCodeTimer.value) {
    clearInterval(verifyCodeTimer.value)
  }
})
</script>

<style>
.container {
  padding: 40rpx;
  min-height: 100vh;
  background-color: #fff;
}

.logo {
  text-align: center;
  margin: 60rpx 0;
}

.logo image {
  width: 200rpx;
  height: 200rpx;
}

.form {
  margin-top: 60rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.input {
  width: 100%;
  height: 90rpx;
  background-color: #f8f8f8;
  border-radius: 45rpx;
  padding: 0 40rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.verify-code {
  display: flex;
  align-items: center;
}

.verify-code .input {
  flex: 1;
  margin-right: 20rpx;
}

.verify-btn {
  width: 200rpx;
  height: 90rpx;
  line-height: 90rpx;
  font-size: 26rpx;
  border-radius: 45rpx;
  background-color: #4095E5;
  color: #fff;
  padding: 0;
}

.verify-btn[disabled] {
  background-color: #ccc;
  color: #fff;
}

.submit-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  background-color: #4095E5;
  color: #fff;
  border-radius: 45rpx;
  margin-top: 60rpx;
  font-size: 32rpx;
}

.actions {
  margin-top: 40rpx;
  text-align: center;
}

.link {
  color: #4095E5;
  font-size: 28rpx;
}
</style> 