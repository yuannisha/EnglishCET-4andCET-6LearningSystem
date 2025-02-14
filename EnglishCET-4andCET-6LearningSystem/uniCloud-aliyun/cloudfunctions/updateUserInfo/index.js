'use strict';

/**
 * 更新用户信息
 * @param {Object} event 请求参数
 * @param {string} event.nickname 昵称
 * @param {string} event.avatar 头像
 */
exports.main = async (event, context) => {
	const db = uniCloud.database()
	
	try {
		const { userId, nickname, avatar } = event
		if (!userId) {
			return {
				code: -1,
				msg: '用户未登录'
			}
		}
		
		const account = event.account
        // 检查手机号是否已被使用
        const { data: [userInfo] } = await db.collection('users')
			.where({
				account: account
			})
			.get()
        //检查昵称是否已被使用
        const { data: [userInfoWithNickname] } = await db.collection('users')
			.where({
				nickname: nickname
			})
			.get()

		if (userInfo) {
			return {
				code: -1,
				msg: '该手机号已被使用'
			}
		}
        if (userInfoWithNickname) {
			return {
				code: -1,
				msg: '该昵称已被使用'
			}
		}   
			// 用户存在，更新信息
			const updateData = {}
			if (account) updateData.account = account   
			if (nickname) updateData.nickname = nickname
			if (avatar) updateData.avatar = avatar
			
			await db.collection('users')
				.where({
					_id: userId
				})
				.update(updateData)
				
			return {
				code: 0,
				msg: 'success',
				data: {
					...userInfo,
					...updateData
				}
			}
	} catch (e) {
		return {
			code: -1,
			msg: e.message || '更新用户信息失败'
		}
	}
} 