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
  { value: 'CET4', label: '四级听力' },
  { value: 'CET6', label: '六级听力' }
])

/**
 * @description 当前套题编号
 */
const currentSet = ref(1)

/** 
 * @description 是否已作答所有题目
 */
const hasAnsweredAll = ref(false)

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
 * @description 正确答案
 */
const answers = ref([])

/**
 * @description 音频是否正在播放
 */
const isPlaying = ref(false)

/** 
 * @description 音频对象
 */
const audioContext = ref(null)

/**
 * @description 音频播放状态
 */
const audioPlayed = ref(false)

/**
 * @description 加载题目数据
 */
const loadQuestions = async () => {
  try {
    uni.showLoading({
      title: '加载中...'
    })
    
    const { result } = await uniCloud.callFunction({
      name: 'getListeningQuestions',
      data: {
        category: currentCategory.value,
        set_number: currentSet.value
      }
    })
    
    console.log('题目数据:', result)
    
    if (result.code === 0) {
      console.log('题目数据:', result.data)
      questionList.value = result.data.list
      totalSets.value = result.data.total_sets.total
      answers.value = questionList.value[0].answers
      questionId.value = questionList.value[0]._id
      console.log("questionId.value",questionId.value)
      // 重置答案
      userAnswers.value = {}
      showAnswers.value = false
      hasAnsweredAll.value = false
      
      // 重置音频状态
      if (audioContext.value) {
        audioContext.value.destroy()
        audioContext.value = null
      }
      isPlaying.value = false
      audioPlayed.value = false
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
  answers.value = []
  userAnswers.value = {}
  showAnswers.value = false
  isPlaying.value = false
  audioPlayed.value = false
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
  console.log("answers[questionNumber - 1]?.key",answers.value[questionNumber - 1].key)
  if (showAnswers.value){
    uni.showToast({ 
      title: '答案已提交，请勿重复作答',
      icon: 'none'
    })
    return
  }
  userAnswers.value[`${questionNumber}`] = answer
  console.log("userAnswers.value",userAnswers.value)
  console.log("userAnswers.value.length",Object.keys(userAnswers.value).length)
  console.log("questionList.value[0].answers.length",questionList.value[0].answers.length)
  if (Object.keys(userAnswers.value).length === questionList.value[0].answers.length) {
    hasAnsweredAll.value = true
  } else {
    hasAnsweredAll.value = false
  } 
  console.log("hasAnsweredAll.value",hasAnsweredAll.value)
}

/**
 * @description 播放音频
 */
const playAudio = () => {
  if (!questionList.value.length) return
  
  if (!audioContext.value) {
    audioContext.value = uni.createInnerAudioContext()
    audioContext.value.src = questionList.value[0].audio_file
    
    audioContext.value.onPlay(() => {
      isPlaying.value = true
      audioPlayed.value = true
    })
    
    audioContext.value.onPause(() => {
      isPlaying.value = false
    })
    
    audioContext.value.onEnded(() => {
      isPlaying.value = false
      audioPlayed.value = true
    })
    
    audioContext.value.onError((err) => {
      console.error('音频播放错误:', err)
      isPlaying.value = false
      uni.showToast({
        title: '音频播放失败',
        icon: 'none'
      })
    })
  }
  
  if (isPlaying.value) {
    audioContext.value.pause()
  } else {
    audioContext.value.play()
  }
}

/**
 * @description 重新开始播放
 */
const restartAudio = () => {
  if (!audioContext.value) return
  
  audioContext.value.stop()
  audioContext.value.seek(0)
  setTimeout(() => {
    audioContext.value.play()
  }, 100)
}

/**
 * @description 提交答案
 */
const submitAnswers = async () => {
    console.log(userAnswers.value) 
  if (Object.keys(userAnswers.value).length === 0) {
    uni.showToast({
      title: '请先作答',
      icon: 'none'
    })
    return
  }
  if(showAnswers.value){
    uni.showToast({
      title: '答案已提交，请勿重复作答',
      icon: 'none'
    })
    return
  }
  
  try {
    // 更新练习记录
    Object.entries(userAnswers.value).map(([key, value]) => {
      console.log("answers.value[key - 1].content",answers?.value[key - 1]?.content)
      console.log("key",key)
      console.log("value",value)  
      if (value === answers?.value[key - 1]?.content){
        //如果结果有小数则取一位小数
        userScore.value += Math.round(answers?.value[key - 1]?.score * 10) / 10
        correctCount.value ++
      } 
    })
    userScore.value = Math.round(userScore.value * 10) / 10
    correctRate.value = (Math.round(correctCount.value / Object.keys(userAnswers.value).length * 100) / 100)* 100
    console.log("correctCount",correctCount.value)
    console.log("correctRate.value",correctRate.value) 
    console.log("userScore.value",userScore.value)
    
    console.log("correctCount",correctCount.value)

    const user_id = uni.getStorageSync('userInfo')._id
    
    await uniCloud.callFunction({
      name: 'saveAndUpdatePracticeRecord',
      data: {
        userId: user_id,
        question_id: questionId.value,
        question_type:'listening',
        correctCount: correctCount.value,
        correctRate: correctRate.value,
        userScore: userScore.value,
      }
    })
    console.log("showAnswers.value,到这里了！！111111",showAnswers.value)
    showAnswers.value = true
    console.log("showAnswers.value,到这里了！！",showAnswers.value)
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

/**
 * @description 生命周期钩子
 */
onMounted(() => {
  console.log('onMounted triggered')
  if(!uni.getStorageSync('userInfo')) {
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
  console.log('onShow triggered')
  if(uni.getStorageSync('userInfo')) {
    loadQuestions()
  }
})

onHide(() => {
  console.log('onHide triggered')
  if (audioContext.value) {
    audioContext.value.pause()
    isPlaying.value = false
  }
})

onUnmounted(() => {
  console.log('onUnmounted triggered')
  if (audioContext.value) {
    audioContext.value.destroy()
    isPlaying.value = false
    audioPlayed.value = false
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
    

    <!-- 增加一个显示当前练习结果的组件 -->
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
    
    <!-- 题目内容 -->
    <scroll-view class="question-content" scroll-y>
      <block v-if="questionList && questionList.length > 0">
        <block v-for="(section, sectionIndex) in questionList[0]?.question_content" :key="sectionIndex">
          <!-- Section标题和说明 -->
          <view class="section-header">
            <text class="section-name">{{ section.section_name }}</text>
            <text class="section-desc">{{ section.description }}</text>
          </view>
          
          <!-- 问题列表 -->
          <view class="questions" v-for="(question, questionIndex) in section.questions" :key="questionIndex">
            <text class="question-desc">{{ question.description1 }}</text>
            
            <!-- 选项列表 -->
            <view class="options-list">
              <view 
                class="option-item" 
                v-for="option in question.options" 
                :key="option.tips"
              >
                <text class="option-number">Question {{ option.tips }}</text>
                <view 
                  class="option-choice"
                  v-for="(content, key) in option.content"
                  :key="key"
                  :class="{ 
                    active: userAnswers[`${option.tips}`] === key,
                    correct: showAnswers && answers[option.tips - 1]?.content === key,
                    wrong: showAnswers && userAnswers[`${option.tips}`] === key && answers[option.tips - 1]?.content !== key
                  }"
                  @tap="selectAnswer(option.tips, key)"
                >
                  <text class="option-key">{{ key }}</text>
                  <text class="option-content">{{ content }}</text>
                </view>
              </view>
            </view>
          </view>
        </block>
      </block>
      <view v-else class="empty-tip">
        <text>暂无题目数据</text>
      </view>
    </scroll-view>

    <!-- 固定在底部的控制栏 -->
    <view class="fixed-bottom">
      <view class="audio-controls">
        <button 
          class="control-btn" 
          @tap="playAudio"
          :disabled="!questionList.length"
        >
          {{ isPlaying ? '暂停' : (audioPlayed ? '继续' : '播放') }}
        </button>
        <button 
          class="control-btn" 
          @tap="restartAudio"
          :disabled="!questionList.length || !audioPlayed"
        >
          重新播放
        </button>
        <button 
          class="control-btn" 
          @tap="resetAnswers"
          :disabled="!Object.keys(userAnswers).length"
        >
          重置答案
        </button>
      </view>
      <button 
        class="submit-btn" 
        @tap="submitAnswers"
        :disabled="!hasAnsweredAll || showAnswers"
      >
        提交答案
      </button>
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

.question-content {
  flex: 1;
  height: calc(100vh - 400rpx); /* 减去顶部和底部的高度 */
  margin-bottom: 160rpx; /* 为底部固定栏留出空间 */
}

.section-header {
  margin-bottom: 30rpx;
}

.section-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.section-desc {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
}

.questions {
  margin-bottom: 40rpx;
}

.question-desc {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.options-list {
  margin-bottom: 30rpx;
}

.option-item {
  margin-bottom: 30rpx;
}

.option-number {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  display: block;
  margin-bottom: 10rpx;
}

.option-choice {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border: 1px solid #eee;
  border-radius: 10rpx;
  margin-bottom: 10rpx;
}

.option-choice.active {
  background-color: #4095E5;
  border-color: #4095E5;
}

.option-choice.active text {
  color: #fff;
}

.option-choice.correct {
  background-color: #67c23a;
  border-color: #67c23a;
}

.option-choice.correct text {
  color: #fff;
}

.option-choice.wrong {
  background-color: #f56c6c;
  border-color: #f56c6c;
}

.option-choice.wrong text {
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

.fixed-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 20rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
  z-index: 100;
}

.audio-controls {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20rpx;
}

.control-btn {
  flex: 1;
  margin: 0 10rpx;
  height: 70rpx;
  line-height: 70rpx;
  font-size: 26rpx;
  background-color: #f8f8f8;
  color: #333;
}

.control-btn[disabled] {
  background-color: #f5f5f5;
  color: #999;
}

.submit-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background-color: #4095E5;
  color: #fff;
  font-size: 28rpx;
  border-radius: 40rpx;
}

.submit-btn[disabled] {
  background-color: #ccc;
}

.empty-tip {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 28rpx;
}
.practice-result{
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 30rpx;
  background-color: #fff;
  border-radius: 20rpx;
} 
.practice-result text{
  font-size: 30rpx;
  color: #d65252;
} 
.restart-btn{
  background-color: #4095E5;
  color: #fff;
  width: 160rpx;
  height: 120rpx;
  line-height: 60rpx;
  font-size: 30rpx; 
} 
</style> 