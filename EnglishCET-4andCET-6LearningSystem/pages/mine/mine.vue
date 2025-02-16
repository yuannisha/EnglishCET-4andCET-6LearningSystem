<script setup>
import { ref, onMounted, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'

/**
 * @description 用户信息
 */
const userInfo = ref({
    _id: '',
    nickname: '',
    avatar: '',
    level: '',
    study_days: 0,
    points: 0   
})
const isLogin = ref(false)

const avatarPreview = ref(false)    

/**
 * @description 功能菜单列表
 */
const menuList = ref([
  {
    id: 1,
    title: '学习记录',
    icon: '/static/icons/record.png',
    path: '/pages/mine/learning-records/learning-records'
  },
  {
    id: 2,
    title: '我的收藏',
    icon: '/static/icons/favorite.png',
    path: '/pages/mine/favorites/favorites'
  },
  {
    id: 3,
    title: '学习计划',
    icon: '/static/icons/plan.png',
    path: '/pages/mine/study-plan/study-plan'
  },
  {
    id: 4,
    title: '设置',
    icon: '/static/icons/settings.png',
    path: '/pages/mine/settings/settings'
  }
])

/**
 * @description 跳转到对应页面
 * @param {string} path - 页面路径
 */
const navigateToPage = (path) => {
  uni.navigateTo({
    url: path
  })
}

/** 
 * @description 处理用户退出登录
 */
const handleLogout = () => {
  uni.removeStorageSync('userInfo')
  isLogin.value = false
  userInfo.value = {
    _id: '',
    nickname: '',
    avatar: '',
    level: '',
    study_days: 0,
    points: 0
  }
  uni.navigateTo({
    url: '/pages/login/login'
  })    
}

/**
 * @description 处理头像点击
 */
const handleAvatarClick = () => {
  if (!isLogin.value) {
    uni.navigateTo({
      url: '/pages/login/login'
    })
    return
  }
  
  uni.showActionSheet({
    itemList: ['查看头像', '更换头像'],
    success: (res) => {
      if (res.tapIndex === 0) {
        avatarPreview.value = true
        console.log("userInfo.value.avatar",userInfo.value.avatar)  
      } else {
        // 更换头像
        uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: async (res) => {
            const tempFilePath = res.tempFilePaths[0]
            
            try {
              uni.showLoading({ title: '上传中...' })
              
              // 上传图片到云存储
              const uploadRes = await uniCloud.uploadFile({
                filePath: tempFilePath,
                cloudPath: `avatar/${Date.now()}-${Math.random().toString(36).substr(2)}.jpg`
              })
              
              // 更新用户信息
              const { result } = await uniCloud.callFunction({
                name: 'updateUserInfo',
                data: {
                  userId: userInfo.value._id,
                  avatar: uploadRes.fileID
                }
              })
              
              if (result.code === 0) {
                userInfo.value.avatar = uploadRes.fileID
                const storedUserInfo = uni.getStorageSync('userInfo')
                storedUserInfo.avatar = uploadRes.fileID
                uni.setStorageSync('userInfo', storedUserInfo)
                
                uni.showToast({
                  title: '更新成功',
                  icon: 'success'
                })
              }
            } catch (e) {
              uni.showToast({
                title: '更新失败',
                icon: 'none'
              })
            } finally {
              uni.hideLoading()
            }
          }
        })
      }
    }
  })
}

onShow(() => {
    console.log("storedUserInfo",uni.getStorageSync('userInfo'))
    console.log("userInfo",userInfo.value)    
  const storedUserInfo = uni.getStorageSync('userInfo')
  if (!storedUserInfo) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
      duration: 2000  
    })	
    uni.navigateTo({
      url: '/pages/login/login'
    })
  } else {
    isLogin.value = true
    userInfo.value = storedUserInfo
  }	
})
</script>

<template>
  <view class="container">
    <!-- 用户信息卡片 -->
    <view class="user-card" @tap="handleAvatarClick">
      <image class="avatar" :src="userInfo.avatar || '/static/avatar/default.png'" mode="aspectFill" />
      <view class="user-info">
        <text class="nickname">{{userInfo.nickname || '未登录' }}</text>
        <text class="level">{{ userInfo.level || '英语小白' }}</text>
      </view>
    </view>
    
    <!-- 学习数据 -->
    <view class="study-data" v-if="isLogin">
      <view class="data-item">
        <text class="data-num">{{ userInfo.study_days || 0  }}</text>
        <text class="data-label">学习天数</text>
      </view>
      <view class="data-item">
        <text class="data-num">{{ userInfo.points || 0 }}</text>
        <text class="data-label">积分</text>
      </view>
    </view>
    
    <!-- 功能菜单 -->
    <view class="menu-list">
      <view 
        class="menu-item" 
        v-for="item in menuList" 
        :key="item.id"
        @tap="navigateToPage(item.path)"
        v-if="isLogin"
      >
        <image class="menu-icon" :src="item.icon" mode="aspectFit" />
        <text class="menu-title">{{ item.title }}</text>
        <text class="menu-arrow">></text>
      </view>
      
      <view v-if="isLogin" class="menu-item" @tap="navigateToPage('/pages/mine/center')">
        <image class="menu-icon" src="/static/icons/personal.png" mode="aspectFit" /> 
        <text class="menu-title">个人中心</text>
        <text class="menu-arrow">></text>
      </view>
      
      <view v-if="isLogin" class="menu-item" @tap="handleLogout">
        <image class="menu-icon" src="/static/icons/logout.png" mode="aspectFit" /> 
        <text class="menu-title">退出登录</text>
        <text class="menu-arrow">></text>
      </view>
    </view>
    <!-- 查看头像，如果登陆了且有头像，加一层遮罩，点击遮罩关闭 -->
    <view class="avatar-preview-mask" v-if="isLogin && userInfo.avatar && avatarPreview " @tap="avatarPreview = false">
        <view class="avatar-preview-mask-content"> 
            <image :src="userInfo.avatar" mode="aspectFill" />
        </view>
    </view> 
  </view>
</template>

<style>
.container {
  padding: 30rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 40rpx;
  background-color: #4095E5;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  margin-right: 30rpx;
  border: 4rpx solid rgba(255,255,255,0.3);
}

.user-info {
  color: #fff;
}

.nickname {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 10rpx;
}

.level {
  font-size: 24rpx;
  opacity: 0.9;
}

.study-data {
  display: flex;
  justify-content: space-around;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.data-item {
  text-align: center;
}

.data-num {
  font-size: 36rpx;
  color: #333;
  font-weight: bold;
  display: block;
  margin-bottom: 10rpx;
}

.data-label {
  font-size: 24rpx;
  color: #666;
}

.menu-list {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 0 20rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1px solid #eee;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
}

.menu-title {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.menu-arrow {
  color: #999;
  font-size: 32rpx;
}

.avatar-preview-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}      

.avatar-preview-mask-content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}   
</style> 