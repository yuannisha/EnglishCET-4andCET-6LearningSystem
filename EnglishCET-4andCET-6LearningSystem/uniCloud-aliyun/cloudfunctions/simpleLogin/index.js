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
        last_login_time: Date.now()
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
        points: user.points,
        study_days: user.study_days
      }
    }
  } catch (e) {
    return {
      code: -1,
      msg: e.message || '登录失败'
    }
  }
} 