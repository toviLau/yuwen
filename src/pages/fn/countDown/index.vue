<template>
    <page-meta class="page" page-orientation="landscape" root-font-size="16px">
        <view class="top">
            <!-- <uni-icons type="left" size="30" class="top-left"/> -->
            <span
                class="iconfont icon-arrow-left top-left"
                @click="callback()"
            ></span>

            <picker
                mode="multiSelector"
                :value="[5, 0]"
                :range="multiArray"
                @change="pickerFn"
                v-if="!isCount"
            >
                <text class="top-btn">设置时间</text>
            </picker>
            <text class="top-btn" v-else @click="stopCount()">终止倒计时</text>
            <text class="top-btn" @click="isCloseAudio = !isCloseAudio"
                >{{ !isCloseAudio ? "关闭" : "打开" }}计时音效</text
            >
        </view>
        <view class="start-btn" @click="start()" v-show="!isCount">开始</view>
        <view class="count-down">
            <view class="minute">{{ I }}</view>
            <view
                class="split-string"
                :class="{
                    twinkle: isCount,
                }"
            />
            <view class="second">{{ S }}</view>
        </view>
    </page-meta>
</template>

<script lang="ts" setup>
import date from "date-php";
import { ref, onUnmounted } from "vue";
import { playSound } from "@/module/tools";

const callback = () =>
    uni.navigateBack({
        delta: 1, // 返回的页面数，如果需要返回上一页，delta 设为 1
        success: function () {
            // 成功返回上一页之后，通过事件通信触发上一页的刷新方法
            uni.$emit("refreshData");
        },
    });
// const selTime = ref(0)
const multiArray = [
    [
        "--",
        "1分",
        "2分",
        "3分",
        "4分",
        "5分",
        "6分",
        "7分",
        "8分",
        "9分",
        "10分",
        "11分",
        "12分",
        "13分",
        "14分",
        "15分",
        "16分",
        "17分",
        "18分",
        "19分",
        "20分",
        "21分",
        "22分",
        "23分",
        "24分",
        "25分",
        "26分",
        "27分",
        "28分",
        "29分",
        "30分",
        "31分",
        "32分",
        "33分",
        "34分",
        "35分",
        "36分",
        "37分",
        "38分",
        "39分",
        "40分",
        "41分",
        "42分",
        "43分",
        "44分",
        "45分",
        "46分",
        "47分",
        "48分",
        "49分",
        "50分",
        "51分",
        "52分",
        "53分",
        "54分",
        "55分",
        "56分",
        "57分",
        "58分",
        "59分",
    ],
    ["--", "10秒", "20秒", "30秒", "40秒", "50秒"],
    // [
    //     "--",
    //     "1秒",
    //     "2秒",
    //     "3秒",
    //     "4秒",
    //     "5秒",
    //     "6秒",
    //     "7秒",
    //     "8秒",
    //     "9秒",
    //     "10秒",
    //     "11秒",
    //     "12秒",
    //     "13秒",
    //     "14秒",
    //     "15秒",
    //     "16秒",
    //     "17秒",
    //     "18秒",
    //     "19秒",
    //     "20秒",
    //     "21秒",
    //     "22秒",
    //     "23秒",
    //     "24秒",
    //     "25秒",
    //     "26秒",
    //     "27秒",
    //     "28秒",
    //     "29秒",
    //     "30秒",
    //     "31秒",
    //     "32秒",
    //     "33秒",
    //     "34秒",
    //     "35秒",
    //     "36秒",
    //     "37秒",
    //     "38秒",
    //     "39秒",
    //     "40秒",
    //     "41秒",
    //     "42秒",
    //     "43秒",
    //     "44秒",
    //     "45秒",
    //     "46秒",
    //     "47秒",
    //     "48秒",
    //     "49秒",
    //     "50秒",
    //     "51秒",
    //     "52秒",
    //     "53秒",
    //     "54秒",
    //     "55秒",
    //     "56秒",
    //     "57秒",
    //     "58秒",
    //     "59秒",
    // ],
];
// const audio = import.meta.globEager("../../../assets/count-time/*.mp3");
import audioCountTime from "@/assets/count-time/count-time.mp3";

