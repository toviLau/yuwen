# zero-switch

## 一. 插件说明

个人仅测试与vue2,vue3,微信小程序，其他平台请自行测试

### `增加 **moon** 月亮模式` ,直接实现暗黑模式切换的开关,也可以自行配色,下面有介绍

### [zero-switch-看似简单的一个uniapp开关小组件，你真的用明白了吗？](https://juejin.cn/post/7279402761413558326)

## 二. 使用方法

```html
<template>
	<view class="container">
	<!-- 默认用法 -->
	<zero-switch  v-model="switchBtn"></zero-switch>

	<!-- 渐变玩法 -->
	<zero-switch class='inline_item' v-model="switchBtn" inactive-color="radial-gradient(circle,#fff 10%, #ccc 100%)" active-color="radial-gradient(circle,#fff 10%, #007aff 100%)"></zero-switch>
	<zero-switch class='inline_item' v-model="switchBtn" inactive-color="radial-gradient(circle,#000 10%, #f00000 40%,  #000 70%)" active-color="radial-gradient(circle,#000 10%, #00f260 40%,  #000 70%)" backgroundColorOff='#000000' backgroundColorOn='#000000'></zero-switch>
	
	<!-- 进阶渐变玩法 -->
	<zero-switch class='inline_item' v-model="switchBtn" inactive-color="radial-gradient(circle at 70% 35%, #000000 30%, #009fff 60%)" backgroundColorOff='#000000' active-color="linear-gradient(40deg,#ff0080,#ff8c00 70%)"></zero-switch>
	
	<!-- 提供一个没有渐变的月亮模式  :moon="true"-->
    <zero-switch class='inline_item' v-model="switchBtn" :moon="true" backgroundColorOff='#000000' backgroundColorOn="#000000"></zero-switch>

	<!-- 异步控制 -->
	<zero-switch  v-model="switchBtn" @change="handleAsync"></zero-switch>
     
    <!-- 禁用 -->
   <zero-switch  v-model="switchBtn" :disabled="true"></zero-switch>

      
	</view>
</template>
<script>
	export default {
		data() {
			return {
				switchBtn: false,
			}
		},
		methods:{
			handleAsync(e) {
				uni.showModal({
					title: '提示',
					content: '确定要改变开关状态吗?',
					success: (res) => {
						if (res.confirm) {
							console.log('用户点击确定');
							this.btnAsync = !this.btnAsync
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			}

		},
	}
</script>
```

## 三. 参数说明

|参数				|类型	|默认值	|描述																								|
|--					|--		|--		|--																									|
|value				|Boolean|false	|开关状态																							|
|activeColor		|String	|#1EABFA|开关开启时颜色																						|
|inactiveColor		|String	|#cccccc|开关关闭时颜色																						|
|backgroundColorOn	|String	|#ffffff|开关开启背景颜色																					|
|backgroundColorOff	|String	|#ffffff|开关关闭背景颜色																					|
|borderColorOn		|String	|#eeeeee|开关开启边框颜色																					|
|borderColorOff		|String	|#eeeeee|开关关闭边框颜色																					|
|showText			|Boolean|false	|是否显示文字(只能显示一个字)																		|
|textOn				|String	|开		|开关开启时的文字																					|
|textOff			|String	|关		|开关关闭时的文字																					|
|size				|Number	|26		|开关大小																							|
|disabled			|Boolean|false	|是否禁用																							|
|stopChange			|Boolean|false	|是否需要异步控制																					|
|moon				|Boolean|false	|月亮模式,此时禁用文字,建议把背景色改成黑色backgroundColorOff='#000000' backgroundColorOn="#000000"	|

## 四. event

|参数	|返回值	|
|---	|---	|
|change	| value	|

插件预览:
![code](https://img.jszero.cn/mweb/we_code.jpg)

> 预览的小程序不一定能及时更新当前插件