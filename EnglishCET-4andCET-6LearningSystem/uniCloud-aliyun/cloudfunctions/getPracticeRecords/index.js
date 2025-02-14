'use strict';

/**
 * 获取练习记录
 * @param {Object} event 请求参数
 * @param {string} event.practice_type 练习类型：mock-模拟考试，real-真题练习
 * @param {number} event.page 页码，从1开始
 * @param {number} event.pageSize 每页数量
 */
exports.main = async (event, context) => {
	const db = uniCloud.database()
	const { OPENID } = context
	
	if (!OPENID) {
		return {
			code: -1,
			msg: '用户未登录'
		}
	}
	
	try {
		const { practice_type, page = 1, pageSize = 10 } = event
		const skip = (page - 1) * pageSize
		
		// 构建查询条件
		const where = {
			user_id: OPENID
		}
		if (practice_type) {
			where.practice_type = practice_type
		}
		
		// 查询练习记录
		const { data: records } = await db.collection('practice_records')
			.where(where)
			.orderBy('create_date', 'desc')
			.skip(skip)
			.limit(pageSize)
			.get()
			
		// 获取总数
		const { total } = await db.collection('practice_records')
			.where(where)
			.count()
			
		return {
			code: 0,
			msg: 'success',
			data: {
				list: records,
				total,
				page,
				pageSize
			}
		}
	} catch (e) {
		return {
			code: -1,
			msg: e.message || '获取练习记录失败'
		}
	}
} 