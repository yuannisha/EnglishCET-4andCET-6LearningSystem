<script setup>
import { ref, onMounted ,onUnmounted } from 'vue'

/**
 * @description 考试时间（分钟）
 */
const EXAM_TIME = 45  // 真题练习时间更长

/**
 * @description 考试状态
 */
const examStatus = ref('ready') // ready-准备开始, ongoing-考试中, finished-已结束

/**
 * @description 剩余时间（秒）
 */
const remainingTime = ref(EXAM_TIME * 60)

/**
 * @description 题目列表
 */
const questionList = ref([])

/**
 * @description 当前题目索引
 */
const currentIndex = ref(0)

/**
 * @description 用户答案
 */
const userAnswers = ref([])

/**
 * @description 计时器
 */
let timer = null

/**
 * @description 分数
 */
const score = ref(0)

/**
 * @description 答对率
 */
const correctRate = ref(0)

/**
 * @description 答对题数
 */
const correctCount = ref(0)

/**
 * @description 是否显示解析
 */
const showAnalysis = ref(false)

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
 * @description 年份列表
 */
const yearList = ref([])

/**
 * @description 当前选择的年份
 */
const currentYear = ref('')

/**
 * @description 当前选择的月份
 */
const currentMonth = ref('')

/**
 * @description 月份列表
 */
const monthList = ref([])

/**
 * @description 当前题目类型
 */
const currentType = ref('listening')

/**
 * @description 题目类型选项
 */
const typeOptions = ref([
  { value: 'listening', label: '听力' },
  { value: 'reading', label: '阅读' },
  { value: 'translation', label: '翻译' },
  { value: 'writing', label: '写作' }
])

/**
 * @description 试卷数据
 */
const paperData = ref(null)

/**
 * @description 音频播放器
 */
const audioContext = ref(null)
const isPlaying = ref(false)

/**
 * @description 加载题目
 */
