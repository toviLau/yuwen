<!--
 * @Author: ToviLau 46134256@qq.com
 * @Date: 2023-09-14 19:06:05
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-09-27 15:59:53
 -->
<template>
    <view class="page">
        <view class="content">
            <navigator class="list" open-type="navigate" url="/pages/yuwen/index">语文：拼音练习</navigator>
            <navigator class="list" open-type="navigate" url="/pages/shuxue/index">数学：四则运算训练</navigator>
        </view>
        <div class="footer">
            <div class="footer-item">
                &copy; Tovi 2023-present
                <navigator class="about" open-type="navigate" url="/pages/about/index">@关于与反馈</navigator>
            </div>
            <div class="footer-item">好好学习 天天向上 version: {{ version }}</div>
        </div>
    </view>
</template>
<script setup>
import { onMounted, ref, watch, reactive } from 'vue';
import {
    getGradeName
} from "../../module/tools";
const { miniProgram } = uni.getAccountInfoSync ? uni.getAccountInfoSync() : {}
const version = (miniProgram?.version || '0.0.2').match(/^\d+(\.\d+){2}/)[0]

// #ifdef MP-WEIXIN

uni.showShareMenu({
    title: `四小${['一', '二', '三', '四', '五', '六'][getGradeName().y]}(8)班`,
    content: '课外练习',
    imageUrl: '/assets/icon.jpeg',
    path: '/pages/index/index'
});
// #endif

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
    background-color: var(--c-safegray-hlighter);

    .list {
        width: 11em;
        height: 3em;
        line-height: 3em;
        font-size: 28rpx;
        background-color: var(--c-safegray-hlight);
        border-radius: 5rpx;
        text-align: center;
    }
}

// .foot-line {
//     @color: #e9e9e9;
//     color: @color;
//     display: flex;
//     align-items: center;
//     height: 2em;
//     padding: 0 5%;
//     margin-bottom: .5em;
//     font-size: 30rpx;

//     &::after,
//     &::before {
//         content: '';
//         flex: 1;
//         background-color: @color;
//         height: 1rpx;
//         margin: 0 .35em;
//     }
// }

.footer {
    background-color: var(--c-safegray-hdarker);
    // background-image: linear-gradient(0deg, var(--c-safegray-hdarker), var(--c-safegray-darker));
    color: var(--c-safegray-hlight);
    text-align: center;
    line-height: 1.6em;
    font-size: 28rpx;
    padding: .5em 0;

    .footer-item {
        display: flex;
        justify-content: center;
    }

    .about {
        margin-left: 1em;
        text-decoration: underline;
    }
}
</style>

