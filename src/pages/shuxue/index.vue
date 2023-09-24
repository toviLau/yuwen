<template>
    <view class="content">
        <div class="top">
            <div class="top-left">日期: {{ date('Y-m-d') }}</div>
            <div class="top-right">用时: {{ startTimed }}</div>
        </div>
        <div class="list">
            <div class="list-item" v-for="(v, i) in numlist" :key="i" @click="ckItem(i)" :class="{
                'cur-item': i === curidx && submited === 0,
                right: v[2] === 1,
                wrong: v[2] === 0 && !['', undefined].includes(v[1]),
            }">
                <div class="edited" v-if="v[3] > 0">{{ v[3] }}</div>
                <div class="wait-edited" v-if="v[2] === 0 && !v[3]"></div>
                <div class="list-item-idx" v-if="showIdx">{{ i + 1 }}</div>
                {{
                    // 数1
                    !Array.isArray(v[0][0]) ? `${v[0][0]}` : `${v[0][0][0]}${["+", "-", '×', '÷'][v[0][0][2]]}${v[0][0][1]}`

                        // 运算符
                        `${["+", "-", '×', '÷'][v[0][2]]}`

                        // 数1
                        (!Array.isArray(v[0][1])) ? `${v[0][1]}` : v[0][1][2] === 1 ? '(' : '' + v[0][1][0]
                            + ["+", "-", '×', '÷'][v[0][1][2]]
                            + v[0][1][1]
                            + v[0][1][2] === 1 ? ')' : ''
                                + `=`
                                + curidx !== undefined && numlist[i][1] !== undefined ? numlist[i][1] : ""
                }}
                <div v-show="v[2] === 0">
                    <div class="tip-wrong" v-if="numlist[i][1] === v[0][0] + v[0][1]">粗心了吧，是不是当成加(+)法算啦。</div>
                    <div class="tip-wrong" v-if="numlist[i][1] === v[0][0] - v[0][1] + 10">忘记借位了吧？</div>
                    <div class="tip-wrong" v-if="numlist[i][1] === v[0][0] - v[0][1]">这是加法哦，粗心当减(-)法算了么？</div>
                    <div class="tip-wrong"
                        v-if="numlist[i][1] === v[0][0] + v[0][1] - 10 && v[0][0] % 10 + v[0][1] % 10 > 9">忘记进位了吧?
                    </div>
                </div>
            </div>
            <div class="list-item list-item-none" v-for="i in 10" :key="i" />
        </div>
        <div class="footer" v-show="curidx !== undefined"
            v-if="submited === 0 && curidx !== '' || submited === 1 || setConfig.status" :class="{
                dsb:
                    curidx &&
                    (numlist[curidx][1] === undefined ? '' : numlist[curidx][1] + '')
                        .length > 2,
            }">
            <div class="pan" :class="{ dsb: numlist[curidx][2] === 1, easyKeyboard: !keyboard }"
                v-if="submited === 0 && curidx !== '' && !setConfig.status">
                <div class="pan-item" v-for="i in 9" @click="keyNum(i)" :key="i">
                    {{ i }}
                </div>
                <div class="pan-item" @click="keyNum(0)">0</div>
                <div class="pan-footer">
                    <div class="pan-item pan-enter" @click="subEnter()">查看得分</div>
                    <div class="pan-item pan-set">
                        <div class="pan-set-btn" @click="showConfig(true)"></div>
                    </div>
                    <div class="pan-item pan-del" @click="keyNum('del')">⇐</div>
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
                    <div class="fen-item fen-edit" @click="[edit(), playSound({ name: musicArr['dian2_mp3'] })]"
                        :class="{ dsb: score === 100 }">去订正</div>
                    <div class="pan-item pan-set">
                        <div class="pan-set-btn" @click="showConfig(true)"></div>
                    </div>
                    <div class="fen-item fen-new" @click="[createList(true), playSound({ name: musicArr['dian2_mp3'] })]">
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
                        <div class="set-sys-db-list-left">题目数量：</div>
                        <div class="set-sys-db-list-right">
                            <hao-slider :step="10" :sliderHeight="4" sliderLeftColor="#55a4f3" :min="10"
                                :value="setConfig.totalNum" @change="setNumChange" class="set-slider" />
                        </div>
                    </div>
                    <div class="set-sys-db-list">
                        <div class="set-sys-db-list-left">显示序号：</div>
                        <div class="set-sys-db-list-right">
                            <div class="set-sys-switch">
                                <div class="set-sys-switch-item set-sys-switch-c">
                                    <zeroSwitch :size="20" v-model="setConfig.showIdx" inactiveColor="#f9f9f9"
                                        activeColor="#f9f9f9" backgroundColorOn="#55a4f3" backgroundColorOff="#dcdcdc" />
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
                                    <zeroSwitch :size="20" v-model="setConfig.keyboard" inactiveColor="#f9f9f9"
                                        activeColor="#f9f9f9" backgroundColorOn="#55a4f3" backgroundColorOff="#55a4f3" />
                                </div>
                                <div class="set-sys-switch-item set-sys-switch-r" :class="{ cur: setConfig.keyboard }">九宫格
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="set-sys-db-list">
                        <div class="set-sys-db-list-left">运算规则：</div>
                        <div class="set-sys-db-list-right">
                            <div class="set-sys-switch">
                                <div class="set-sys-switch-item set-sys-switch-l" :class="{ cur: !setConfig.opType }">加减运算
                                </div>
                                <div class="set-sys-switch-item set-sys-switch-c">
                                    <zeroSwitch :size="20" v-model="setConfig.opType" inactiveColor="#f9f9f9"
                                        activeColor="#f9f9f9" backgroundColorOn="#55a4f3" backgroundColorOff="#55a4f3" />
                                </div>
                                <div class="set-sys-switch-item set-sys-switch-r" :class="{ cur: setConfig.opType }">四则运算
                                </div>
                            </div>
                            <div class="label cur">
                                <uni-data-checkbox multiple v-model="setConfig.isMixed" selectedColor="#55a4f3"
                                    class="label-ckd" :localdata="[{ 'value': 1, 'text': '混合' }]"></uni-data-checkbox>
                            </div>
                        </div>
                    </div>
                    <div class="set-sys-db-list" v-if="setConfig.opType">
                        <div class="set-sys-db-list-left">难度：</div>
                        <div class="set-sys-db-list-right">
                            <div class="set-sys-switch">
                                <div class="set-sys-switch-item set-sys-switch-l" :class="{ cur: !setConfig.difficulty }">简单
                                </div>
                                <div class="set-sys-switch-item set-sys-switch-c">
                                    <zeroSwitch :size="20" v-model="setConfig.difficulty" inactiveColor="#f9f9f9"
                                        activeColor="#f9f9f9" backgroundColorOn="#55a4f3" backgroundColorOff="#55a4f3" />
                                </div>
                                <div class="set-sys-switch-item set-sys-switch-r" :class="{ cur: setConfig.difficulty }">困难
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
                    <div class="btns">
                        <div class="set-btn set-btn-submit" @click="saveConfig()">保存</div>
                        <div class="set-btn set-btn-clean" @click="cleanConfig()">取消</div>
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
import zeroSwitch from "../../uni_modules/zero-switch/components/zero-switch"
import { onReady, onShow, onHide, onUnload } from '@dcloudio/uni-app'
import uniDataCheckbox from '../../uni_modules/uni-data-checkbox/uni-data-checkbox.vue'
const musics = import.meta.globEager('../../assets/music/*.mp3')
const musicArr = reactive({})
Object.keys(musics).forEach(key => {
    const _key = key.replace(/.+?([^\/\\]+)\.(\w+)$/g, '$1_$2')
    musicArr[_key] = musics[key].default
})
// 数据列表:[[[数字1 || [数字1,数字2, 运算符], 数字2 || [数字1,数字2, 运算符], 运算符], 用户运算结果, 结果对错判定, 订正次数], ...]
const numlist = reactive([]); // 数据列表:[[数字1,数字2, 运算符, 用户运算结果, 结果对错判定, 订正次数], ...]
const submited = ref(0); // 是否提交
const score = ref(0); // 得分
const comment = ref(""); // 评语
const curidx = ref(); // 当前所计算的索引数据
const startTime = ref(0) // 开始时间
const startTimed = ref('') // 已用时
const subEnterTime = ref('') // 提交时间
const contTimeId = ref() // 计时定时器 ID
const defaultConf = { // 默认配置
    totalNum: 50, // 题目数量
    keyboard: true, // 键盘类型[false:简单, true:九宫格]
    showIdx: false, // 显示序号
    difficulty: false, // 困难度
    bgmVolume: 10, // 背景音乐音量
    opType: false, // 运算规则 0:+-,1:+-*/
    isMixed: 1 // 是否混合运算
}
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
const keyboard = ref(storageConf.keyboard) // 键盘类型
const showIdx = ref(storageConf.showIdx) // 显示序号
const opType = ref(storageConf.opType) // 运算类型
const difficulty = ref(storageConf.difficulty) // 困难度
const isMixed = ref(storageConf.isMixed) // 是否混合运算
//  // 设置数据
// watch(setConfig, res=>{
//     // playSound({name: musicArr['dian2_mp3']})
//     // bgm.src = musicArr['dian2_mp3']
//     // console.log(res.bgmVolume);
//     // bgm.volume = res.volume
//     bgm.volume = res.bgmVolume / 20
// })
// onShow(()=>{
//     startTime.value = startTime.value + ((Date.now() - subEnterTime.value).toString().replace(/\d{3}$/, '000') - 0 + 1000)
// })
// onHide(()=>{
//     subEnterTime.value = Date.now()
// })

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
        if (isInit) numlist.length = 0
        const _numlist = []
        // 随机生成运算符 0:'+' | 1:'-' | 2:'*' | 3:'/'
        const createOperator = (operator) => Math.floor(Math.random() * (operator || (opType.value ? 4 : 2)) + 0)

        const createExpression = function (operator) {
            const _getOperator = createOperator(operator)
            const _expression = new Array(2).fill(undefined)
            switch (_getOperator) {
                case 0: // '+'
                    _expression[0] = random(8, "10-90")
                    _expression[1] = random(8, `10-${100 - _expression[0]}`)
                    break;

                case 1: // '-'
                    _expression[1] = random(8, "10-99")
                    _expression[0] = random(8, `${_expression[1]}-99`)
                    break;

                case 2: // '*'
                    _expression[0] = random(8, `${difficulty.value ? '10-50' : '1-10'}`)
                    _expression[1] = random(8, `${difficulty.value ? '10-50' : '1-10'}`)
                    break;

                case 3: // '/'
                    const initF = () => {
                        _expression[1] = random(8, `${difficulty.value ? '10-50' : '1-10'}`)
                        _expression[0] = random(8, `${_expression[1]}-${difficulty.value ? '999' : '99'}`)
                        // Todo: 小数与混合模式支持后期再说
                        _expression[0] = _expression[0] - _expression[0] % _expression[1] // 除法只做了可以整除, 小数万一有无限小数就不好判定了
                        if (
                            _expression[1] === 0 // 被除数为0, 小学阶段无意义
                            || _expression[0] === 0 // 排除商为0，此条可以删除 
                            || _expression[0] === _expression[1] // 排除商为1，此条可以删除
                        ) initF()
                    }
                    initF()
                    break;
            }
            return _expression.concat(_getOperator)
        }

        for (let i = 0; i < num; i++) {
            // [
            //     [ 数字1 || [ 数字1, 数字2, 运算符 ], 数字2 || [ 数字1, 数字2, 运算符 ], 运算符 ],
            //     用户运算结果,
            //     结果对错判定,
            //     订正次数
            // ]
            const numArr = new Array(4).fill(undefined)
            const mData = mergeData(createExpression(), createExpression(2))
            const _createExpression = createExpression()
            numArr[0] = isMixed.value[0] ? mData : _createExpression
            // console.log(numArr[0]);
            _numlist.push(numArr);
        }

        /**
         * 合并两数据
         * @param {array} data1 [数1,数2, 运算符]
         * @param {array} data2 [数1,数2, 运算符]
         * @return [[数1-1,数1-2, 运算符],数2, 运算符] || [数1,[数2-1,数2-2, 运算符], 运算符]
         */
        function mergeData(data1, data2) {
            const idx = Math.random() > 0.5 ? 1 : 0
            data2[idx] = data1
            if (data2[2] === 1) {
                const _data1 = data2[0] - 0 || expressionResult(data2[0])
                const _data2 = data2[1] - 0 || expressionResult(data2[1])
                const _tmp = data2.pop()
                if (_data1 < _data2) data2.reverse()
                data2.push(_tmp)
            }
            return data2
        }

        numlist.push(..._numlist)
    }
    isInit
        ? createData(totalNum.value)
        : totalNum.value > numlist.length
            ? createData(totalNum.value - numlist.length)
            : numlist.length = totalNum.value

    score.value = 0

    edit(true);
    curidx.value = "";
    startTime.value = Date.now()
    contTime()
    curidx.value = 0;
}
createList(true);