const loadQuestions = async () => {
  try {
    uni.showLoading({
      title: '加载中...'
    })
    //重置所有变量
    userAnswers.value = []
    correctCount.value = 0
    correctRate.value = 0
    score.value = 0
    showAnalysis.value = false
    currentIndex.value = 0
    remainingTime.value = EXAM_TIME * 60
    isPlaying.value = false
    //重置音频播放器
    if (audioContext.value) { 
      audioContext.value.pause()
      audioContext.value.destroy()
      audioContext.value = null
    }
    
    
    const { result } = await uniCloud.callFunction({
      name: 'getRealExamQuestions',
      data: {
        category: currentCategory.value,
        type: currentType.value,
        year: currentYear.value,
        month: currentMonth.value
      }
    })
    
    if (result.code === 0) {
      questionList.value = result.data.list
      initAnswers()
      showAnalysis.value = false
      score.value = 0
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
 * @description 初始化答案
 */
const initAnswers = () => {
  console.log("questionList",questionList.value)
  if (currentType.value === 'listening' || currentType.value === 'reading') {
    userAnswers.value = new Array(questionList.value[0].answers.length).fill('')
  } else {
    userAnswers.value = ''
  }
  console.log("userAnswers",userAnswers.value)
}

/**
 * @description 开始考试
 */
const startExam = () => {
  examStatus.value = 'ongoing'
  startTimer()
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
  clearInterval(timer)
  examStatus.value = 'finished'
  showAnalysis.value = true
  
  try {
    uni.showLoading({
      title: '正在提交...'
    })
    
    const { result } = await uniCloud.callFunction({
      name: 'savePracticeRecord',
      data: {
        practice_type: 'real',
        answers: userAnswers.value.map((answer, index) => ({
          questionId: questionList.value[index]._id,
          answer,
          isCorrect: answer === questionList.value[index].answer
        })),
        duration: EXAM_TIME * 60 - remainingTime.value
      }
    })
    
    if (result.code === 0) {
      score.value = result.data.score
    } else {
      uni.showToast({
        title: result.msg || '提交失败',
        icon: 'none'
      })
    }
  } catch (e) {
    console.error('保存练习记录失败', e)
    uni.showToast({
      title: '提交失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

/**
 * @description 选择答案
 */
const selectAnswer = (index, answer) => {
  userAnswers.value[index] = answer
}

/**
 * @description 下一题
 */
const nextQuestion = () => {
  if (currentIndex.value < questionList.value.length - 1) {
    currentIndex.value++
  }
}

/**
 * @description 上一题
 */
const prevQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

/**
 * @description 格式化时间
 */
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * @description 加载年份列表
 */
const loadYearList = async () => {
  try {
    const { result } = await uniCloud.callFunction({
      name: 'getRealExamQuestions',
      data: {
        category: currentCategory.value,
        type: currentType.value
      }
    })
    
    if (result.code === 0) {
      yearList.value = result.data.years
      if (yearList.value.length > 0) {
        currentYear.value = yearList.value[0]
        loadMonthList()
      }
    }
  } catch (e) {
    console.error(e)
    uni.showToast({
      title: '加载年份失败',
      icon: 'none'
    })
  }
}

/**
 * @description 加载月份列表
 */
const loadMonthList = async () => {
  try {
    const { result } = await uniCloud.callFunction({
      name: 'getRealExamQuestions',
      data: {
        category: currentCategory.value,
        type: currentType.value,
        year: currentYear.value
      }
    })
    
    if (result.code === 0) {
      monthList.value = result.data.months
      if (monthList.value.length > 0) {
        currentMonth.value = monthList.value[0]
        loadQuestions()
      }
    }
  } catch (e) {
    console.error(e)
    uni.showToast({
      title: '加载月份失败',
      icon: 'none'
    })
  }
}

/**
 * @description 切换类别
 */
const handleCategoryChange = (category) => {
  currentCategory.value = category
  currentYear.value = ''
  currentMonth.value = ''
  paperData.value = null
  loadYearList()
}

/**
 * @description 切换年份
 */
const handleYearChange = (year) => {
  currentYear.value = year
  loadMonthList()
}

/**
 * @description 切换月份
 */
const handleMonthChange = (month) => {
  currentMonth.value = month
  loadQuestions()
}

/**
 * @description 切换题目类型
 */
const handleTypeChange = (type) => {
  currentType.value = type
  loadYearList()
}

/**
 * @description 播放音频
 */
const playAudio = () => {
  if (!questionList.value[0]?.audio_file) return
  
  if (!audioContext.value) {
  
  audioContext.value = uni.createInnerAudioContext()
  audioContext.value.src = questionList.value[0].audio_file
  
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
    
    audioContext.value.pause()
    isPlaying.value = false 
    console.log("暂停音频")
  } else {
    
    audioContext.value.play()
    isPlaying.value = true
    console.log("播放音频")
  }
}

/**
 * @description 检查英文输入
 */
const checkEnglishInput = (e) => {
  const text = e.detail.value
  if (/[^\x00-\xff\s\p{P}]/u.test(text)) {
    uni.showToast({
      title: '请输入英文',
      icon: 'none'
    })
    userAnswers.value = text.replace(/[^\x00-\xff\s\p{P}]/gu, '')
  }
}

/**
 * @description 提交答案
 */
const submitAnswer = async () => {
  if (currentType.value === 'listening' || currentType.value === 'reading') {
    if (userAnswers.value.includes('')) {
      uni.showToast({
        title: '请完成所有题目',
        icon: 'none'
      })
      return
    }
  } else if (!userAnswers.value.trim()) {
    uni.showToast({
      title: '请输入答案',
      icon: 'none'
    })
    return
  }
  
  try {
    uni.showLoading({
      title: '提交中...'
    })
    console.log("userAnswers",userAnswers.value)
    let practiceType = ''
      if(currentType.value === 'listening'){
        practiceType = 'real_listening'
      }else if(currentType.value === 'reading'){
        practiceType = 'real_reading'
      }else if(currentType.value === 'translation'){
        practiceType = 'real_translation'
      }else if(currentType.value === 'writing'){
        practiceType = 'real_writing'
      }
    // 计算得分
    if (currentType.value === 'listening' || currentType.value === 'reading') {
      correctCount.value = questionList.value[0].answers.reduce((total, answer, index) => {
        console.log("userAnswers.value[index]",userAnswers.value[index])
        console.log("answer.content",answer.content)
        return total + (userAnswers.value[index] === answer.content ? 1 : 0)
      }, 0)
      correctRate.value = Math.round((correctCount.value / questionList.value[0].answers.length) * 100)
      score.value = Math.round(questionList.value[0].answers.reduce((total, answer, index) => {
        return total + (userAnswers.value[index] === answer.content ? answer.score : 0)
      }, 0) * 10) / 10
      // 保存练习记录
      await uniCloud.callFunction({
            name: 'saveAndUpdatePracticeRecord',
            data: {
              userId: uni.getStorageSync('userInfo')._id,
              question_id: questionList.value[0]._id,
              practice_type: practiceType,
              year: currentYear.value,
              month: currentMonth.value,
              userScore: score.value,
              correctCount: correctCount.value,
              correctRate: correctRate.value
      }
    })

    } else {
      // 翻译和写作使用模拟评分
      score.value = Math.round((questionList.value[0].score - Math.random() * 20) * 10) / 10
      // 保存练习记录
    await uniCloud.callFunction({
      name: 'saveAndUpdatePracticeRecord',
      data: {
        userId: uni.getStorageSync('userInfo')._id,
        question_id: questionList.value[0]._id,
        practice_type: practiceType,
        year: currentYear.value,
        month: currentMonth.value,
        userScore: score.value
      }
    })
    }
    
    
    
    showAnalysis.value = true
  } catch (e) {
    console.error(e)
    uni.showToast({
      title: '提交失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

/**
 * @description 重新练习
 */
const restartPractice = () => {
  initAnswers()
  showAnalysis.value = false
  score.value = 0
  if (currentType.value === 'listening') {
    playAudio()
  }
}

onUnmounted(() => {
  if (audioContext.value) {
    audioContext.value.pause()
    isPlaying.value = false
    console.log("卸载音频")
    audioContext.value.destroy()
  }
})  

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
    loadYearList()
  }
})
</script>

<template>
  <view class="container">
    <!-- 顶部选择区域 -->
    <view class="selector-area">
      <view class="selector-row">
        <view class="selector-item">
          <text class="label">考试类型</text>
          <view class="options-list">
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
      
      <view class="selector-row">
        <view class="selector-item">
          <text class="label">题目类型</text>
          <view class="options-list">
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
      
      <view class="selector-row">
        <view class="selector-item">
          <text class="label">年份</text>
          <view class="options-list">
            <view
              class="option"
              v-for="year in yearList"
              :key="year"
              :class="{ active: currentYear === year }"
              @tap="handleYearChange(year)"
            >
              {{ year }}
            </view>
          </view>
        </view>
      </view>
      
      <view class="selector-row">
        <view class="selector-item">
          <text class="label">月份</text>
          <view class="options-list">
            <view
              class="option"
              v-for="month in monthList"
              :key="month"
              :class="{ active: currentMonth === month }"
              @tap="handleMonthChange(month)"
            >
              {{ month }}月
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 题目内容区域 -->
    <scroll-view class="question-content" scroll-y>
      <block v-if="questionList.length > 0">
        <!-- 听力部分 -->
        <template v-if="currentType === 'listening'">
          <view class="audio-player" @tap="playAudio">
            <text class="iconfont">{{ isPlaying ? '暂停' : '播放' }}</text>
          </view>
          
          <view
            class="question-section"
            v-for="(section, sectionIndex) in questionList[0].question_content"
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
                  :class="{ active: userAnswers[option.tips -1] === key }"
                  @tap="selectAnswer(option.tips -1, key)"
                >
                  <text class="option-key">{{ key }}</text>
                  <text class="option-content">{{ content }}</text>
                </view>
              </view>
              </view>
            </view>
          </view>
        </template>
        
        <!-- 阅读部分 -->
        <template v-if="currentType === 'reading'">
          <view class="reading-passage">
            <text class="passage-title">{{ questionList[0].little_title }}</text>
            <text class="passage-content">{{ questionList[0].passage }}</text>
          </view>
          
          <view
            class="question-item"
            v-for="(question, index) in questionList[0].questions"
            :key="index"
          >
          <text class="question-number">Question {{ question.question_number }}</text>
            <text class="question-text">{{ question.question }}</text>
            <view class="options">
              <view
                class="option-choice"
                v-for="(content, key) in question.options"
                :key="key"
                :class="{ active: userAnswers[index] === key }"
                @tap="selectAnswer(index, key)"
              >
                <text class="option-key">{{ key }}</text>
                <text class="option-content">{{ content }}</text>
              </view>
            </view>
          </view>
        </template>
        
        <!-- 翻译部分 -->
        <template v-if="currentType === 'translation'">
          <view class="translation-content">
            <text class="section-title">{{ questionList[0].little_title }}</text>
            <view class="original-text">
              <text class="text-label">原文：</text>
              <text class="text-content">{{ questionList[0].original_text }}</text>
            </view>
            
            <view class="translation-area">
              <text class="text-label">译文：</text>
              <textarea
                class="translation-input"
                v-model="userAnswers"
                :disabled="showAnalysis"
                placeholder="请输入英文翻译..."
                @blur="checkEnglishInput"
                maxlength="-1"
              />
            </view>
            
            <view class="reference-answer" v-if="showAnalysis">
              <text class="text-label">参考译文：</text>
              <text class="text-content">{{ questionList[0].reference_translation }}</text>
            </view>
          </view>
        </template>
        
        <!-- 写作部分 -->
        <template v-if="currentType === 'writing'">
          <view class="writing-content">
            <text class="section-title">{{ questionList[0].little_title }}</text>
            <text class="writing-title">{{ questionList[0].title }}</text>
            
            <view class="word-limit">
              字数要求：{{ questionList[0].word_limit.min }}-{{ questionList[0].word_limit.max }}词
            </view>
            
            <textarea
              class="writing-input"
              v-model="userAnswers"
              :disabled="showAnalysis"
              placeholder="请用英文写作..."
              @blur="checkEnglishInput"
              maxlength="-1"
            />
            
            <view class="reference-answer" v-if="showAnalysis">
              <text class="text-label">参考范文：</text>
              <text class="text-content">{{ questionList[0].reference_answer }}</text>
            </view>
          </view>
        </template>
      </block>
      <view v-else class="empty-tip">
        <text>暂无题目数据</text>
      </view>
    </scroll-view>
    
    <!-- 底部控制栏 -->
    <view class="fixed-bottom">
      <view class="score-info" v-if="showAnalysis">
        <text>得分：{{ score }}</text>
      </view>
      <view class="button-group">
        <button
          class="control-btn"
          v-if="showAnalysis"
          @tap="restartPractice"
        >
          重新练习
        </button>
        <button
          class="control-btn primary"
          v-else
          @tap="submitAnswer"
        >
          提交答案
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
  display: flex;
  flex-direction: column;
}

.selector-area {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
}

.selector-row {
  margin-bottom: 20rpx;
}

.selector-row:last-child {
  margin-bottom: 0;
}

.selector-item {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
}
.options-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.options {
  padding-left: 20rpx;
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

.question-content {
  flex: 1;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 120rpx;
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

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  display: block;
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

.reference-answer {
  margin-top: 40rpx;
  padding-top: 40rpx;
  border-top: 1px solid #eee;
}

.fixed-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 20rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.score-info {
  text-align: center;
  margin-bottom: 20rpx;
  font-size: 32rpx;
  color: #4095E5;
}

.button-group {
  display: flex;
  gap: 20rpx;
}

.control-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 28rpx;
  border-radius: 40rpx;
  margin: 0;
}

.control-btn.primary {
  background-color: #4095E5;
  color: #fff;
}

.empty-tip {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style> 