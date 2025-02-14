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
  { value: 'CET4', label: '四级翻译' },
  { value: 'CET6', label: '六级翻译' }
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
const userAnswer = ref('')

/**
 * @description 用户得分
 */
const userScore = ref(0)

/**
 * @description 是否显示参考答案
 */
const showReference = ref(false)

/**
 * @description 加载题目数据
 */
const loadQuestions = async () => {
  try {
    uni.showLoading({
      title: '加载中...'
    })
    
    const { result } = await uniCloud.callFunction({
      name: 'getTranslationQuestions',
      data: {
        category: currentCategory.value,
        set_number: currentSet.value
      }
    })
    
    if (result.code === 0) {
      questionList.value = result.data.list
      totalSets.value = result.data.total_sets.total
      questionId.value = questionList.value[0]._id
      
      // 重置答案
      userAnswer.value = ''
      showReference.value = false
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
  userAnswer.value = ''
  showReference.value = false
  userScore.value = 0
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
 * @description 检查输入是否为英文
 */
const checkInput = (e) => {
  const text = e.detail.value
  // 检查是否包含非英文字符（允许标点符号和空格）
  if (/[^\x00-\xff\s\p{P}]/u.test(text)) {
    uni.showToast({
      title: '请输入英文',
      icon: 'none'
    })
    // 移除非英文字符
    userAnswer.value = text.replace(/[^\x00-\xff\s\p{P}]/gu, '')
    return
  }
}

/**
 * @description 提交答案
 */
const submitAnswer = async () => {
  if (!userAnswer.value.trim()) {
    uni.showToast({
      title: '请先完成翻译',
      icon: 'none'
    })
    return
  }
  
  try {
    // 模拟评分：在满分基础上随机减去0-20分
    const maxScore = questionList.value[0].score
    userScore.value = Math.round((maxScore - Math.random() * 20) * 10) / 10
    
    // 更新练习记录
    const user_id = uni.getStorageSync('userInfo')._id
    
    await uniCloud.callFunction({
      name: 'saveAndUpdatePracticeRecord',
      data: {
        userId: user_id,
        question_id: questionId.value,
        question_type: 'translation',
        userScore: userScore.value
      }
    })
    
    showReference.value = true
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
        userAnswer.value = ''
        userScore.value = 0
        showReference.value = false
        loadQuestions()
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
    <view class="practice-result" v-if="showReference">
      <text>得分：{{ userScore }}</text>
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

    <!-- 翻译内容区域 -->
    <scroll-view class="translation-content" scroll-y>
      <block v-if="questionList && questionList.length > 0">
        <!-- 原文 -->
        <view class="original-text">
          <text class="section-title">原文：</text>
          <text class="text-content">{{ questionList[0].original_text }}</text>
        </view>

        <!-- 翻译区域 -->
        <view class="translation-area">
          <text class="section-title">译文：</text>
          <textarea
            class="translation-input"
            v-model="userAnswer"
            :disabled="showReference"
            placeholder="请输入英文翻译..."
            @blur="checkInput"
            maxlength="-1" 
          />
        </view>

        <!-- 参考译文 -->
        <view class="reference-answer" v-if="showReference">
          <text class="section-title">参考译文：</text>
          <text class="text-content">{{ questionList[0].reference_translation }}</text>
        </view>
      </block>
      <view v-else class="empty-tip">
        <text>暂无题目数据</text>
      </view>
    </scroll-view>

    <!-- 底部控制栏 -->
    <view class="fixed-bottom">
      <button
        class="submit-btn"
        @tap="submitAnswer"
        :disabled="showReference"
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

.translation-content {
  flex: 1;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 120rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.text-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
  display: block;
}

.original-text {
  margin-bottom: 40rpx;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
}

.translation-area {
  margin-bottom: 40rpx;
}

.translation-input {
  width: 100%;
  height: 300rpx;
  padding: 20rpx;
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 10rpx;
  box-sizing: border-box;
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
  padding: 20rpx 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.submit-btn {
  width: 100%;
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