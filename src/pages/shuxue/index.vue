<template>
    <view class="content">
        <div class="top">
            <div class="top-left">日期: {{ date('Y-m-d') }}</div>
            <div class="top-right">用时: {{ startTimed }}</div>
        </div>
        <div class="list">
            <div class="list-item" v-for="(v, i) in numlist" @click="ckItem(i)" :class="{
                'cur-item': i === curidx && submited === 0,
                right: v[4] === 1,
                wrong: v[4] === 0 && !['', undefined].includes(v[3]),
            }">
                <div class="edited" v-if="v[5] > 0">{{ v[5] }}</div>
                <div class="wait-edited" v-if="v[4] === 0 && !v[5]"></div>
                <!-- <div class="list-item-idx">{{i+1}}.</div> -->
                {{
                    `${v[0]} ${["+", "-"][v[2]]} ${v[1]} = ${curidx !== undefined && numlist[i][3] !== undefined
                        ? numlist[i][3]
                        : ""
                        }`
                }}
            </div>
        </div>
        <div class="footer" v-show="curidx !== undefined"
            v-if="submited === 0 && curidx !== '' || submited === 1 || setSystemStatus" :class="{
                dsb:
                    curidx &&
                    (numlist[curidx][3] === undefined ? '' : numlist[curidx][3] + '')
                        .length > 2,
            }">
            <div class="pan" :class="{ dsb: numlist[curidx][4] === 1 }" v-if="submited === 0 && curidx !== ''">
                <div class="pan-item" v-for="i in 9" @click="keyNum(i)">
                    {{ i }}
                </div>
                <div class="pan-item" @click="keyNum(0)">
                    0
                </div>
                <div class="pan-footer">
                    <div class="pan-item pan-enter" @click="subEnter()">查看得分</div>
                    <div class="pan-item pan-set">
                        <div class="pan-set-btn" @click="setSystemStatusFn(true)"></div>
                    </div>
                    <div class="pan-item pan-del" @click="keyNum('del')">⇐</div>
                </div>
            </div>
            <div class="fen" v-if="submited === 1">
                <div class="fen-title">
                    <div class="fen-title-left">宝贝你的得分</div>
                    <div class="fen-title-right">题量: {{ totalNum }}</div>
                </div>
                <div class="score">{{ score }}</div>
                <div class="comment">{{ comment }}</div>
                <div class="fen-btns">
                    <div class="fen-item fen-edit" @click="edit()" :class="{ dsb: score === 100 }">去订正</div>
                    <div class="pan-item pan-set">
                        <div class="pan-set-btn" @click="setSystemStatusFn(true)"></div>
                    </div>
                    <div class="fen-item fen-new" @click="createList()">做新题</div>
                </div>
            </div>
            <div class="set-sys" v-if="setSystemStatus">
                <div class="set-sys-title">
                    <div class="set-sys-title-left">设置</div>
                    <div class="set-sys-title-right">
                        <div class="rest-default" @click="setNumDefault">恢复默认</div>
                    </div>
                </div>
                <div class="set-sys-bd">
                    <div class="set-sys-db-list">
                        <div class="set-sys-db-list-left">题量：</div>
                        <div class="set-sys-db-list-right">
                            <hao-slider :step="10" :sliderHeight="4" sliderLeftColor="#55a4f3" :min="10" :value="setNum"
                                @change="setNumChange" />
                        </div>
                    </div>
                    <div class="btns">
                        <div class="set-btn set-btn-submit" @click="setNumSubmit()">确定题量</div>
                        <div class="set-btn set-btn-clean" @click="setSystemStatusFn(false)">取消设置</div>
                    </div>

                </div>
            </div>
        </div>
    </view>
</template>

<script setup>
import { onMounted, ref, reactive, watch } from "vue";
import { random } from "../../module/tools";
import date from 'date-php'
import haoSlider from "../../uni_modules/hao-slider/hao-slider.vue"
import { onReady, onShow, onHide } from '@dcloudio/uni-app'