/**
 * 播放音频
 * @author ToviLau 46134256@qq.com
 * @param name {string} 音频地址
 * @param loop {boolean} 是否循环播放
 * @param volume 音量大小(1-20)
 * @return 当前媒体实例对象
 */
const playSound = ({ name: src, loop = false, volume = storageConf.bgmVolume }) => {
    const innerAudioContext = uni.createInnerAudioContext();
    Object.assign(innerAudioContext, {
        src,
        volume: volume / 20,
        autoplay: true,
        loop
    })
    innerAudioContext.onEnded(() => {
        innerAudioContext.destroy()
    })
    return innerAudioContext
}

// BGM
const bgm = playSound({ name: musicArr['bgm-sxg_mp3'], loop: true })

/**
 * 计时操作
 * @author ToviLau 46134256@qq.com
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
    curidx.value = numlist.findIndex(res => [undefined, 0, ''].includes(res[2]))
    startTime.value = startTime.value + ((Date.now() - subEnterTime.value).toString().replace(/\d{3}$/, '000') - 0 + 1000)
    contTime()
}

/**
 * 选择的索引(正在计算的四则运算)
 * @author ToviLau 46134256@qq.com
 * @param {number} idx // 索引号
 */
const ckItem = (idx) => {
    if (submited.value === 0) playSound({ name: musicArr['dian1_mp3'] })
    curidx.value = idx;
    if (numlist[idx][2] === 0 && submited.value !== 1) numlist[idx][2] = ''
};

