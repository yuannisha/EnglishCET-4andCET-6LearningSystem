<script setup>
import { ref } from 'vue'

/**
 * @description 收藏类型选项
 */
const typeOptions = ref([
  { value: 'word', label: '单词' },
  { value: 'listening', label: '听力' },
  { value: 'reading', label: '阅读' },
  { value: 'translation', label: '翻译' },
  { value: 'writing', label: '写作' }
])

/**
 * @description 当前选择的类型
 */
const currentType = ref('word')

/**
 * @description 切换类型
 */
const handleTypeChange = (type) => {
  currentType.value = type
}
</script>

<template>
  <view class="container">
    <!-- 类型选择 -->
    <view class="type-selector">
      <view
        class="type-item"
        v-for="item in typeOptions"
        :key="item.value"
        :class="{ active: currentType === item.value }"
        @tap="handleTypeChange(item.value)"
      >
        <text class="type-label">{{ item.label }}</text>
      </view>
    </view>
    
    <!-- 收藏列表 -->
    <scroll-view class="favorite-list" scroll-y>
      <!-- 单词收藏 -->
      <template v-if="currentType === 'word'">
        <view class="empty-tip">
          <text>暂无收藏的单词</text>
        </view>
      </template>
      
      <!-- 听力收藏 -->
      <template v-if="currentType === 'listening'">
        <view class="empty-tip">
          <text>暂无收藏的听力</text>
        </view>
      </template>
      
      <!-- 阅读收藏 -->
      <template v-if="currentType === 'reading'">
        <view class="empty-tip">
          <text>暂无收藏的阅读</text>
        </view>
      </template>
      
      <!-- 翻译收藏 -->
      <template v-if="currentType === 'translation'">
        <view class="empty-tip">
          <text>暂无收藏的翻译</text>
        </view>
      </template>
      
      <!-- 写作收藏 -->
      <template v-if="currentType === 'writing'">
        <view class="empty-tip">
          <text>暂无收藏的写作</text>
        </view>
      </template>
    </scroll-view>
  </view>
</template>

<style>
.container {
  padding: 30rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.type-selector {
  display: flex;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  gap: 20rpx;
}

.type-item {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;
  border-radius: 40rpx;
}

.type-item.active {
  background-color: #4095E5;
}

.type-label {
  font-size: 28rpx;
  color: #666;
}

.type-item.active .type-label {
  color: #fff;
}

.favorite-list {
  height: calc(100vh - 200rpx);
}

.empty-tip {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style> 