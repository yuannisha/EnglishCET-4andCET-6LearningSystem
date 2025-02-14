<script setup>
import { ref, onMounted } from 'vue'

/**
 * @description 当前选择的类别
 */
const currentCategory = ref('all')

/**
 * @description 类别选项
 */
const categoryOptions = ref([
  { value: 'all', label: '全部' },
  { value: 'listening', label: '听力' },
  { value: 'reading', label: '阅读' },
  { value: 'translation', label: '翻译' },
  { value: 'writing', label: '写作' }
])

/**
 * @description 错题列表
 */
const wrongQuestionList = ref([])

/**
 * @description 是否显示答案
 */
const showAnswers = ref(false)

/**
 * @description 音频播放状态
 */
const audioPlaying = ref(false)
const audioContext = ref(null)

/**
 * @description 加载错题列表
 */
const loadWrongQuestions = async () => {
  try {
    uni.showLoading({
      title: '加载中...'
    })
    
    const { result } = await uniCloud.callFunction({
      name: 'getWrongQuestions',
      data: {
        userId: uni.getStorageSync('userInfo')._id,
        category: currentCategory.value === 'all' ? null : currentCategory.value
      }
    })
    
    if (result.code === 0) {
      wrongQuestionList.value = result.data
    } else {
      throw new Error('加载错题失败')
    }
  } catch (e) {
    console.error(e)
    uni.showToast({
      title: '加载错题失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

/**
 * @description 播放听力音频
 */
const playAudio = (audioUrl) => {
  if (audioPlaying.value) {
    audioContext.value.stop()
    audioContext.value.destroy()
  }
  
  audioContext.value = uni.createInnerAudioContext()
  audioContext.value.src = audioUrl
  audioContext.value.autoplay = true
  
  audioContext.value.onPlay(() => {
    audioPlaying.value = true
  })
  
  audioContext.value.onEnded(() => {
    audioPlaying.value = false
  })
  
  audioContext.value.onError(() => {
    audioPlaying.value = false
    uni.showToast({
      title: '音频播放失败',
      icon: 'none'
    })
  })
}

/**
 * @description 切换类别
 */
const handleCategoryChange = (category) => {
  currentCategory.value = category
  loadWrongQuestions()
}

/**
 * @description 移除错题
 */
const removeWrongQuestion = async (questionId) => {
  try {
    uni.showLoading({
      title: '移除中...'
    })
    
    const { result } = await uniCloud.callFunction({
      name: 'removeWrongQuestion',
      data: {
        userId: uni.getStorageSync('userInfo')._id,
        questionId
      }
    })
    
    if (result.code === 0) {
      wrongQuestionList.value = wrongQuestionList.value.filter(
        item => item._id !== questionId
      )
      uni.showToast({
        title: '移除成功',
        icon: 'success'
      })
    } else {
      throw new Error('移除失败')
    }
  } catch (e) {
    console.error(e)
    uni.showToast({
      title: '移除失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

/**
 * @description 开始专项练习
 */
const startPractice = () => {
  if (wrongQuestionList.value.length === 0) {
    uni.showToast({
      title: '暂无错题',
      icon: 'none'
    })
    return
  }
  
  uni.navigateTo({
    url: `/pages/practice/mock-exam/mock-exam?type=wrong&category=${currentCategory.value}`
  })
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
    loadWrongQuestions()
  }
})
</script>

<template>
  <view class="container">
    <!-- 顶部操作栏 -->
    <view class="action-bar">
      <view class="category-selector">
        <scroll-view scroll-x>
          <view 
            class="category-item" 
            v-for="item in categoryOptions" 
            :key="item.value"
            :class="{ active: currentCategory === item.value }"
            @tap="handleCategoryChange(item.value)"
          >
            {{ item.label }}
          </view>
        </scroll-view>
      </view>
      
      <view class="action-buttons">
        <button 
          class="btn outline" 
          @tap="showAnswers = !showAnswers"
        >
          {{ showAnswers ? '隐藏答案' : '显示答案' }}
        </button>
        <button 
          class="btn primary" 
          @tap="startPractice"
        >
          开始练习
        </button>
      </view>
    </view>
    
    <!-- 错题列表 -->
    <scroll-view 
      class="question-list" 
      scroll-y
      v-if="wrongQuestionList.length > 0"
    >
      <!-- 听力题目 -->
      <view 
        class="question-item listening"
        v-for="item in wrongQuestionList.filter(q => q.type === 'listening')"
        :key="item._id"
      >
        <view class="question-header">
          <text class="question-type">听力</text>
          <text class="question-date">{{ item.create_date }}</text>
        </view>
        
        <view class="question-content">
          <view class="audio-player" @tap="playAudio(item.audio_file)">
            <text class="iconfont">{{ audioPlaying ? '暂停' : '播放' }}</text>
          </view>
          
          <text class="question-text">{{ item.question }}</text>
          
          <view class="options">
            <view 
              class="option-item"
              v-for="(content, key) in item.options"
              :key="key"
              :class="{ 
                wrong: item.user_answer === key && key !== item.correct_answer,
                correct: showAnswers && key === item.correct_answer
              }"
            >
              <text class="option-key">{{ key }}</text>
              <text class="option-content">{{ content }}</text>
            </view>
          </view>
          
          <view class="answer-analysis" v-if="showAnswers">
            <text class="analysis-title">答案解析：</text>
            <text class="analysis-content">{{ item.analysis }}</text>
          </view>
        </view>
        
        <view class="question-footer">
          <button 
            class="btn text" 
            @tap="removeWrongQuestion(item._id)"
          >
            移除
          </button>
        </view>
      </view>
      
      <!-- 阅读题目 -->
      <view 
        class="question-item reading"
        v-for="item in wrongQuestionList.filter(q => q.type === 'reading')"
        :key="item._id"
      >
        <view class="question-header">
          <text class="question-type">阅读</text>
          <text class="question-date">{{ item.create_date }}</text>
        </view>
        
        <view class="question-content">
          <text class="passage-title">{{ item.title }}</text>
          <text class="passage-content">{{ item.passage }}</text>
          
          <text class="question-text">{{ item.question }}</text>
          
          <view class="options">
            <view 
              class="option-item"
              v-for="(content, key) in item.options"
              :key="key"
              :class="{ 
                wrong: item.user_answer === key && key !== item.correct_answer,
                correct: showAnswers && key === item.correct_answer
              }"
            >
              <text class="option-key">{{ key }}</text>
              <text class="option-content">{{ content }}</text>
            </view>
          </view>
          
          <view class="answer-analysis" v-if="showAnswers">
            <text class="analysis-title">答案解析：</text>
            <text class="analysis-content">{{ item.analysis }}</text>
          </view>
        </view>
        
        <view class="question-footer">
          <button 
            class="btn text" 
            @tap="removeWrongQuestion(item._id)"
          >
            移除
          </button>
        </view>
      </view>
      
      <!-- 翻译题目 -->
      <view 
        class="question-item translation"
        v-for="item in wrongQuestionList.filter(q => q.type === 'translation')"
        :key="item._id"
      >
        <view class="question-header">
          <text class="question-type">翻译</text>
          <text class="question-date">{{ item.create_date }}</text>
        </view>
        
        <view class="question-content">
          <view class="original-text">
            <text class="text-label">原文：</text>
            <text class="text-content">{{ item.original_text }}</text>
          </view>
          
          <view class="user-translation">
            <text class="text-label">你的翻译：</text>
            <text class="text-content">{{ item.user_translation }}</text>
          </view>
          
          <view class="reference-translation" v-if="showAnswers">
            <text class="text-label">参考译文：</text>
            <text class="text-content">{{ item.reference_translation }}</text>
          </view>
          
          <view class="answer-analysis" v-if="showAnswers">
            <text class="analysis-title">评分要点：</text>
            <text class="analysis-content">{{ item.scoring_points }}</text>
          </view>
        </view>
        
        <view class="question-footer">
          <button 
            class="btn text" 
            @tap="removeWrongQuestion(item._id)"
          >
            移除
          </button>
        </view>
      </view>
      
      <!-- 写作题目 -->
      <view 
        class="question-item writing"
        v-for="item in wrongQuestionList.filter(q => q.type === 'writing')"
        :key="item._id"
      >
        <view class="question-header">
          <text class="question-type">写作</text>
          <text class="question-date">{{ item.create_date }}</text>
        </view>
        
        <view class="question-content">
          <text class="writing-title">{{ item.title }}</text>
          <text class="writing-requirements">{{ item.requirements }}</text>
          
          <view class="user-essay">
            <text class="text-label">你的作文：</text>
            <text class="text-content">{{ item.user_essay }}</text>
          </view>
          
          <view class="model-essay" v-if="showAnswers">
            <text class="text-label">范文：</text>
            <text class="text-content">{{ item.model_essay }}</text>
          </view>
          
          <view class="answer-analysis" v-if="showAnswers">
            <text class="analysis-title">评分要点：</text>
            <text class="analysis-content">{{ item.scoring_points }}</text>
          </view>
        </view>
        
        <view class="question-footer">
          <button 
            class="btn text" 
            @tap="removeWrongQuestion(item._id)"
          >
            移除
          </button>
        </view>
      </view>
    </scroll-view>
    
    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <image class="empty-icon" src="/static/images/empty.png" />
      <text class="empty-text">暂无错题记录</text>
    </view>
  </view>
</template>

<style>
.container {
  padding: 30rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.action-bar {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
}

.category-selector {
  margin-bottom: 20rpx;
}

.category-selector scroll-view {
  white-space: nowrap;
}

.category-item {
  display: inline-block;
  padding: 10rpx 30rpx;
  margin: 0 10rpx;
  border-radius: 30rpx;
  font-size: 28rpx;
  color: #666;
  background-color: #f5f5f5;
}

.category-item:first-child {
  margin-left: 0;
}

.category-item.active {
  background-color: #4095E5;
  color: #fff;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
}

.btn {
  width: 45%;
  height: 70rpx;
  line-height: 70rpx;
  font-size: 28rpx;
  margin: 0;
}

.btn.outline {
  background-color: #fff;
  color: #4095E5;
  border: 1px solid #4095E5;
}

.btn.primary {
  background-color: #4095E5;
  color: #fff;
}

.btn.text {
  background-color: transparent;
  color: #666;
  padding: 0;
  width: auto;
  height: auto;
  line-height: 1;
}

.question-list {
  height: calc(100vh - 250rpx);
}

.question-item {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.question-type {
  font-size: 24rpx;
  color: #4095E5;
  background-color: rgba(64, 149, 229, 0.1);
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
}

.question-date {
  font-size: 24rpx;
  color: #999;
}

.question-content {
  margin-bottom: 20rpx;
}

.audio-player {
  width: 80rpx;
  height: 80rpx;
  background-color: #4095E5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.audio-player .iconfont {
  color: #fff;
  font-size: 40rpx;
}

.passage-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.passage-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
  margin-bottom: 30rpx;
  display: block;
}

.question-text {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.options {
  margin-left: 40rpx;
}

.option-item {
  display: flex;
  align-items: flex-start;
  padding: 20rpx;
  border: 1px solid #eee;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
}

.option-item.wrong {
  background-color: rgba(255, 77, 79, 0.1);
  border-color: #ff4d4f;
}

.option-item.correct {
  background-color: rgba(82, 196, 26, 0.1);
  border-color: #52c41a;
}

.option-key {
  width: 60rpx;
  font-size: 28rpx;
  color: #666;
}

.option-content {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
}

.text-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.text-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
  display: block;
  margin-bottom: 20rpx;
}

.writing-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.writing-requirements {
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
  margin-bottom: 30rpx;
  display: block;
}

.answer-analysis {
  margin-top: 30rpx;
  padding-top: 30rpx;
  border-top: 1px dashed #eee;
}

.analysis-title {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.analysis-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
}

.question-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20rpx;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style> 