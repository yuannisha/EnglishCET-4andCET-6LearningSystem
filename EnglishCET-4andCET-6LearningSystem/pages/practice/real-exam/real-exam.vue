<script setup>
import { ref, onMounted } from 'vue'

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
  { value: 'CET4', label: '四级真题' },
  { value: 'CET6', label: '六级真题' }
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
 * @description 试卷数据
 */
const paperData = ref(null)

/**
 * @description 加载题目
 */
const loadQuestions = async () => {
  try {
    uni.showLoading({
      title: '加载中...'
    })
    
    const { result } = await uniCloud.callFunction({
      name: 'getExamQuestions',
      data: {
        type: 'real',
        count: 20  // 真题练习题目数量较少
      }
    })
    
    if (result.code === 0) {
      questionList.value = result.data
      userAnswers.value = new Array(questionList.value.length).fill('')
    } else {
      uni.showToast({
        title: result.msg || '加载题目失败',
        icon: 'none'
      })
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
const selectAnswer = (answer) => {
  userAnswers.value[currentIndex.value] = answer
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
    uni.showLoading({
      title: '加载中...'
    })
    
    const { result } = await uniCloud.callFunction({
      name: 'getRealExamYears',
      data: {
        category: currentCategory.value
      }
    })
    
    if (result.code === 0) {
      yearList.value = result.data
      if (yearList.value.length > 0) {
        currentYear.value = yearList.value[0].year
        currentMonth.value = yearList.value[0].months[0]
      }
    } else {
      throw new Error('加载年份列表失败')
    }
  } catch (e) {
    console.error(e)
    uni.showToast({
      title: '加载年份列表失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

/**
 * @description 加载试卷
 */
const loadPaper = async () => {
  if (!currentYear.value || !currentMonth.value) return
  
  try {
    uni.showLoading({
      title: '加载中...'
    })
    
    const { result } = await uniCloud.callFunction({
      name: 'getRealExamPaper',
      data: {
        category: currentCategory.value,
        year: currentYear.value,
        month: currentMonth.value
      }
    })
    
    if (result.code === 0) {
      paperData.value = result.data
    } else {
      throw new Error('加载试卷失败')
    }
  } catch (e) {
    console.error(e)
    uni.showToast({
      title: '加载试卷失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

/**
 * @description 开始练习
 */
const startPractice = () => {
  uni.navigateTo({
    url: `/pages/practice/mock-exam/mock-exam?category=${currentCategory.value}&year=${currentYear.value}&month=${currentMonth.value}&type=real`
  })
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
  currentMonth.value = yearList.value.find(item => item.year === year).months[0]
  loadPaper()
}

/**
 * @description 切换月份
 */
const handleMonthChange = (month) => {
  currentMonth.value = month
  loadPaper()
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
    loadYearList()
  }
})
</script>

<template>
  <view class="container">
    <!-- 准备开始 -->
    <view class="ready-card" v-if="examStatus === 'ready'">
      <view class="ready-title">真题练习</view>
      <view class="ready-info">
        <text>练习时长：{{ EXAM_TIME }}分钟</text>
        <text>题目数量：{{ questionList.length }}题</text>
      </view>
      <button class="btn primary" @tap="startExam">开始练习</button>
    </view>
    
    <!-- 练习中 -->
    <view class="exam-content" v-else-if="examStatus === 'ongoing'">
      <!-- 顶部进度 -->
      <view class="exam-header">
        <text class="progress">{{ currentIndex + 1 }}/{{ questionList.length }}</text>
        <text class="timer">{{ formatTime(remainingTime) }}</text>
      </view>
      
      <!-- 题目内容 -->
      <view class="question-card" v-if="questionList[currentIndex]">
        <view class="question-title">{{ questionList[currentIndex].title }}</view>
        <view class="options">
          <view 
            class="option-item"
            v-for="option in questionList[currentIndex].options"
            :key="option.key"
            :class="{ active: userAnswers[currentIndex] === option.key }"
            @tap="selectAnswer(option.key)"
          >
            <text class="option-key">{{ option.key }}</text>
            <text class="option-content">{{ option.content }}</text>
          </view>
        </view>
      </view>
      
      <!-- 底部按钮 -->
      <view class="exam-footer">
        <button class="btn" @tap="prevQuestion">上一题</button>
        <button class="btn" @tap="nextQuestion">下一题</button>
        <button class="btn primary" @tap="finishExam">完成练习</button>
      </view>
    </view>
    
    <!-- 练习结束 -->
    <view class="result-card" v-else>
      <view class="result-title">练习结束</view>
      <view class="result-info">
        <text>用时：{{ EXAM_TIME * 60 - remainingTime }}秒</text>
        <text>得分：{{ score }}</text>
      </view>
      
      <!-- 题目解析 -->
      <view class="analysis-section" v-if="showAnalysis">
        <view class="analysis-title">题目解析</view>
        <view class="question-list">
          <view 
            class="question-item"
            v-for="(question, index) in questionList"
            :key="index"
          >
            <view class="question-header">
              <text class="question-number">第{{ index + 1 }}题</text>
              <text :class="['answer-status', userAnswers[index] === question.answer ? 'correct' : 'wrong']">
                {{ userAnswers[index] === question.answer ? '正确' : '错误' }}
              </text>
            </view>
            <view class="question-content">{{ question.title }}</view>
            <view class="correct-answer">正确答案：{{ question.answer }}</view>
            <view class="analysis-content">{{ question.analysis }}</view>
          </view>
        </view>
      </view>
      
      <button class="btn primary" @tap="navigateToPage('/pages/practice/practice')">返回</button>
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
  text-align: center;
}

.ready-title,
.result-title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
}

.ready-info,
.result-info {
  margin-bottom: 40rpx;
}

.ready-info text,
.result-info text {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.exam-header {
  display: flex;
  justify-content: space-between;
  padding: 20rpx;
  background-color: #fff;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
}

.progress,
.timer {
  font-size: 28rpx;
  color: #666;
}

.question-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.question-title {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 30rpx;
}

.options {
  margin-bottom: 20rpx;
}

.option-item {
  display: flex;
  align-items: center;
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
}

.exam-footer {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
}

.exam-footer .btn {
  width: 30%;
}

/* 解析部分样式 */
.analysis-section {
  margin-top: 40rpx;
  text-align: left;
}

.analysis-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.question-list {
  margin-bottom: 40rpx;
}

.question-item {
  background-color: #f8f8f8;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.question-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.question-number {
  font-size: 28rpx;
  color: #666;
}

.answer-status {
  font-size: 28rpx;
}

.answer-status.correct {
  color: #4caf50;
}

.answer-status.wrong {
  color: #f44336;
}

.question-content {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
}

.correct-answer {
  font-size: 28rpx;
  color: #4caf50;
  margin-bottom: 10rpx;
}

.analysis-content {
  font-size: 28rpx;
  color: #666;
  background-color: #fff;
  padding: 10rpx;
  border-radius: 6rpx;
}
</style> 