'use strict';
const db = uniCloud.database()

exports.main = async (event, context) => {
	const { category = 'CET4', set_number } = event
	
	try {
		const query = {
			category:category
		}
		
		if (set_number) {
			query.set_number = set_number
		}
		
		// 获取题目总套数
		const total = await db.collection('listening_questions')
			.where({category:query.category})
			.count()
			
		// 如果没有指定套题编号，获取第一套题
		if (!set_number) {
			query.set_number = 1
		}
		
		const { data: questions } = await db.collection('listening_questions')
			.where(query)
			.get()
			
		return {
			code: 0,
			msg: 'success',
			data: {
				list: questions,
				total_sets: total,
				current_set: set_number || 1
			}
		}
		
	} catch (e) {
		return {
			code: -1,
			msg: e.message || '获取听力题目失败'
		}
	}
}; 