const numlist = reactive([]); // 数据列表:[[数字1,数字2, 运算符, 用户运算结果, 结果对错判定, 订正次数], ...]
const submited = ref(0); // 是否提交
const score = ref(0); // 得分
const comment = ref(""); // 评语
const curidx = ref(); // 当前所计算的索引数据
// const edited = ref(0); // 订正次数
const startTime = ref(0) // 开始时间
const startTimed = ref('') // 已用时
const subEnterTime = ref('') // 提交时间
const contTimeId = ref() // 计时定时器 ID
const lTotalNum = uni.getStorageSync('totalNum') || 50; // 缓存读取
const totalNum = ref(lTotalNum) // 题量
const setNum = ref(totalNum.value); // 设置滑块题量
const setSystemStatus = ref(false) // 设置框显隐

// onShow(()=>{
//     debugger
//     startTime.value = startTime.value + ((Date.now() - subEnterTime.value).toString().replace(/\d{3}$/, '000') - 0 + 1000)
// })
// onHide(()=>{
//     subEnterTime.value = Date.now()
// })
// #ifdef MP-WEIXIN
uni.showShareMenu({
    title: '四小二(8)班',
    content: '二年级数学100以内加减法',
    imageUrl: '/assets/icon.jpeg',
    path: '/pages/shuxue/index'
});
//#endif
// 生成数据列表
function createList() {
    numlist.length = 0;
    score.value = 0
    for (let i = 0; i < totalNum.value; i++) {
        const numArr = [random(8, "1-90") - 0, random(8, "1-90") - 0]; // 两数字生成
        const notation = Math.random() > 0.5 ? 1 : 0; // 运算符 0:+, 1:-
        if (notation === 1 && numArr[0] < numArr[1]) numArr.reverse(); // 运算符是- 且 数1 < 数2 会调换两数位置(二年级还没有学负数)
        if (notation === 0 && numArr[0] + numArr[1] > 100) { // 100以内加减法和不能超过100, 重新生成大数数值
            const bigValIdx = numArr[0] > numArr[1] ? 0 : 1
            numArr[bigValIdx] = random(8, `1-${100 - numArr[bigValIdx]}`) - 0
        }
        numlist.push(numArr.concat(notation, undefined, undefined, undefined));
    }
    edit(true);
    curidx.value = "";
    // edited.value = 0;
    startTime.value = Date.now()
    contTime()
}
createList();

/**
 * 计时操作
 * @param {boolean} isStop true: 何止计时, false: 开始计时
 */
function contTime(isStop = false) {
    if (isStop) {
        clearInterval(contTimeId.value)
        contTimeId.value = ''
    } else {
        contTimeId.value = contTimeId.value || setInterval(() => {
            const diff = Date.now() - startTime.value
            const _diff = {
                h: date.duration("H", diff),
                i: date.duration("i", diff),
                s: date.duration("s", diff)
            }
            const _tpl = []

            if (_diff.h - 0 > 0) _tpl.push('H小时')
            if (_diff.i - 0 > 0) _tpl.push('i分钟')
            if (_diff.s - 0 > 0) _tpl.push('s秒')

            startTimed.value = date.duration(_tpl.join(''), diff)
        }, 1000)
    }
}

// 订正事件
function edit() {
    if (score.value === 100) return
    submited.value = 0;
    curidx.value = "";
    startTime.value = startTime.value + ((Date.now() - subEnterTime.value).toString().replace(/\d{3}$/, '000') - 0 + 1000)
    contTime()
}

/**
 * 选择的索引(正在计算的加减法)
 * @param {number} idx // 索引号
 */
const ckItem = (idx) => {
    curidx.value = idx;
    if (numlist[idx][4] === 0 && submited.value !== 1) numlist[idx][4] = ''
};

