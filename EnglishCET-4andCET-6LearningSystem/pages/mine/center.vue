<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const userInfo = ref({
  _id: '',
  account: '',
  nickname: '',
  avatar: ''
})

const formData = ref({  
  account: '',
  nickname: '',
  verifyCode: ''
})

const isEditing = ref(false)

const verifyCodeTime = ref(0)
const verifyCodeTimer = ref(null)
const VerifyCode = ref(0)

// 获取验证码
const getVerifyCode = () => {
  if (!formData.value.account) {
    uni.showToast({
      title: '请输入手机号',
      icon: 'none'
    })
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(formData.value.account)) {
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


// 加载用户信息
const loadUserInfo = () => {
  const storedUserInfo = uni.getStorageSync('userInfo')
  if (storedUserInfo) {
    userInfo.value = storedUserInfo
    formData.value.account = storedUserInfo.account
    formData.value.nickname = storedUserInfo.nickname
  }
}

// 处理表单提交
const handleSubmit = async () => {
    console.log("formData.value",formData.value)
  if (!formData.value.account || !formData.value.nickname || !formData.value.verifyCode) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }
  if (VerifyCode.value !== formData.value.verifyCode) {
    uni.showToast({
      title: '验证码错误',
      icon: 'none'
    })
    return
  } 
  
  try {
    uni.showLoading({ title: '保存中...' })

    // 更新用户信息
    const { result } = await uniCloud.callFunction({
      name: 'updateUserInfo',
      data: {
        userId: userInfo.value._id,
        account: formData.value.account,
        nickname: formData.value.nickname
      }
    })
    
    if (result.code === 0) {
      // 更新本地存储
      const storedUserInfo = uni.getStorageSync('userInfo')
      storedUserInfo.account = formData.value.account
      storedUserInfo.nickname = formData.value.nickname
      uni.setStorageSync('userInfo', storedUserInfo)
      
      // 更新页面数据
      userInfo.value = storedUserInfo
      isEditing.value = false
      
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: result.msg || '保存失败',
        icon: 'none'
      })
    }
  } catch (e) {
    console.error(e)
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 开始编辑
const startEdit = () => {
  isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
  formData.value.account = userInfo.value.account
  formData.value.nickname = userInfo.value.nickname
  formData.value.verifyCode = ''
  isEditing.value = false
}

onMounted(() => {
  loadUserInfo()
})

// 组件销毁时清除定时器
onUnmounted(() => {
  if (verifyCodeTimer.value) {
    clearInterval(verifyCodeTimer.value)
  }
})
</script>

<template>
  <view class="container">
    <view class="user-info">
      <view class="avatar-section">
        <image class="avatar" :src="userInfo.avatar || '/static/avatar/default.png'" mode="aspectFill" />
      </view>
      
      <view class="info-section">
        <view v-if="!isEditing" class="info-item">
          <text class="label">手机号</text>
          <text class="value">{{ userInfo.account }}</text>
        </view>
        <view v-if="!isEditing" class="info-item">
          <text class="label">昵称</text>
          <text class="value">{{ userInfo.nickname }}</text>
        </view>
        
        <view v-if="isEditing" class="form">
          <view class="form-item">
            <text class="label">手机号</text>
            <input 
              class="input" 
              type="number" 
              v-model="formData.account" 
              placeholder="请输入手机号"
            />
          </view>
          <view class="form-item verify-code">
        <input 
              class="input" 
              type="number" 
              v-model="formData.verifyCode" 
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
          <view class="form-item">
            <text class="label">昵称</text>
            <input 
              class="input" 
              type="text" 
              v-model="formData.nickname" 
              placeholder="请输入昵称"
            />
          </view>
        </view>
      </view>
    </view>
    
    <view class="actions">
      <template v-if="!isEditing">
        <button class="btn primary" @tap="startEdit">编辑资料</button>
      </template>
      <template v-else>
        <button class="btn" @tap="cancelEdit">取消</button>
        <button class="btn primary" @tap="handleSubmit">保存</button>
      </template>
    </view>
  </view>
</template>

<style>
.container {
  padding: 30rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.user-info {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
}

.avatar-section {
  text-align: center;
  margin-bottom: 40rpx;
}

.avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 80rpx;
  border: 4rpx solid rgba(64, 149, 229, 0.1);
}

.info-section {
  margin-bottom: 30rpx;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid #eee;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  width: 140rpx;
  font-size: 28rpx;
  color: #666;
}

.value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.form-item {
  margin-bottom: 30rpx;
}

.input {
  height: 80rpx;
  background-color: #f8f8f8;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  margin-top: 10rpx;
}

.actions {
  display: flex;
  justify-content: space-around;
  padding: 20rpx;
}

.btn {
  width: 45%;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 28rpx;
  margin: 0;
}

.btn.primary {
  background-color: #4095E5;
  color: #fff;
}

.verify-code {
  display: flex;
  align-items: center;
}

.verify-code .input {
  flex: 1;
  margin-right: 20rpx;
}
</style> 