<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

/**
 * @description 考试时间（分钟）
 */
const EXAM_TIME = 130 // 标准四六级考试时间

/**
 * @description 考试状态
 */
const examStatus = ref('ready') // ready-准备开始, ongoing-考试中, finished-已结束

/**
 * @description 剩余时间（秒）
 */
const remainingTime = ref(EXAM_TIME * 60)

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
 * @description 考试数据
 */
const examData = ref({
  listening: [],
  reading: [],
  translation: [],
  writing: []
})

/**
 * @description 当前考试部分
 */
const currentSection = ref('listening') // listening, reading, translation, writing

/**
 * @description 用户答案
 */
const userAnswers = ref({
  listening: [],
  reading: [],
  translation: '',
  writing: ''
})

/**
 * @description 分数
 */
const scores = ref({
  listening: 0,
  reading: 0,
  translation: 0,
  writing: 0,
  total: 0
})

/**
 * @description 音频播放器
 */
const audioContext = ref(null)
const isPlaying = ref(false)

/**
 * @description 计时器
 */
let timer = null

/**
 * @description 加载考试题目
 */
const loadExamQuestions = async () => {
  try {
    uni.showLoading({
      title: '加载中...'
    })
    console.log("currentCategory.value",currentCategory.value)
    const { result } = await uniCloud.callFunction({
      name: 'getMockExamQuestions',
      data: {
        category: currentCategory.value
      }
    })
    
    if (result.code === 0) {
      examData.value = result.data
      // 初始化用户答案
      userAnswers.value = {
        listening: new Array(examData.value.listening[0].answers.length -1).fill(''),
        reading: new Array(examData.value.reading[0].answers.length).fill(''),
        translation: '',
        writing: ''
      }
      console.log("userAnswers.value",userAnswers.value)
    } else {
      throw new Error(result.msg || '加载失败')
    }
  } catch (e) {
    console.error(e)
    uni.showToast({
      title: '加载题目失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

/**
 * @description 开始考试
 */
const startExam = () => {
  examStatus.value = 'ongoing'
  currentSection.value = 'listening'
  console.log("currentCategory",currentCategory.value)
  loadExamQuestions()
  startTimer()
}

/**
 * @description 切换考试部分
 */
const switchSection = (section) => {
  if (audioContext.value) {
    audioContext.value.pause()
    isPlaying.value = false
  }
  currentSection.value = section
  console.log("当前部分考试内容",examData.value[section][0])
}

/**
 * @description 播放音频
 */
const playAudio = () => {
  console.log("audioContext.value",audioContext.value)
  console.log(examData.value.listening[0])
  console.log("isPlaying.value",isPlaying.value)
  if (!examData.value.listening[0]?.audio_file) return
  
  //if (audioContext.value) {
    //audioContext.value.stop()
  //}
  if (!audioContext.value) {
  audioContext.value = uni.createInnerAudioContext()
  audioContext.value.src = examData.value.listening[0].audio_file
  console.log(audioContext.value.src)

  
  audioContext.value.onPlay(() => {
    isPlaying.value = true
  })
  
  audioContext.value.onEnded(() => {
    isPlaying.value = false
  })

  audioContext.value.onError(() => {
    isPlaying.value = false
    uni.showToast({
      title: '音频播放失败',
      icon: 'none'
    })
  })
}

  if (isPlaying.value) {
    if(audioContext.value){ 
      audioContext.value.pause()
      isPlaying.value = false 
      console.log("暂停音频")
    }
  } else {
    if(audioContext.value){ 
      audioContext.value.play()
      isPlaying.value = true
      console.log("播放音频")
    }
  }
}

/**
 * @description 选择答案
 */
const selectAnswer = (section, index, answer) => {
  if (section === 'listening' || section === 'reading') {
    userAnswers.value[section][index] = answer
  }
  console.log("userAnswers.value",userAnswers.value)
}

/**
 * @description 更新文本答案
 */
const updateTextAnswer = (section, value) => {
  userAnswers.value[section] = value
}

/**
 * @description 检查英文输入
 */
const checkEnglishInput = (e, section) => {
  const text = e.detail.value
  if (/[^\x00-\xff\s\p{P}]/u.test(text)) {
    uni.showToast({
      title: '请输入英文',
      icon: 'none'
    })
    userAnswers.value[section] = text.replace(/[^\x00-\xff\s\p{P}]/gu, '')
  }
}

/**
 * @description 开始计时
 */
const startTimer = () => {
  timer = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
    } else {
      finishExam()
    }
  }, 1000)
}

/**
 * @description 结束考试
 */
const finishExam = async () => {
  //检查用户作答是否完整，对于听力与阅读，需要检查每个问题的作答情况  
  const listeningIsAnswered = userAnswers.value.listening.every(answer => answer !== '')
  const readingIsAnswered = userAnswers.value.reading.every(answer => answer !== '')
  const translationIsAnswered = userAnswers.value.translation !== ''
  const writingIsAnswered = userAnswers.value.writing !== ''
  if (!listeningIsAnswered || !readingIsAnswered || !translationIsAnswered || !writingIsAnswered) {
    uni.showToast({
      title: '请先作答',
      icon: 'none'
    })
    return  
  }
  clearInterval(timer)
  examStatus.value = 'finished'
  if (audioContext.value) { 
    audioContext.value.stop()
    isPlaying.value = false
  }
  
  // 计算分数
  // 听力部分，结果保留一位小数
  const listeningScore = Math.round(examData.value.listening[0].answers.reduce((total, answer, index) => {
    return total + (userAnswers.value.listening[index] === answer.content ? answer.score : 0)
  }, 0) * 10) / 10
  
  
  // 阅读部分
  //const readingScore = examData.value.reading[0].answers.reduce((total, answer, index) => {
    //return total + (userAnswers.value.reading[index] === answer.content ? answer.score : 0)
  //}, 0)
  const readingScore = Math.round(examData.value.reading[0].answers.reduce((total, answer, index) => {
    return total + (userAnswers.value.reading[index] === answer.content ? 49.7 : 0)
  }, 0) * 10) / 10
  
  // 翻译和写作部分使用模拟评分
  const translationScore = Math.round((examData.value.translation[0].score - Math.random() * 20) * 10) / 10
  const writingScore = Math.round((examData.value.writing[0].score - Math.random() * 20) * 10) / 10
  
  scores.value = {
    listening: listeningScore,
    reading: readingScore,
    translation: translationScore,
    writing: writingScore,
    total: Math.round((listeningScore + readingScore + translationScore + writingScore) * 10) / 10
  }
  
  // 保存练习记录
  try {
    await uniCloud.callFunction({
      name: 'saveAndUpdatePracticeRecord',
      data: {
        userId: uni.getStorageSync('userInfo')._id,
        practice_type: 'mock',
        category: currentCategory.value,
        scores: scores.value,
        duration: EXAM_TIME * 60 - remainingTime.value
      }
    })
  } catch (e) {
    console.error('保存练习记录失败:', e)
  }
  
  
  
}

/**
 * @description 重新开始
 */
const restart = () => {
  uni.showModal({
    title: '提示',
    content: '确定要重新开始考试吗？',
    success: (res) => {
      if (res.confirm) {
        if (audioContext.value) {
          audioContext.value.stop()
          audioContext.value.destroy()
          isPlaying.value = false
        }
        examStatus.value = 'ready'
        remainingTime.value = EXAM_TIME * 60
        userAnswers.value = {
          listening: [],
          reading: [],
          translation: '',
          writing: ''
        }
        scores.value = {
          listening: 0,
          reading: 0,
          translation: 0,
          writing: 0,
          total: 0
        }
        loadExamQuestions()
      }
    }
  })
}

/**
 * @description 格式化时间
 */
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
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
    loadExamQuestions()
  }
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
  if (audioContext.value) {
    isPlaying.value = false
    audioContext.value.stop()
    audioContext.value.destroy()
    console.log("卸载音频")
  }
})
</script>

