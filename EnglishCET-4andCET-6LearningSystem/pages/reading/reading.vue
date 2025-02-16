<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { onShow, onHide } from '@dcloudio/uni-app'

/**
 * @description 当前选择的类别
 */
const currentCategory = ref('CET4')

/**
 * @description 类别选项
 */
const categoryOptions = ref([
  { value: 'CET4', label: '四级阅读' },
  { value: 'CET6', label: '六级阅读' }
])

/**
 * @description 当前套题编号
 */
const currentSet = ref(1)

/**
 * @description 总套数
 */
const totalSets = ref(0)

/**
 * @description 题目Id
 */
const questionId = ref('')

/**
 * @description 题目列表
 */
const questionList = ref([])

/**
 * @description 用户答案
 */
const userAnswers = ref({})

/**
 * @description 用户得分
 */
const userScore = ref(0)

/**
 * @description 正确率
 */
const correctRate = ref(0)

/**
 * @description 正确题目数量
 */
const correctCount = ref(0)

/**
 * @description 是否显示答案
 */
const showAnswers = ref(false)

/**
 * @description 是否已作答所有题目
 */
const hasAnsweredAll = ref(false)

/**
 * @description 加载题目数据
 */
const loadQuestions = async () => {
  try {
    uni.showLoading({
      title: '加载中...'
    })
    
    const { result } = await uniCloud.callFunction({
      name: 'getReadingQuestions',
      data: {
        category: currentCategory.value,
        set_number: currentSet.value
      }
    })
    console.log("result",result)
    
    if (result.code === 0) {
      questionList.value = result.data.list
      totalSets.value = result.data.total_sets.total
      questionId.value = questionList.value[0]._id
      
      // 重置答案
      userAnswers.value = {}
      showAnswers.value = false
      hasAnsweredAll.value = false
    } else {
      uni.showToast({
        title: result.msg || '加载失败',
        icon: 'none'
      })
    }
  } catch (e) {
    console.error('加载题目失败:', e)
    uni.showToast({
      title: '加载失败',
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
  currentSet.value = 1
  questionChange()
  loadQuestions()
}

/**
 * @description 切换套题
 */
const questionChange = () => {
  userAnswers.value = {}
  showAnswers.value = false
  correctCount.value = 0
  correctRate.value = 0
  userScore.value = 0
  hasAnsweredAll.value = false
}

/**
 * @description 上一套题
 */
const prevSet = () => {
  if (currentSet.value > 1) {
    currentSet.value--
    questionChange()
    loadQuestions()
  }
}

/**
 * @description 下一套题
 */
const nextSet = () => {
  if (currentSet.value < totalSets.value) {
    currentSet.value++
    questionChange()
    loadQuestions()
  }
}

/**
 * @description 选择答案
 */
const selectAnswer = (questionNumber, answer) => {
  if (showAnswers.value) {
    uni.showToast({
      title: '答案已提交，请勿重复作答',
      icon: 'none'
    })
    return
  }
  userAnswers.value[`${questionNumber}`] = answer
  
  // 检查是否所有题目都已作答
  if (Object.keys(userAnswers.value).length === questionList.value[0].questions.length) {
    hasAnsweredAll.value = true
  } else {
    hasAnsweredAll.value = false
  }
}

/**
 * @description 提交答案
 */
const submitAnswers = async () => {
  if (Object.keys(userAnswers.value).length === 0) {
    uni.showToast({
      title: '请先作答',
      icon: 'none'
    })
    return
  }
  
  if (showAnswers.value) {
    uni.showToast({
      title: '答案已提交，请勿重复作答',
      icon: 'none'
    })
    return
  }
  
  try {
    // 计算得分和正确率
    questionList.value[0].answers.forEach((answer, index) => {
      if (userAnswers.value[`${index + 1}`] === answer.content) {
        userScore.value += answer.score
        correctCount.value++
      }
    })
    
    correctRate.value = Math.round((correctCount.value / questionList.value[0].questions.length) * 100)
    
    // 更新练习记录
    const user_id = uni.getStorageSync('userInfo')._id
    console.log("user_id",user_id)  
    console.log("questionId.value",questionId.value)  
    console.log("correctCount.value",correctCount.value)  
    console.log("correctRate.value",correctRate.value)  
    console.log("userScore.value",userScore.value)    
    
    await uniCloud.callFunction({
      name: 'saveAndUpdatePracticeRecord',
      data: {
        userId: user_id,
        question_id: questionId.value,
        practice_type: 'reading',
        correctCount: correctCount.value,
        correctRate: correctRate.value,
        userScore: userScore.value
      }
    })
    
    showAnswers.value = true
  } catch (e) {
    console.error(e)
    uni.showToast({
      title: '提交失败',
      icon: 'none'
    })
  }
}

/**
 * @description 重新开始练习
 */
const restartPractice = () => {
  uni.showModal({
    title: '提示',
    content: '确定要重新开始练习吗？',
    success: (res) => {
      if (res.confirm) {
        userAnswers.value = {}
        correctCount.value = 0
        correctRate.value = 0
        userScore.value = 0
        showAnswers.value = false
        hasAnsweredAll.value = false
        loadQuestions()
      }
    }
  })
}

/**
 * @description 重置答案
 */
const resetAnswers = () => {
  uni.showModal({
    title: '提示',
    content: '确定要重置所有答案吗？',
    success: (res) => {
      if (res.confirm) {
        userAnswers.value = {}
        showAnswers.value = false
        hasAnsweredAll.value = false
      }
    }
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
    loadQuestions()
  }
})

onShow(() => {
  if (uni.getStorageSync('userInfo')) {
    loadQuestions()
  }
})
</script>

<template>
  <view class="container">
    <!-- 顶部类别选择 -->
    <view class="category-selector">
      <view
        class="category-item"
        v-for="item in categoryOptions"
        :key="item.value"
        :class="{ active: currentCategory === item.value }"
        @tap="handleCategoryChange(item.value)"
      >
        {{ item.label }}
      </view>
    </view>

    <!-- 显示练习结果 -->
    <view class="practice-result" v-if="showAnswers">
      <text>正确率：{{ correctRate }}%</text>
      <text>得分：{{ userScore }}</text>
      <text>正确题目数量：{{ correctCount }}</text>
      <button class="restart-btn" @tap="restartPractice">重新开始练习</button>
    </view>

    <!-- 套题导航 -->
    <view class="set-navigation">
      <text class="set-info">第 {{ currentSet }} 套 / 共 {{ totalSets }} 套</text>
      <view class="set-actions">
        <button class="nav-btn" @tap="prevSet" :disabled="currentSet <= 1">上一套</button>
        <button class="nav-btn" @tap="nextSet" :disabled="currentSet >= totalSets">下一套</button>
      </view>
    </view>

    <!-- 阅读文章和题目内容 -->
    <scroll-view class="question-content" scroll-y>
      <block v-if="questionList && questionList.length > 0">
        <!-- 阅读文章 -->
        <view class="passage-content">
          <text class="passage-text">{{ questionList[0].passage }}</text>
        </view>

        <!-- 问题列表 -->
        <view class="questions">
          <view 
            class="question-item" 
            v-for="(question, index) in questionList[0].questions" 
            :key="index"
          >
            <text class="question-number">Question {{ index + 1 }}</text>
            <text class="question-text">{{ question.question }}</text>
            
            <!-- 选项列表 -->
            <view class="options-list">
              <view
                class="option-item"
                v-for="(content, key) in question.options"
                :key="key"
                :class="{
                  active: userAnswers[`${index + 1}`] === key,
                  correct: showAnswers && questionList[0].answers[index].content === key,
                  wrong: showAnswers && userAnswers[`${index + 1}`] === key && questionList[0].answers[index].content !== key
                }"
                @tap="selectAnswer(index + 1, key)"
              >
                <text class="option-key">{{ key }}</text>
                <text class="option-content">{{ content }}</text>
              </view>
            </view>
          </view>
        </view>
      </block>
      <view v-else class="empty-tip">
        <text>暂无题目数据</text>
      </view>
    </scroll-view>

    <!-- 底部控制栏 -->
    <view class="fixed-bottom">
      <view class="control-actions">
        <button
          class="control-btn"
          @tap="resetAnswers"
          :disabled="!Object.keys(userAnswers).length"
        >
          重置答案
        </button>
        <button
          class="submit-btn"
          @tap="submitAnswers"
          :disabled="!hasAnsweredAll || showAnswers"
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

.category-selector {
  display: flex;
  justify-content: space-between;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
}

.category-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666;
  border-radius: 10rpx;
  margin: 0 10rpx;
}

.category-item.active {
  background-color: #4095E5;
  color: #fff;
}

.practice-result {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.practice-result text {
  font-size: 28rpx;
  color: #333;
}

.restart-btn {
  margin-top: 20rpx;
  background-color: #4095E5;
  color: #fff;
}

.set-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
}

.set-info {
  font-size: 28rpx;
  color: #333;
}

.set-actions {
  display: flex;
  gap: 20rpx;
}

.nav-btn {
  font-size: 24rpx;
  padding: 10rpx 30rpx;
}

.question-content {
  flex: 1;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 160rpx;
}

.passage-content {
  margin-bottom: 40rpx;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
}

.passage-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
  white-space: pre-wrap;
}

.questions {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

.question-item {
  border-bottom: 1px solid #eee;
  padding-bottom: 30rpx;
}

.question-number {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.question-text {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
  line-height: 1.6;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border: 1px solid #eee;
  border-radius: 10rpx;
  transition: all 0.3s;
}

.option-item.active {
  background-color: #4095E5;
  border-color: #4095E5;
  color: #fff;
}

.option-item.correct {
  background-color: #52c41a;
  border-color: #52c41a;
  color: #fff;
}

.option-item.wrong {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
  color: #fff;
}

.option-key {
  font-size: 28rpx;
  font-weight: bold;
  margin-right: 20rpx;
}

.option-content {
  font-size: 28rpx;
  flex: 1;
}

.fixed-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 20rpx 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.control-actions {
  display: flex;
  gap: 20rpx;
}

.control-btn {
  flex: 1;
  font-size: 28rpx;
  background-color: #f5f5f5;
  color: #666;
}

.submit-btn {
  flex: 2;
  font-size: 28rpx;
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