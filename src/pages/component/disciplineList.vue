<template>
    <view class="list-menu">
        <!-- <view
            class="list-li"
            :class="{
                active: isActive('pages/discipline/yuwen/index'),
            }"
            >语文</view
        >
        <view
            class="list-li"
            :class="{
                active: isActive('pages/discipline/shuxue/index'),
            }"
            >数学</view
        >
        <view
            class="list-li"
            :class="{
                active: isActive('pages/discipline/yingyu/index'),
            }"
            >英语</view
        > -->
        <navigator
            class="list-li"
            open-type="navigate"
            url="/pages/discipline/yuwen/index"
            :class="{
                active: isActive('pages/discipline/yuwen/index'),
            }"
            >语文</navigator
        >
        <navigator
            class="list-li"
            open-type="navigate"
            url="/pages/discipline/shuxue/index"
            :class="{
                active: isActive('pages/discipline/shuxue/index'),
            }"
            >数学</navigator
        >
        <navigator
            class="list-li"
            open-type="navigate"
            url="/pages/discipline/yingyu/index"
            :class="{
                active: isActive('pages/discipline/yingyu/index'),
            }"
            >英语</navigator
        >
    </view>
</template>

<script lang="ts" setup>
// 获取当前页面的实例
const pages = getCurrentPages();
const currentPage = pages[pages.length - 1];

// 获取页面路径
const currentPath = currentPage.route || currentPage.$route.path;

console.log(currentPath);
const isActive = (path) => currentPath === path;
</script>

<style lang="less" scoped>
.list-menu {
    background-color: var(--c-safegray-hlight);
    border-right: 1rpx solid var(--c-safegray-lighter);
    height: 100%;
    .list-li {
        width: 4em;
        text-align: center;
        line-height: 2.6em;
    }
    .active {
        background-color: #fff;
        position: relative;
        right: -1rpx;
        padding: -1rpx;
        border: 1rpx var(--c-safegray-lighter) solid;
        border-left: none;
        border-right: none;
        &:nth-child(1) {
            border-top: none;
        }
    }
}
</style>
