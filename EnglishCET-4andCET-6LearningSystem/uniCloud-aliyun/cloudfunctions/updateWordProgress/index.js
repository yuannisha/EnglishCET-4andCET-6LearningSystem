'use strict';

/**
 * 更新单词学习进度
 * @param {Object} event
 * @param {string} event.word_id 单词ID
 * @param {string} event.status 学习状态：new-未学习，learning-学习中，learned-已掌握
 */
exports.main = async (event, context) => {
	const db = uniCloud.database()
	const { user_id } = event
	
	if (!user_id) {
		return {
			code: -1,
			msg: '用户未登录'
		}
	}
	
	try {
		const { word_id, status } = event
		
		// 查询是否已存在进度记录
		const { data: [existingProgress] } = await db.collection('user_word_progress')
			.where({
				user_id: user_id,
				word_id: word_id
			})
			.get()
			
		if (existingProgress) {
			// 更新现有记录
			await db.collection('user_word_progress')
				.doc(existingProgress._id)
				.update({
					status: status,
					review_times: db.command.inc(1),
					last_review_date: Date.now()
				})
		} else {
			// 创建新记录
			await db.collection('user_word_progress')
				.add({
					user_id: user_id,
					word_id: word_id,
					status: status,
					review_times: 1,
					last_review_date: Date.now(),
					create_date: Date.now()
				})
		}
		
		return {
			code: 0,
			msg: 'success'
		}
	} catch (e) {
		return {
			code: -1,
			msg: e.message || '更新进度失败'
		}
	}
} 