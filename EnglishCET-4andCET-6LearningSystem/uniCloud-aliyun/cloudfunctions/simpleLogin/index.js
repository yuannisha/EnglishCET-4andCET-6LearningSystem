'use strict';

/**
 * 简单登录
 * @param {Object} event
 * @param {string} event.account - 用户名
 * @param {string} event.password - 密码
 */
exports.main = async (event, context) => {
  const { account, password } = event
  const db = uniCloud.database()
  
  try {
    // 查询用户
    const { data: [user] } = await db.collection('users')
      .where({
        account: account,
        password: password // 实际项目中应该使用加密密码
      })
      .get()
    
    if (!user) {
      return {
        code: -1,
        msg: '手机号或密码错误'
      }
    }
    
    // 生成简单的token（实际项目中应该使用更安全的方式）
    const token = Date.now() + '-' + Math.random().toString(36).substr(2)
    
    // 更新用户token
    await db.collection('users')
      .doc(user._id)
      .update({
        token: token,
        last_login_time: new Date()
      })

    //更新学习天数，比较上次登录的日期，如果超过一天，则加一天，否则不加  
    const today = new Date()
    const lastLoginDate = new Date(user.last_login_time)
    const timeDiff = today - lastLoginDate
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
    const days =  daysDiff > 0 ? user.study_days + 1 : user.study_days
    await db.collection('users')
      .doc(user._id)  
      .update({
        study_days: days
      })
    

    return {
      code: 0,
      msg: '登录成功',
      token: token,
      userInfo: {
        _id: user._id,
        account: user.account,
        nickname: user.nickname,
        avatar: user.avatar,
        level: user.level,
        points: user.points,
        study_days: days
      }
    }
  } catch (e) {
    return {
      code: -1,
      msg: e.message || '登录失败'
    }
  }
} 