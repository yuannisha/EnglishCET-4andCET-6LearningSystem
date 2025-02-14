'use strict';

/**
 * 获取用户错题记录
 * @param {Object} event
 * @param {number} event.page 页码，从1开始
 * @param {number} event.pageSize 每页数量
 */
exports.main = async (event, context) => {
	const db = uniCloud.database()
	const $ = db.command.aggregate
	const { OPENID } = context
	
	if (!OPENID) {
		return {
			code: -1,
			msg: '用户未登录'
		}
	}
	
	try {
		const { page = 1, pageSize = 10 } = event
		const skipCount = (page - 1) * pageSize
		
		// 聚合查询：
		// 1. 查询用户的练习记录
		// 2. 展开答题记录数组
		// 3. 筛选出错误的题目
		// 4. 关联查询题目详情
		// 5. 分页
		const { data } = await db.collection('practice_records')
			.aggregate()
			.match({
				user_id: OPENID
			})
			.unwind('$answers')
			.match({
				'answers.isCorrect': false
			})
			.lookup({
				from: 'questions',
				localField: 'answers.questionId',
				foreignField: '_id',
				as: 'questionDetail'
			})
			.unwind('$questionDetail')
			.group({
				_id: '$answers.questionId',
				question: $.first('$questionDetail'),
				wrongCount: $.sum(1),
				lastWrongTime: $.max('$create_date')
			})
			.sort({
				lastWrongTime: -1
			})
			.skip(skipCount)
			.limit(pageSize)
			.end()
			
		// 获取错题总数
		const { total } = await db.collection('practice_records')
			.aggregate()
			.match({
				user_id: OPENID
			})
			.unwind('$answers')
			.match({
				'answers.isCorrect': false
			})
			.group({
				_id: '$answers.questionId'
			})
			.count('total')
			.end()
		
		return {
			code: 0,
			msg: 'success',
			data: {
				list: data,
				total: total[0] ? total[0].total : 0,
				page,
				pageSize
			}
		}
	} catch (e) {
		return {
			code: -1,
			msg: e.message || '获取错题记录失败'
		}
	}
} 