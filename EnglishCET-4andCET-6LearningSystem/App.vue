<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	/* 全局样式 */
	page {
		font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica,
			Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei',
			sans-serif;
	}

	/* 通用容器 */
	.container {
		padding: 30rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	/* 卡片样式 */
	.card {
		background-color: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
	}

	/* 按钮样式 */
	.btn {
		background-color: #4095E5;
		color: #fff;
		border-radius: 10rpx;
		padding: 20rpx 40rpx;
		font-size: 28rpx;
		border: none;
	}

	.btn:active {
		opacity: 0.8;
	}

	.btn.outline {
		background-color: transparent;
		color: #4095E5;
		border: 1px solid #4095E5;
	}

	/* 文本样式 */
	.title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
	}

	.subtitle {
		font-size: 28rpx;
		color: #666;
		margin-bottom: 10rpx;
	}

	/* 列表样式 */
	.list {
		background-color: #fff;
		border-radius: 20rpx;
		overflow: hidden;
	}

	.list-item {
		padding: 30rpx;
		border-bottom: 1px solid #eee;
		display: flex;
		align-items: center;
	}

	.list-item:last-child {
		border-bottom: none;
	}

	/* 加载提示 */
	.loading {
		text-align: center;
		padding: 30rpx;
		color: #999;
	}

	/* 空状态提示 */
	.empty {
		text-align: center;
		padding: 60rpx 30rpx;
		color: #999;
	}

	.empty-icon {
		font-size: 80rpx;
		margin-bottom: 20rpx;
	}

	.empty-text {
		font-size: 28rpx;
	}
</style>
