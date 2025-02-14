'use strict';

const db = uniCloud.database()
const translationQuestionsCollection = db.collection('translation_questions')

exports.main = async (event, context) => {
  const { category, set_number } = event
  
  try {
    // 获取指定类别和套数的题目
    const { data: list } = await translationQuestionsCollection
      .where({
        category,
        set_number: parseInt(set_number)
      })
      .get()
      
    // 获取总套数
    const { total } = await translationQuestionsCollection
      .where({
        category
      })
      .count()
      
    return {
      code: 0,
      msg: '获取成功',
      data: {
        list,
        total_sets: {
          total
        }
      }
    }
  } catch (e) {
    return {
      code: -1,
      msg: '获取失败',
      error: e
    }
  }
}