const getTime = (time) => date.countTime("all", time);
const countTime = ref(0);
const I = ref("00");
const S = ref("00");
const isCount = ref(false);
const getCountTime = () => {
    const { i, s } = getTime(countTime.value);
    I.value = i;
    S.value = s;
};

let st = null;
const isCloseAudio = ref(false);

const stopCount = (isPlaySound = false) => {
    clearInterval(st);

    uni.setKeepScreenOn({
        keepScreenOn: false,
    });
    isCount.value = false;
    countTime.value = nextTime.value;
    getCountTime();

    if (isPlaySound) {
        playSound({
            src: audioCountTime,
            volume: 6,
            areaTime: [2, 2000],
            loop: false,
        });
    }
};
const startCountDown = () => {
    uni.setKeepScreenOn({
        keepScreenOn: true,
    });
    st = setInterval(() => {
        getCountTime();
        if (countTime.value > 0) {
            countTime.value -= 1000;
            if (!isCloseAudio.value) {
                playSound({
                    src: audioCountTime,
                    volume: countTime.value < 30000 ? 10 : 20,
                    areaTime: countTime.value < 10000 ? [1, 1000] : [0, 1000],
                    loop: false,
                });
            }
        } else {
            stopCount(true);
            return;
        }
    }, 1000);
};

const nextTime = ref(0);
const pickerFn = ({
    detail: {
        value: [i, s],
    },
}) => {
    nextTime.value = (i * 60 + s * 10) * 1000;
    countTime.value = nextTime.value;
    getCountTime();
};

const start = (time) => {
    if (isCount.value) return;
    if (!countTime.value) return;
    isCount.value = true;
    startCountDown();
};
onUnmounted(() => {
    stopCount();
});
</script>

<style lang="less" scoped>
.page {
    display: flex !important;
    flex-direction: column;
    background-color: #000;
    width: 100%;
    color: #fff;
    font-family: 微软雅黑;
}
.top {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    .top-btn {
        padding: 0.5em 1em;
        background-color: #fff2;
        border-radius: 5rpx;
        color: #fff3;
        margin: 5rpx 5rpx;
    }
    .top-left {
        width: 2em;
        line-height: 2.5em;
        // background-color: #fff2;
        margin-right: 0.25em;
        text-align: center;
        color: #fff;
    }
    // .close-audio {
    //     position: fixed;
    //     left: 8.5em;
    //     top: 0.5em;
    //     padding: 0.5em 1em;
    //     background-color: #fff2;
    //     border-radius: 5rpx;
    //     color: #fff3;
    // }
}
.start-btn {
    padding: 0.5em 0.8em;
    font-size: 11vh;
    color: #fffc;
    background-color: #e42121f0;
    border: 3rpx solid #fff6;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 0.25em;
}
.minute,
.second,
.split-string {
    // height: 100%;
}
.count-down {
    width: 100%;
    height: 100%;
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-evenly;
    font-size: 65vh;
    // font-weight: 500;
    .split-string {
        // position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        // height: 60%;
        margin: 20rpx;
        &::before,
        &::after {
            content: "";
            display: block;
            // position: absolute;
            width: 32rpx;
            height: 32rpx;
            margin: 6vh 0;
            border-radius: 50%;
            background-color: #fff;
        }
        &.twinkle {
            animation: twinkle 1s infinite;
        }
        @-webkit-keyframes twinkle {
            0% {
                opacity: 0;
            }
            75%,
            100% {
                opacity: 1;
            }
        }
        @keyframes twinkle {
            0% {
                opacity: 0;
            }
            75%,
            100% {
                opacity: 1;
            }
        }
    }
}
.setup-time {
    position: fixed;
    left: 4em;
    right: 4em;
    top: 4em;
    bottom: 4em;
    background-color: #eeeeeef9;
    border: 5rpx solid #999;
    border-radius: 15rpx;
}
</style>
