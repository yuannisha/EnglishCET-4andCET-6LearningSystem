'use strict';

/**
 * 获取用户学习统计数据
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
		//获取已练习的记录数
		const practiceRecord = await db.collection('practice_records')
			.where({
				user_id: user_id
			})
			.count()
			
		
		return {
			code: 0,
			msg: 'success',
			data: {
				practice_record: practiceRecord
			}
		}
	} catch (e) {
		return {
			code: -1,
			msg: e.message || '获取统计数据失败'
		}
	}
} 