'use strict';

/**
 * 获取用户单词学习进度
 * @param {Object} event
 * @param {Array<string>} event.word_ids 单词ID列表
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
    const { word_ids } = event
    
    // 查询用户的单词学习进度
    const { data } = await db.collection('user_word_progress')
      .where({
        user_id: user_id,
        word_id: db.command.in(word_ids)
      })
      .get()
    
    return {
      code: 0,
      msg: 'success',
      data
    }
  } catch (e) {
    return {
      code: -1,
      msg: e.message || '获取单词进度失败'
    }
  }
} 