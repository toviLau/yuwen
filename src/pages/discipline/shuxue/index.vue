<template>
    <div class="page">
        <DisciplineList></DisciplineList>
        <view class="list">
            <navigator
                class="list-li"
                open-type="navigate"
                url="/pages/discipline/shuxue/jisuan"
            >
                常规算术运算练习
            </navigator>
            <navigator
                class="list-li"
                open-type="navigate"
                u-rl="/pages/yuwen/index"
            >
                速算技巧(开发中...)
            </navigator>
            <navigator
                class="list-li"
                open-type="navigate"
                u-rl="/pages/yuwen/index"
            >
                计算公式(开发中...)
            </navigator>
        </view>
    </div>
</template>

<script lang="ts" setup>
import DisciplineList from "@/pages/component/disciplineList.vue";
</script>

<style lang="less" scoped>
.page {
    display: flex;
    width: 100%;
}
.list {
    flex: 1;
    width: 100%;
    .list-li {
        // width: 12em;
        // border: 1rpx solid #999;
        // text-align: center;
        // line-height: 2.8em;
        margin: 1em auto;
        // border-radius: 8rpx;

        width: 12em;
        // height: 3em;
        // line-height: 3em;
        padding: .75em 0;
        font-size: 28rpx;
        background-color: var(--c-safegray-hlight);
        border: 1rpx var(--c-safegray-lighter) solid;
        border-radius: 5rpx;
        text-align: center;
    }
}
</style>