/**
 * 数字键盘点击事件
 * @author ToviLau 46134256@qq.com
 * @param {string|number} key // 键盘数字 || 或del
 */
const keyNum = (key) => {
    playSound({ name: musicArr['dian2_mp3'] })
    if (
        numlist[curidx.value][2] === 1  // 已判定当前题为正确
        || key === 'del' && ['', undefined].includes(numlist[curidx.value][1]) // 册除事件 并 内容为空时
    ) return
    const _val = (numlist[curidx.value][1] || "") + '';

    numlist[curidx.value][1] = key === "del"
        // 删除事件
        ? numlist[curidx.value][2] !== 1
            ? numlist[curidx.value][2] === 0 ? '' : _val.substring(0, _val.length - 1)
            : _val
        // 数字输入事件(最大4位数)
        : numlist[curidx.value][2] !== 1 && _val.length < 4
            ? _val + key - 0
            : _val - 0;
    // 恢复下标4(对错判断)标识为:空 (错:0, 对:1, 无:'')
    if (numlist[curidx.value][2] !== 1) numlist[curidx.value].splice(2, 1, '')
};

// 计算表达式答案
function expressionResult(data) {
    const _tmp = [
        Array.isArray(data[0]) ? expressionResult(data[0]) : data[0],
        Array.isArray(data[1]) ? expressionResult(data[1]) : data[1]
    ]
    switch (data[2]) {
        case 0:
            return _tmp[0] + _tmp[1]
        case 1:
            return _tmp[0] - _tmp[1]
        case 2:
            return _tmp[0] * _tmp[1]
        case 3:
            return _tmp[0] / _tmp[1]
    }
}

