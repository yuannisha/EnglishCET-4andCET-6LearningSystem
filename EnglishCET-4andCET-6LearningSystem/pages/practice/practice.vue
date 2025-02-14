<script setup>
import { ref, onMounted } from 'vue'

/**
 * @description 练习类型列表
 */
const practiceTypes = ref([
  {
    id: 1,
    title: '模拟考试',
    desc: '完整模拟四六级考试流程',
    icon: '/static/icons/exam.png',
    path: '/pages/practice/mock-exam/mock-exam'
  },
  {
    id: 2,
    title: '真题练习',
    desc: '历年四六级真题训练',
    icon: '/static/icons/real-exam.png',
    path: '/pages/practice/real-exam/real-exam'
  },
  {
    id: 3,
    title: '错题集',
    desc: '记录并复习错题',
    icon: '/static/icons/wrong-questions.png',
    path: '/pages/practice/wrong-questions/wrong-questions'
  }
])

/**
 * @description 统计数据
 */
const statistics = ref({
  todayQuestions: 0,
  correctRate: 0,
  studyDays: 0
})

/**
 * @description 跳转到对应练习页面
 * @param {string} path - 页面路径
 */
const navigateToPage = (path) => {
  uni.navigateTo({
    url: path
  })
}

/**
 * @description 加载统计数据
 */
const loadStatistics = async () => {
  try {
    const { result } = await uniCloud.callFunction({
      name: 'getUserStatistics'
    })
    
    if (result.code === 0) {
      statistics.value = result.data
    }
  } catch (e) {
    console.error('获取统计数据失败', e)
  }
}

// 监听页面显示
uni.$on('practiceRecordUpdated', () => {
  loadStatistics()
})

onMounted(() => {
    if(!uni.getStorageSync('userInfo')) {
		uni.showToast({
			title: '请先登录',
			icon: 'none',
			duration: 2000
		})	
        uni.navigateTo({
            url: '/pages/login/login'
        })
    }else{
        loadStatistics()
    }	
})
</script>

<template>
  <view class="container">
    <!-- 顶部统计区域 -->
    <view class="statistics">
      <view class="stat-item">
        <text class="stat-num">{{ statistics.todayQuestions }}</text>
        <text class="stat-label">今日练习题</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ statistics.correctRate }}%</text>
        <text class="stat-label">正确率</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ statistics.studyDays }}</text>
        <text class="stat-label">连续打卡</text>
      </view>
    </view>
    
    <!-- 练习类型列表 -->
    <view class="practice-list">
      <view 
        class="practice-item" 
        v-for="item in practiceTypes" 
        :key="item.id"
        @tap="navigateToPage(item.path)"
      >
        <image class="practice-icon" :src="item.icon" mode="aspectFit" />
        <view class="practice-info">
          <text class="practice-title">{{ item.title }}</text>
          <text class="practice-desc">{{ item.desc }}</text>
        </view>
        <text class="practice-arrow">></text>
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

.statistics {
  display: flex;
  justify-content: space-between;
  padding: 30rpx;
  background-color: #4095E5;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
}

.stat-item {
  text-align: center;
  color: #fff;
}

.stat-num {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 10rpx;
}

.stat-label {
  font-size: 24rpx;
  opacity: 0.9;
}

.practice-list {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
}

.practice-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1px solid #eee;
}

.practice-item:last-child {
  border-bottom: none;
}

.practice-icon {
  width: 80rpx;
  height: 80rpx;
  margin-right: 20rpx;
}

.practice-info {
  flex: 1;
}

.practice-title {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.practice-desc {
  font-size: 24rpx;
  color: #666;
}

.practice-arrow {
  color: #999;
  font-size: 32rpx;
}
</style> 