/**
 * 数字键盘点击事件
 * @param {string|number} key // 键盘数字 || 或del
 */
const keyNum = (key) => {
    const _val = (numlist[curidx.value][3] || "") + '';
    numlist[curidx.value][3] = key === "del"
        // 删除事件
        ? numlist[curidx.value][4] !== 1
            ? _val.substring(0, _val.length - 1)
            : _val
        // 数字输入事件(最大3位数)
        : numlist[curidx.value][4] !== 1 && _val.length < 3
            ? _val + key - 0
            : _val - 0;
};

// 查看得分事件
const subEnter = () => {
    subEnterTime.value = Date.now()
    // 锁定提交状态
    submited.value = 1;
    contTime(true)

    // 对错判定
    numlist.map((res) => {
        const _val = res[2] === 0 ? res[0] + res[1] : res[0] - res[1];
        if (res[4] === '' && !['', undefined].includes(res[3])) res[5] = res[5] ? res[5] + 1 : 1 // 订正次数
        if (!['', undefined].includes(res[3])) res[4] = _val === res[3] ? 1 : 0; // 1对,0错

    });

    const totleLen = numlist.length; // 总题数
    const rightLen = numlist.filter((res) => res[4] === 1).length; // 正确题数量
    score.value = Math.floor((100 * rightLen) / totleLen); // 得分计算

    // 评语数组
    const commentArr = [
        "很棒呦，不要骄傲，继续保持吧 Y(^_^)Y",
        "哎呀！就差一点点，下次要细心哟(｡･ω･｡)ﾉ♡",
        "还不错哟，加油，再接再厉(ง •̀_•́)ง",
        "再努力一下，会有好成绩的。(づ ●─● )づ",
        "好好学习，天天向上(*_*)",
        "不要偷懒哦~~ 你一半都还没做完呢。(T_T)",
    ];

    // 评语等级
    switch (true) {
        case score.value > 99:
            comment.value = commentArr[0];
            break;
        case score.value > 89:
            comment.value = commentArr[1];
            break;
        case score.value > 79:
            comment.value = commentArr[2];
            break;
        case score.value > 69:
            comment.value = commentArr[3];
            break;
        default:
            comment.value = commentArr[4];
    }

    // 没有做满50%题不给评语
    const fillLen = numlist.filter((res) => res[3]).length;
    if (totleLen * 0.5 > fillLen) comment.value = commentArr[5];
};

// 设置窗口显隐
const setSystemStatusFn = (val = false) => {
    setSystemStatus.value = val
}

// 滑块数量设置
function setNumFn(num, isSaveLocalstrage = false) {
    setNum.value = num
    if (isSaveLocalstrage) uni.setStorageSync('totalNum', num)
}

// 恢复默认
const setNumDefault = () => {
    setNumFn(50)
}
// 确定题量
const setNumSubmit = val => {
    setNumFn(setNum.value, true)
    totalNum.value = setNum.value
    setSystemStatusFn(false)
    createList()
}
// 滑块更新
const setNumChange = val => {
    setNumFn(Math.round(val / 10) * 10)
}
</script>

