<template>
    <page-meta class="page" page-orientation="landscape" root-font-size="16px">
        <view class="top">
            <!-- <uni-icons type="left" size="30" class="top-reback"/> -->
            <span
                class="iconfont icon-arrow-left top-reback"
                @click="callback()"
            ></span>

            <picker
                mode="multiSelector"
                :value="[5, 0]"
                :range="multiArray"
                @change="pickerFn"
                v-if="!isCountting"
            >
                <text class="top-btn">设置时间</text>
            </picker>
            <text class="top-btn" v-else @click="stopCount()">终止倒计时</text>
            <text class="top-label">禁用计时音效：</text>
            <zeroSwitch
                :size="18"
                v-model="isCloseAudio"
                inactiveColor="#333"
                activeColor="#9999"
                backgroundColorOn="#333"
                backgroundColorOff="#3333"
                borderColorOn="#666"
                borderColorOff="#333"
                showText
                textOn="✓"
                textOff=""
            />

            <uni-data-checkbox
                style="margin-left: .25em"
                multiple
                v-model="heartbeat"
                v-if="isCloseAudio"
                selectedColor="#999"
                selectedTextColor="#999"
                class="label-ckd"
                :localdata="[{ value: true, text: '保留最后10秒心跳声' }]"
            />
        </view>
        <view class="start-btn" @click="start()" v-if="!isCountting"
        :class="{
            'start-btn-time0': countTime===0
        }">
        开始
        </view>
        <view class="count-down">
            <view class="minute">{{ I }}</view>
            <view
                class="split-string"
                :class="{
                    twinkle: isCountting,
                }"
            />
            <view class="second">{{ S }}</view>
        </view>
    </page-meta>
</template>

<script lang="ts" setup>
import date from "date-php";
import { ref, onUnmounted, Ref } from "vue";
import { playSound } from "@/module/tools";
import zeroSwitch from "@/uni_modules/zero-switch/components/zero-switch";
import uniDataCheckbox from "@/uni_modules/uni-data-checkbox/uni-data-checkbox.vue";

// 监听返回事件
const callback = () =>
    uni.navigateBack({
        delta: 1, // 返回的页面数，如果需要返回上一页，delta 设为 1
        success: function () {
            uni.$emit("refreshData"); // 成功返回上一页之后，通过事件通信触发上一页的刷新方法
        },
    });

//生成时间数据
const multiArray = [];
multiArray.push(
    new Array(21)
        .fill("")
        .map((v, i) => (i === 0 ? "--" : `${i > 10 ? (i % 10) * 5 + 10 : i}分`))
);
multiArray.push(
    new Array(12).fill("").map((v, i) => (i === 0 ? "--" : `${i * 5}秒`))
);

// 音效音频
import audioCountTime from "@/assets/count-time/count-time.mp3";

const getTime = (time) => date.countTime("all", time);
const countTime = ref(0); // 倒记时时间戳
const I = ref("00");
const S = ref("00");
const isCountting = ref(false); // 是否正在倒记时

// 计算计时分秒数据
const getCountTime = () => {
    const { i, s } = getTime(countTime.value);
    I.value = i;
    S.value = s;
};

let st = null; // 倒记时句柄 ID
const heartbeat: Ref = ref([true]); // 保留最后十秒心跳
const isCloseAudio = ref(false); // 是否关闭音效
const prevTime = ref(0); // 上次记时时间

/**
 * 停止倒记时方法
 * @param {boolean} isPlayStopSound 是否播放终止音效
 */
const stopCount = (isPlayStopSound = false) => {
    clearInterval(st);
    isCountting.value = false;

    uni.setKeepScreenOn({
        keepScreenOn: false, // 关闭屏幕常亮
    });

    countTime.value = prevTime.value;
    getCountTime();

    if (isPlayStopSound) {
        playSound({
            src: audioCountTime,
            volume: 6,
            areaTime: [2, 2000],
            loop: false,
        });
    }
};

// 时间选择器 change 事件
const pickerFn = ({
    detail: {
        value: [i, s],
    },
}) => {
    // prevTime.value = (i * 60 + s * 10) * 1000;
    // `${i>10 ? i%10*5+10 :i}分`

    prevTime.value = ((i > 10 ? (i % 10) * 5 + 10 : i) * 60 + s * 5) * 1000;
    countTime.value = prevTime.value;
    getCountTime();
};

// 开始倒记时按钮事件
const start = () => {
    if (isCountting.value) return;
    if (!countTime.value) return;
    isCountting.value = true;
    uni.setKeepScreenOn({
        keepScreenOn: true, // 屏幕常亮
    });
    st = setInterval(() => {
        getCountTime();
        if (countTime.value > 0) {
            countTime.value -= 1000;
            playSound({
                src: audioCountTime,
                volume: isCloseAudio.value
                    ? countTime.value < 10000
                        ? heartbeat.value[0]
                          ? 20 
                          : 0
                        : 0
                    : countTime.value < 30000
                        ? 20
                        : 5,
                areaTime: countTime.value < 10000 ? [1, 1000] : [0, 1000],
                loop: false,
            });
        } else {
            stopCount(true);
            return;
        }
    }, 1000);
};

onUnmounted(() => {
    stopCount(); //  页面卸载停止记时
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
    .top-label {
        // width: 2.5em;
        margin-left: 1em;
        line-height: 2.5em;
        // background-color: #fff2;
        margin-right: 0.25em;
        text-align: center;
        color: var(--c-safegray-darker);
    }
    .top-reback {
        width: 2.5em;
        line-height: 2.5em;
        // background-color: #fff2;
        margin-right: 0.25em;
        text-align: center;
        color: #fff;
    }
    .top-ckd {
        margin-left: 1em;
    }
    ::v-deep .checkbox__inner {
        background-color: transparent !important;
        border-color: #666 !important;
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
    display: flex;
    flex-direction: column;
    text-align: center;
    &.start-btn-time0{

        background-color: #666666f0;
        &:after{
            content:'请设置时长';
            color: #e42121;
            font-size: 4vh;
        }
    }
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
