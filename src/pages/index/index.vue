<!--
 * @Author: ToviLau 46134256@qq.com
 * @Date: 2023-09-14 19:06:05
 * @LastEditors: ToviLau 46134256@qq.com
 * @LastEditTime: 2023-09-19 22:29:51
 * @FilePath: /yuwen/src/pages/index/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
    <view class="page">
        <view class="content">
            <navigator class="list" open-type="navigate" url="/pages/yuwen/index">语文拼音练习</navigator>
            <navigator class="list" open-type="navigate" url="/pages/shuxue/index">数学100以内加减法</navigator>
        </view>
        <div class="foot-line">好好学习 天天向上 ver:{{ (version || '0.0.2').match(/^\d+(\.\d+){2}/)[0] }}</div>
    </view>
</template>

<script >
async function setup(){
    // const { miniProgram: { version } } = uni.getAccountInfoSync()
    const { miniProgram } = uni.getAccountInfoSync()
}
</script>
<script setup>
import { onMounted, ref, watch, reactive } from 'vue';

// new Promise(resolve=>{
//     const { miniProgram:version } = uni.getAccountInfoSync()
//     resolve(version)
// }).then(()=>{

// })
// // console.log(miniProgram, '=========');
onMounted(()=>{
    // const { miniProgram:version } = uni.getAccountInfoSync
    // console.log(miniProgram, '=========');
})
console.log(uni);

// #ifdef MP-WEIXIN
uni.showShareMenu({
    title: '四小二(8)班',
    content: '课外练习',
    imageUrl: '/assets/icon.jpeg',
    path: '/pages/index/index'
});
// #endif

// const system = reactive({})
// uni.getSystemInfo({
//     success: res => {
//         Object.assign(system, res)
//         console.log(system, '====');
//     }
// })
</script>

<style lang="less">
.page {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    // background-color: #f3f3f3;
}

.content {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    flex: 1;
    background-color: #fcfcfc;

    .list {
        width: 10em;
        height: 3em;
        line-height: 3em;
        background-color: #f0f0f0;
        border-radius: 5rpx;
        text-align: center;

    }
}

// .version{
//     text-align: right;
//     padding:0 1em;
//     // color: #999
// }
.foot-line {
    @color: #e9e9e9;
    color: @color;
    display: flex;
    align-items: center;
    height: 2em;
    padding: 0 5%;
    margin-bottom: .5em;
    font-size: 30rpx;

    &::after,
    &::before {
        content: '';
        flex: 1;
        background-color: @color;
        height: 1rpx;
        margin: 0 .35em;
    }
}</style>

