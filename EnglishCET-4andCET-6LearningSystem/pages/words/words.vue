<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'

/**
 * @description 单词列表数据
 */
const wordList = ref([])

/**
 * @description 当前学习的单词索引
 */
const currentIndex = ref(0)

/**
 * @description 音频是否正在播放
 */
const audioIsPlaying = ref(false) 

/**
 * @description 当前选择的类别
 */
const currentCategory = ref('CET4')

/**
 * @description 类别选项
 */
const categoryOptions = ref([
  { value: 'CET4', label: '四级词汇' },
  { value: 'CET6', label: '六级词汇' }
])

/**
 * @description 是否显示单词释义
 */
const showMeaning = ref(false)

/**
 * @description 单词学习状态
 */
const wordStatus = ref('new')

/**
 * @description 学习进度统计
 */
const progressStats = ref({
  total: 0,
  learned: 0,
  learning: 0,
  new: 0
})

/**
 * @description 加载单词数据
 */
const loadWordList = async () => {
  try {
    uni.showLoading({
      title: '加载中...'
    })
    
    const { result } = await uniCloud.callFunction({
      name: 'getWordList',
      data: {
        category: currentCategory.value,
        page: 1,
        pageSize: 50
      }
    })
    
    if (result.code === 0) {
      wordList.value = result.data.list
      currentIndex.value = 0
      showMeaning.value = false
      
      // 加载单词学习状态
      await loadWordProgress()
    } else {
      uni.showToast({
        title: result.msg || '加载单词失败',
        icon: 'none'
      })
    }
  } catch (e) {
    console.error(e)
    uni.showToast({
      title: '加载单词失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

/**
 * @description 加载单词学习进度
 */
const loadWordProgress = async () => {
  try {
    const { result } = await uniCloud.callFunction({
      name: 'getWordProgress',
      data: {
        user_id: uni.getStorageSync('userInfo')._id,
        word_ids: wordList.value.map(word => word._id)
      }
    })
    
    if (result.code === 0) {
      // 更新单词状态
      wordList.value = wordList.value.map(word => {
        const progress = result.data.find(p => p.word_id === word._id)
        return {
          ...word,
          status: progress ? progress.status : 'new',
          review_times: progress ? progress.review_times : 0
        }
      })
      
      // 更新当前单词状态
      updateCurrentWordStatus()
      
      // 更新统计数据
      progressStats.value = {
        total: wordList.value.length,
        learned: wordList.value.filter(w => w.status === 'learned').length,
        learning: wordList.value.filter(w => w.status === 'learning').length,
        new: wordList.value.filter(w => w.status === 'new').length
      }
    }
  } catch (e) {
    console.error('加载单词进度失败', e)
  }
}

/**
 * @description 更新当前单词状态
 */
const updateCurrentWordStatus = () => {
  if (wordList.value[currentIndex.value]) {
    wordStatus.value = wordList.value[currentIndex.value].status
  }
}

/**
 * @description 切换类别
 */
const handleCategoryChange = (value) => {
  currentCategory.value = value
  loadWordList()
}

/**
 * @description 朗读单词
 */
const playAudio = () => {
  if(audioIsPlaying.value) return
  
  const audio = uni.createInnerAudioContext()
  audio.autoplay = true
  audio.src = 'https://dict.youdao.com/dictvoice?type=1&audio=' + wordList.value[currentIndex.value].word
  
  audio.play()
  audioIsPlaying.value = true
  
  audio.onEnded(() => {
    audioIsPlaying.value = false
  })
  
  audio.onError(() => {
    audioIsPlaying.value = false
    uni.showToast({
      title: '播放失败',
      icon: 'none'
    })
  })
}

/**
 * @description 切换到下一个单词
 */
const nextWord = async () => {
  if (currentIndex.value < wordList.value.length - 1) {
    // 更新当前单词状态，如果当前单词状态为new，则更新为learning
    if (wordList.value[currentIndex.value].status === 'new') {
      await updateWordProgress('learning')
    }
    
    currentIndex.value++
    showMeaning.value = false
    updateCurrentWordStatus()
  } else {
    uni.showToast({
      title: '已经是最后一个单词了',
      icon: 'none'
    })
  }
}

/**
 * @description 切换到上一个单词
 */
const prevWord = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    showMeaning.value = false
    updateCurrentWordStatus()
  } else {
    uni.showToast({
      title: '已经是第一个单词了',
      icon: 'none'
    })
  }
}

/**
 * @description 切换显示/隐藏释义
 */
const toggleMeaning = () => {
  showMeaning.value = !showMeaning.value
}

/**
 * @description 标记单词状态
 */
const markWordStatus = async (status) => {
  await updateWordProgress(status)
  uni.showToast({
    title: status === 'learned' ? '已掌握' : '继续学习',
    icon: 'success'
  })
}

const updateUserLevel = async (userId,totalLearned,level) => {
  const {result} = await uniCloud.callFunction({
    name: 'updateUserInfo',
    data: {
      userId: userId,
      totalLearned: totalLearned,
      level: level
    }
  })

  if(result.code === 0){
            uni.showModal({
              title: `恭喜你已经掌握了${totalLearned}个单词,你的等级已经提升为${level}！`,
              icon: 'success',
              duration: 4000
      })
  }
}
/**
 * @description 更新单词学习进度
 */
const updateWordProgress = async (status) => {
  try {
    const currentWord = wordList.value[currentIndex.value]
    const {result} = await uniCloud.callFunction({
      name: 'updateWordProgress',
      data: {
        user_id: uni.getStorageSync('userInfo')._id,
        word_id: currentWord._id,
        status: status
      }
    })
    console.log("result",result)
    console.log("status",status)
    console.log("result.totalLearned.total",result.totalLearned.total)
    
    if(result.code === 0 && status === 'learned' && result.totalLearned.total > 0){
      uni.setStorageSync('userInfo',{
        ...uni.getStorageSync('userInfo'),
        points: result.totalLearned.total
      })
      console.log("uni.getStorageSync('userInfo')",uni.getStorageSync('userInfo'))
      if(uni.getStorageSync('userInfo').points > 2 && uni.getStorageSync('userInfo').points <= 4){
        if(uni.getStorageSync('userInfo').level === '英语小白'){
          uni.setStorageSync('userInfo',{
            ...uni.getStorageSync('userInfo'),
            level: '英语初学者'
          })
          console.log("uni.getStorageSync('userInfo,更新等级')",uni.getStorageSync('userInfo'))
          updateUserLevel(uni.getStorageSync('userInfo')._id,result.totalLearned.total,'英语初学者')
        } 
      }else if(uni.getStorageSync('userInfo').points > 4 && uni.getStorageSync('userInfo').points <= 6){
        if(uni.getStorageSync('userInfo').level === '英语初学者'){
          uni.setStorageSync('userInfo',{
            ...uni.getStorageSync('userInfo'),
            level: '英语入门'
          })
        } 
        updateUserLevel(uni.getStorageSync('userInfo')._id,result.totalLearned.total,'英语入门')
      }else if(uni.getStorageSync('userInfo').points > 6 && uni.getStorageSync('userInfo').points <= 8){
        if(uni.getStorageSync('userInfo').level === '英语入门'){
          uni.setStorageSync('userInfo',{
            ...uni.getStorageSync('userInfo'),
            level: '英语进阶'
          })
        } 
        updateUserLevel(uni.getStorageSync('userInfo')._id,result.totalLearned.total,'英语进阶')
      }else if(uni.getStorageSync('userInfo').points > 8 && uni.getStorageSync('userInfo').points <= 10){
        if(uni.getStorageSync('userInfo').level === '英语进阶'){
          uni.setStorageSync('userInfo',{
            ...uni.getStorageSync('userInfo'),
            level: '英语高手'
          })
        } 
        updateUserLevel(uni.getStorageSync('userInfo')._id,result.totalLearned.total,'英语高手') 
      }else if(uni.getStorageSync('userInfo').points > 10 && uni.getStorageSync('userInfo').points <= 12){
        if(uni.getStorageSync('userInfo').level === '英语高手'){
          uni.setStorageSync('userInfo',{
            ...uni.getStorageSync('userInfo'),
            level: '英语大师'
          })
        } 
        updateUserLevel(uni.getStorageSync('userInfo')._id,result.totalLearned.total,'英语大师') 
      }else if(uni.getStorageSync('userInfo').points > 12){
        if(uni.getStorageSync('userInfo').level === '英语大师'){
          uni.setStorageSync('userInfo',{
            ...uni.getStorageSync('userInfo'),
            level: '英语王者'
          })
        }  
        updateUserLevel(uni.getStorageSync('userInfo')._id,result.totalLearned.total,'英语王者') 
      }
      
    }
    
    // 更新本地状态
    currentWord.status = status
    wordStatus.value = status
    
    // 更新统计数据
    progressStats.value = {
      ...progressStats.value,
      learned: wordList.value.filter(w => w.status === 'learned').length,
      learning: wordList.value.filter(w => w.status === 'learning').length,
      new: wordList.value.filter(w => w.status === 'new').length
    }
  } catch (e) {
    console.error('更新进度失败', e)
    uni.showToast({
      title: '更新进度失败',
      icon: 'none'
    })
  }
}

onMounted(() => {
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
    loadWordList()
  }	
})

onShow(() => {
  loadWordList()
})
</script>

<template>
  <view class="container">
    <!-- 学习进度统计 -->
    <view class="progress-stats">
      <view class="stat-item">
        <text class="stat-num">{{ progressStats.learned }}</text>
        <text class="stat-label">已掌握</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ progressStats.learning }}</text>
        <text class="stat-label">学习中</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ progressStats.new }}</text>
        <text class="stat-label">未学习</text>
      </view>
    </view>
    
    <!-- 类别选择器 -->
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
    
    <!-- 单词卡片 -->
    <view class="word-card" v-if="wordList.length > 0">
      <view class="word-content">
        <view class="word-status" :class="wordStatus">
          {{ wordStatus === 'learned' ? '已掌握' : wordStatus === 'learning' ? '学习中' : '未学习' }}
        </view>
        <text class="word">{{ wordList[currentIndex].word }}</text>
        <text class="phonetic">/{{ wordList[currentIndex].phonetic }}/</text>
        <button class="action-btn primary play-btn" @tap="playAudio">朗读</button>
        <view class="meaning" v-if="showMeaning">
          <text class="meaning-text">{{ wordList[currentIndex].meaning }}</text>
          <text class="example">{{ wordList[currentIndex].example }}</text>
        </view>
      </view>
      
      <!-- 操作按钮 -->
      <view class="actions">
        <button class="action-btn" @tap="prevWord">上一个</button>
        <button class="action-btn primary" @tap="toggleMeaning">
          {{ showMeaning ? '隐藏释义' : '显示释义' }}
        </button>
        <button class="action-btn" @tap="nextWord">下一个</button>
      </view>
      
      <!-- 学习状态按钮 -->
      <view class="status-actions">
        <button 
          class="status-btn"
          :class="{ active: wordStatus === 'learned' }"
          @tap="markWordStatus('learned')"
        >
          已掌握
        </button>
        <button 
          class="status-btn"
          :class="{ active: wordStatus === 'learning' }"
          @tap="markWordStatus('learning')"
        >
          继续学习
        </button>
      </view>
    </view>
    
    <!-- 加载提示 -->
    <view class="loading" v-else>
      <text>暂无单词</text>
    </view>
  </view>
