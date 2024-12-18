<template>
    <view class="page">
        <DisciplineList></DisciplineList>
        <view class="list">
            <view class="title"> 敬请期待... </view>
            <view class="desc">还没想好做什么功能 Y(^_^)Y</view>
        </view>
    </view>
</template>

<script lang="ts" setup>
import DisciplineList from "@/pages/component/disciplineList.vue";
</script>

<style lang="less" scoped>
.page {
    display: flex;
    width: 100%;
}
// .list {
//     flex: 1;
//     width: 100%;
//     .list-li {
//         // width: 12em;
//         // border: 1rpx solid #999;
//         // text-align: center;
//         // line-height: 2.8em;
//         margin: 1em auto;
//         // border-radius: 8rpx;

//         width: 12em;
//         height: 3em;
//         line-height: 3em;
//         font-size: 28rpx;
//         background-color: var(--c-safegray-hlight);
//         border: 1rpx var(--c-safegray-lighter) solid;
//         border-radius: 5rpx;
//         text-align: center;
//     }
// }
.list {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .title {
        font-size: 65rpx;
    }
    .desc {
        font-size: 35rpx;
        color: var(--c-safegray-darker);
    }
}
</style>
