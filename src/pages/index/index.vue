<template>
    <view class="content">
        <navigator class="list" open-type="navigate" url="/pages/yuwen/index">语文拼音练习</navigator>
        <navigator class="list" open-type="navigate" url="/pages/shuxue/index">数学100以内加减法</navigator>
    </view>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';

// #ifdef MP-WEIXIN
uni.showShareMenu({
    title:'四小二(8)班',
    content:'课外练习',
    imageUrl: '/assets/icon.jpeg',
    path: '/pages/index/index'
});
// #endif
</script>

<style lang="less">
.content {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    flex: 1;

    .list {
        width: 10em;
        height: 3em;
        line-height: 3em;
        background-color: #f0f0f0;
        border-radius: 5rpx;
        text-align: center;

    }
}
</style>

