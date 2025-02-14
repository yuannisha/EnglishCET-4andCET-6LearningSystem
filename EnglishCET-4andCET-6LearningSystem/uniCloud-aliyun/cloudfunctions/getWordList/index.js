'use strict';

/**
 * 获取单词列表
 * @param {Object} event 请求参数
 * @param {string} event.category 单词分类：CET4/CET6
 * @param {number} event.page 页码，从1开始
 * @param {number} event.pageSize 每页数量
 */
exports.main = async (event, context) => {
	const db = uniCloud.database()
	const { category = 'CET4', page = 1, pageSize = 50 } = event
	
	try {
		// 计算跳过的数量
		const skip = (page - 1) * pageSize
		
		// 查询单词列表
		const { data: words } = await db.collection('words')
			.where({
				category: category
			})
			.skip(skip)
			.limit(pageSize)
			.get()
			
		// 获取总数
		const { total } = await db.collection('words')
			.where({
				category: category
			})
			.count()
			
		return {
			code: 0,
			msg: 'success',
			data: {
				list: words,
				total,
				page,
				pageSize
			}
		}
	} catch (e) {
		return {
			code: -1,
			msg: e.message || '获取单词列表失败'
		}
	}
} 