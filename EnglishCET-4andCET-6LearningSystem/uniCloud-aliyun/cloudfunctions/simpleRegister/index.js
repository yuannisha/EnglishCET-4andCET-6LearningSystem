'use strict';

/**
 * 简单注册
 * @param {Object} event
 * @param {string} event.account - 用户名
 * @param {string} event.password - 密码
 * @param {string} event.nickname - 昵称
 */
exports.main = async (event, context) => {
  const { account, password, nickname } = event
  const db = uniCloud.database()
  
  try {
    // 检查用户名是否已存在
    const { total } = await db.collection('users')
      .where({
        account: account
      })
      .count()
    const { total: nicknameTotal } = await db.collection('users')   
      .where({
        nickname: nickname
      })
      .count()
    
    if (total > 0 ) {
      return {
        code: -1,
        msg: '手机号已存在'
      }
    }
    if (nicknameTotal > 0) {
      return {
        code: -1,
        msg: '昵称已存在'
      }
    }   
    
    // 创建新用户
    const { id } = await db.collection('users')
      .add({
        account,
        password, // 实际项目中应该使用加密密码
        nickname,
        avatar: '/static/avatar/default.png',
        points: 0,
        study_days: 0,
        level: '英语小白',
        create_time: Date.now()
      })
    
    return {
      code: 0,
      msg: '注册成功',
      id
    }
  } catch (e) {
    return {
      code: -1,
      msg: e.message || '注册失败'
    }
  }
} 