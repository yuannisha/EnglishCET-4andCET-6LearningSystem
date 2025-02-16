<script setup>
import { ref } from 'vue'

/**
 * @description 学习计划列表
 */
const planList = ref([
  {
    title: '单词学习',
    target: '每天50个单词',
    progress: 30,
    icon: '📚'
  },
  {
    title: '听力练习',
    target: '每周3次',
    progress: 66,
    icon: '🎧'
  },
  {
    title: '阅读练习',
    target: '每周2篇',
    progress: 50,
    icon: '📖'
  },
  {
    title: '翻译练习',
    target: '每周2篇',
    progress: 0,
    icon: '✍️'
  },
  {
    title: '写作练习',
    target: '每周1篇',
    progress: 100,
    icon: '📝'
  }
])

/**
 * @description 学习统计
 */
const statistics = ref({
  totalDays: 30,
  continuousDays: 7,
  totalTime: 45,
  averageScore: 85
})
</script>

<template>
  <view class="container">
    <!-- 学习统计 -->
    <view class="statistics-card">
      <view class="stat-item">
        <text class="stat-value">{{ statistics.totalDays }}</text>
        <text class="stat-label">总学习天数</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ statistics.continuousDays }}</text>
        <text class="stat-label">连续学习</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ statistics.totalTime }}h</text>
        <text class="stat-label">总学习时长</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ statistics.averageScore }}</text>
        <text class="stat-label">平均得分</text>
      </view>
    </view>
    
    <!-- 学习计划列表 -->
    <view class="plan-list">
      <view
        class="plan-item"
        v-for="(plan, index) in planList"
        :key="index"
      >
        <view class="plan-header">
          <view class="plan-title">
            <text class="plan-icon">{{ plan.icon }}</text>
            <text class="title-text">{{ plan.title }}</text>
          </view>
          <text class="plan-target">{{ plan.target }}</text>
        </view>
        
        <view class="progress-bar">
          <view
            class="progress-inner"
            :style="{ width: plan.progress + '%' }"
          ></view>
        </view>
        
        <text class="progress-text">完成度 {{ plan.progress }}%</text>
      </view>
    </view>
    
    <!-- 添加计划按钮 -->
    <button class="add-btn">
      <text class="btn-text">添加新计划</text>
    </button>
  </view>
</template>

<style>
.container {
  padding: 30rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.statistics-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 36rpx;
  color: #4095E5;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}

.plan-list {
  margin-bottom: 30rpx;
}

.plan-item {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.plan-title {
  display: flex;
  align-items: center;
}

.plan-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.title-text {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
}

.plan-target {
  font-size: 26rpx;
  color: #666;
}

.progress-bar {
  height: 10rpx;
  background-color: #f0f0f0;
  border-radius: 5rpx;
  overflow: hidden;
  margin-bottom: 10rpx;
}

.progress-inner {
  height: 100%;
  background-color: #4095E5;
  border-radius: 5rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 24rpx;
  color: #999;
}

.add-btn {
  position: fixed;
  bottom: 40rpx;
  left: 30rpx;
  right: 30rpx;
  height: 80rpx;
  line-height: 80rpx;
  background-color: #4095E5;
  color: #fff;
  border-radius: 40rpx;
  font-size: 32rpx;
  text-align: center;
}

.btn-text {
  color: #fff;
}
</style> 