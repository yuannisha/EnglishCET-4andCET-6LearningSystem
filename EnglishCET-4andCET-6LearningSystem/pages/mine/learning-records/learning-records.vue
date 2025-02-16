<script setup>
import { ref, onMounted } from 'vue'

/**
 * @description 记录列表
 */
const recordList = ref([])

/**
 * @description 分页相关参数
 */
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

/**
 * @description 当前选择的类别
 */
const currentCategory = ref('CET4')

/**
 * @description 类别选项
 */
const categoryOptions = ref([
  { value: 'CET4', label: '大学英语四级' },
  { value: 'CET6', label: '大学英语六级' }
])

/**
 * @description 当前选择的练习类型
 */
const currentType = ref('all')

/**
 * @description 练习类型选项
 */
const typeOptions = ref([
  { value: 'all', label: '全部' },
  { value: 'mock', label: '模拟考试' },
  { value: 'real', label: '真题练习' },
  { value: 'listening', label: '听力练习' },
  { value: 'reading', label: '阅读练习' },
  { value: 'writing', label: '写作练习' },
  { value: 'translation', label: '翻译练习' },
  { value: 'real_listening', label: '听力真题' },
  { value: 'real_reading', label: '阅读真题' },
  { value: 'real_translation', label: '翻译真题' },
  { value: 'real_writing', label: '写作真题' }
])

/**
 * @description 加载练习记录
 */
