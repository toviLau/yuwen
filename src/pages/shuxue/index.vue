<!--
 * @Author       : ToviLau 46134256@qq.com
 * @Date         : 2023-09-29 02:25:21
 * @LastEditors  : ToviLau 46134256@qq.com
 * @LastEditTime : 2023-10-04 23:25:01
-->
<template>
    <view class="content">
        <div class="top">
            <div class="top-item">
                <div class="top-left">日期: {{ date('Y-m-d') }}</div>
                <div class="top-right">用时: {{ startTimed }}</div>
                <span class="top-audio">
                    <div class="iconfont icon-audio" :class="{ pause: bgmPause }" @click="bgmPause = !bgmPause"></div>
                </span>
            </div>
        </div>
        <scroll-view :scroll-top="scrollTop" class="scroll-view" scroll-y="true">
            <div class="list">
                <div class="list-item" v-for="(v, i) in numList" :key="i" @click="ckItem(i)">
                    <div class="list-item-li" :class="{
                        'cur-item': !setConfig.status && i === curidx && submited === 0,
                        cursor1: cursorType === false,
                        cursor2: cursorType === true,
                        right: v[2] === 1,
                        wrong: v[2] === 0 && !['', undefined].includes(v[1]),
                    }">

                        <div class="edited" v-if="v[3] > 0">{{ v[3] }}</div>
                        <div class="wait-edited" v-if="v[2] === 0 && !v[3]"></div>
                        <div class="list-item-idx" v-if="showIdx">{{ i + 1 }}</div>
                        {{
                            renderExpression(v[0]) +
                            `${Array.isArray(v[0][3]) ? '≈' : '='}${curidx !== undefined && ![undefined, null].includes(v[1]) ?
                                v[1] : ""}`
                        }}
                        <div class="tip-wrong active-show" v-if="Array.isArray(v[0][3])">请用四舍五入法保留{{ v[0][3][1] }}位小数</div>

                        <div v-show="v[2] === 0">
                            <div class="tip-wrong">
                                {{
                                    v[1] - 0 === v[0][0] + v[0][1]
                                    ? '粗心了吧，是不是当成加(+)法算啦。'
                                    : v[1] - 0 === v[0][0] - v[0][1] + 10
                                        ? '忘记借位了吧？'
                                        : v[1] - 0 === v[0][0] - v[0][1]
                                            ? '这是加法哦，粗心当减(-)法算了么？'
                                            : v[1] - 0 === v[0][0] + v[0][1] - 10 && v[0][0] % 10 + v[0][1] % 10 > 9
                                                ? '忘记进位了吧?'
                                                : ''
                                }}
                            </div>
                        </div>
                    </div>
                    <div v-if="vertical" class="vertical" :class="{
                        plus: v[0][2] === 0,
                        minus: v[0][2] === 1
                    }">
                        <div class="vertical-li">
                            <div class="vertical-li-nums" v-for="vItem in v[0][0].toString().split('')">{{ vItem }}</div>
                        </div>
                        <div class="vertical-li">
                            <div class="vertical-li-nums" v-for="vItem in v[0][1].toString().split('')">{{ vItem }}</div>
                        </div>

                        <div class="vertical-li">
                            <div class="vertical-li-nums" v-for="vItem in (v[1] || '  ').toString().split('')">{{ vItem }}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="list-item list-item-none" v-for="i in 10" :key="i" />
            </div>
        </scroll-view>
        <div class="footer" v-show="curidx !== undefined"
            v-if="submited === 0 && curidx !== '' || submited === 1 || setConfig.status" :class="{
                dsb: curidx && (numList[curidx][1] === undefined ? '' : numList[curidx][1] + '').length > 2,
            }">
            <div class="pan" :class="{
                dsb: numList[curidx][2] === 1, easyKeyboard: !keyboard,
                'has-decimal': hasDecimal
            }" v-if="submited === 0 && curidx !== '' && !setConfig.status">
                <template v-for="item in keyboardCode" :key="item.idx">
                    <div class="pan-item" @click="keyClick(item.value)"
                        v-if="keyboard && item.fullKey || !keyboard && item.easyKey">
                        <div class="pan-item-container">{{ item.name }}</div>
                    </div>
                </template>

                <div class="pan-footer">
                    <div class="pan-item pan-enter" @click="subEnter()">查看得分</div>
                    <div class="pan-item pan-set">
                        <span class="iconfont icon-set pan-set-btn" @click="showConfig(true)"></span>
                    </div>
                    <div class="pan-item pan-del" @click="keyClick('del')">⇐</div>
                </div>
            </div>
            <div class="fen" v-if="submited === 1 && !setConfig.status">
                <div class="fen-title">
                    <div class="fen-title-left">宝贝你的得分</div>
                    <div class="fen-title-right">题目数量: {{ totalNum }}</div>
                </div>
                <div class="score">{{ score }}</div>
                <div class="comment">{{ comment }}</div>
                <div class="fen-btns">
                    <div class="fen-item fen-edit"
                        @click="[edit(), playSound({ src: musicArr['dian2_mp3'], volume: setConfig.bgmVolume / 2 })]"
                        :class="{ dsb: score === 100 }">去订正</div>
                    <div class="pan-item pan-set">
                        <span class="iconfont icon-set pan-set-btn" @click="showConfig(true)"></span>
                    </div>
                    <div class="fen-item fen-new"
                        @click="[createList(true), playSound({ src: musicArr['dian2_mp3'], volume: setConfig.bgmVolume / 2 })]">
                        做新题
                    </div>
                </div>
            </div>
            <div class="set-sys" v-if="setConfig.status">
                <div class="set-sys-title">
                    <div class="set-sys-title-left">设置</div>
                    <div class="set-sys-title-right">
                        <div class="rest-default" @click="setNumDefault">恢复默认</div>
                    </div>
                </div>
                <div class="set-sys-bd">
                    <div class="set-sys-db-list">
                        <div class="set-sys-histroy">
                            <div class="set-sys-btn" @click="historyList()">
                                <span class="iconfont icon-history"></span>
                                <span>历史记录</span>
                            </div>
                        </div>
                        <div class="set-sys-record">
                            <div class="set-sys-btn" @click="recordRead()">
                                <span class="iconfont icon-read"></span>
                                <span>读档</span>
                            </div>
                            <div class="set-sys-btn" @click="recordSave()">
                                <span class="iconfont icon-save"></span>
                                <span>存档</span>
                            </div>
                            <!-- <div class="set-sys-rceord-item">
                            </div> -->
                        </div>
                    </div>
                    <div class="set-sys-db-list">
                        <div class="set-sys-db-list-left">题目数量：</div>
                        <div class="set-sys-db-list-right">
                            <hao-slider :step="10" :sliderHeight="4" sliderLeftColor="#55a4f3" :min="10"
                                :value="setConfig.totalNum" @change="setNumChange" class="set-slider" />
                        </div>
                    </div>
                    <div class="set-sys-db-list">
                        <div class="set-sys-db-list-left">运算规则：</div>
                        <div class="set-sys-db-list-right">
                            <div class="set-sys-switch">
                                <div class="set-sys-switch-item set-sys-switch-l" :class="{ cur: !setConfig.opType }">加减运算
                                </div>
                                <div class="set-sys-switch-item set-sys-switch-c">
                                    <zeroSwitch :size="18" v-model="setConfig.opType" inactiveColor="#fcfcfc"
                                        activeColor="#fcfcfc" backgroundColorOn="#55a4f3" backgroundColorOff="#55a4f3"
                                        @change="opTypeChange" />
                                </div>
                                <div class="set-sys-switch-item set-sys-switch-r" :class="{ cur: setConfig.opType }">四则运算
                                </div>
                            </div>
                            <div class="label">
                                <uni-data-checkbox multiple v-model="setConfig.isMixed" selectedColor="#55a4f3"
                                    class="label-ckd" :localdata="[{ 'value': 1, 'text': '混合' }]"
                                    @change="mixedChange"></uni-data-checkbox>
                            </div>
                        </div>
                    </div>
                    <div class="set-sys-db-list" vif="setConfig.opType">
                        <div class="set-sys-db-list-left">难易度：</div>
                        <div class="set-sys-db-list-right">
                            <div class="set-sys-switch">
                                <div class="set-sys-switch-item set-sys-switch-l" :class="{ cur: !setConfig.difficulty }">
                                    {{ setConfig.opType ? '简单' : '20以内' }}
                                </div>
                                <div class="set-sys-switch-item set-sys-switch-c">
                                    <zeroSwitch :size="18" v-model="setConfig.difficulty" inactiveColor="#fcfcfc"
                                        activeColor="#fcfcfc" backgroundColorOn="#55a4f3" backgroundColorOff="#55a4f3" />
                                </div>
                                <div class="set-sys-switch-item set-sys-switch-r" :class="{ cur: setConfig.difficulty }">
                                    {{ setConfig.opType ? '困难' : '100以内' }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- <div class="set-sys-db-list" v-if="!setConfig.opType">
                        <div class="set-sys-db-list-left">难易度：</div>
                        <div class="set-sys-db-list-right">
                            <div class="set-sys-switch">
                                <div class="set-sys-switch-item set-sys-switch-l" :class="{ cur: !setConfig.difficulty }">20以内
                                </div>
                                <div class="set-sys-switch-item set-sys-switch-c">
                                    <zeroSwitch :size="18" v-model="setConfig.difficulty" inactiveColor="#fcfcfc"
                                        activeColor="#fcfcfc" backgroundColorOn="#55a4f3" backgroundColorOff="#55a4f3" />
                                </div>
                                <div class="set-sys-switch-item set-sys-switch-r" :class="{ cur: setConfig.difficulty }">100以内
                                </div>
                            </div>
                        </div>
                    </div> -->
                    <!-- <div class="set-sys-db-list" vif="!setConfig.opType">
                        <div class="set-sys-db-list-left">开启竖式：</div>
                        <div class="set-sys-db-list-right">
                            <div class="set-sys-switch">
                                <div class="set-sys-switch-item set-sys-switch-c">
                                    <zeroSwitch :size="18" v-model="setConfig.vertical" inactiveColor="#fcfcfc"
                                        activeColor="#fcfcfc" backgroundColorOn="#55a4f3" backgroundColorOff="#cfcfcf"
                                        @change="verticalChange" />
                                </div>
                            </div>
                        </div>
                    </div> -->
                    <div class="set-sys-db-list">
                        <div class="set-sys-db-list-left">启用小数：</div>
                        <div class="set-sys-db-list-right">
                            <div class="lv2 has-next">
                                <div class="set-sys-switch">
                                    <zeroSwitch :size="18" v-model="setConfig.hasDecimal" inactiveColor="#fcfcfc"
                                        activeColor="#fcfcfc" backgroundColorOn="#55a4f3" backgroundColorOff="#cfcfcf" />
                                </div>
                                <div class="lv2-next" v-if="setConfig.hasDecimal">
                                    <div class="lv2-label">最多有效位数:</div>
                                    <hao-slider :step="1" :sliderHeight="4" sliderLeftColor="#55a4f3" :min="1" :max="3"
                                        :value="setConfig.decimalLen" @change="setDecimalLenChange" class="set-slider" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="divider-line">这是一条纯洁的分隔线</div>
                    <div class="set-sys-db-list">
                        <div class="set-sys-db-list-left">显示序号：</div>
                        <div class="set-sys-db-list-right">
                            <div class="set-sys-switch">
                                <div class="set-sys-switch-item set-sys-switch-c">
                                    <zeroSwitch :size="18" v-model="setConfig.showIdx" inactiveColor="#fcfcfc"
                                        activeColor="#fcfcfc" backgroundColorOn="#55a4f3" backgroundColorOff="#cfcfcf" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="set-sys-db-list">
                        <div class="set-sys-db-list-left">键盘布局：</div>
                        <div class="set-sys-db-list-right">
                            <div class="set-sys-switch">
                                <div class="set-sys-switch-item set-sys-switch-l" :class="{ cur: !setConfig.keyboard }">简约
                                </div>
                                <div class="set-sys-switch-item set-sys-switch-c">
                                    <zeroSwitch :size="18" v-model="setConfig.keyboard" inactiveColor="#fcfcfc"
                                        activeColor="#fcfcfc" backgroundColorOn="#55a4f3" backgroundColorOff="#55a4f3" />
                                </div>
                                <div class="set-sys-switch-item set-sys-switch-r" :class="{ cur: setConfig.keyboard }">九宫格
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="set-sys-db-list">
                        <div class="set-sys-db-list-left">光标提示符：</div>
                        <div class="set-sys-db-list-right">
                            <div class="set-sys-switch">
                                <div class="set-sys-switch-item set-sys-switch-l" :class="{ cur: !setConfig.cursorType }">
                                    {{ `下划线 _` }}
                                </div>
                                <div class="set-sys-switch-item set-sys-switch-c">

                                    <zeroSwitch :size="18" v-model="setConfig.cursorType" inactiveColor="#fcfcfc"
                                        activeColor="#fcfcfc" backgroundColorOn="#55a4f3" backgroundColorOff="#55a4f3" />
                                </div>
                                <div class="set-sys-switch-item set-sys-switch-r" :class="{ cur: setConfig.cursorType }">
                                    {{ `竖线 |` }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="set-sys-db-list">
                        <div class="set-sys-db-list-left">背景音量：</div>
                        <div class="set-sys-db-list-right">
                            <hao-slider :step="1" :sliderHeight="4" sliderLeftColor="#55a4f3" :min="0"
                                :value="setConfig.bgmVolume" :max="20" @change="bgmVolumeChange" class="set-slider" />
                        </div>
                    </div>
                    <div class="declare divider-line">
                        <div>
                            <div>个人版非商用，不采集个人信息。所有数据仅存储在本地</div>
                            <div>如果清除微信缓存,您保存的所有数据就会丢失</div>
                        </div>
                    </div>
                    <div class="btns">
                        <div class="set-btn set-btn-submit" @click="saveConfig()">保存</div>
                        <div class="set-btn set-btn-clean" @click="cleanConfig()">取消</div>
                    </div>
                </div>
            </div>
        </div>
    </view>
    <cc-popup :isShow='popupConf.status' width="calc(100vw - 70px)" height="auto" radius="16rpx">
        <div class="popup-dialog">
            <div class="popup-dialog-content">
                <div class="popup-dialog-msg">{{ popupConf[popupConf.curKey].msg }}</div>
            </div>
            <div class="popup-dialog-footer">
                <div class="popup-dialog-footer-item clean" vif="popupConf[popupConf.curKey].curKey==="
                    @click="popupConf[popupConf.curKey].fn.clean">取消</div>
                <div class="popup-dialog-footer-item submit" vif="popupConf[popupConf.curKey].fn.submit" :class="{
                    danger: popupConf[popupConf.curKey].isDanger
                }" @click="popupConf[popupConf.curKey].fn.submit">确定</div>
            </div>
        </div>
    </cc-popup>
    <cc-popup :isShow='historyConf.status' width="100vw" height="auto" radius="16rpx" :opacity="0.65" bgcolor="transparent">
        <div class="history-dialog">
            <span class="iconfont icon-wrong history-dialog-close" @click="historyConf.status = false"></span>
            <span class="iconfont icon-clean history-dialog-clean" @click="historyClean()">清除所有历史</span>
            <div class="history-title">历史成绩</div>
            <div class="history-tab">
                <div class="history-th">
                    <div class="history-td">开始时间</div>
                    <div class="history-td">提交时间</div>
                    <div class="history-td">用时</div>
                    <div class="history-td">题目数量</div>
                    <div class="history-td">得分</div>
                    <div class="history-td">订正次数</div>
                </div>
                <div class="history-tr" v-for="item in historyConf.list" v-if="historyConf.list.length > 0">
                    <div class="history-td">{{ date('Y-m-d H:i:s', item.startTime) }}</div>
                    <div class="history-td">{{ date('Y-m-d H:i:s', item.endTime) }}</div>
                    <div class="history-td">{{ date.duration('H:i:s', item.endTime - item.startTime) }}</div>
                    <div class="history-td">{{ item.totalNum }}</div>
                    <div class="history-td">{{ item.score }}</div>
                    <div class="history-td">{{ item.revision }}</div>
                    <div class="history-td">题目设置: {{ item.config }}</div>
                    <div class="history-td">
                        <span class="iconfont icon-delete" @click="deleteHistory(item.id)"></span>
                    </div>
                </div>
                <div class="history-tr" v-else>
                    <div class="history-td history-none">暂无历史</div>
                </div>
            </div>
            <div class="history-tips">最多只保留最近10条历史记录</div>
        </div>
    </cc-popup>
    <!-- <cc-popup :isShow='!true' width="calc(100vw - 70px)" height="auto" radius="16rpx">
        <div class="popup-dialog">
            <div class="popup-dialog-content">
                <div class="popup-dialog-msg">检测到您当前有一份存档记录，“确定”后将覆盖当前记录。</div>
            </div>
            <div class="popup-dialog-footer">
                <div class="popup-dialog-footer-item clean">取消</div>
                <div class="popup-dialog-footer-item submit">确定</div>
            </div>
        </div>
    </cc-popup> -->
</template>

<script setup>
import { onMounted, ref, reactive, watch } from "vue";
import {
    random,
    mergeData,
    playSound,
    expressionResult,
    createKeyboardCode
} from "../../module/tools";
import date from 'date-php'
import Bignumber from 'BigNumber.js'
import haoSlider from "../../uni_modules/hao-slider/hao-slider.vue"
// import uniNavBar from "../../uni_modules/uni-nav-bar/uni-nav-bar.vue"
import zeroSwitch from "../../uni_modules/zero-switch/components/zero-switch"
import ccPopup from "../../uni_modules/cc-popup"
import { onReady, onShow, onHide, onUnload, onLoad } from '@dcloudio/uni-app'
import uniDataCheckbox from '../../uni_modules/uni-data-checkbox/uni-data-checkbox.vue'
const musics = import.meta.globEager('../../assets/music/*.mp3')
const musicArr = reactive({})
Object.keys(musics).forEach(key => {
    const _key = key.replace(/.+?([^\/\\]+)\.(\w+)$/g, '$1_$2')
    musicArr[_key] = musics[key].default
})

const numList = reactive([]); // 数据列表:[[[数字1 || [数字1,数字2, 运算符], 数字2 || [数字1,数字2, 运算符], 运算符], 用户运算结果, 结果对错判定, 订正次数], ...]
const submited = ref(0); // 是否提交
const score = ref(0); // 得分
const comment = ref(""); // 评语
const curidx = ref(); // 当前所计算的索引数据
const startTime = ref(0) // 开始时间
const startTimed = ref('') // 已用时
const subEnterTime = ref('') // 提交时间
const contTimeId = ref() // 计时定时器 ID
const bgmPause = ref(false)
const defaultConf = { // 默认配置
    showIdx: false, // 显示序号
    keyboard: true, // 键盘类型[false:简单, true:九宫格]
    bgmVolume: 10, // 背景音乐音量
    cursorType: false, // 光标类型 false:_, true:|
    difficulty: true, // 困难度
    totalNum: 50, // 题目数量
    opType: false, // 运算规则 0:+-,1:+-*/
    isMixed: false, // 是否混合运算
    hasDecimal: false, // 启用小数
    vertical: false, // 开启竖式
    decimalLen: 2, // 最大小数位
}
// 在读档弹窗
const popupConf = reactive({
    status: false,
    curKey: 'save',
    save: {
        msg: '检测到您当前有一份存档记录，“确定”后将覆盖当前记录。',
        isDanger: true,
        fn: {
            clean() {
                popupConf.status = false
            },
            submit() {
                popupConf.status = false
                uni.setStorageSync('record', numList)
                // setConfig.status=false
            },
        }
    },
    read: {
        msg: '您确定要读档么?此操作将会覆盖当前正在计算的结果。',
        isDanger: true,
        fn: {
            clean() {
                popupConf.status = false
            },
            submit() {
                Object.assign(numList, nulToUndef(uni.getStorageSync('record')))
                popupConf.status = false
                setTimeout(() => {
                    popupConf.status = true
                    popupConf.curKey = 'del'
                    setConfig.status = false
                }, 500)
            },
        }
    },
    del: {
        msg: '存档记录已读取，是否删除当前存档',
        isDanger: true,
        fn: {
            clean() {
                popupConf.status = false
            },
            submit() {
                popupConf.status = false
                uni.removeStorageSync('record')
            },
        }
    },
    recordUnll: {
        msg: '您还没有存档哦',
        isDanger: false,
        fn: {
            // clean() {
            //     popupConf.status = false
            // },
            submit() {
                popupConf.status = false
            },
        }
    },
    onLoad: {
        msg: '检测到您有一份存档，请问是否读取？',
        isDanger: false,
        fn: {
            clean() {
                popupConf.status = false
            },
            submit() {
                popupConf.status = false
                Object.assign(numList, nulToUndef(uni.getStorageSync('record')))
                // setConfig.status=false
                setTimeout(() => {
                    popupConf.status = true
                    popupConf.curKey = 'del'
                }, 300)
            },
        }
    }
})

const getStorageData = () => { // 读取设置缓存
    return Object.assign({}, defaultConf, uni.getStorageSync('config'));
}
const storageConf = getStorageData() // 获取用户保存的设置
const setConfig = reactive( // 配制项
    Object.assign(storageConf, {
        status: false, // 设置框显隐
    })
)
const totalNum = ref(storageConf.totalNum) // 题目数量
const numListId = ref()
const keyboard = ref(storageConf.keyboard) // 键盘类型 false: 简约, true: 九宫格
const showIdx = ref(storageConf.showIdx) // 显示序号
const opType = ref(storageConf.opType) // 运算类型
const difficulty = ref(storageConf.difficulty) // 困难度
const isMixed = ref(storageConf.isMixed) // 是否混合运算
const cursorType = ref(storageConf.cursorType) // 光标类型
const hasDecimal = ref(storageConf.hasDecimal) // 是否包涵小数
const decimalLen = ref(storageConf.decimalLen) // 小数位数
const scrollTop = ref(0) // 滚动位置
const vertical = ref(storageConf.vertical) // 开启竖式
const historyConf = reactive({
    status: false,
    list: []
})
// 滚动条将当前光标自动滚动到可视区域内
const autoCurItemPosition = async () => {
    function createSelectorQuery(selector) {
        return new Promise(resolve => {
            uni.createSelectorQuery().select(selector).boundingClientRect(({ top, bottom, left, right, height }) => {
                resolve({ top, bottom, left, right, height })
            }).exec()
        })
    }
    const { top: scrollT, height: scrollH } = await createSelectorQuery('.scroll-view')
    const { top: listTop, height: listHeight } = await createSelectorQuery('.list')
    const { top: curItemTop, height: curItemHeight } = await createSelectorQuery('.cur-item')
    scrollTop.value = curItemTop < 0
        ? Math.abs(listTop) + curItemTop - curItemHeight * 2
        : curItemTop + curItemHeight > scrollH
            ? Math.abs(listTop) + scrollH - curItemHeight * 2
            : scrollTop.value || 0
}

watch(keyboard, () => {
    autoCurItemPosition()
})

watch(cursorType, () => {
    setConfig.cursorType = cursorType.value
})
watch(setConfig, val => {
    playSound({ src: musicArr['dian2_mp3'], volume: setConfig.bgmVolume / 2, instanceName: 'set-config' })
    cursorType.value = val.cursorType
    showIdx.value = val.showIdx
    vertical.value = val.vertical
})
watch(bgmPause, val => {
    playSound({ src: musicArr['dian2_mp3'], volume: setConfig.bgmVolume / 2 })
    val ? bgm.pause() : bgm.play()
})

// 混合模式改变
const mixedChange = ({ detail: { value: val } }) => {
    if (val) setConfig.vertical = false
}

// 运算规则改变
const opTypeChange = val => {
    if (val) setConfig.vertical = false
    setConfig.difficulty = !val // false
}

// TODO: 竖式
const verticalChange = val => {
    if (val) {
        setConfig.opType = false
        setConfig.isMixed[0] = undefined
    }
}

// 获取运算符
const getOperator = i => ["+", "-", '×', '÷'][i]

// render 表达式
const renderExpression = (data) => {
    const _data = [...data]
    if (Array.isArray(_data[0])) _data[0] = renderExpression(_data[0])
    if (Array.isArray(_data[1])) {
        _data[1] = renderExpression(_data[1])
        if (_data[2] === 1 && !/[÷×]/.test(_data[1])) {
            _data[1] = ['(', _data[1], ')'].join('')
        }
    }
    return `${_data[0]}${getOperator(_data[2])}${_data[1]}`
}
// #ifdef MP-WEIXIN
// 条件编译--仅微信
uni.showShareMenu({
    title: '四小二(8)班',
    content: '四则运算练习',
    imageUrl: '/assets/icon.jpeg',
    path: '/pages/shuxue/index'
});
//#endif

/**
 * 生成数据列表
 * @author ToviLau 46134256@qq.com
 * @param {string} isInit 是否初始化-重新生成数据
 */
function createList(isInit = true) {
    /**
     * 需要创建的数据量
     * @author ToviLau 46134256@qq.com
     * @param {number} num  数量
     */
    function createData(num) {
        // 随机生成运算符 0:'+' | 1:'-' | 2:'*' | 3:'/'
        const createOperator = (operator) => Math.floor(Math.random() * (operator || (opType.value ? 4 : 2)) + 0)

        // 创建题
        /**
         * @Description  :  
         * @Date         : 2023-10-01 21:22:15
         * @Author       : ToviLau 46134256@qq.com
         * @LastEditors  : ToviLau 46134256@qq.com
         * @LastEditTime : Do not edit
         * @param         {string} operator 运算符
         * @return        算术题
         */
        const createExpression = function (operator) {
            const _getOperator = createOperator(operator)
            const _expression = new Array(2).fill(undefined)

            const _expressionMax1 = !opType.value && !difficulty.value ? '1-15' : '10-90'
            const _expressionMax2 = !opType.value && !difficulty.value ? '20' : '99'
            switch (_getOperator) {
                case 0: // '+'
                    _expression[0] = random(8, _expressionMax1)
                    _expression[1] = random(8, `10-${_expressionMax2 - _expression[0]}`)
                    break;

                case 1: // '-'
                    _expression[1] = random(8, _expressionMax1)
                    _expression[0] = random(8, `${_expression[1]}-${_expressionMax2}`)
                    break;

                case 2: // '*'
                    _expression[0] = random(8, difficulty.value ? '10-50' : '1-10')
                    _expression[1] = random(8, difficulty.value ? '10-50' : '1-10')
                    break;

                case 3: // '/'
                    const divisionFn = () => {
                        _expression[1] = random(8, `${difficulty.value ? '10-50' : '1-10'}`)
                        _expression[0] = random(8, `${_expression[1]}-${difficulty.value ? '999' : '99'}`)

                        const BN = new Bignumber(_expression[0])
                        const _bn = BN.modulo(_expression[1]) // 取模
                        _expression[0] = BN.minus(_bn) // 除法只做了可以整除, 小数万一有无限小数就不好判定了
                        if (
                            _expression[1] === 0 // 被除数为0, 小学阶段无意义
                            || _expression[0] === 0 // 排除商为0，此条可以删除 
                            || _expression[0] === _expression[1] // 排除商为1，此条可以删除
                        ) divisionFn() // 不符合要求重新创建
                    }
                    divisionFn()
                    break;
            }

            // 开启小数处理,添加小数位
            if (hasDecimal.value) _expression.forEach((item, idx) => {
                const decimal = Math.random()
                _expression[idx] = (item + decimal - 0).toFixed(decimalLen.value) - 0
            })
            return _expression.concat(_getOperator)
        }
        if (isInit) numList.length = 0 // 初始化完全新建

        const _numList = new Array(num).fill(undefined).map(res => {
            // [
            //     [ 数字1 || [ 数字1, 数字2, 运算符 ], 数字2 || [ 数字1, 数字2, 运算符 ], 运算符 ],
            //     用户运算结果,
            //     结果对错判定,
            //     订正次数
            // ]
            const numArr = new Array(4).fill(undefined)
            const mData = mergeData(createExpression(), createExpression(2))

            // 获取小数位信息: 长度与小数值
            const getDecimalArr = val => {
                const _decimalMatch = val.toString().match(/\.\d+/) // 小数值匹配
                const _decimal = _decimalMatch ? _decimalMatch[0] : '' // 小数位值
                const _decimalLen = _decimal.toString().substring(1).length // 真实小数位数
                const _decimalFixed = val.toFixed(decimalLen.value) - 0 // 四舍五入值
                return {
                    decimalValue: _decimal - 0,
                    decimalFixed: _decimalFixed - 0,
                    decimalLength: _decimalLen
                }
            }
            numArr[0] = isMixed.value[0] ? mData : createExpression()
            const expressionSucc = expressionResult(numArr[0])
            const { /*decimalValue,*/ decimalLength } = getDecimalArr(expressionSucc)
            if (decimalLength > decimalLen.value) { // 运算结果超出设定范围
                const expressionSuccFixed = expressionSucc.toFixed(decimalLen.value)
                const { /*decimalValue: decimalFixedValue,*/ decimalLength: decimalFixedLength } = getDecimalArr(expressionSucc.toFixed(decimalLen.value) - 0)
                numArr[0][3] = [expressionSuccFixed - 0, decimalFixedLength]
            } else {
                numArr[0][3] = expressionSucc
            }
            return numArr
        })
        numList.push(..._numList)
    }
    isInit  // 计算要创建的数量
        ? createData(totalNum.value) // 与用户设定一制
        : totalNum.value > numList.length
            ? createData(totalNum.value - numList.length) // 增量创建
            : numList.length = totalNum.value // 直接删除多出的数据

    score.value = 0

    edit(true);
    curidx.value = "";
    startTime.value = Date.now()
    contTime()
    curidx.value = 0;
    numListId.value = Date.now().toString(16)
    // TODO: 历史功能: 存储当前配置信息 与 列表信息,正确率 提交次数等 订正次数 等 
    // const _history_is = Date.now()
    // const _history_conf =  {
    //     ...JSON.parse(JSON.stringify(storageConf)) 
    // }
    // 
    // // hasDecimal: false
    // // decimalLen: 1
    // // difficulty: false
    // // isMixed: []
    // // opType: false
    // // totalNum: 20
}
createList(true);
const keyboardCode = reactive(createKeyboardCode())

// BGM
const bgm = playSound({ src: musicArr['bgm-sxg_mp3'], volume: setConfig.bgmVolume, loop: true, instanceName: 'BGM' })

function nulToUndef(data) {
    return data.map(res => {
        if (Array.isArray(res)) {
            return nulToUndef(res)
        } else {
            return res === null ? undefined : res
        }
    })

}
/**
 * 计时操作
 * @author ToviLau 46134256@qq.com
 * @param {boolean} isStop true: 停止计时, false: 开始计时
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
    curidx.value = numList.findIndex(res => [undefined, 0, ''].includes(res[2]))
    startTime.value = startTime.value + ((Date.now() - subEnterTime.value).toString().replace(/\d{3}$/, '000') - 0 + 1000)
    contTime()
}

/**
 * 选择的索引(正在计算的四则运算)
 * @author ToviLau 46134256@qq.com
 * @param {number} idx // 索引号
 */
const ckItem = (idx) => {
    if (submited.value === 0) playSound({ src: musicArr['dian1_mp3'], volume: setConfig.bgmVolume / 2 })
    curidx.value = idx;
    if (numList[idx][2] === 0 && submited.value !== 1) numList[idx][2] = ''
};

/**
 * 数字键盘点击事件
 * @author ToviLau 46134256@qq.com
 * @param {string|number} key // 键盘数字 || 或del
 */
const keyClick = (key) => {
    uni.saveFile({
        tempFilePath: './1.json',
        complete: function (res) {
            var savedFilePath = res.savedFilePath;
        }
    });
    playSound({ src: musicArr['dian2_mp3'], volume: setConfig.bgmVolume / 2 })
    if (
        numList[curidx.value][2] === 1  // 已判定当前题为正确
        || key === 'del' && ['', undefined].includes(numList[curidx.value][1]) // 册除事件 并 内容为空时
    ) return
    const _val = (numList[curidx.value][1] || "") + '';
    if (numList[curidx.value][2] === 1) return

    switch (key) {
        case 'del': // 删除事件
            // 如果提交后已判错, 删除是全部,其它情况单个从右到左删除
            numList[curidx.value][1] = numList[curidx.value][2] === 0 ? '' : _val.substring(0, _val.length - 1)
            break;

        case 'next': // 下一题
            if (curidx.value >= numList.length - 1) return
            const _curidx = curidx.value + 1
            // 查找没有做的 与 结果非正确的题
            const _nextIdx = numList[_curidx][2] === 1
                ? numList.findIndex((res, idx) => res[2] !== 1 && idx > _curidx)
                : _curidx
            // const _curidx = numList.findIndex((res, idx) => res[2]===0)
            curidx.value = _nextIdx > numList.length - 1 ? curidx.value : _nextIdx

            autoCurItemPosition()
            break;

        case '.':
        default: // 默认数字输入事件
            const _keyVal = _val.length < 9 ? _val + key : _val;
            // _keyVal.replace(/^0$ || [^0.]\d+/)
            numList[curidx.value][1] = _keyVal.match(/^(0\.?|[1-9]\d*(\.?\d*))/)[0]
            break;
    }
    // 恢复下标4(对错判断)标识为:空 (错:0, 对:1, 无:'')
    numList[curidx.value].splice(2, 1, '')
};

// 查看得分事件
const subEnter = () => {
    playSound({ src: musicArr['dian2_mp3'], volume: setConfig.bgmVolume / 2 })
    subEnterTime.value = Date.now()
    // 锁定提交状态
    submited.value = 1;
    contTime(true)

    // 对错判定
    numList.map((res) => {
        // let _val = expressionResult(res[0])
        const _val = Array.isArray(res[0][3]) ? res[0][3][0] : res[0][3];
        if ([''].includes(res[2]) && !['', undefined].includes(res[1])) res[3] = !['', undefined].includes(res[3]) ? res[3] + 1 : 0 // 订正次数
        // debugger
        if (!['', undefined].includes(res[1])) res[2] = _val === res[1] - 0 ? 1 : 0; // 1对,0错
    });

    const totleLen = numList.length; // 总题数
    const rightLen = numList.filter((res) => res[2] === 1).length; // 正确题数量
    score.value = Math.floor((100 * rightLen) / totleLen); // 得分计算

    // 评语数组
    const commentArr = [
        "很棒呦，不要骄傲，继续保持吧 Y(^_^)Y",
        "哎呀！就差一点点，下次要细心哟(｡･ω･｡)ﾉ♡",
        "还不错哟，加油，再接再厉(ง •̀_•́)ง",
        "再努力一下，会有好成绩的。(づ ●─● )づ",
        "好好学习，天天向上(*_*)",
        "不要偷懒哦~~ 你一半都还没做完呢。(T_T|||)",
    ];

    // 评语等级
    switch (true) {
        case score.value > 99: // 100
            comment.value = commentArr[0];
            playSound({ src: musicArr['wa_mp3'], volume: setConfig.bgmVolume })
            break;
        case score.value > 89: // 90+
            comment.value = commentArr[1];
            playSound({ src: musicArr['ao_mp3'], volume: setConfig.bgmVolume })
            break;
        case score.value > 79: // 80+
            comment.value = commentArr[2];
            playSound({ src: musicArr['tantiao_mp3'], volume: setConfig.bgmVolume })
            break;
        case score.value > 69: // 70+
            comment.value = commentArr[3];
            playSound({ src: musicArr['jiong_mp3'], volume: setConfig.bgmVolume })
            break;
        default:
            comment.value = commentArr[4];
            playSound({ src: musicArr['wrong_mp3'], volume: setConfig.bgmVolume }).onEnded(() => {
                playSound({ src: musicArr['ou-no_mp3'], volume: setConfig.bgmVolume })
            })
    }

    // 没有做满50%题不给评语
    const fillLen = numList.filter((res) => res[1]).length;
    if (totleLen * 0.5 > fillLen) comment.value = commentArr[5];
    // historyConf.list=[]
    let revision = 0
    numList.forEach(item => {
        revision += (item[3] || 0)
    })

    const _config = []
    _config.push(['加减运算', '乘除运算'][opType.value - 0] + `(${opType.value ? ['简单', '复杂'][difficulty.value - 0] : ['20以内', '100以内'][difficulty.value - 0]})`)
    _config.push(isMixed.value[0] === 1 ? '混合' : '非混合')
    _config.push(`${['未开启小数', '开启小数'][hasDecimal.value - 0]}` + (hasDecimal.value - 0 ? `(有效数位:${decimalLen.value})` : ''))

    const _historyConf = {
        id: numListId.value,
        startTime: startTime.value,
        endTime: Date.now(),
        startTimed: startTimed.value,
        totalNum: totalNum.value,
        score: score.value,
        revision,
        config: _config.join(' / ')
    }
    const historyConfList = historyConf.list
    const hasHistoryIdx = historyConfList.findIndex(res => res.id === _historyConf.id)
    hasHistoryIdx === -1
        ? historyConfList.unshift(_historyConf)
        : historyConfList.splice(hasHistoryIdx, 1, _historyConf)
    if (historyConfList.length > 10) historyConfList.length = 10
    uni.setStorageSync('historyConfList', historyConfList)
};

// 设置窗口显隐
const showConfig = (val = false) => {
    playSound({ src: musicArr['dian2_mp3'], volume: setConfig.bgmVolume / 2 })
    if (val) Object.assign(setConfig, getStorageData())
    setConfig.status = val
}

// 滑块题目数量设置
function setNumFn(num) {
    setConfig.totalNum = num
}

// 恢复默认
const setNumDefault = () => {
    playSound({ src: musicArr['dian2_mp3'], volume: setConfig.bgmVolume / 2 })
    Object.assign(setConfig, defaultConf)
    // cursorType.value = setConfig.cursorType
    bgm.volume = setConfig.bgmVolume / 20
}

// 保存设置事件
const saveConfig = () => {
    showConfig(false)

    // 配置存 stroage
    const _setConfig = { ...setConfig }
    delete _setConfig.status
    uni.setStorageSync('config', _setConfig)

    // 应用配置信息
    keyboard.value = setConfig.keyboard
    showIdx.value = setConfig.showIdx
    cursorType.value = setConfig.cursorType
    vertical.value = setConfig.vertical

    if (!bgmPause.value) {
        bgm.volume = setConfig.bgmVolume / 20
        bgmPause.value = false
    } else {
        bgm.stop()
    }

    // 运算规则 或 难度变动 列表都要重新生成
    if (opType.value !== setConfig.opType
        || difficulty.value !== setConfig.difficulty
        || isMixed.value[0] !== setConfig.isMixed[0]
        || hasDecimal.value !== setConfig.hasDecimal
        || decimalLen.value !== setConfig.decimalLen
    ) {
        opType.value = setConfig.opType // 运算规则变动
        difficulty.value = setConfig.difficulty // 难度变动
        isMixed.value = setConfig.isMixed
        hasDecimal.value = setConfig.hasDecimal
        decimalLen.value = setConfig.decimalLen
        createList(true) // 运算规则类型变动重新生成列表
    }

    // 题目数量变动，只需差量增减
    if (totalNum.value !== setConfig.totalNum) {
        totalNum.value = setConfig.totalNum
        createList(false)
    }
}

// 取消设置事件
const cleanConfig = () => {
    const {
        bgmVolume: volume,
        cursorType: cursor,
        showIdx: _showIdx,
        vertical
    } = getStorageData()

    if (!bgmPause.value) {
        bgm.volume = volume / 20
        bgmPause.value = false
    } else {
        bgm.stop()
    }
    cursorType.value = cursor
    showIdx.value = _showIdx
    setConfig.showIdx = _showIdx
    setConfig.vertical = vertical
    showConfig(false)

}

// 题目数量滑块更新
const setNumChange = val => {
    // bgm.volume = setConfig.bgmVolume / 20
    setNumFn(Math.round(val / 10) * 10)
}

// 最多有效位数变动
const setDecimalLenChange = val => {
    setConfig.decimalLen = val
}

// 音量滑块更新
const bgmVolumeChange = val => {
    setConfig.bgmVolume = val
    bgm.volume = val / 20
    // bgm.play()
}

// 显示历史弹窗
const historyList = () => {
    historyConf.status = true
}

// 册除单条历史事件
const deleteHistory = id => {

    uni.showModal({
        // title: 'title',
        // editable: false,
        content: '您确定要清除所有历史记录么?',
        showCancel: true,
        // cancelText: '取消'
        cancelColor: '#999',
        // confirmText: '确定',
        confirmColor: '#ed5d46',
        success: function ({confirm, cancel}) {
            if(confirm){
                const idx = historyConf.list.findIndex(res => res.id === id)
                historyConf.list.splice(idx, 1)
                uni.setStorageSync('historyConfList', historyConf.list)
            }
        },
        fail: function (res) {}
    })
}

// 清除历史事件
const historyClean = () => {

    uni.showModal({
        // title: 'title',
        // editable: false,
        content: '您确定要清除所有历史记录么?',
        showCancel: true,
        // cancelText: '取消'
        cancelColor: '#999',
        // confirmText: '确定',
        confirmColor: '#ed5d46',
        success: function ({confirm, cancel}) {
            if(confirm){
                uni.setStorageSync('historyConfList', [])
                historyConf.list = []
            }
        },
        fail: function (res) {}
    })
}

// 读档
const recordRead = () => {
    const record = uni.getStorageSync('record')
    popupConf.status = true
    if (record) {
        popupConf.curKey = 'read'
    } else {
        popupConf.curKey = 'recordUnll'
    }
}
// 存档
const recordSave = () => {
    const record = uni.getStorageSync('record')
    if (record) {
        popupConf.curKey = 'save'
        popupConf.status = true
    } else {
        uni.setStorageSync('record', numList)
        uni.showToast({
            icon: 'none',
            title: '存档成功'
        })
    }
}

onShow(() => {
    if (!bgmPause.value) {
        // bgm.volume = setConfig.bgmVolume / 20
        bgm.play();
    }
})
onHide(() => {
    bgm.pause()
})
onLoad(() => {
    const reCord = uni.getStorageSync('record');
    historyConf.list = uni.getStorageSync('historyConfList') || []

    if (reCord) {
        popupConf.curKey = 'onLoad'
        popupConf.status = true
        setConfig.status = false
    }
})

onUnload(() => {
    bgm.destroy()
})
</script>

<style lang="less">
.content {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;

    .top {
        .top-item {
            font-size: 26rpx;
            padding: .25em 1em;
            color: var(--c-safegray);
            background-color: var(--c-safegray-hlight);
            display: flex;
            line-height: 1.5em;

        }

        .top-right {
            display: flex;
            justify-content: flex-end;
        }

        .top-left,
        .top-right {
            flex: 1;
        }

        .top-right {
            text-align: right;
        }

        .top-audio {
            // width: 1em;
            margin-left: .5em;
            height: 1.2em;
            display: flex;

            .icon-audio {
                border: 5rpx solid var(--c-safegray-dark);
                text-align: center;
                border-radius: 50%;
                box-sizing: border-box;
                width: 1.2em;
                height: 1.2em;
                line-height: 1.2em;
                color: #fff;
                background-color: var(--c-safegray-dark);
                animation: audio-button 5s infinite linear;

                @keyframes audio-button {
                    0% {
                        transform: rotate(0deg);
                    }

                    100% {
                        transform: rotate(360deg);
                    }
                }

                &.pause {
                    border-color: var(--color-R);
                    animation: none;
                    position: relative;

                    &:after {
                        content: '';
                        width: 100%;
                        height: 6rpx;
                        background-color: var(--color-R);
                        position: absolute;
                        top: 50%;
                        left: 0;
                        margin-top: -3rpx;
                        transform: rotate(-45deg);
                        opacity: .618;

                    }

                    // box-shadow: 0 0 0 5rpx var(--color-R);
                }
            }
        }
    }

    .scroll-view {
        flex: 1;
        overflow: auto;
    }

    .list {
        display: flex;
        align-content: flex-start;
        overflow: auto;
        flex-wrap: wrap;
        padding: 0.25em .1em;

        .list-item {
            @item-primary-color: #b6aafa;
            border-bottom: 1px solid var(--c-safegray-hlight);
            font-size: 28rpx;
            // font-size: 70%;
            // width: 42%;
            display: flex;
            flex-direction: column;
            // align-items: center;
            // text-align: center;
            color: var(--c-safegray-hdark);
            min-width: 46%;
            flex: 1 0 auto;
            margin: 0 2%;

            &.list-item-none {
                border: none;
                line-height: 0;
            }

            .list-item-li {
                display: flex;
                align-items: center;
                text-align: center;
                line-height: 3em;
                padding-left: .5em;
                box-sizing: border-box;
                position: relative;
                overflow: hidden;

                .list-item-idx {
                    border: 1px solid var(--c-safegray-hlight);
                    border-radius: 5rpx;
                    color: var(--c-safegray-lighter);
                    padding: 0 0.2em;
                    width: 1.8em;
                    line-height: 1.4em;
                    margin-right: 0.35em;
                    font-size: 18rpx;
                    background-image: linear-gradient(180deg, var(--c-safegray-hlight), transparent);
                    margin-left: -0.6em;
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
                    background-color: var(--c-gray-hlighter);
                    color: var(--c-safegray-light);

                    &::before {
                        content: '已订正：'
                    }

                    &::after {
                        content: ' 次'
                    }
                }

                .wait-edited {
                    background-color: var(--color-R);
                    color: var(--c-safegray-hlight);

                    &::before {
                        content: '尚未订正'
                    }
                }

                &.right,
                &.wrong {
                    position: relative;

                    &:before {
                        font-family: "iconfont" !important;
                        font-style: normal;
                        -webkit-font-smoothing: antialiased;
                        -moz-osx-font-smoothing: grayscale;
                        background: center/cover no-repeat;
                        position: absolute;
                        line-height: 1em;
                        top: 50%;
                        left: 120rpx;
                        opacity: 0.816;
                        margin-top: -.5em;
                        color: var(--color-R);
                    }

                    &.right:before {

                        content: "\e77e";
                        font-size: 120rpx;
                    }

                    &.wrong:before {
                        content: "\e77c";
                        font-size: 60rpx;
                        font-weight: bolder;
                    }
                }

                &.cur-item {
                    box-shadow: 0 0 0 4rpx @item-primary-color;
                    // border-bottom: none;
                    border-radius: 5rpx;

                    &:after {
                        animation: guang-biao-shan-shuo 1.6s infinite;
                    }

                    &.right {
                        box-shadow: 0 0 0 4rpx var(--c-safegray-light);

                        &:after {
                            animation: none;
                        }
                    }

                    .list-item-idx {
                        background-image: linear-gradient(0deg, ligthen(@item-primary-color, 0.15%), transparent);
                        color: darken(@item-primary-color, 11.5%);
                    }

                    .active-show {
                        display: block !important;
                    }
                }

                .tip-wrong {
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #c9a63122;
                    color: var(--color-Y);
                    line-height: 1.6em;
                    font-size: 18rpx;
                    padding: 0 .5em;

                    &.active-show {
                        display: none;
                    }
                }

                @keyframes guang-biao-shan-shuo {
                    40% {
                        opacity: 0;
                    }

                    50%,
                    80% {
                        opacity: 1;
                    }

                    90% {
                        opacity: 0;
                    }
                }

                &:after {
                    content: "";
                    display: inline-block;
                    opacity: 0;
                }

                &.cursor1 {
                    &:after {
                        width: 0.5em;
                        border-bottom: 5rpx lighten(@item-primary-color, 2%) solid;
                        margin-bottom: -1.125em;
                    }
                }

                &.cursor2 {
                    &:after {
                        height: 1em;
                        border-left: 5rpx lighten(@item-primary-color, 2%) solid;
                        margin-bottom: 0;
                        margin-left: .125em;
                    }
                }
            }

            .vertical {
                width: 7em;
                // margin-left: 2em;
                margin: .5em 0 .5em 2em;

                .vertical-li {
                    display: flex;
                    justify-content: flex-end;
                    padding-right: .5em;

                    .vertical-li-nums {
                        width: 2em;
                        text-align: center;
                        border: 1rpx solid var(--c-safegray-hlight);
                        margin: -1rpx;
                        height: 2em;
                        line-height: 2em;
                    }

                    &:nth-child(2) {
                        padding-bottom: .5em;
                        position: relative;

                        &:after {
                            position: absolute;
                            bottom: .25em;
                            left: 0;
                            right: -1em;
                            content: '';
                            display: block;
                            width: 100%;
                            // margin-top: .25em;
                            border-top: 1rpx solid var(--c-safegray-dark);
                        }
                    }

                    &:nth-child(3) {
                        .vertical-li-nums {
                            border-color: var(--c-safegray-light);
                        }
                    }
                }

                &.plus,
                &.minus {
                    .vertical-li:nth-child(2) {
                        position: relative;

                        &:before {
                            position: absolute;
                            left: .5em;
                            font-size: 1.25em;
                        }

                        // &:before,&:after{
                        //     position: absolute;
                        //     left: 1em;
                        // }
                    }
                }

                &.plus {
                    .vertical-li:nth-child(2) {
                        &::before {
                            content: '+';
                        }
                    }
                }

                &.minus {
                    .vertical-li:nth-child(2) {
                        &::before {
                            content: '-';
                        }
                    }
                }

            }

        }
    }

    .footer {
        box-shadow: 0 0 2px var(--c-gray-hlight);
        border: 1rpx solid var(--c-gray-hlighter);
        padding: 0.5em 0;
        position: relative;
        border-top: 1rpx solid var(--c-safegray-hlight);
        background-color: var(--c-safegray-hlighter);

        .pan {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-evenly;

            &.dsb {

                &>.pan-item:not(.pan-enter),
                .pan-del {
                    background-image: linear-gradient(0deg, var(--c-safegray-hlight), var(--c-safegray-hlighter));
                    background-color: transparent;
                    color: var(--c-safegray-lighter);
                    box-shadow: 0 0 0 1rpx var(--c-safegray-hlight);

                    // filter: grayscale(.8) ;
                }
            }

            &:not(.easyKeyboard) {
                &:not(.has-decimal) {
                    :nth-child(10) {
                        .pan-item-container {
                            display: none;
                        }
                    }

                    :nth-child(11) {
                        .pan-item-container {
                            margin-left: calc(-100% - 20rpx);
                        }
                    }
                }
            }

            &.easyKeyboard {
                .pan-item {
                    width: 15%;
                }

                &:not(.has-decimal) {
                    :nth-child(6) {
                        .pan-item-container {
                            display: none;
                        }
                    }

                    :nth-child(12) {
                        .pan-item-container {
                            margin-top: calc(-3em - 12rpx);
                            line-height: calc(3em * 2 + 12rpx)
                        }
                    }

                }

            }
        }

        .pan-item,
        .fen-item {
            margin: 6rpx 0;
            position: relative;
            text-align: center;

            .pan-item-container {
                box-shadow: 0 0 4rpx var(--c-safegray);
                background-image: linear-gradient(0deg, var(--c-gray-hlighter), var(--c-safegray-hlighter));
                color: var(--c-safegray-dark);
                border-radius: 5rpx;
                font-weight: bolder;
                line-height: 3em;
            }

            &:active:not(.dsb) {
                opacity: 0.618;
            }

            &.dsb .pan-item-container {
                background-image: none;
                color: #ccc;
                background-color: var(--c-safegray-hlight);
                box-sizing: border-box;
                border: 1px solid;
                border-color: var(--c-safegray-light) var(--c-safegray-light) var(--c-safegray-hlighter) var(--c-safegray-hlighter);
            }
        }

        .pan-enter,
        .pan-del,
        .fen-new,
        .fen-edit {
            // width: 36%;
            border-radius: 4rpx;
            background-image: none;
            color: var(--c-safegray-hlighter);
            box-shadow: none;
            flex: 1;
            line-height: 2.2em;
            height: 2.2em;
            box-shadow: 4rpx 2rpx 6rpx var(--c-safegray-lighter);
            // border: none !important;

        }

        .pan-del,
        .fen-new {
            background-color: var(--color-R);
        }

        .pan-enter,
        .fen-edit {
            background-color: var(--color-G);

            &.dsb {
                background-color: var(--c-safegray-hlight);
                color: var(--c-safegray);
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
            margin-top: .5em;
        }

        .pan-set {
            border: none;
            background: none;
            border: none;
            box-shadow: none;
            display: flex;
            flex: 1;
            justify-content: center;
            align-items: center;
        }

        .pan-set-btn {
            // background: url(../../assets/set.svg) center/cover no-repeat;
            // width: 1.5em;
            // height: 1.5em;
            font-size: 50rpx;
            color: var(--c-safegray-dark);
        }

        .fen {
            .fen-title {
                background-image: linear-gradient(180deg, var(--c-gray-hlight), var(--c-safegray-hlighter));
                color: var(--c-safegray-darker);
                margin-top: -0.5em;
                line-height: 2.2em;
                padding: 0 1em;
                display: flex;
                justify-content: space-between;

                .fen-title-right {
                    font-size: 22rpx;
                    color: var(--c-safegray)
                }
            }

            .score {
                text-align: center;
                font-size: 62rpx;
                line-height: 1.25em;
                margin-top: 0.125em;
                color: var(--color-R);
                position: relative;

                &:after,
                &:before {
                    content: "";
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    height: .06em;
                    background-color: var(--color-R);
                }

                &:after {
                    margin-left: -0.816em;
                    width: 1.8em;
                    margin-top: .42em;
                    transform: rotate(-6deg);
                }

                &:before {
                    margin-left: -0.7em;
                    width: 2em;
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
            width: 100%;
            color: #333;
            background-color: var(--c-safegray-hlighter);
            display: flex;
            flex-direction: column;

            .divider-line {
                @c: #e9e9e9;
                width: 100%;
                align-items: center;
                display: flex;
                // flex-direction: column;
                font-size: 24rpx;
                color: @c;
                margin: .75em 0;
                text-shadow: 3rpx 3rpx 0 var(--c-safegray-hlighter);

                &:before,
                &:after {
                    content: '';
                    height: 1rpx;
                    flex: 1;
                    background-color: @c;
                    margin: 0 .5em;
                    box-shadow: 3rpx 2rpx 0 var(--c-safegray-hlighter);
                }
            }

            .set-sys-title {
                background-image: linear-gradient(180deg, var(--c-safegray-lighter), var(--c-safegray-hlighter));
                margin-top: -0.5em;
                line-height: 2.5em;
                padding: 0 1em;
                display: flex;
                justify-content: space-between;
                font-size: 30rpx;

                .set-sys-title-right {
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    .rest-default {
                        color: var(--c-safegray);
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
                // padding: 1em;
                margin-bottom: -.5em;
                margin-top: .5em;
            }

            .set-sys-db-list {
                display: flex;
                align-items: center;
                width: 90%;
                padding: .2em;
                font-size: 26rpx;
                line-height: 1.9em;

                .set-sys-histroy,
                .set-sys-record {
                    margin-bottom: 1em;
                }

                .set-sys-histroy {
                    flex: 1;
                    display: flex;
                    justify-content: flex-start;
                }

                .set-sys-record {
                    display: flex;
                }

                .set-sys-btn {
                    background-image: linear-gradient(0deg, var(--c-safegray-lighter), var(--c-safegray-hlight));
                    border: 1px solid var(--c-safegray-light);
                    padding: 0 .5em;
                    font-size: 26rpx;
                    line-height: 2em;
                    border-radius: 5rpx;
                    margin: 0 5rpx;
                    color: var(--c-safegray-hdark);

                    display: flex;
                    align-items: baseline;
                    justify-content: center;

                    :deep(.iconfont) {
                        font-size: inherit;
                    }
                }

                .set-sys-db-list-left {
                    flex-shrink: 0;
                    width: 6.5em;
                    text-align: right;
                }

                .set-sys-db-list-right {
                    display: flex;
                    flex: 1;

                    .label {
                        display: flex;
                        align-items: center;

                        :deep(.checklist-text) {
                            font-size: 20rpx;

                        }
                    }

                    .label-ckd {
                        margin-left: 1em;

                        :deep(.checklist-box) {
                            .checklist-text {
                                color: var(--c-safegray-lighter) !important;
                            }

                            &.is-checked {
                                .checklist-text {
                                    color: var(--color-B) !important;
                                }
                            }
                        }
                    }
                }

                .cur {
                    color: var(--color-B);
                }

                .set-sys-switch {
                    display: flex;
                    align-items: center;
                    color: var(--c-safegray-lighter);
                    font-size: 20rpx;
                    margin-right: 1em;

                    :deep(.uni-switch-input) {
                        background-color: var(--color-B) !important;
                        transform: scale(0.7) !important;
                    }

                    :deep(.double-switch) {
                        .uni-switch-input {
                            &::before {
                                background-color: inherit !important;
                            }
                        }
                    }


                    .set-sys-switch-item {
                        line-height: 30rpx;

                    }

                    // .set-sys-switch-l {}
                    .set-sys-switch-c {
                        margin: 0 .5em;
                    }

                    // .set-sys-switch-r {}
                }

                .lv2 {
                    flex: 1;
                    display: flex;

                    &.has-next {
                        .lv2-next {
                            // background-color: var(--c-safegray-hlight);
                            // box-shadow: 2rpx 1rpx 1rpx var(--c-safegray-light) inset, -3rpx -2rpx 1rpx var(--c-safegray-hlighter) inset;
                            color: var(--c-safegray-dark);
                            flex: 1;
                            display: flex;
                            align-items: center;
                            // margin-left: 1em;
                            padding-left: .5em;
                            padding-right: 2.5em;
                            border-radius: 6rpx;

                            .lv2-label {
                                flex-shrink: 0;
                                margin-right: 1em;
                                font-size: 24rpx;
                            }
                        }
                    }

                }

            }

            .set-slider {
                width: 90%;
            }

            :deep(.hao-slider-block) {
                background-color: var(--color-B) !important;
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

            .declare {
                font-size: 24rpx;
                line-height: 1.35em;
                font-weight: normal;
                margin: .5em 0 -1.1em;
                text-align: center;
                color: var(--c-gray-hlighter);
            }

            .btns {
                display: flex;
                margin-top: 1em;
                width: 100%;


                .set-btn {
                    // margin: 6rpx 0;
                    line-height: 1.8em;
                    text-align: center;
                    box-shadow: none;
                    flex: 1;
                    line-height: 2em;

                }

                .set-btn-submit {
                    background-color: var(--color-B);
                    color: var(--c-safegray-hlighter);
                }

                .set-btn-clean {
                    background-color: var(--c-safegray-hlight);
                    color: var(--c-safegray);
                }
            }
        }
    }
}

.popup-dialog {
    font-size: 26rpx;
    color: var(--c-safegray-hdarker);

    // border: 1rpx solid var(--c-safegray-light);
    // border-radius: 20rpx;
    // overflow: hidden;
    .popup-dialog-content {
        min-height: 18vh;
        border-bottom: 1rpx solid var(--c-safegray-light);
        display: flex;
        align-items: center;
        padding: 0 1.2em;
    }

    .popup-dialog-footer {
        display: flex;

        .popup-dialog-footer-item {
            flex: 1;
            line-height: 3em;
            text-align: center;

            &:not(:nth-child(1)) {
                border-left: 1rpx solid var(--c-safegray-light);
            }

            &.clean {
                color: var(--c-safegray);
            }

            &.submit {
                color: var(--c-safegray-hdark);
            }

            &.danger {
                color: var(--color-R);
            }

        }
    }
}

.history-dialog {
    font-size: 24rpx;
    margin: 0 10rpx;
    position: relative;

    .history-dialog-close {
        position: absolute;
        bottom: 0;
        right: .5em;
        padding: .125em;
        font-size: 30rpx;
        border-radius: 4rpx;
        font-weight: bolder;
        background-color: var(--c-gray-hlighter);
    }

    .history-dialog-clean {
        position: absolute;
        bottom: 0;
        right: 2.5em;
        padding: .125em;
        font-size: 26rpx;
        border-radius: 4rpx;
        font-weight: bolder;
        background-color: var(--c-gray-hlighter);
    }

    .history-title {
        text-align: center;
        color: var(--c-gray-hlighter);
        font-size: 26rpx;
        line-height: 1.5em;
    }

    .history-tab {
        padding: .5em .5em;
        margin: 0 auto;
        // background-color: var(--c-safegray-hdark);
        color: var(--c-safegray-darker);

        .history-th,
        .history-tr {
            display: flex;
            flex-wrap: wrap;
            border-bottom: 1rpx solid var(--c-safegray-light);

            // border: 1rpx solid var(--c-safegray-lighter);
            &.history-th {
                background-image: linear-gradient(0deg, var(--c-safegray-light), var(--c-safegray-hlighter));
                padding: .125em 0;
                font-weight: bolder;
            }

            &:nth-child(odd):not(.history-th) {
                background-color: var(--c-gray-hlighter);
            }

            &:nth-child(even) {
                background-color: var(--c-safegray-hlighter);
            }

            &:not(:nth-child(1)) .history-td:nth-last-child(2) {
                background-color: #ccc3;
                margin: 0 8rpx 6rpx;
                padding: 6rpx 0;
                box-shadow: 2rpx 2rpx 1rpx var(--c-safegray-darker) inset, 2rpx 2rpx 1rpx var(--c-safegray-hlighter);
                color: var(--c-safegray-dark) // border: 1rpx solid var(--c-safegray);
                    // border-bottom: none;
            }

            &:not(:nth-child(1)) .history-td:nth-last-child(1):not(:nth-child(1)) {
                flex: 0 0 auto;
            }

            .history-td {
                // border: 1rpx solid var(--c-safegray-lighter);
                text-align: center;
                padding: .1em .25em;
                // margin: -1rpx;
                display: flex;
                flex: 1 0 auto;
                box-sizing: border-box;
                align-items: center;
                justify-content: center;
                line-height: 1.1em;

                // &:not(:nth-child(1)){
                //     border-left: none;
                // }
                &:nth-child(1),
                &:nth-child(2) {
                    width: 6em;
                }

                &:nth-child(3) {
                    width: 4em;
                }

                &:nth-child(4) {
                    width: 2em;
                }

                &:nth-child(5) {
                    width: 2.5em;
                }

                &:nth-child(6) {
                    width: 2em;
                }

            }

            .history-none {
                flex: 1;
                line-height: 4em;
                height: 4em;
            }
        }
    }

    .history-tips {
        margin-left: 1em;
        color: var(--c-gray-hlighter);
    }
}</style>
