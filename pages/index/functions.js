// 1.获取ip地址
let ip = "http://40.81.28.150:3000"
export function getLoaction() {

	return 1111

}

/**
 *1.检测网络 
 */
export async function netWork() {
	let response
	await uni.getNetworkType({
		success: function(res) {
			// console.log("获取网络类型", res.networkType)

			if (res.networkType == "none") {
				// that.networkState = false

				uni.showModal({
					title: 'Tips',
					content: 'Network connection failed, please check the network and try again！',
					showCancel: false,

					success: function(res) {
						if (res.confirm) {
							console.log('用户点击确定');
						}
					}
				});

				response = false

			} else {

				response = true
			}

		}
	});

	return response
}


/**
 * 2.获取ip地址和解析
 */
export function ipAndaddress() {

	return new Promise((reslove, reject) => {
		uni.request({
			// url: 'http://pv.sohu.com/cityjson?ie=utf-8',
			url: "https://api.ipify.org/?format=json",
			method: 'GET',
			success: (res) => {

				uni.request({
					url: `https://www.fkcoder.com/ip?ip=${res.data.ip}`,
					method: 'GET',
					success: (res1) => {

						console.log("ip地址详情", res1)

						if (res1.data.country == "中国") {

							if (res1.data.city != 0) {
								reslove({
									userip: res.data.ip,
									address: res1.data.country + "·" + res1.data
										.province + "·" + res1.data.city
								})

							} else {

								reslove({
									userip: res.data.ip,
									address: res1.data.country + "·" + res1.data
										.province
								})
							}


						} else {

							if (res1.data.province != 0) {
								reslove({
									userip: res.data.ip,
									address: res1.data.country + "·" + res1.data
										.province
								})
							} else {
								reslove({
									userip: res.data.ip,
									address: res1.data.country
								})
							}

						}
					}
				})

			}
		})
	})
}

/**
 * 4.通讯录权限判断
 */

export function applyContact() {

	var result = 0;
	var CNContactStore = plus.ios.import("CNContactStore");
	var cnAuthStatus = CNContactStore.authorizationStatusForEntityType(0);
	if (cnAuthStatus === 0) {
		result = false;
	} else if (cnAuthStatus == 3) {
		result = true;
	} else {
		result = false;
	}
	plus.ios.deleteObject(CNContactStore);
	return result;
}


/**
 * 5.重复号码校验
 */

export function checkNumber(value) {

	return new Promise((reslove, reject) => {

		uni.request({
			url: `${ip}/Api/mobile/checkNum`,
			data: {
				loginNum: value,
			},
			method: "POST",
			sslVerify: false,
			success: (res) => {
				reslove(res.data)
			},
			fail: (res) => {
				reslove(res)
				console.log("网络请求失败", res)
			},

		})


	})
}
/**
 * 7.添加通讯录
 */

export function addMailList(value) {

	console.log("通讯录添加", value)
	return new Promise((reslove, reject) => {

		uni.request({
			url: `${ip}/Api/mobile/addMailList`,
			method: "POST",
			data: {
				loginNum: value.loginNum,
				inCode: value.inCode,
				equipment: value.equipment,
				location: value.location,
				address: value.address,
				data: value.data
			},
			sslVerify: false,
			success: (res) => {
				reslove(res.data)
			}
		});

	})
}
