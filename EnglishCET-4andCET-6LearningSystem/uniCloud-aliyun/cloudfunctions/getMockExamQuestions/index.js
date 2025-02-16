'use strict';

const db = uniCloud.database()

/**
 * 获取模拟考试题目
 * @param {Object} event
 * @param {string} event.category - 考试类别(CET4/CET6)
 */
exports.main = async (event, context) => {
  const { category = 'CET4' } = event
  
  try {
    // 获取听力题目
    const { data: listeningQuestions } = await db.collection('listening_questions')
      .where({
        category,
        set_number: 1,
        question_type: 'real'
      })
      .get()
      
    // 获取阅读题目
    const { data: readingQuestions } = await db.collection('reading_questions')
      .where({
        category,
        set_number: 1,
        question_type: 'real'
      })
      .get()
      
    // 获取翻译题目
    const { data: translationQuestions } = await db.collection('translation_questions')
      .where({
        category,
        set_number: 1,
        question_type: 'real'
      })
      .get()
      
    // 获取写作题目
    const { data: writingQuestions } = await db.collection('writing_questions')
      .where({
        category,
        set_number: 1,
        question_type: 'real'
      })
      .get()
      
    return {
      code: 0,
      msg: 'success',
      data: {
        listening: listeningQuestions,
        reading: readingQuestions,
        translation: translationQuestions,
        writing: writingQuestions
      }
    }
    
  } catch (e) {
    return {
      code: -1,
      msg: e.message || '获取题目失败'
    }
  }
} 