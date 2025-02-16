'use strict';

const db = uniCloud.database()

/**
 * 获取真题练习题目
 * @param {Object} event
 * @param {string} event.category - 考试类别(CET4/CET6)
 * @param {string} event.year - 年份
 * @param {string} event.month - 月份
 * @param {string} event.type - 题目类型(listening/reading/translation/writing)
 */
exports.main = async (event, context) => {
  const { category = 'CET4', year, month, type } = event
  
  try {
    const query = {
      category,
      question_type: 'real'
    }
    
    if (year) query.year = year
    if (month) query.month = month
    
    let collection
    switch (type) {
      case 'listening':
        collection = 'listening_questions'
        break
      case 'reading':
        collection = 'reading_questions'
        break
      case 'translation':
        collection = 'translation_questions'
        break
      case 'writing':
        collection = 'writing_questions'
        break
      default:
        throw new Error('无效的题目类型')
    }
    
    // 获取题目
    const { data: questions } = await db.collection(collection)
      .where(query)
      .get()
    console.log("questions",questions)
    // 获取所有年份
    const { data: yearsData } = await db.collection(collection)
      .where({
        category,
        question_type: 'real'
      })
      .field({ year: true })
      .get()
    console.log("yearsData",yearsData)
    // 提取并去重年份
    const years = [...new Set(yearsData.map(item => item.year))].sort((a, b) => b - a)
    
    // 获取月份
    const monthQuery = {
      category,
      question_type: 'real'
    }
    if (year) monthQuery.year = year
    
    const { data: monthsData } = await db.collection(collection)
      .where(monthQuery)
      .field({ month: true })
      .get()
      
    // 提取并去重月份
    const months = [...new Set(monthsData.map(item => item.month))].sort((a, b) => b - a)
    
    return {
      code: 0,
      msg: 'success',
      data: {
        list: questions,
        years,
        months
      }
    }
    
  } catch (e) {
    return {
      code: -1,
      msg: e.message || '获取题目失败'
    }
  }
} 