const loadRecords = async () => {
  try {
    uni.showLoading({
      title: '加载中...'
    })
    const { result } = await uniCloud.callFunction({
      name: 'getPracticeRecords',
      data: {
        user_id: uni.getStorageSync('userInfo')._id,
        category: currentCategory.value,
        practice_type: currentType.value === 'all' ? undefined : currentType.value,
        page: pagination.value.current,
        pageSize: pagination.value.pageSize
      }
    })
    
    if (result.code === 0) {
      recordList.value = result.data.list
      pagination.value.total = result.data.total
      console.log("recordList",recordList.value)
    } else {
      throw new Error(result.msg)
    }
  } catch (e) {
    uni.showToast({
      title: '加载记录失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

/**
 * @description 切换类别
 */
const handleCategoryChange = (category) => {
  currentCategory.value = category
  loadRecords()
}

/**
 * @description 切换练习类型
 */
const handleTypeChange = (type) => {
  currentType.value = type
  loadRecords()
}

/**
 * @description 切换页码
 */
const handlePageChange = (page) => {
  pagination.value.current = page
  loadRecords()
}

/**
 * @description 格式化时间
 */
const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * @description 格式化练习类型
 */
const formatType = (type) => {
  const option = typeOptions.value.find(item => item.value === type)
  return option ? option.label : type
}

/**
 * @description 格式化练习时长
 */
const formatDuration = (duration) => {
  const minutes = Math.floor(duration / 60);  
  const seconds = duration % 60;  
  return `${minutes}分${seconds}秒`;  
}   

onMounted(() => {
  if (!uni.getStorageSync('userInfo')) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
      duration: 2000
    })
    uni.navigateTo({
      url: '/pages/login/login'
    })
  } else {
    loadRecords()
  }
})
</script>

<template>
  <view class="container">
    <!-- 筛选区域 -->
    <view class="filter-area">
      <view class="filter-row">
        <view class="filter-item">
          <text class="label">考试类型</text>
          <view class="options">
            <view
              class="option"
              v-for="item in categoryOptions"
              :key="item.value"
              :class="{ active: currentCategory === item.value }"
              @tap="handleCategoryChange(item.value)"
            >
              {{ item.label }}
            </view>
          </view>
        </view>
      </view>
      
      <view class="filter-row">
        <view class="filter-item">
          <text class="label">练习类型</text>
          <view class="options">
            <view
              class="option"
              v-for="item in typeOptions"
              :key="item.value"
              :class="{ active: currentType === item.value }"
              @tap="handleTypeChange(item.value)"
            >
              {{ item.label }}
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 记录列表 -->
    <scroll-view class="record-list" scroll-y>
      <view v-if="recordList.length > 0">
        <view
          class="record-item"
          v-for="(record, index) in recordList"
          :key="record._id"
        >
          <view class="record-header">
            <text class="practice-type">{{ formatType(record.practice_type) }}</text>
            <text class="practice-date">{{ formatDate(record.create_date) }}</text>
          </view>
          
          <view class="record-content">
            <view class="score-info">
              <view class="score-item">
                <text class="label">得分</text>
                <text class="value">{{ record.scores?.total || record.lastScore }}</text>
              </view>
              <view class="score-item" v-if="record.practice_type === 'mock' || record.practice_type === 'real'">
                <text class="label">听力</text>
                <text class="value">{{ record.scores?.listening || 0 }}</text>
              </view>
              <view class="score-item" v-if="record.practice_type === 'mock' || record.practice_type === 'real'">
                <text class="label">阅读</text>
                <text class="value">{{ record.scores?.reading || 0 }}</text>
              </view>
              <view class="score-item" v-if="record.practice_type === 'mock' || record.practice_type === 'real'">
                <text class="label">翻译</text>
                <text class="value">{{ record.scores?.translation || 0 }}</text>
              </view>
              <view class="score-item" v-if="record.practice_type === 'mock' || record.practice_type === 'real'">
                <text class="label">写作</text>
                <text class="value">{{ record.scores?.writing || 0 }}</text>
              </view>
            </view>
            
            <view class="practice-info">
              <view class="info-item" v-if="record.duration">
                <text class="label">练习时长</text>
                <text class="value">{{ formatDuration(record.duration) }}</text>
              </view>
              <view class="info-item" v-if="record.practice_type !== 'mock' && record.practice_type !== 'translation' && record.practice_type !== 'writing' && record.practice_type !== 'real_translation' && record.practice_type !== 'real_writing'">
                <text class="label">正确率</text>
                <text class="value">{{ record.lastCorrectRate }}%</text>
              </view>
              <view class="info-item" v-if="record.practice_type !== 'mock' && record.practice_type !== 'translation' && record.practice_type !== 'writing' && record.practice_type !== 'real_translation' && record.practice_type !== 'real_writing'">
                <text class="label">正确题数</text>
                <text class="value" v-if="record.practice_type === 'real_listening' || record.practice_type === 'listening'">{{ record.lastCorrectCount }}/25</text>
                <text class="value" v-if="record.practice_type === 'real_reading' || record.practice_type === 'reading'">{{ record.lastCorrectCount }}/5</text>
              </view>
              <view class="info-item" v-if="record.practice_type === 'translation' || record.practice_type === 'writing' || record.practice_type === 'real_translation' || record.practice_type === 'real_writing'">
                <text class="label">满分</text>
                <text class="value">106.5</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view v-else class="empty-tip">
        <text>暂无练习记录</text>
      </view>
    </scroll-view>
    
    <!-- 分页控制 -->
    <view class="pagination" v-if="recordList.length > 0">
      <view class="page-info">
        <text>共 {{ pagination.total }} 条记录</text>
      </view>
      <view class="page-controls">
        <button 
          class="page-btn" 
          :disabled="pagination.current <= 1"
          @tap="handlePageChange(pagination.current - 1)"
        >
          上一页
        </button>
        <text class="page-number">第 {{ pagination.current }} 页</text>
        <button 
          class="page-btn" 
          :disabled="pagination.current >= Math.ceil(pagination.total / pagination.pageSize)"
          @tap="handlePageChange(pagination.current + 1)"
        >
          下一页
        </button>
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

.filter-area {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
}

.filter-row {
  margin-bottom: 20rpx;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-item {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.options {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.option {
  padding: 10rpx 30rpx;
  font-size: 26rpx;
  color: #666;
  background-color: #f8f8f8;
  border-radius: 30rpx;
}

.option.active {
  background-color: #4095E5;
  color: #fff;
}

.record-list {
  height: calc(100vh - 300rpx);
}

.record-item {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.practice-type {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
}

.practice-date {
  font-size: 26rpx;
  color: #999;
}

.record-content {
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 20rpx;
}

.score-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1px solid #eee;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120rpx;
}

.score-item .label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.score-item .value {
  font-size: 32rpx;
  color: #4095E5;
  font-weight: bold;
}

.practice-info {
  display: flex;
  justify-content: space-around;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-item .label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.info-item .value {
  font-size: 28rpx;
  color: #333;
}

.empty-tip {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}

.pagination {
  background-color: #fff;
  padding: 20rpx;
  border-radius: 20rpx;
  margin-top: 20rpx;
}

.page-info {
  text-align: center;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.page-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20rpx;
}

.page-btn {
  font-size: 26rpx;
  padding: 10rpx 30rpx;
  background-color: #4095E5;
  color: #fff;
  border-radius: 30rpx;
}

.page-btn[disabled] {
  background-color: #ccc;
  color: #fff;
}

.page-number {
  font-size: 26rpx;
  color: #333;
}
</style> 