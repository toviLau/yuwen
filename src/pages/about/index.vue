<!--
 * @Author       : ToviLau 46134256@qq.com
 * @Date         : 2023-10-01 15:51:59
 * @LastEditors  : ToviLau 46134256@qq.com
 * @LastEditTime : 2023-10-01 19:13:22
-->
<template>
    <view class="page">
        <div class="doc">
            <div class="doc-item">此小程序诞生是疫情失业在家无意之作，本意是给自家闺女玩的，训练她的数学计算能力，为将来的学习打好坚实基础。</div>
            <div class="doc-item">经各交流群里的热心群友测试与体验，觉得比较实用后邀请开源。现此小程序源码已在 码云 与 gitbub 上同步开源(MIT)。欢迎 isuse。</div>
            <div class="doc-item"><span class="iconfont icon-github"></span>https://github.com/toviLau/yuwen</div>
            <div class="doc-item"><span class="iconfont icon-gitee"></span>https://gitee.com/tovilau/yuwen</div>
            <div class="divider-line">纯个人版小程序, 非商用无广告，不采集个人信息。</div>
            <div class="doc-item-h">建议反馈</div>
            <div class="doc-item">如果您有好的 idea 可以反馈给我，我将选择性采纳，反馈方式可以通过上面的开源社区，也可以通下方的二维码反馈给我。</div>
            <image src="../../assets/about/wechat.png" alt="me wechat" show-menu-by-longpress class="me-wechat"></image>
        </div>
    </view>
</template>
<script setup>
import { onMounted, ref, watch, reactive } from 'vue';
// #ifdef MP-WEIXIN
uni.showShareMenu({
    title: '四小二(8)班',
    content: '课外练习',
    imageUrl: '/assets/icon.jpeg',
    path: '/pages/about/index'
});
// #endif

</script>

<style lang="less">
.page {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}
.doc{
    font-size: 30rpx;
    font-weight: normal;
    margin: 0 1em;
    color: var(--c-safegray-hdark);
    .doc-item{
        text-indent: 2em;
    }
    .doc-item-h{
        font-size: 1.25em;
        margin-top: 1em;
        color: var(--c-safegray-hdark);
    }
    .iconfont{
        font-size: 35rpx;
        line-height: 1em;
        &.icon-github{
            color: #333;
        }
        &.icon-gitee{
            color:#c71d23;
        }
    }
    .me-wechat{
        width: 80%;
        margin: 0 auto;
        display: block;
    }
}

</style>