// 查看得分事件
const subEnter = () => {
    playSound({ name: musicArr['dian2_mp3'] })
    subEnterTime.value = Date.now()
    // 锁定提交状态
    submited.value = 1;
    contTime(true)

    // 对错判定
    numlist.map((res) => {
        let _val = expressionResult(res[0])

        if ([''].includes(res[2]) && !['', undefined].includes(res[1])) res[3] = !['', undefined].includes(res[3]) ? res[3] + 1 : 0 // 订正次数
        if (!['', undefined].includes(res[1])) res[2] = _val === res[1] ? 1 : 0; // 1对,0错
    });

    const totleLen = numlist.length; // 总题数
    const rightLen = numlist.filter((res) => res[2] === 1).length; // 正确题数量
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
            playSound({ name: musicArr['wa_mp3'] })
            break;
        case score.value > 89: // 90+
            comment.value = commentArr[1];
            playSound({ name: musicArr['ao_mp3'] })
            break;
        case score.value > 79: // 80+
            comment.value = commentArr[2];
            playSound({ name: musicArr['tantiao_mp3'] })
            break;
        case score.value > 69: // 70+
            comment.value = commentArr[3];
            playSound({ name: musicArr['jiong_mp3'] })
            break;
        default:
            comment.value = commentArr[4];
            playSound({ name: musicArr['wrong_mp3'] }).onEnded(() => {
                playSound({ name: musicArr['ou-no_mp3'] })
            })
    }

    // 没有做满50%题不给评语
    const fillLen = numlist.filter((res) => res[1]).length;
    if (totleLen * 0.5 > fillLen) comment.value = commentArr[5];
};