<style lang="less">
.content {
    height: 100%;
    display: flex;
    flex-direction: column;

    .top {
        font-size: 26rpx;
        padding: 0 1em;
        color: #666;
        // background-color: #f9f9f9;
        background-color: #e9e9e9;
        display: flex;
        justify-content: space-between;
        line-height: 1.5em;

        .top-left {}

        .top-right {}
    }

    //   height: 100vh;
    .list {
        display: flex;
        align-content: flex-start;
        flex: 1;
        overflow: auto;
        flex-wrap: wrap;
        padding: 0.25em 0;

        .list-item {
            border-bottom: 1px solid #ccc;
            font-size: 32rpx;
            line-height: 2.95em;
            width: 42%;
            margin: 0 auto;
            padding: 0 .6em;
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            text-align: center;
            color: #333;

            .list-item-idx {
                background-color: #f6f6f6;
                border: 1px solid #ececec;
                border-radius: 5rpx;
                color: #ccc;
                padding: 0 .3em;
                width: 2.3em;
                line-height: 1.5em;
                margin-right: .35em;
                font-size: 18rpx;

            }

            .edited,
            .wait-edited {
                font-size: 16rpx;
                line-height: 1em;
                padding: 6rpx 1.25em 6rpx .75em;
                // opacity: .8;
                text-align: center;
                position: absolute;
                left: 0;
                top: 0;
                border-radius: 0 0 16rpx 0;
            }

            .edited {

                background-color: #ececec;
                color: #c3c3c3;

                &::before {
                    content: '已订正：'
                }

                &::after {
                    content: ' 次'
                }
            }

            .wait-edited {
                background-color: #ed5d46;
                color: #f0f0f0;

                &::before {
                    content: '尚未订正'
                }
            }

            &.right,
            &.wrong {
                position: relative;

                &:before {
                    content: "";
                    background: center/cover no-repeat;
                    position: absolute;
                    top: 50%;
                    left: 40%;
                    opacity: 0.816;
                }

                &.right:before {
                    background-image: url("../../assets/right.svg");
                    width: 4em;
                    height: 4em;
                    margin-top: -2em;
                }

                &.wrong:before {
                    background-image: url("../../assets/wrong.svg");
                    width: 2em;
                    height: 2em;
                    margin-top: -1em;
                }
            }

            // &.cur-item:not(.right) {
            &.cur-item {
                box-shadow: 0 0 0 4rpx #b6aafa;
                border-bottom: none;
                border-radius: 5rpx;

                &:after {
                    animation: guang-biao-shan-shuo 1.6s infinite;
                }

                &.right {
                    box-shadow: 0 0 0 4rpx #cfcfcf;

                    &:after {
                        animation: none;
                    }
                }
            }

            @keyframes guang-biao-shan-shuo {
                45% {
                    opacity: 0;
                }

                60%,
                70% {
                    opacity: 1;
                }

                85% {
                    opacity: 0;
                }
            }

            &:after {
                content: "";
                display: inline-block;
                width: 0.5em;
                border-bottom: 5rpx #ccc solid;
                margin-bottom: -1.125em;
                opacity: 0;
            }
        }
    }

    .footer {
        box-shadow: 0 0 15px #ececec;
        padding: 0.5em 0;
        position: relative;

        .pan {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-evenly;

            &.dsb {
                .pan-item:not(.pan-enter) {
                    background-color: #f6f6f6;
                    color: #ccc;
                }
            }
        }

        .pan-item,
        .fen-item {
            margin: 6rpx 0;
            line-height: 2em;
            text-align: center;
            box-shadow: 0 0 0 1rpx #cfcfcf;
            background-color: #f0f0f0;
            border-radius: 5rpx;
            color: #666;

            &.pan-enter,
            &.pan-del,
            &.fen-new,
            &.fen-edit {
                // width: 36%;
                color: #fcfcfc;
                box-shadow: none;
                flex: 1;

            }

            &.pan-del,
            &.fen-new {
                background-color: #ed5d46;
            }

            &.pan-enter,
            &.fen-edit {
                background-color: #2ce02c;

                &.dsb {
                    background-color: #e6e6e6;
                    color: #999;
                }
            }

            &:active {
                opacity: 0.618;
            }
        }

        .pan-item {
            width: 30%;
        }

        .fen-item {
            width: 16%;
        }

        .pan-footer {
            width: 96%;
            display: flex;
        }

        .pan-set {
            border: none;
            background: none;
            border: none;
            box-shadow: none;
            display: flex;
            flex: 1;
            // width: auto;
            justify-content: center;
            align-items: center;
        }

        .pan-set-btn {
            background: url(../../assets/set.png) center/cover no-repeat;
            width: 1.5em;
            height: 1.5em;
        }

        .fen {
            .fen-title {
                // background-color: #ececec;
                background-image: linear-gradient(180deg, #e0e0e0, #fcfcfc);
                color: #333;
                margin-top: -0.5em;
                line-height: 2.2em;
                padding: 0 1em;
                display: flex;
                justify-content: space-between;

                .fen-title-right {
                    font-size: 22rpx;
                    color: #999
                }
            }

            .score {
                text-align: center;
                font-size: 62rpx;
                line-height: 1.25em;
                margin-top: 0.125em;
                color: #ed5d46;
                position: relative;

                &:after,
                &:before {
                    content: "";
                    // border: 1rpx solid #ed5d46;
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    // width: 3em;
                    height: .06em;
                    background-color: #ed5d46;
                }

                &:after {
                    margin-left: -0.816em;
                    width: 1.8em;
                    // bottom: 10rpx;
                    margin-top: .42em;
                    transform: rotate(-6deg);
                }

                &:before {
                    margin-left: -0.7em;
                    width: 2em;
                    // bottom: 5rpx;
                    margin-top: .5em;
                    transform: rotate(-5deg);
                }
            }

            .fen-btns {
                display: flex;
                flex-wrap: wrap;
                justify-content: space-evenly;
                width: 96%;
                margin: 0 auto;
                // .fen-item {
                //   width: 16%;
                //   margin: 1%;
                //   line-height: 2em;
                //   text-align: center;
                //   box-shadow: 0 0 0 1rpx #ccc;
                //   background-color: #f0f0f0;
                //   width: 33%;
                //   color: #fcfcfc;

                //   &.fen-new {
                //     background-color: #ed5d46;
                //   }
                //   &.fen-edit {
                //     background-color: #2ce02c;
                //   }
                // }
            }

            .comment {
                text-align: center;
                font-size: 28rpx;
                line-height: 1.8em;
                padding-bottom: 0.25em;
                color: #232323;
            }
        }

        .set-sys {
            position: absolute;
            top: 0;
            width: 100%;
            color: #333;
            background-color: #fff;
            display: flex;
            flex-direction: column;

            bottom: 0;

            .set-sys-title {
                // background-color: #ececec;
                background-image: linear-gradient(180deg, #e0e0e0, #fcfcfc);
                margin-top: -0.5em;
                line-height: 2.5em;
                padding: 0 1em;
                display: flex;
                justify-content: space-between;

                .set-sys-title-right {
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    .rest-default {
                        color: #999;
                        font-size: 26rpx;
                    }
                }
            }

            .set-sys-bd {
                display: flex;
                flex-direction: column;
                flex: 1;
                justify-content: center;
                align-items: center;
            }

            .set-sys-db-list {
                display: flex;
                align-items: center;
                width: 80%;

                .set-sys-db-list-left {
                    flex-shrink: 0;
                }

                .set-sys-db-list-right {
                    flex: 1;
                }
            }

            :deep(.hao-slider-block) {
                background-color: #55a4f3 !important;
                width: 2.2em !important;
                // padding: 0 8rpx;
                text-align: center;
                border-radius: 6rpx !important;
                height: 1.5em !important;
                line-height: 1.5em !important;
                left: -50%;
                font-size: 28rpx;
                color: #fff;
            }

            :deep(.hao-slider-currentValue) {
                // display: none;
                // background: none;
            }

            .btns {
                display: flex;
                margin-top: 1em;

                .set-btn {
                    padding: 8rpx 16rpx;
                    border-radius: 5rpx;
                    margin: 0 1em;
                    font-size: 28rpx;
                }

                .set-btn-submit {
                    background-color: #55a4f3;
                    color: #f0f0f0;
                }

                .set-btn-clean {
                    background-color: #e6e6e6;
                    color: #999;
                }
            }
        }
    }
}</style>