</template>

<style>
.container {
  padding: 30rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  background-color: #4095E5;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.stat-item {
  text-align: center;
  color: #fff;
}

.stat-num {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 10rpx;
}

.stat-label {
  font-size: 24rpx;
  opacity: 0.9;
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

.word-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
}

.word-content {
  text-align: center;
  margin-bottom: 40rpx;
  position: relative;
}

.word-status {
  position: absolute;
  top: -20rpx;
  right: -20rpx;
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #fff;
}

.word-status.learned {
  background-color: #67c23a;
}

.word-status.learning {
  background-color: #e6a23c;
}

.word-status.new {
  background-color: #909399;
}

.word {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.phonetic {
  font-size: 32rpx;
  color: #666;
  display: block;
  margin-bottom: 30rpx;
}

.meaning {
  margin-top: 30rpx;
  padding-top: 30rpx;
  border-top: 1px solid #eee;
}

.meaning-text {
  font-size: 32rpx;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
  line-height: 1.5;
}

.example {
  font-size: 28rpx;
  color: #666;
  display: block;
  line-height: 1.5;
  font-style: italic;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 40rpx;
}

.action-btn {
  width: 30%;
  font-size: 28rpx;
  margin: 0;
}

.action-btn.primary {
  background-color: #4095E5;
  color: #fff;
}

.status-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30rpx;
  padding-top: 30rpx;
  border-top: 1px solid #eee;
}

.status-btn {
  width: 45%;
  font-size: 28rpx;
  margin: 0;
  background-color: #f5f5f5;
  color: #666;
}

.status-btn.active {
  background-color: #4095E5;
  color: #fff;
}

.loading {
  text-align: center;
  padding: 40rpx;
  color: #666;
}

.play-btn {
  width: 200rpx;
  margin: 20rpx auto;
}
</style> 