// 设置窗口显隐
const showConfig = (val = false) => {
    playSound({ name: musicArr['dian2_mp3'] })
    if (val) Object.assign(setConfig, getStorageData())
    setConfig.status = val
}

// 滑块题目数量设置
function setNumFn(num) {
    setConfig.totalNum = num
}

// 恢复默认
const setNumDefault = () => {
    playSound({ name: musicArr['dian2_mp3'] })
    Object.assign(setConfig, defaultConf)
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
    bgm.volume = setConfig.bgmVolume / 20

    // 运算规则 或 难度变动 列表都要重新生成
    console.log(isMixed.value[0], setConfig.isMixed[0]);
    if (opType.value !== setConfig.opType || difficulty.value !== setConfig.difficulty || isMixed.value[0] !== setConfig.isMixed[0]) {
        opType.value = setConfig.opType // 运算规则变动
        difficulty.value = setConfig.difficulty // 难度变动
        isMixed.value = setConfig.isMixed
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
    bgm.volume = getStorageData().bgmVolume / 20
    showConfig(false)
}

// 题目数量滑块更新
const setNumChange = val => {
    bgm.volume = setConfig.bgmVolume / 20
    setNumFn(Math.round(val / 10) * 10)
}

// 音量滑块更新
const bgmVolumeChange = val => {
    setConfig.bgmVolume = val
    bgm.volume = val / 20
}

onShow(() => {
    setTimeout(() => {
        bgm.volume = setConfig.bgmVolume / 20
    }, 10)
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
        font-size: 26rpx;
        padding: 0 1em;
        color: #666;
        // background-color: #f9f9f9;
        background-color: #e9e9e9;
        display: flex;
        justify-content: space-between;
        line-height: 1.5em;
        // .top-left {}
        // .top-right {}
    }

    //   height: 100vh;
    .list {
        display: flex;
        align-content: flex-start;
        flex: 1;
        overflow: auto;
        flex-wrap: wrap;
        padding: 0.25em .1em;

        .list-item {
            border-bottom: 1px solid #ccc;
            font-size: 30rpx;
            line-height: 2.95em;
            // width: 42%;
            padding-left: .6em;
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            text-align: center;
            color: #333;
            min-width: 9.75em;
            flex: 1;
            margin: 0 .5em;

            &.list-item-none {
                border: none;
                line-height: 0;
            }

            .list-item-idx {
                border: 1px solid #f0f0f0;
                border-radius: 5rpx;
                color: #ccc;
                padding: 0 0.3em;
                width: 1.8em;
                line-height: 1.6em;
                margin-right: 0.35em;
                font-size: 18rpx;
                background-image: linear-gradient(180deg, #e9e9e9, transparent);
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

                .list-item-idx {
                    background-image: linear-gradient(0deg, rgba(182, 170, 250, 0.35), transparent);
                    color: rgba(182, 170, 250, 0.6);
                }
            }

            .tip-wrong {
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(244, 227, 172, 0.6);
                color: #c9a631;
                line-height: 1.6em;
                font-size: 18rpx;
                padding: 0 .5em;
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

                &>.pan-item:not(.pan-enter),
                .pan-del {
                    background-color: #f6f6f6;
                    color: #ccc;
                }
            }
        }

        .pan-item,
        .fen-item {
            margin: 6rpx 0;
            line-height: 2.6em;
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
                line-height: 1.8em;

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

        .easyKeyboard .pan-item {
            width: 18%;
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
            justify-content: center;
            align-items: center;
        }

        .pan-set-btn {
            background: url(../../assets/set.svg) center/cover no-repeat;
            width: 1.5em;
            height: 1.5em;
        }

        .fen {
            .fen-title {
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
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    height: .06em;
                    background-color: #ed5d46;
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
            background-color: #fff;
            display: flex;
            flex-direction: column;


            .set-sys-title {
                background-image: linear-gradient(180deg, #e0e0e0, #fcfcfc);
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
                // padding: 1em;
                margin-bottom: -.5em;
            }

            .set-sys-db-list {
                display: flex;
                align-items: center;
                width: 90%;
                padding: .2em;
                font-size: 26rpx;
                line-height: 2.25em;

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
                            font-size: 16rpx;

                        }
                    }

                    .label-ckd {
                        margin-left: 1em;

                        :deep(.checklist-box) {
                            .checklist-text {
                                color: #c0c0c0 !important;
                            }

                            &.is-checked {
                                .checklist-text {
                                    color: #55a4f3 !important;
                                }
                            }
                        }
                    }
                }

                .cur {
                    color: #55a4f3;
                }

                .set-sys-switch {
                    display: flex;
                    align-items: center;
                    color: #c0c0c0;
                    font-size: 20rpx;
                    margin-right: 1em;

                    :deep(.uni-switch-input) {
                        background-color: #55a4f3 !important;
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

            }

            .set-slider {
                width: 90%;
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

            .btns {
                display: flex;
                margin-top: 1em;
                width: 100%;


                .set-btn {
                    margin: 6rpx 0;
                    line-height: 1.8em;
                    text-align: center;
                    box-shadow: 0 0 0 1rpx #cfcfcf;
                    background-color: #f0f0f0;
                    border-radius: 5rpx;
                    color: #666;

                    color: #fcfcfc;
                    box-shadow: none;
                    flex: 1;
                    line-height: 1.8em;

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
}
</style>