<template>
  <view class="container">
    <!-- 考试准备页 -->
    <view v-if="examStatus === 'ready'" class="exam-ready">
      <view class="category-selector">
        <view
          class="category-item"
          v-for="item in categoryOptions"
          :key="item.value"
          :class="{ active: currentCategory === item.value }"
          @tap="currentCategory = item.value"
        >
          {{ item.label }}
        </view>
      </view>
      
      <view class="exam-info">
        <view class="info-item">
          <text class="label">考试时长：</text>
          <text class="value">{{ EXAM_TIME }}分钟</text>
        </view>
        <view class="info-item">
          <text class="label">试卷结构：</text>
          <text class="value">听力、阅读、翻译、写作</text>
        </view>
        <view class="info-item">
          <text class="label">总分：</text>
          <text class="value">710分</text>
        </view>
      </view>
      
      <button class="start-btn" @tap="startExam">开始考试</button>
    </view>
    
    <!-- 考试进行中 -->
    <view v-else-if="examStatus === 'ongoing'" class="exam-ongoing">
      <!-- 顶部导航 -->
      <view class="exam-nav">
        <view class="timer">剩余时间：{{ formatTime(remainingTime) }}</view>
        <view class="section-tabs">
          <view
            class="tab-item"
            v-for="(label, key) in { listening: '听力', reading: '阅读', translation: '翻译', writing: '写作' }"
            :key="key"
            :class="{ active: currentSection === key }"
            @tap="switchSection(key)"
          >
            {{ label }}
          </view>
        </view>
      </view>
      
      <!-- 听力部分 -->
      <scroll-view
        v-if="currentSection === 'listening' && examData.listening.length > 0"
        class="exam-content"
        scroll-y
      >
        <view class="audio-player" @tap="playAudio">
          <text class="iconfont">{{ isPlaying ? '暂停' : '播放' }}</text>
        </view>
        
        <view
          class="question-section"
          v-for="(section, sectionIndex) in examData.listening[0].question_content"
          :key="sectionIndex"
        >
          <text class="section-name">{{ section.section_name }}</text>
          <text class="section-desc">{{ section.description }}</text>
          
          <view
            class="question-item"
            v-for="(question, questionIndex) in section.questions"
            :key="questionIndex"
          >
            <text class="question-text">{{ question.description1 }}</text>
            <view class="options">
              <view class="option-item" v-for="(option, key) in question.options" :key="option.tips"> 
                <text class="option-number">Question {{ option.tips }}</text>
                <view
                  class="option-choice"
                  v-for="(content, key) in option.content"
                  :key="key"
                  :class="{ active: userAnswers.listening[option.tips -1] === key }"
                  @tap="selectAnswer('listening', option.tips -1, key)"
                >
                  <text class="option-key">{{ key }}</text>
                  <text class="option-content">{{ content }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
      
      <!-- 阅读部分 -->
      <scroll-view
        v-if="currentSection === 'reading' && examData.reading.length > 0"
        class="exam-content"
        scroll-y
      >
        <view class="reading-passage">
          <text class="passage-title">{{ examData.reading[0].little_title }}</text>
          <text class="passage-content">{{ examData.reading[0].passage }}</text>
        </view>
        
        <view
          class="question-item"
          v-for="(question, index) in examData.reading[0].questions"
          :key="index"
        >
          <text class="question-number">Question {{ question.question_number }}</text>
          <text class="question-text">{{ question.question }}</text>
          <view class="options">
            <view
              class="option-choice"
              v-for="(content, key) in question.options"
              :key="key"
              :class="{ active: userAnswers.reading[index] === key }"
              @tap="selectAnswer('reading', index, key)"
            >
              <text class="option-key">{{ key }}</text>
              <text class="option-content">{{ content }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
      
      <!-- 翻译部分 -->
      <scroll-view
        v-if="currentSection === 'translation' && examData.translation.length > 0"
        class="exam-content"
        scroll-y
      >
        <view class="translation-content">
          <text class="section-title">{{ examData.translation[0].little_title }}</text>
          <view class="original-text">
            <text class="text-label">原文：</text>
            <text class="text-content">{{ examData.translation[0].original_text }}</text>
          </view>
          
          <view class="translation-area">
            <text class="text-label">译文：</text>
            <textarea
              class="translation-input"
              v-model="userAnswers.translation"
              placeholder="请输入英文翻译..."
              @blur="checkEnglishInput($event, 'translation')"
              maxlength="-1"
            />
          </view>
        </view>
      </scroll-view>
      
      <!-- 写作部分 -->
      <scroll-view
        v-if="currentSection === 'writing' && examData.writing.length > 0"
        class="exam-content"
        scroll-y
      >
        <view class="writing-content">
          <text class="section-title">{{ examData.writing[0].little_title }}</text>
          <text class="writing-title">{{ examData.writing[0].title }}</text>
          
          <view class="word-limit">
            字数要求：{{ examData.writing[0].word_limit.min }}-{{ examData.writing[0].word_limit.max }}词
          </view>
          
          <textarea
            class="writing-input"
            v-model="userAnswers.writing"
            placeholder="请用英文写作..."
            @blur="checkEnglishInput($event, 'writing')"
            maxlength="-1"
          />
        </view>
      </scroll-view>
      
      <!-- 底部控制栏 -->
      <view class="exam-footer">
        <button class="submit-btn" @tap="finishExam">结束考试</button>
      </view>
    </view>
    
    <!-- 考试结束页 -->
    <view v-else class="exam-finished">
      <view class="score-summary">
        <text class="total-score">总分：{{ scores.total }}</text>
        <view class="score-details">
          <view class="score-item">
            <text class="label">听力：</text>
            <text class="value">{{ scores.listening }}</text>
          </view>
          <view class="score-item">
            <text class="label">阅读：</text>
            <text class="value">{{ scores.reading }}</text>
          </view>
          <view class="score-item">
            <text class="label">翻译：</text>
            <text class="value">{{ scores.translation }}</text>
          </view>
          <view class="score-item">
            <text class="label">写作：</text>
            <text class="value">{{ scores.writing }}</text>
          </view>
        </view>
      </view>
      
      <button class="restart-btn" @tap="restart">重新开始</button>
    </view>
  </view>
</template>

<style>
.container {
  padding: 30rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 考试准备页样式 */
.exam-ready {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
}

.category-selector {
  display: flex;
  justify-content: space-around;
  margin-bottom: 40rpx;
}

.category-item {
  padding: 20rpx 40rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  color: #666;
  background-color: #f5f5f5;
}

.category-item.active {
  background-color: #4095E5;
  color: #fff;
}

.exam-info {
  margin-bottom: 40rpx;
}

.info-item {
  display: flex;
  margin-bottom: 20rpx;
}

.info-item .label {
  width: 160rpx;
  font-size: 28rpx;
  color: #666;
}

.info-item .value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.start-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background-color: #4095E5;
  color: #fff;
  border-radius: 40rpx;
  font-size: 32rpx;
}

/* 考试进行中样式 */
.exam-nav {
  background-color: #fff;
  padding: 20rpx;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
}

.timer {
  text-align: center;
  font-size: 32rpx;
  color: #4095E5;
  margin-bottom: 20rpx;
}

.section-tabs {
  display: flex;
  justify-content: space-around;
}

.tab-item {
  padding: 10rpx 30rpx;
  font-size: 28rpx;
  color: #666;
  border-radius: 30rpx;
}

.tab-item.active {
  background-color: #4095E5;
  color: #fff;
}

.exam-content {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 100rpx;
  height: calc(100vh - 300rpx);
}

.audio-player {
  width: 100rpx;
  height: 100rpx;
  background-color: #4095E5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30rpx;
}

.audio-player .iconfont {
  color: #fff;
  font-size: 40rpx;
}

.section-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.section-desc {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 30rpx;
  display: block;
}

.question-item {
  margin-bottom: 40rpx;
}

.question-text {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.options {
  padding-left: 20rpx;
}

.option-choice {
  display: flex;
  align-items: flex-start;
  padding: 20rpx;
  border: 1px solid #eee;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
}

.option-choice.active {
  background-color: rgba(64, 149, 229, 0.1);
  border-color: #4095E5;
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
}

.reading-passage {
  margin-bottom: 40rpx;
  padding: 30rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
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
  color: #333;
  line-height: 1.8;
}

.translation-content,
.writing-content {
  padding: 30rpx;
}

.text-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
  display: block;
}

.text-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
  margin-bottom: 30rpx;
  display: block;
}

.translation-input,
.writing-input {
  width: 100%;
  height: 400rpx;
  padding: 20rpx;
  font-size: 28rpx;
  line-height: 1.8;
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 10rpx;
  box-sizing: border-box;
}

.word-limit {
  font-size: 24rpx;
  color: #666;
  margin: 20rpx 0;
}
.option-number {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  display: block;
  margin-bottom: 10rpx;
}
.exam-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 20rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.submit-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background-color: #4095E5;
  color: #fff;
  border-radius: 40rpx;
  font-size: 32rpx;
}

/* 考试结束页样式 */
.exam-finished {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
}
.option-item {
  margin-bottom: 30rpx;
}
.score-summary {
  text-align: center;
  margin-bottom: 40rpx;
}

.total-score {
  font-size: 48rpx;
  color: #4095E5;
  font-weight: bold;
  margin-bottom: 30rpx;
  display: block;
}

.score-details {
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 30rpx;
}

.score-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.score-item:last-child {
  margin-bottom: 0;
}

.score-item .label {
  font-size: 28rpx;
  color: #666;
}

.score-item .value {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.restart-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background-color: #4095E5;
  color: #fff;
  border-radius: 40rpx;
  font-size: 32rpx;
  margin-top: 40rpx;
}
</style> 