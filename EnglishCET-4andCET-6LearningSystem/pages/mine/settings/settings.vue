<script setup>
import { ref } from 'vue'

/**
 * @description 设置选项
 */
const settings = ref({
  notification: true,
  autoPlay: false,
  darkMode: false,
  fontSize: 'medium'
})

/**
 * @description 字体大小选项
 */
const fontSizeOptions = [
  { value: 'small', label: '小' },
  { value: 'medium', label: '中' },
  { value: 'large', label: '大' }
]

/**
 * @description 切换开关
 */
const toggleSwitch = (key) => {
  settings.value[key] = !settings.value[key]
}

/**
 * @description 选择字体大小
 */
const selectFontSize = (size) => {
  settings.value.fontSize = size
}

/**
 * @description 退出登录
 */
const logout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.removeStorageSync('userInfo')
        uni.reLaunch({
          url: '/pages/login/login'
        })
      }
    }
  })
}

/**
 * @description 清除缓存
 */
const clearCache = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清除缓存吗？',
    success: (res) => {
      if (res.confirm) {
        uni.clearStorageSync()
        uni.showToast({
          title: '清除成功',
          icon: 'success'
        })
      }
    }
  })
}
</script>

<template>
  <view class="container">
    <!-- 基本设置 -->
    <view class="settings-section">
      <view class="section-title">基本设置</view>
      
      <view class="settings-list">
        <view class="settings-item">
          <text class="item-label">消息通知</text>
          <switch
            :checked="settings.notification"
            @change="toggleSwitch('notification')"
            color="#4095E5"
          />
        </view>
        
        <view class="settings-item">
          <text class="item-label">自动播放音频</text>
          <switch
            :checked="settings.autoPlay"
            @change="toggleSwitch('autoPlay')"
            color="#4095E5"
          />
        </view>
        
        <view class="settings-item">
          <text class="item-label">深色模式</text>
          <switch
            :checked="settings.darkMode"
            @change="toggleSwitch('darkMode')"
            color="#4095E5"
          />
        </view>
        
        <view class="settings-item">
          <text class="item-label">字体大小</text>
          <view class="font-size-selector">
            <view
              class="size-option"
              v-for="option in fontSizeOptions"
              :key="option.value"
              :class="{ active: settings.fontSize === option.value }"
              @tap="selectFontSize(option.value)"
            >
              {{ option.label }}
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 其他设置 -->
    <view class="settings-section">
      <view class="section-title">其他设置</view>
      
      <view class="settings-list">
        <view class="settings-item link" @tap="clearCache">
          <text class="item-label">清除缓存</text>
          <text class="iconfont arrow">></text>
        </view>
        
        <view class="settings-item link">
          <text class="item-label">关于我们</text>
          <text class="iconfont arrow">></text>
        </view>
        
        <view class="settings-item link">
          <text class="item-label">意见反馈</text>
          <text class="iconfont arrow">></text>
        </view>
        
        <view class="settings-item link">
          <text class="item-label">隐私政策</text>
          <text class="iconfont arrow">></text>
        </view>
      </view>
    </view>
    
    <!-- 退出登录 -->
    <button class="logout-btn" @tap="logout">退出登录</button>
  </view>
</template>

<style>
.container {
  padding: 30rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.settings-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 30rpx;
}

.settings-list {
  border-radius: 10rpx;
  overflow: hidden;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1px solid #f5f5f5;
}

.settings-item:last-child {
  border-bottom: none;
}

.item-label {
  font-size: 28rpx;
  color: #333;
}

.font-size-selector {
  display: flex;
  gap: 20rpx;
}

.size-option {
  padding: 10rpx 30rpx;
  font-size: 26rpx;
  color: #666;
  background-color: #f8f8f8;
  border-radius: 30rpx;
}

.size-option.active {
  background-color: #4095E5;
  color: #fff;
}

.settings-item.link {
  cursor: pointer;
}

.arrow {
  font-size: 24rpx;
  color: #999;
}

.logout-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background-color: #ff4d4f;
  color: #fff;
  border-radius: 40rpx;
  font-size: 32rpx;
  margin-top: 60rpx;
}
</style> 