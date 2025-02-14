<script setup>
import { ref, onMounted } from 'vue'

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
  { value: 'CET4', label: '四级考试' },
  { value: 'CET6', label: '六级考试' }
])

/**
 * @description 考试题目数据
 */
const examData = ref({
  listening: null,
  reading: null,
  translation: null,
  writing: null
})

/**
 * @description 当前考试部分
 */
const currentSection = ref('listening') // listening, reading, translation, writing

/**
 * @description 用户答案
 */
const userAnswers = ref({
  listening: {},
  reading: {},
  translation: '',
  writing: ''
})

/**
 * @description 分数统计
 */
const scores = ref({
  listening: 0,
  reading: 0,
  translation: 0,
  writing: 0,
  total: 0
})

/**
 * @description 计时器
 */
let timer = null

/**
 * @description 音频播放状态
 */
const audioPlaying = ref(false)
const audioContext = ref(null)

/**
 * @description 加载考试题目
 */
const loadExamQuestions = async () => {
  try {
    uni.showLoading({
      title: '加载中...'
    })
    
    // 加载听力题目
    const listeningRes = await uniCloud.callFunction({
      name: 'getListeningQuestions',
      data: {
        category: currentCategory.value,
        set_number: 1
      }
    })
    
    // 加载阅读题目
    const readingRes = await uniCloud.callFunction({
      name: 'getReadingQuestions',
      data: {
        category: currentCategory.value,
        set_number: 1
      }
    })
    
    // 加载翻译题目
    const translationRes = await uniCloud.callFunction({
      name: 'getTranslationQuestions',
      data: {
        category: currentCategory.value,
        set_number: 1
      }
    })
    
    // 加载写作题目
    const writingRes = await uniCloud.callFunction({
      name: 'getWritingQuestions',
      data: {
        category: currentCategory.value,
        set_number: 1
      }
    })
    
    if (listeningRes.result.code === 0 && 
        readingRes.result.code === 0 && 
        translationRes.result.code === 0 && 
        writingRes.result.code === 0) {
      examData.value = {
        listening: listeningRes.result.data.list[0],
        reading: readingRes.result.data.list[0],
        translation: translationRes.result.data.list[0],
        writing: writingRes.result.data.list[0]
      }
    } else {
      throw new Error('加载题目失败')
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
  startTimer()
  playListeningAudio()
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
 * @description 播放听力音频
 */
const playListeningAudio = () => {
  if (audioPlaying.value) return
  
  audioContext.value = uni.createInnerAudioContext()
  audioContext.value.src = examData.value.listening.audio_file
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
 * @description 切换考试部分
 */
const switchSection = (section) => {
  if (section === currentSection.value) return
  
  // 停止音频播放
  if (audioContext.value) {
    audioContext.value.stop()
    audioContext.value.destroy()
  }
  
  currentSection.value = section
}

/**
 * @description 选择答案（听力/阅读）
 */
const selectAnswer = (section, questionNumber, answer) => {
  userAnswers.value[section][questionNumber] = answer
}

/**
 * @description 更新文本答案（翻译/写作）
 */
const updateTextAnswer = (section, text) => {
  userAnswers.value[section] = text
}

/**
 * @description 检查字数限制（写作）
 */
const checkWordLimit = () => {
  const wordCount = userAnswers.value.writing.split(/\s+/).filter(Boolean).length
  const limit = examData.value.writing.word_limit
  
  return wordCount >= limit.min && wordCount <= limit.max
}

/**
 * @description 结束考试
 */
const finishExam = async () => {
  clearInterval(timer)
  examStatus.value = 'finished'
  
  try {
    uni.showLoading({
      title: '正在评分...'
    })
    
    // 计算听力分数
    examData.value.listening.answers.forEach(answer => {
      if (userAnswers.value.listening[answer.key] === answer.content) {
        scores.value.listening += answer.score
      }
    })
    
    // 计算阅读分数
    examData.value.reading.answers.forEach(answer => {
      if (userAnswers.value.reading[answer.question_number] === answer.correct_answer) {
        scores.value.reading += answer.score
      }
    })
    
    // 翻译和写作使用模拟评分
    scores.value.translation = Math.round((examData.value.translation.score - Math.random() * 5) * 10) / 10
    scores.value.writing = Math.round((examData.value.writing.score - Math.random() * 10) * 10) / 10
    
    // 计算总分
    scores.value.total = Math.round((
      scores.value.listening + 
      scores.value.reading + 
      scores.value.translation + 
      scores.value.writing
    ) * 10) / 10
    
    // 保存考试记录
    await uniCloud.callFunction({
      name: 'saveAndUpdatePracticeRecord',
      data: {
        userId: uni.getStorageSync('userInfo')._id,
        question_id: examData.value.listening._id, // 使用听力题目ID作为考试ID
        question_type: 'mock',
        correctCount: 0, // 模拟考试不计算正确题目数
        correctRate: 0, // 模拟考试不计算正确率
        userScore: scores.value.total
      }
    })
  } catch (e) {
    console.error(e)
    uni.showToast({
      title: '评分失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

/**
 * @description 重新开始
 */
const restart = () => {
  examStatus.value = 'ready'
  remainingTime.value = EXAM_TIME * 60
  currentSection.value = 'listening'
  userAnswers.value = {
    listening: {},
    reading: {},
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

/**
 * @description 格式化时间
 */
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
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
</script>

<template>
  <view class="container">
    <!-- 准备开始 -->
    <view class="ready-card" v-if="examStatus === 'ready'">
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
        <text class="title">模拟考试</text>
        <view class="info-item">
          <text class="label">考试时长：</text>
          <text class="value">{{ EXAM_TIME }}分钟</text>
        </view>
        <view class="info-item">
          <text class="label">总分：</text>
          <text class="value">710分</text>
        </view>
        <view class="section-list">
          <view class="section-item">
            <text class="section-name">听力</text>
            <text class="section-score">249分</text>
          </view>
          <view class="section-item">
            <text class="section-name">阅读</text>
            <text class="section-score">249分</text>
          </view>
          <view class="section-item">
            <text class="section-name">翻译</text>
            <text class="section-score">106.5分</text>
          </view>
          <view class="section-item">
            <text class="section-name">写作</text>
            <text class="section-score">106.5分</text>
          </view>
        </view>
      </view>
      
      <button class="btn primary" @tap="startExam">开始考试</button>
    </view>
    
    <!-- 考试中 -->
    <view class="exam-content" v-else-if="examStatus === 'ongoing'">
      <!-- 顶部状态栏 -->
      <view class="exam-header">
        <text class="timer">剩余时间：{{ formatTime(remainingTime) }}</text>
        <view class="section-tabs">
          <view 
            class="tab-item"
            v-for="(label, section) in { listening: '听力', reading: '阅读', translation: '翻译', writing: '写作' }"
            :key="section"
            :class="{ active: currentSection === section }"
            @tap="switchSection(section)"
          >
            {{ label }}
          </view>
        </view>
      </view>
      
      <!-- 听力部分 -->
      <scroll-view 
        class="section-content" 
        scroll-y 
        v-if="currentSection === 'listening' && examData.listening"
      >
        <view class="listening-section">
          <view 
            class="question-group" 
            v-for="(section, index) in examData.listening.question_content" 
            :key="index"
          >
            <text class="section-title">{{ section.section_name }}</text>
            <text class="section-desc">{{ section.description }}</text>
            
            <view 
              class="question-item" 
              v-for="question in section.questions" 
              :key="question.description1"
            >
              <text class="question-title">{{ question.description1 }}</text>
              <view class="options">
                <view 
                  class="option-item"
                  v-for="(content, key) in question.options.content"
                  :key="key"
                  :class="{ active: userAnswers.listening[question.tips] === key }"
                  @tap="selectAnswer('listening', question.tips, key)"
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
        class="section-content" 
        scroll-y 
        v-if="currentSection === 'reading' && examData.reading"
      >
        <view class="reading-section">
          <view class="passage">
            <text class="passage-title">{{ examData.reading.little_title }}</text>
            <text class="passage-content">{{ examData.reading.passage }}</text>
          </view>
          
          <view class="questions">
            <view 
              class="question-item"
              v-for="question in examData.reading.questions"
              :key="question.question_number"
            >
              <text class="question-title">{{ question.question_number }}. {{ question.question }}</text>
              <view class="options">
                <view 
                  class="option-item"
                  v-for="(content, key) in question.options"
                  :key="key"
                  :class="{ active: userAnswers.reading[question.question_number] === key }"
                  @tap="selectAnswer('reading', question.question_number, key)"
                >
                  <text class="option-key">{{ key }}</text>
                  <text class="option-content">{{ content }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
      
      <!-- 翻译部分 -->
      <scroll-view 
        class="section-content" 
        scroll-y 
        v-if="currentSection === 'translation' && examData.translation"
      >
        <view class="translation-section">
          <text class="section-title">{{ examData.translation.little_title }}</text>
          <view class="original-text">
            <text class="text-label">原文：</text>
            <text class="text-content">{{ examData.translation.original_text }}</text>
          </view>
          
          <view class="translation-area">
            <text class="text-label">译文：</text>
            <textarea
              class="translation-input"
              v-model="userAnswers.translation"
              placeholder="请输入英文翻译..."
              maxlength="-1"
            />
          </view>
        </view>
      </scroll-view>
      
      <!-- 写作部分 -->
      <scroll-view 
        class="section-content" 
        scroll-y 
        v-if="currentSection === 'writing' && examData.writing"
      >
        <view class="writing-section">
          <text class="section-title">{{ examData.writing.little_title }}</text>
          <view class="writing-info">
            <text class="writing-title">{{ examData.writing.title }}</text>
            <text class="word-limit">
              字数要求：{{ examData.writing.word_limit.min }}-{{ examData.writing.word_limit.max }}
            </text>
          </view>
          
          <textarea
            class="writing-input"
            v-model="userAnswers.writing"
            placeholder="请输入作文内容..."
            maxlength="-1"
          />
        </view>
      </scroll-view>
      
      <!-- 底部按钮 -->
      <view class="exam-footer">
        <button 
          class="btn primary" 
          @tap="finishExam"
          :disabled="!userAnswers.writing && currentSection === 'writing'"
        >
          交卷
        </button>
      </view>
    </view>
    
    <!-- 考试结束 -->
    <view class="result-card" v-else>
      <view class="result-title">考试结束</view>
      <view class="result-info">
        <view class="total-score">
          <text class="score-label">总分</text>
          <text class="score-value">{{ scores.total }}</text>
        </view>
        
        <view class="section-scores">
          <view class="score-item">
            <text class="section-name">听力</text>
            <text class="section-score">{{ scores.listening }}</text>
          </view>
          <view class="score-item">
            <text class="section-name">阅读</text>
            <text class="section-score">{{ scores.reading }}</text>
          </view>
          <view class="score-item">
            <text class="section-name">翻译</text>
            <text class="section-score">{{ scores.translation }}</text>
          </view>
          <view class="score-item">
            <text class="section-name">写作</text>
            <text class="section-score">{{ scores.writing }}</text>
          </view>
        </view>
      </view>
      
      <view class="result-actions">
        <button class="btn" @tap="restart">重新开始</button>
        <button class="btn primary" @tap="switchSection('listening')">查看详情</button>
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

.ready-card,
.result-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
}

.category-selector {
  display: flex;
  justify-content: center;
  margin-bottom: 40rpx;
}

.category-item {
  padding: 20rpx 40rpx;
  margin: 0 20rpx;
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
  text-align: center;
  margin-bottom: 40rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
  display: block;
}

.info-item {
  margin-bottom: 20rpx;
}

.label {
  color: #666;
  font-size: 28rpx;
}

.value {
  color: #333;
  font-size: 28rpx;
  font-weight: bold;
}

.section-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 30rpx;
}

.section-item {
  width: 45%;
  background-color: #f8f8f8;
  padding: 20rpx;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
}

.section-name {
  font-size: 28rpx;
  color: #666;
  display: block;
}

.section-score {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
  display: block;
  margin-top: 10rpx;
}

.exam-header {
  background-color: #fff;
  padding: 20rpx;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
}

.timer {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
  display: block;
}

.section-tabs {
  display: flex;
  justify-content: space-around;
  border-bottom: 1px solid #eee;
}

.tab-item {
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #4095E5;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -2rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background-color: #4095E5;
}

.section-content {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 120rpx;
  height: calc(100vh - 300rpx);
}

.listening-section,
.reading-section,
.translation-section,
.writing-section {
  padding-bottom: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
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

.question-title {
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

.option-item.active {
  background-color: #4095E5;
  border-color: #4095E5;
}

.option-item.active text {
  color: #fff;
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

.passage {
  margin-bottom: 40rpx;
}

.passage-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.passage-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
  display: block;
}

.translation-area,
.writing-info {
  margin-bottom: 30rpx;
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
  display: block;
  margin-bottom: 30rpx;
}

.translation-input,
.writing-input {
  width: 100%;
  height: 400rpx;
  background-color: #f8f8f8;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 28rpx;
  line-height: 1.8;
}

.writing-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.word-limit {
  font-size: 24rpx;
  color: #666;
}

.exam-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  padding: 20rpx 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
}

.result-title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 40rpx;
}

.total-score {
  text-align: center;
  margin-bottom: 40rpx;
}

.score-label {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.score-value {
  font-size: 64rpx;
  color: #4095E5;
  font-weight: bold;
}

.section-scores {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.score-item {
  width: 45%;
  text-align: center;
  background-color: #f8f8f8;
  padding: 20rpx;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
}

.result-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 40rpx;
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
</style> 