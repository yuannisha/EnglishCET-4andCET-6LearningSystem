'use strict';

/**
 * 获取用户学习统计数据
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
		// 获取今日日期（0时0分0秒）
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		
		// 聚合查询练习记录
		const { data: practiceStats } = await db.collection('practice_records')
			.aggregate()
			.match({
				user_id: OPENID,
				create_date: db.command.gte(today.getTime())
			})
			.group({
				_id: null,
				todayQuestions: $.sum('$questions_count'),
				correctCount: $.sum('$correct_count'),
				totalTime: $.sum('$duration')
			})
			.end()
			
		// 获取连续打卡天数
		const { data: [userInfo] } = await db.collection('users')
			.where({
				openid: OPENID
			})
			.get()
			
		// 获取错题统计
		const { total: wrongQuestionCount } = await db.collection('practice_records')
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
			
		// 获取已学单词数量
		const { total: learnedWordsCount } = await db.collection('user_word_progress')
			.where({
				user_id: OPENID,
				status: 'learned'
			})
			.count()
		
		const stats = {
			todayQuestions: practiceStats[0]?.todayQuestions || 0,
			correctRate: practiceStats[0] ? 
				Math.round((practiceStats[0].correctCount / practiceStats[0].todayQuestions) * 100) : 0,
			studyTime: practiceStats[0]?.totalTime || 0,
			studyDays: userInfo?.study_days || 0,
			points: userInfo?.points || 0,
			wrongQuestionCount: wrongQuestionCount[0]?.total || 0,
			learnedWordsCount: learnedWordsCount.total || 0
		}
		
		return {
			code: 0,
			msg: 'success',
			data: stats
		}
	} catch (e) {
		return {
			code: -1,
			msg: e.message || '获取统计数据失败'
		}
	}
} 