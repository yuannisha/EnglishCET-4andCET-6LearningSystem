'use strict';

/**
 * 获取考试题目
 * @param {Object} event
 * @param {string} event.type 题目类型：mock-模拟考试，real-真题练习
 * @param {number} event.count 题目数量
 */
exports.main = async (event, context) => {
	const db = uniCloud.database()
	const { type = 'mock', count = 50 } = event
	
	try {
		// 随机获取题目
		const { data: questions } = await db.collection('questions')
			.where({
				type: type
			})
			.limit(count)
			.get()
			
		// 处理题目数据，移除正确答案
		const processedQuestions = questions.map(q => {
			const { answer, ...rest } = q
			return rest
		})
		
		return {
			code: 0,
			msg: 'success',
			data: processedQuestions
		}
	} catch (e) {
		return {
			code: -1,
			msg: e.message || '获取题目失败'
		}
	}
} 