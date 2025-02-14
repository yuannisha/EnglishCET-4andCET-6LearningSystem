'use strict';
const db = uniCloud.database()
const dbCmd = db.command

exports.main = async (event, context) => {
	const { userId,question_id,question_type } = event
	const { correctCount , correctRate , userScore  } = event

	if (!userId) {
		return {
			code: -1,
			msg: '请先登录'
		}
	}
	//查询题目,根据question_type决定查询哪个集合
	const question = await db.collection(question_type + '_questions').doc(question_id).get()

	console.log("question",question)
	if(!question.data){
		return {
			code: -1,
			msg: '题目不存在'
		}
	}
	
	try {
		
		//查询含有userId与question_id的记录
		const record = await db.collection('practice_records').where({
			user_id: userId,
			question_id: question_id
		}).get()	
		if(record.data.length > 0){
			const highestScore = Math.max(record.data[0].lastScore, userScore)
			const highestCorrectCount = Math.max(record.data[0].lastCorrectCount, correctCount)
			const highestCorrectRate = Math.max(record.data[0].lastCorrectRate, correctRate)
			const practice_count = record.data[0].practice_count + 1

			await db.collection('practice_records').doc(record.data[0]._id).update({
				lastCorrectCount: correctCount,
				lastCorrectRate: correctRate,
				lastScore: userScore,
				highestScore: highestScore,
				highestCorrectCount: highestCorrectCount,
				highestCorrectRate: highestCorrectRate,
				practice_count: practice_count
			})
		}else{
			//添加记录
			await db.collection('practice_records').add({
				user_id: userId,
				question_id: question_id,
				practice_type: question_type,
				category: question.data[0].category,
				set_number: question.data[0].set_number,
				lastCorrectCount: correctCount,
				lastCorrectRate: correctRate,
				lastScore: userScore,
				highestScore: userScore,
				highestCorrectCount: correctCount,
				highestCorrectRate: correctRate,
				practice_count: 1
			})
		}
		return {
			code: 0,
			msg: 'success'
		}
		
	} catch (e) {
		return {
			code: -1,
			msg: e.message || '提交失败'
		}
	}
}; 