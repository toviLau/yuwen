<!--
 * @Author: ToviLau 46134256@qq.com
 * @Date: 2023-09-14 19:06:05
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-09-27 15:59:53
 -->
<template>
    <view class="page">
        <view class="content">
            <view class="content-list">
                <view class="content-list-t">
                    <view class="content-list-label">学科</view>
                </view>
                <view class="content-list-b">
                    <navigator
                        class="content-list-item"
                        open-type="navigate"
                        url="/pages/discipline/yuwen/index"
                        >语文</navigator
                    >
                    <navigator
                        class="content-list-item"
                        open-type="navigate"
                        url="/pages/discipline/shuxue/index"
                        >数学</navigator
                    >
                    <navigator
                        class="content-list-item"
                        open-type="navigate"
                        url="/pages/discipline/yingyu/index"
                        >英语</navigator
                    >
                </view>
            </view>

            <view class="content-list">
                <view class="content-list-t">
                    <view class="content-list-label">小工具</view>
                </view>
                <view class="content-list-b">
                    <navigator
                        class="content-list-item"
                        open-type="navigate"
                        url="/pages/fn/countDown/index"
                        >倒记时</navigator
                    >
                </view>
            </view>
        </view>
        <view class="footer">
            <view class="footer-item">
                &copy; Tovi 2023-present
                <navigator
                    class="about"
                    open-type="navigate"
                    url="/pages/about/index"
                    >@关于与反馈</navigator
                >
            </view>
            <view class="footer-item">
                好好学习 天天向上 version: {{ version }}
            </view>
        </view>
    </view>
</template>
<script setup>
import { onMounted, ref, watch, reactive } from "vue";
import { getGradeName } from "../../module/tools";
const { miniProgram } = uni.getAccountInfoSync ? uni.getAccountInfoSync() : {};
const version = (miniProgram?.version || "0.0.2").match(/^\d+(\.\d+){2}/)[0];

// #ifdef MP-WEIXIN

uni.showShareMenu({
    title: `四小${["一", "二", "三", "四", "五", "六"][getGradeName().y]}(8)班`,
    content: "课外练习",
    imageUrl: "/assets/icon.jpeg",
    path: "/pages/index/index",
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
    flex: 1;
    display: flex;
    flex-direction: column;
    .content-list {
        display: flex;
        padding: 0 1em;
        // justify-content: center;
        flex: 1;
        flex-direction: column;
        &:last-child {
            flex-grow: 0;
            background-color: var(--c-safegray-hlight);
        }
        .content-list-t,
        .content-list-b {
            display: flex;
            justify-content: space-between;
            // flex: 1;
            flex-wrap: wrap;
            // background-color: var(--c-safegray-hlighter);
            align-items: center;
        }
        .content-list-t {
            margin: 0.8em 0;
            // background-color: var(--c-safegray-lighter);
            &::before,
            &::after {
                content: "";
                flex: 1;
                height: 2rpx;
                background-color: var(--c-safegray-lighter);
            }
            &::before {
                margin-right: 1em;
            }
            &::after {
                margin-left: 1em;
            }
        }
        .content-list-b {
        }
        &:last-child {
            border-top: 3rpx solid var(--c-safegray-light);
            .content-list-b {
                margin-bottom: 1em;
            }
            .content-list-item {
                background-color: var(--color-G);
                width: auto;
                padding: 0 1em;
                line-height: 2.5em;
            }
        }
    }
    .content-list-item {
        width: 7em;
        // height: 3em;
        line-height: 3em;
        font-size: 28rpx;
        background-color: var(--c-safegray-hlight);
        border: 1rpx var(--c-safegray-lighter) solid;
        border-radius: 5rpx;
        text-align: center;
        flex-shrink: 0;
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
    padding: 0.5em 0;

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
