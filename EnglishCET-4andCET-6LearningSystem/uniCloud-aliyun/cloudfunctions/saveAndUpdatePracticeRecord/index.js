'use strict';
const db = uniCloud.database()
const dbCmd = db.command

exports.main = async (event, context) => {
	const { userId,practice_type,question_id,category,duration,scores } = event
	const { correctCount , correctRate , userScore , year , month } = event

	if (!userId) {
		return {
			code: -1,
			msg: '请先登录'
		}
	}
	console.log("practice_type",practice_type)
	console.log("question_id",question_id)
	console.log("category",category)
	console.log("duration",duration)
	console.log("scores",scores)
	//如果practice_type含有字符串'real_',则去掉	
	var table_name = ''
	if(practice_type.includes('real_')){
		table_name = practice_type.replace('real_','')+ '_questions'
	}else{
		table_name = practice_type + '_questions'
	}
	console.log("table_name",table_name)
	if(practice_type!= 'mock'){
	//查询题目,根据question_type决定查询哪个集合
	var question = await db.collection(table_name).doc(question_id).get()
	console.log("question",question)
	if(question.data.length == 0){
		return {
			code: -1,
			msg: '题目不存在'
		}
	}
	}
	
	try {
		if(practice_type!= 'mock'){
			console.log("12345648489787")
		//查询含有userId与question_id的记录
		const record = await db.collection('practice_records').where({
			user_id: userId,
			question_id: question_id
		}).get()	
		if(record.data.length > 0 && !year && !month){
			console.log("123")
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
			if(year && month){
				console.log("456")
				console.log("question",question)
				const durationTime = duration ? duration : undefined
						//添加记录
						await db.collection('practice_records').add({
							user_id: userId,
							question_id: question_id,
							practice_type: practice_type,
							category: question.data[0].category,
							set_number: question.data[0].set_number,
							lastCorrectCount: correctCount,
							lastCorrectRate: correctRate,
							lastScore: userScore,
							year: year,
							month: month,
							create_date: new Date(),
							duration:durationTime
						})
			}else{
				console.log("789")
						//添加记录
						await db.collection('practice_records').add({
							user_id: userId,
							question_id: question_id,
							practice_type: practice_type,
							category: question.data[0].category,
							set_number: question.data[0].set_number,
							lastCorrectCount: correctCount,
							lastCorrectRate: correctRate,
							lastScore: userScore,
							highestScore: userScore,
							highestCorrectCount: correctCount,
							highestCorrectRate: correctRate,
							practice_count: 1,
							create_date: new Date()
						})
			}
			
		}
		}else{
			console.log("9999")
			//添加记录
			await db.collection('practice_records').add({
				user_id: userId,
				practice_type: practice_type,
				category: category,
				scores: scores,
				duration: duration,
				create_date: new Date()
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