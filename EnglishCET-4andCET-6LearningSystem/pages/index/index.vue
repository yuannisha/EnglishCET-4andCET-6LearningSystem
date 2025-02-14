<template>
	<view class="container">
		<!-- 顶部欢迎区域 -->
		<view class="header">
			<view class="welcome">
				<text class="title">英语四六级学习</text>
				<text class="subtitle">提升英语能力，助你一臂之力</text>
			</view>
		</view>
		
		<!-- 功能区块 -->
		<view class="function-blocks">
			<view 
				class="block" 
				v-for="item in functionBlocks" 
				:key="item.id"
				@tap="navigateToPage(item.path)"
			>
				<view class="block-content">
					<image class="block-icon" :src="item.icon" mode="aspectFit" />
					<text class="block-title">{{ item.title }}</text>
				</view>
				<view class="block-arrow">
					<text class="arrow">→</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

/**
 * @description 首页功能区块数据
 */
const functionBlocks = ref([
	{
		id: 1,
		title: '单词学习',
		icon: '/static/icons/word.png',
		path: '/pages/words/words'
	},
	{
		id: 2,
		title: '听力训练',
		icon: '/static/icons/listening.png',
		path: '/pages/listening/listening'
	},
	{
		id: 3,
		title: '阅读理解',
		icon: '/static/icons/reading.png',
		path: '/pages/reading/reading'
	},
	{
		id: 4,
		title: '写作练习',
		icon: '/static/icons/writing.png',
		path: '/pages/writing/writing'
	},
	{
		id: 5,
		title: '翻译练习',
		icon: '/static/icons/translation.png',
		path: '/pages/translation/translation'
	}
])

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
    }	
})

/**
 * @description 跳转到对应功能页面
 * @param {string} path - 页面路径
 */
const navigateToPage = (path) => {
	if(path === '/pages/words/words'){
		uni.switchTab({
			url: path
		})
	}else{
		uni.navigateTo({
			url: path
		})
	}
}
</script>

<style>
	.container {
		padding: 30rpx;
		background-color: #f8f9fa;
		min-height: 100vh;
	}

	.header {
		background: linear-gradient(135deg, #4095E5 0%, #2d83d1 100%);
		padding: 40rpx 30rpx;
		border-radius: 30rpx;
		margin-bottom: 40rpx;
		box-shadow: 0 4rpx 20rpx rgba(64, 149, 229, 0.15);
	}

	.welcome {
		color: #fff;
	}

	.title {
		font-size: 44rpx;
		font-weight: bold;
		display: block;
		margin-bottom: 16rpx;
		letter-spacing: 2rpx;
	}

	.subtitle {
		font-size: 28rpx;
		opacity: 0.9;
		letter-spacing: 1rpx;
	}

	.function-blocks {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.block {
		background-color: #fff;
		border-radius: 24rpx;
		padding: 32rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
		transition: all 0.3s ease;
	}

	.block:active {
		transform: scale(0.98);
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.block-content {
		display: flex;
		align-items: center;
		gap: 24rpx;
	}

	.block-icon {
		width: 80rpx;
		height: 80rpx;
		transition: transform 0.3s ease;
	}

	.block:active .block-icon {
		transform: scale(0.95);
	}

	.block-title {
		font-size: 32rpx;
		color: #333;
		font-weight: 500;
	}

	.block-arrow {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #f8f9fa;
		border-radius: 30rpx;
	}

	.arrow {
		color: #4095E5;
		font-size: 32rpx;
		font-weight: bold;
	}

	@keyframes float {
		0% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-4rpx);
		}
		100% {
			transform: translateY(0);
		}
	}

	.block:hover .block-icon {
		animation: float 2s ease infinite;
	}
</style>
