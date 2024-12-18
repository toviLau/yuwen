<!--
 * @Author       : ToviLau 46134256@qq.com
 * @Date         : 2022-09-23 22:46:19
 * @LastEditors  : ToviLau 46134256@qq.com
 * @LastEditTime : 2024-09-02 17:13:18
-->
<template>
    <page-meta class="page" page-orientation="landscape" root-font-size="16px">
        <view class="content">
            <div class="btns">
                <div class="btn" @click="randomList(selectArr)">打乱</div>
                <div class="btn" @click="show = showPopup()">筛选</div>
            </div>
            <div class="list">
                <div class="list-content">
                    <div
                        class="list-item"
                        :class="{
                            'list-item-hover':
                                focus && item.value === focus.value,
                            // sm: item.audio.type === 'sm',
                            // dym: item.audio.type === 'dym',
                            // fym: item.audio.type === 'fym',
                        }"
                        v-for="item in selectArr"
                        :key="item.value"
                        @click="itemCk(item)"
                    >
                        <div class="type-tips">
                            {{
                                {
                                    sm: "声母",
                                    dym: "单韵母",
                                    fym: "复韵母",
                                    qbym: "前鼻韵母",
                                    hbym: "后鼻韵母",
                                    whole: "整体认读",
                                }[item.type]
                            }}
                        </div>
                        <span
                            class="iconfont icon-volume"
                            :class="{
                                playing: readPlaying === item.value,
                            }"
                            @click="playAudio({ ...item })"
                            :key="item.value"
                            v-if="item?.audio?.src && item?.audio?.areaTime"
                        ></span>
                        {{ item.value }}
                    </div>
                    <div
                        class="list-item"
                        v-for="i in selectArr.length % 6 > 0
                            ? Math.abs(6 - (selectArr.length % 6))
                            : 0"
                        :key="i"
                    />
                </div>
            </div>
            <div class="select" :style="{ display: show ? 'flex' : 'none' }">
                <div class="form">
                    <!-- <div class="switch">合并模式:
                        <switch :checked="isMerge"
                                color="#FFCC33"
                                @change="s=>isMerge = s.detail.value"
                                style="transform:scale(0.7)"/>
                        <span class="tip"
                                v-show="isMerge">声母可选: {{ selectLenSm }}个 - 韵母可选: {{ selectLenYm }}个</span>
                    </div> -->

                    <div class="label">快捷选择</div>
                    <div class="btns">
                        <div class="btn" @click="reload('sm')">声母</div>
                        <div class="btn" @click="reload('selDef')">
                            单韵母(默认)
                        </div>
                        <div class="btn" @click="reload('fym')">复韵母</div>
                        <div class="btn" @click="reload('bym')">鼻韵母</div>
                        <div class="btn" @click="reload('ztrd')">整体认读</div>
                        <div class="btn" @click="randomSelectFn">随机抽选</div>
                        <div
                            class="btn"
                            @click="reload('none')"
                            style="margin-left: 2em"
                        >
                            清除所选
                        </div>
                    </div>
                    <icon
                        type="cancel"
                        size="26"
                        color="#f0f0f0"
                        @click="show = showPopup()"
                    />
                </div>
                <div style="overflow: auto; flex: 1">
                    <div
                        class="select-li"
                        vif="'合并模式' && !(isMerge && ['ym1', 'ztrd'].includes(list))"
                        v-for="(list, index) in Object.keys(pyList)"
                        :key="list"
                    >
                        <div class="select-label">{{ pyList[list].title }}</div>
                        <div class="select-items">
                            <div
                                class="select-item"
                                :class="{
                                    active: hasInclude(item),
                                    // 'ym-ghbs': list !== 'sm'
                                }"
                                v-for="item in pyList[list].list"
                                :key="'select' + item.value"
                                @click="() => opSelectArr(item)"
                            >
                                {{ item.value }}
                            </div>
                            <!-- <div class="select-group" v-if="index%4===0">
                            </div> -->
                        </div>
                    </div>
                </div>
            </div>
        </view>
    </page-meta>

    <cc-popup :isShow="randomSelect" width="65%" height="auto" radius="6rpx">
        <div class="popup-dialog">
            <span class="iconfont icon-wrong" @click="randomSelectColse"></span>
            <div class="popup-dialog-title">请选择要抽选的数量</div>
            <div class="popup-dialog-content">
                <div
                    class="popup-dialog-content-item"
                    @click="() => reload(i * 6 + 6)"
                    v-for="i in 4"
                    :key="i"
                >
                    {{ i * 6 + 6 }}
                </div>
            </div>
            <!-- <div class="popup-dialog-footer">
                <div class="popup-dialog-footer-item clean">取消</div>
            </div> -->
        </div>
    </cc-popup>
</template>

<script setup>
import { onMounted, ref, reactive, watch } from "vue";
import { getGradeName, playSound } from "@/module/tools";
import ccPopup from "@/uni_modules/cc-popup";

const pinyins = import.meta.globEager("../../../assets/pinyin/*.mp3");
const pinyinArr = reactive({});
Object.keys(pinyins).forEach((key) => {
    const _key = key.replace(/.+?([^\/\\]+)\.(\w+)$/g, "$1_$2");
    pinyinArr[_key] = pinyins[key].default;
});

const readPlaying = ref(""); // 是否播阅读放中
const focus = reactive({}); // tfq

const randomSelect = ref(false);
const randomSelectFn = () => {
    randomSelect.value = !randomSelect.value;
};
// #ifdef MP-WEIXIN
uni.showShareMenu({
    title: `四小${["一", "二", "三", "四", "五", "六"][getGradeName().y]}(8)班`,
    content: "语文拼音练习",
    imageUrl: "/assets/icon.jpeg",
    path: "/pages/yuwen/index",
});
// #endif

const randomSelectColse = () => (randomSelect.value = !randomSelect.value);
// const audioPathHost = "http://file.7bzc.com/mp-yuwen/audio/pinyin"
// 拼音表
const pyList = {
    sm: {
        title: "声母",
        list: [
            {
                value: "b",
                audio: { src: pinyinArr["sm1_mp3"], areaTime: [0, 1500] },
            },
            // { value: 'b', audio: { src: audioPathHost + '/sm1.mp3', areaTime: [0, 1500] } },
            {
                value: "p",
                audio: { src: pinyinArr["sm1_mp3"], areaTime: [2, 1500] },
            },
            {
                value: "m",
                audio: { src: pinyinArr["sm1_mp3"], areaTime: [4, 1500] },
            },
            {
                value: "f",
                audio: { src: pinyinArr["sm1_mp3"], areaTime: [6, 1500] },
            },
            {
                value: "d",
                audio: { src: pinyinArr["sm1_mp3"], areaTime: [8, 1500] },
            },
            {
                value: "t",
                audio: { src: pinyinArr["sm1_mp3"], areaTime: [10, 1500] },
            },
            {
                value: "n",
                audio: { src: pinyinArr["sm1_mp3"], areaTime: [12, 1500] },
            },
            {
                value: "l",
                audio: { src: pinyinArr["sm1_mp3"], areaTime: [14, 1500] },
            },
            {
                value: "g",
                audio: { src: pinyinArr["sm1_mp3"], areaTime: [16, 1500] },
            },
            {
                value: "k",
                audio: { src: pinyinArr["sm1_mp3"], areaTime: [18, 1500] },
            },
            {
                value: "h",
                audio: { src: pinyinArr["sm1_mp3"], areaTime: [20, 1500] },
            },
            {
                value: "j",
                audio: { src: pinyinArr["sm1_mp3"], areaTime: [22, 1500] },
            },
            {
                value: "q",
                audio: { src: pinyinArr["sm1_mp3"], areaTime: [24, 1500] },
            },
            {
                value: "x",
                audio: { src: pinyinArr["sm1_mp3"], areaTime: [26, 1500] },
            },

            {
                value: "z",
                audio: { src: pinyinArr["sm2_mp3"], areaTime: [0, 1500] },
            },
            {
                value: "c",
                audio: { src: pinyinArr["sm2_mp3"], areaTime: [2, 1500] },
            },
            {
                value: "s",
                audio: { src: pinyinArr["sm2_mp3"], areaTime: [4, 1500] },
            },
            {
                value: "zh",
                audio: { src: pinyinArr["sm2_mp3"], areaTime: [6, 1500] },
            },
            {
                value: "ch",
                audio: { src: pinyinArr["sm2_mp3"], areaTime: [8, 1500] },
            },
            {
                value: "sh",
                audio: { src: pinyinArr["sm2_mp3"], areaTime: [10, 1500] },
            },
            {
                value: "r",
                audio: { src: pinyinArr["sm2_mp3"], areaTime: [12, 1500] },
            },
            {
                value: "y",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [60, 1500] },
            },
            {
                value: "w",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [70, 1500] },
            },
        ],
    },
    dym: {
        title: "单韵母",
        // list: (() => Object.keys(dictionary).map(item => dictionary[item]))(),
        list: [
            {
                key: "ā",
                value: "`",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [0, 1500] },
            },
            {
                key: "á",
                value: "1",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [2, 1500] },
            },
            {
                key: "ǎ",
                value: "2",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [4, 1500] },
            },
            {
                key: "à",
                value: "3",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [6, 1500] },
            },

            {
                key: "ō",
                value: "4",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [10, 1500] },
            },
            {
                key: "ó",
                value: "5",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [12, 1500] },
            },
            {
                key: "ǒ",
                value: "6",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [14, 1500] },
            },
            {
                key: "ò",
                value: "7",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [16, 1500] },
            },

            {
                key: "ē",
                value: "8",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [20, 1500] },
            },
            {
                key: "é",
                value: "9",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [22, 1500] },
            },
            {
                key: "ě",
                value: "0",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [24, 1500] },
            },
            {
                key: "è",
                value: "-",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [26, 1500] },
            },

            {
                key: "ī",
                value: "~",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [30, 1500] },
            },
            {
                key: "í",
                value: "!",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [32, 1500] },
            },
            {
                key: "ǐ",
                value: "@",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [34, 1500] },
            },
            {
                key: "ì",
                value: "#",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [36, 1500] },
            },

            {
                key: "ū",
                value: "$",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [40, 1500] },
            },
            {
                key: "ú",
                value: "%",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [42, 1500] },
            },
            {
                key: "ǔ",
                value: "^",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [44, 1500] },
            },
            {
                key: "ù",
                value: "&",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [46, 1500] },
            },

            {
                key: "ǖ",
                value: "*",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [50, 1500] },
            },
            {
                key: "ǘ",
                value: "(",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [52, 1500] },
            },
            {
                key: "ǚ",
                value: ")",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [54, 1500] },
            },
            {
                key: "ǜ",
                value: "_",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [56, 1500] },
            },
        ],
    },
    fym: {
        title: "复韵母",
        list: [
            {
                key: "āi",
                value: "`i",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [0, 1500] },
            },
            {
                key: "ái",
                value: "1i",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [2, 1500] },
            },
            {
                key: "ǎi",
                value: "2i",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [4, 1500] },
            },
            {
                key: "ài",
                value: "3i",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [6, 1500] },
            },
            {
                key: "ēi",
                value: "8i",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [10, 1500] },
            },
            {
                key: "éi",
                value: "9i",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [12, 1500] },
            },
            {
                key: "ěi",
                value: "0i",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [14, 1500] },
            },
            {
                key: "èi",
                value: "-i",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [16, 1500] },
            },
            {
                key: "uī",
                value: "u~",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [20, 1500] },
            },
            {
                key: "uí",
                value: "u!",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [22, 1500] },
            },
            {
                key: "uǐ",
                value: "u@",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [24, 1500] },
            },
            {
                key: "uì",
                value: "u#",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [26, 1500] },
            },
            {
                key: "āo",
                value: "`o",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [30, 1500] },
            },
            {
                key: "áo",
                value: "1o",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [32, 1500] },
            },
            {
                key: "ǎo",
                value: "2o",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [34, 1500] },
            },
            {
                key: "ào",
                value: "3o",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [36, 1500] },
            },
            {
                key: "ōu",
                value: "4u",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [40, 1500] },
            },
            {
                key: "óu",
                value: "5u",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [42, 1500] },
            },
            {
                key: "ǒu",
                value: "6u",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [44, 1500] },
            },
            {
                key: "òu",
                value: "7u",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [46, 1500] },
            },
            {
                key: "iǖ",
                value: "i*",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [50, 1500] },
            },
            {
                key: "iǘ",
                value: "i(",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [52, 1500] },
            },
            {
                key: "iǚ",
                value: "i)",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [54, 1500] },
            },
            {
                key: "iǜ",
                value: "i_",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [56, 1500] },
            },

            {
                key: "ie",
                value: "ie",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [60, 1500] },
            },
            {
                key: "ve",
                value: "ve",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [62, 1500] },
            },
            {
                key: "er",
                value: "er",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [64, 1500] },
            },
            // { key: 'iē', value: 'i8', audio: { src: pinyinArr['fym_mp3'], areaTime: [16, 1500] } },
            // { key: 'ié', value: 'i9', audio: { src: pinyinArr['fym_mp3'], areaTime: [18, 1500] } },
            // { key: 'iě', value: 'i0', audio: { src: pinyinArr['fym_mp3'], areaTime: [20, 1500] } },
            // { key: 'iè', value: 'i-', audio: { src: pinyinArr['fym_mp3'], areaTime: [22, 1500] } },
            // { key: 'vē', value: 'v8', audio: { src: pinyinArr['fym_mp3'], areaTime: [16, 1500] } },
            // { key: 'vé', value: 'v9', audio: { src: pinyinArr['fym_mp3'], areaTime: [18, 1500] } },
            // { key: 'vě', value: 'v0', audio: { src: pinyinArr['fym_mp3'], areaTime: [20, 1500] } },
            // { key: 'vè', value: 'v-', audio: { src: pinyinArr['fym_mp3'], areaTime: [22, 1500] } },
            // { key: 'ēr', value: '8r', audio: { src: pinyinArr['fym_mp3'], areaTime: [16, 1500] } },
            // { key: 'ér', value: '9r', audio: { src: pinyinArr['fym_mp3'], areaTime: [18, 1500] } },
            // { key: 'ěr', value: '0r', audio: { src: pinyinArr['fym_mp3'], areaTime: [20, 1500] } },
            // { key: 'èr', value: '-r', audio: { src: pinyinArr['fym_mp3'], areaTime: [22, 1500] } },
        ],
    },
    qbym: {
        title: "前鼻韵母",
        list: [
            {
                key: "an",
                value: "an",
                audio: { src: pinyinArr["bym_mp3"], areaTime: [0, 1500] },
            },
            {
                key: "en",
                value: "en",
                audio: { src: pinyinArr["bym_mp3"], areaTime: [2, 1500] },
            },
            {
                key: "in",
                value: "in",
                audio: { src: pinyinArr["bym_mp3"], areaTime: [4, 1500] },
            },
            {
                key: "un",
                value: "un",
                audio: { src: pinyinArr["bym_mp3"], areaTime: [6, 1500] },
            },
            {
                key: "vn",
                value: "vn",
                audio: { src: pinyinArr["bym_mp3"], areaTime: [8, 1500] },
            },
            // { key: 'ān', value: '`n', audio: { src: pinyinArr['1111111_mp3'], areaTime: [0, 1500] }},
            // { key: 'án', value: '1n', audio: { src: pinyinArr['1111111_mp3'], areaTime: [2, 1500] } },
            // { key: 'ǎn', value: '2n', audio: { src: pinyinArr['1111111_mp3'], areaTime: [4, 1500] } },
            // { key: 'àn', value: '3n', audio: { src: pinyinArr['1111111_mp3'], areaTime: [6, 1500] } },
            // { key: 'ēn', value: '8n', audio: { src: pinyinArr['1111111_mp3'], areaTime: [16, 1500] } },
            // { key: 'én', value: '9n', audio: { src: pinyinArr['1111111_mp3'], areaTime: [18, 1500] } },
            // { key: 'ěn', value: '0n', audio: { src: pinyinArr['1111111_mp3'], areaTime: [20, 1500] } },
            // { key: 'èn', value: '-n', audio: { src: pinyinArr['1111111_mp3'], areaTime: [22, 1500] } },
            // { key: 'īn', value: '~n', audio: { src: pinyinArr['1111111_mp3'], areaTime: [24, 1500] } },
            // { key: 'ín', value: '!n', audio: { src: pinyinArr['1111111_mp3'], areaTime: [26, 1500] } },
            // { key: 'ǐn', value: '@n', audio: { src: pinyinArr['1111111_mp3'], areaTime: [28, 1500] } },
            // { key: 'ìn', value: '#n', audio: { src: pinyinArr['1111111_mp3'], areaTime: [30, 1500] } },
            // { key: 'ūn', value: '$n', audio: { src: pinyinArr['1111111_mp3'], areaTime: [32, 1500] } },
            // { key: 'ún', value: '%n', audio: { src: pinyinArr['1111111_mp3'], areaTime: [34, 1500] } },
            // { key: 'ǔn', value: '^n', audio: { src: pinyinArr['1111111_mp3'], areaTime: [36, 1500] } },
            // { key: 'ùn', value: '&n', audio: { src: pinyinArr['1111111_mp3'], areaTime: [38, 1500] } },
            // { key: 'ǖn', value: '*n', audio: { src: pinyinArr['1111111_mp3'], areaTime: [40, 1500] } },
            // { key: 'ǘn', value: '(n', audio: { src: pinyinArr['1111111_mp3'], areaTime: [42, 1500] } },
            // { key: 'ǚn', value: ')n', audio: { src: pinyinArr['1111111_mp3'], areaTime: [44, 1500] } },
            // { key: 'ǜn', value: '_n', audio: { src: pinyinArr['1111111_mp3'], areaTime: [46, 1500] } }
        ],
    },
    hbym: {
        title: "后鼻韵母",
        list: [
            {
                key: "ang",
                value: "ang",
                audio: { src: pinyinArr["bym_mp3"], areaTime: [10, 1500] },
            },
            {
                key: "eng",
                value: "eng",
                audio: { src: pinyinArr["bym_mp3"], areaTime: [12, 1500] },
            },
            {
                key: "ing",
                value: "ing",
                audio: { src: pinyinArr["bym_mp3"], areaTime: [14, 1500] },
            },
            {
                key: "ong",
                value: "ong",
                audio: { src: pinyinArr["bym_mp3"], areaTime: [16, 1500] },
            },
            // { key: 'āng', value: '`ng', audio: { src: pinyinArr['1111111_mp3'], areaTime: [0, 1500] } },
            // { key: 'áng', value: '1ng', audio: { src: pinyinArr['1111111_mp3'], areaTime: [2, 1500] } },
            // { key: 'ǎng', value: '2ng', audio: { src: pinyinArr['1111111_mp3'], areaTime: [4, 1500] } },
            // { key: 'àng', value: '3ng', audio: { src: pinyinArr['1111111_mp3'], areaTime: [6, 1500] } },
            // { key: 'ēng', value: '8ng', audio: { src: pinyinArr['1111111_mp3'], areaTime: [16, 1500] } },
            // { key: 'éng', value: '9ng', audio: { src: pinyinArr['1111111_mp3'], areaTime: [18, 1500] } },
            // { key: 'ěng', value: '0ng', audio: { src: pinyinArr['1111111_mp3'], areaTime: [20, 1500] } },
            // { key: 'èng', value: '-ng', audio: { src: pinyinArr['1111111_mp3'], areaTime: [22, 1500] } },
            // { key: 'īng', value: '~ng', audio: { src: pinyinArr['1111111_mp3'], areaTime: [24, 1500] } },
            // { key: 'íng', value: '!ng', audio: { src: pinyinArr['1111111_mp3'], areaTime: [26, 1500] } },
            // { key: 'ǐng', value: '@ng', audio: { src: pinyinArr['1111111_mp3'], areaTime: [28, 1500] } },
            // { key: 'ìng', value: '#ng', audio: { src: pinyinArr['1111111_mp3'], areaTime: [30, 1500] } },
            // { key: 'ōng', value: '4ng', audio: { src: pinyinArr['1111111_mp3'], areaTime: [8, 1500] } },
            // { key: 'óng', value: '5ng', audio: { src: pinyinArr['1111111_mp3'], areaTime: [10, 1500] } },
            // { key: 'ǒng', value: '6ng', audio: { src: pinyinArr['1111111_mp3'], areaTime: [12, 1500] } },
            // { key: 'òng', value: '7ng', audio: { src: pinyinArr['1111111_mp3'], areaTime: [14, 1500] } },
        ],
    },
    whole: {
        title: "整体认读",
        list: [
            {
                key: "zi",
                value: "zi",
                audio: { src: pinyinArr["sm2_mp3"], areaTime: [14, 1500] },
            },
            {
                key: "ci",
                value: "ci",
                audio: { src: pinyinArr["sm2_mp3"], areaTime: [16, 1500] },
            },
            {
                key: "si",
                value: "si",
                audio: { src: pinyinArr["sm2_mp3"], areaTime: [18, 1500] },
            },
            {
                key: "zhi",
                value: "zhi",
                audio: { src: pinyinArr["sm2_mp3"], areaTime: [20, 1500] },
            },
            {
                key: "chi",
                value: "chi",
                audio: { src: pinyinArr["sm2_mp3"], areaTime: [22, 1500] },
            },
            {
                key: "shi",
                value: "shi",
                audio: { src: pinyinArr["sm2_mp3"], areaTime: [24, 1500] },
            },
            {
                key: "ri",
                value: "ri",
                audio: { src: pinyinArr["sm2_mp3"], areaTime: [26, 1500] },
            },

            {
                key: "y~",
                value: "y~",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [60, 1500] },
            },
            {
                key: "y!",
                value: "y!",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [62, 1500] },
            },
            {
                key: "y@",
                value: "y@",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [64, 1500] },
            },
            {
                key: "y#",
                value: "y#",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [66, 1500] },
            },

            {
                key: "w$",
                value: "w$",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [70, 1500] },
            },
            {
                key: "w%",
                value: "w%",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [72, 1500] },
            },
            {
                key: "w^",
                value: "w^",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [74, 1500] },
            },
            {
                key: "w&",
                value: "w&",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [76, 1500] },
            },

            {
                key: "y$",
                value: "y$",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [80, 1500] },
            },
            {
                key: "y%",
                value: "y%",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [82, 1500] },
            },
            {
                key: "y^",
                value: "y^",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [84, 1500] },
            },
            {
                key: "y&",
                value: "y&",
                audio: { src: pinyinArr["dym_mp3"], areaTime: [86, 1500] },
            },
            {
                key: "ye",
                value: "ye",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [70, 1500] },
            },
            // { value: 'ye', audio: '' },
            // { value: 'ye', audio: '' },
            // { value: 'ye', audio: '' },
            {
                key: "yue",
                value: "yue",
                audio: { src: pinyinArr["fym_mp3"], areaTime: [72, 1500] },
            },
            // { value: 'yue', audio: '' },
            // { value: 'yue', audio: '' },
            // { value: 'yue', audio: '' },
            {
                key: "yuan",
                value: "yuan",
                audio: { src: pinyinArr["bym_mp3"], areaTime: [18, 1500] },
            },
            {
                key: "yin",
                value: "yin",
                audio: { src: pinyinArr["bym_mp3"], areaTime: [20, 1500] },
            },
            {
                key: "yun",
                value: "yun",
                audio: { src: pinyinArr["bym_mp3"], areaTime: [22, 1500] },
            },
            {
                key: "ying",
                value: "ying",
                audio: { src: pinyinArr["bym_mp3"], areaTime: [24, 1500] },
            },
            // { value: 'yuan', audio: '' },
            // { value: 'yuan', audio: '' },
            // { value: 'yuan', audio: '' },
            // { value: 'y~n', audio: '' },
            // { value: 'y!n', audio: '' },
            // { value: 'y@n', audio: '' },
            // { value: 'y#n', audio: '' },
            // { value: 'yun', audio: '' },
            // { value: 'yun', audio: '' },
            // { value: 'yun', audio: '' },
            // { value: 'yun', audio: '' },
            // { value: 'y~ng', audio: '' },
            // { value: 'y!ng', audio: '' },
            // { value: 'y@ng', audio: '' },
            // { value: 'y#ng', audio: '' },
        ],
    },
};
Object.keys(pyList).forEach((key) => {
    pyList[key].list.map((res) => {
        res.type = key;
        return res;
    });
});
const show = ref(false); // 筛选列表是否显示
const defList = [...pyList.dym.list]; // 默认筛选列表
const selectArr = ref([...defList]); // 已筛选列表
const isMerge = ref(false);
const selectLenSm = ref(0);
const selectLenYm = ref(0);

/**
 * value
 * audio:
 *   src: 资源路径
 *   areaTime: 播放时间[开始时间, 播放时长[ms]]
 *   whole: 是否整体认读
 * @param {*} item
 */
const playAudio = (item) => {
    if (readPlaying.value) return; // 防抖
    const {
        value,
        type,
        audio: { src, areaTime },
    } = item;
    readPlaying.value = value;

    const audioFn = () => {
        const audio = playSound({
            src,
            volume: 18,
            areaTime,
            loop: false,
        });

        audio.onStop(() => {
            readPlaying.value = "";
        });
        audio.onError((error) => {
            const errCode = {
                10001: "系统错误",
                10002: "网络错误",
                10003: "文件错误",
                10004: "格式错误",
                "-1": "未知错误",
            };
            setTimeout(() => {
                readPlaying.value = "";
            }, 1000);

            uni.showToast({
                icon: "none",
                title: (errCode[error] || "网络错误") + "，请稍后再试",
            });
        });
    };
    if (type) {
        let areaTime = [0, 0];
        switch (type) {
            case "dym":
                areaTime = [0, 1500];
                break;
            case "fym":
                areaTime = [2, 1500];
                break;
            case "sm":
                areaTime = [4, 1500];
                break;
            case "qbym":
                areaTime = [6, 1600];
                break;
            case "hbym":
                areaTime = [8, 1600];
                break;
            case "whole":
                areaTime = [10, 2000];
        }
        playSound({
            src: pinyinArr["type_mp3"],
            volume: 10,
            areaTime,
            loop: false,
        }).onStop(function () {
            audioFn();
        });
    } else audioFn();
};

const itemCk = (item) => {
    Object.assign(focus, item);
};

// watch(isMerge, async (_isMerge) => {
//     reload(_isMerge);
// });
watch(
    selectArr,
    async (_selectArr) => {
        const _tmpList = Object.values(_selectArr);
        let count = 0;
        _tmpList.forEach((res) => {
            count += pyList.sm.list.includes(res) ? 1 : 0;
        });
        selectLenSm.value = 6 - count;
        selectLenYm.value =
            ~~(30 / (6 - selectLenSm.value)) - _tmpList.length + count;
    },
    { deep: true }
);

/**
 * 是否显示筛选
 * @param {boolean} status 是否显示
 */
const showPopup = (status) => status || !show.value;

// 打乱
const randomList = (arr, count = 2) => {
    const random = () => Math.random().toFixed(1) - 0;
    while (count > 0) {
        arr.sort(() => (random() < 0.5 ? 1 : random() > 0.5 ? -1 : 0));
        count--;
    }
};

/**
 * 重载选择
 * @param {string} type 是否清空
 * @return {any[]}
 */
const reload = (type) => {
    // if (isMerge.value) isMerge.value = isClear;
    switch (type) {
        case "sm":
            selectArr.value.splice(
                0,
                selectArr.value.length,
                ...pyList.sm.list
            );
            break;
        case "selDef":
            selectArr.value.splice(0, selectArr.value.length, ...defList);
            break;
        case "none":
            selectArr.value.splice(0, selectArr.value.length);
            break;
        case "fym":
            selectArr.value.splice(
                0,
                selectArr.value.length,
                ...pyList.fym.list
            );
            break;
        case "bym":
            selectArr.value.splice(
                0,
                selectArr.value.length,
                ...[...pyList.qbym.list, ...pyList.hbym.list]
            );
            break;
        case "ztrd":
            selectArr.value.splice(
                0,
                selectArr.value.length,
                ...pyList.whole.list
            );
            break;
        default:
            const _allStr = [];
            Object.keys(pyList).forEach((key) => {
                _allStr.push(...pyList[key].list);
            });
            randomList(_allStr, 10);
            _allStr.length = type;
            selectArr.value = _allStr;
            randomSelectColse();
    }
    randomList(selectArr.value);
};

/**
 * 筛选列表是否已包涵 s 字符
 * @param {string} s 被判断的字符
 */
const hasInclude = (s) => selectArr.value.includes(s);

/**
 * [添加/删除]选中字符
 * @param {string} i 被[添加/删除]的字符
 * @param {number} maxStrlen 最多选择
 */
const opSelectArr = (item, maxStrlen = 30) => {
    hasInclude(item)
        ? selectArr.value.splice(
              selectArr.value.findIndex((j) => j.value === item.value),
              1
          )
        : selectArr.value.length < maxStrlen
        ? selectArr.value.push(item)
        : uni.showToast({
              title: `最多选 ${maxStrlen} 个`,
              duration: 2000,
              icon: "none",
          });
};

onMounted(() => randomList(selectArr.value));
</script>

<style lang="less">
.content {
    display: flex;
    align-items: flex-start;
    // height: 100vh;
    width: 100vw;

    .btns {
        display: flex;
        flex-direction: column;

        .btn {
            background-image: linear-gradient(
                0deg,
                var(--c-safegray-light),
                var(--c-safegray-hlight)
            );
            color: var(--c-safegray-darker);
            padding: 0.35em 1em;
            border-radius: 0.35em;
            display: inline-block;
            // border: 1px solid var(--c-safegray-hlight);
            margin: 0.5em;
        }
    }
}

@font-face {
    // 引入拼音字体库
    font-family: "pinyin";
    src: url("../../../assets/font/pinyinok.ttf?v=1") format("truetype");
}

.line {
    position: relative;

    &:before,
    &:after {
        font-size: inherit;
        content: "";
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        border-top: 1px dashed #f0f0f099;
    }

    &:before {
        margin-top: -0.15em;
    }

    &:after {
        margin-top: 0.25em;
    }
}

.list {
    flex: 1;
    background-color: #ea894a;
    padding: 0.5em 0.75em;
    border: 3px solid #ab5200;
    border-radius: 0.5em;
    height: 100%;
    margin: 0 0.25em;
    box-sizing: border-box;
    position: relative;

    .list-content {
        height: 100%;
        background-color: #67b900;
        display: flex;
        flex-wrap: wrap;
        //align-content: space-evenly;
    }

    //&:before {
    //    content: '';
    //    position: absolute;
    //    top: 0.5em;
    //    right: 0.75em;
    //    bottom: 0.75em;
    //    left: 0.5em;
    //    background-color: #67b900;
    //    z-index: 0;
    //}

    .list-item {
        width: calc(100% / 6);
        font-family: "pinyin", serif !important; // 列表使用拼音字体显示
        display: flex;
        align-items: center;
        box-sizing: border-box;
        justify-content: center;

        font-style: normal;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        padding: 0.01em 0;
        color: #fff;
        text-align: center;
        font-size: 50rpx;
        // max-height: 3em;
        max-height: 33%;
        //line-height: 1em;
        line-height: 0;
        border: 1px solid #c9ec87;
        position: relative;
        .line;

        &.list-item-hover {
            background-color: #4c8a01;

            .iconfont {
                display: block;

                &:after {
                }

                &.playing {
                    font-size: 20rpx;

                    &:before {
                        animation: playing 1s infinite linear;
                        animation-timing-function: steps(1, end);
                        display: block;
                        overflow: hidden;

                        width: 1em;
                        margin-left: 0.3em;

                        @keyframes playing {
                            0% {
                                width: 1em;
                            }

                            32% {
                                width: 0.57em;
                                // margin-left: 0.4em;
                            }

                            64% {
                                width: 0.76em;
                                // margin-left: 0.2em;
                            }

                            96% {
                                width: 1;
                                // margin-left: 0em;
                            }
                        }
                    }
                }
            }

            .type-tips {
                opacity: 1;
                background-color: rgba(0, 0, 0, 0.35);
            }
        }

        .type-tips {
            position: absolute;
            left: 0;
            top: 0;
            font-size: 10rpx;
            line-height: 1em;
            background-color: rgba(0, 0, 0, 0.15);
            padding: 0.25em 0.75em 0.25em 0.5em;
            border-bottom-right-radius: 0.85em;
            color: var(--c-safegray-hlight);
            opacity: 0.25;
            font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
                Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
                sans-serif;
        }

        // &:dym, &:fym, &:sm{
        // }
        // &:dym{
        //     &:before{
        //         content: '单韵母'
        //     }
        // }
        // &:fym{
        //     &:before{
        //         content: '复韵母'
        //     }
        // }
        // &:sm{
        //     &:before{
        //         content: '声母'
        //     }
        // }

        .iconfont {
            position: absolute;
            right: 0;
            top: 0;
            font-size: 14rpx;
            width: 1.6em;
            height: 1.1em;
            line-height: 1.1em;
            background-color: rgba(255, 255, 255, 0.35);
            border-width: 0 0 1rpx 1rpx;
            border-style: solid;
            border-color: rgba(255, 255, 255, 0.35);
            border-bottom-left-radius: 0.5em;
            display: none;
        }

        &:hover {
        }
    }
}

.page {
    display: flex !important;
}

// uni-view {
// }

.select {
    display: none;
    flex-direction: column;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    max-height: 80%;
    width: 90%;
    left: 6.5%;
    margin-left: -3px;
    border: 6px solid #d3763a;
    border-radius: 5px;
    background-color: #67b900f0;
    box-shadow: 0 0 2px 2px #a05525;
    color: #f0f0f0;
    font-size: 14rpx;
    padding-bottom: 0.5em;

    .form {
        //position: absolute;
        display: flex;
        align-items: center;
        right: -4px;
        top: -1.8em;
        line-height: 1.2em;
        text-align: center;
        padding: 0.15em;
        background-color: #5ca502;
        margin-bottom: 0.25em;
        padding: 0 0.5em;

        .switch {
            margin: 0 1em;
            flex: 1;
            text-align: left;
        }

        .btns {
            flex: 1;
            width: 12em;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            //justify-content: center;
            align-items: center;
            font-size: 10rpx;

            .btn {
                background-image: linear-gradient(
                    0deg,
                    var(--c-safegray-light),
                    var(--c-safegray-hlight)
                );
                color: var(--c-safegray-darker);
                // padding: .5em 1em;
                border-radius: 0.25em;
                line-height: 2em;
                padding: 0 1em;
                // margin: 0 0.25em;
                display: inline-block;
                box-shadow: 0 0 3rpx var(--c-safegray-darker);

                &:last-child {
                    color: var(--c-safegray);
                }
            }
        }
    }

    .select-li {
        padding: 0.15em 0.2em;
        display: flex;
        margin: 0 0.5em;
        font-size: 2vw;

        .select-label {
            min-width: 4.5em;
            flex-shrink: 0;
        }

        .select-items {
            flex: 1;
            display: flex;
            flex-wrap: wrap;
        }
    }

    // .ym-ghbs {

    //     &:nth-child(8n+1),
    //     &:nth-child(8n+2),
    //     &:nth-child(8n+3),
    //     &:nth-child(8n+4) {
    //         background-color: rgba(0, 0, 0, 0.1);
    //     }
    // }

    .select-group {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
    }

    .select-item {
        border: 1px solid #c9ec87;
        padding: 0.1em 0.25em;
        box-sizing: content-box;
        flex: none;
        // max-width: 2em;
        min-width: 1.2em;
        text-align: center;
        margin: -1px -1px 0 0;
        font-family: "pinyin", serif !important;
        font-size: 22rpx;
        color: #87df29;

        // min-width: 1.2em;
        // text-align: center;

        position: relative;

        .line;

        &.active {
            // background-color: #325a01;
            background-color: rgba(0, 0, 0, 0.6);
            color: #fff;
        }
    }
}

.popup-dialog {
    padding: 1em;
    position: relative;

    .icon-wrong {
        position: absolute;
        right: 0.75em;
        top: 0.75em;
        font-size: 20rpx;
    }

    .popup-dialog-title {
        font-size: 20rpx;
        color: var(--c-safegray-hdark);
        line-height: 2em;
        // padding:
    }

    .popup-dialog-content {
        font-size: 20rpx;
        color: var(--c-safegray-hdark);
        line-height: 1.5em;
        display: flex;
        justify-content: center;
        margin: 1em 0;

        .popup-dialog-content-item {
            border: 1rpx solid var(--c-safegray-lighter);
            // color: var(--c-safegray-lighter);
            font-size: 16rpx;
            color: var(--c-safegray-dark);
            background-image: linear-gradient(
                0deg,
                var(--c-safegray-hlight),
                var(--c-safegray-hlighter)
            );
            line-height: 2em;
            padding: 0 1em;
            margin: 0 0.5em;
            border-radius: 0.25em;
            // &.cur{
            //     color: var(--c-safegray-dark);
            //     border-color:  var(--c-safegray-dark);
            // }
        }
    }

    // .popup-dialog-footer{
    //     text-align: center;
    //     .popup-dialog-footer-item{
    //         background-image: linear-gradient(0deg, var(--c-safegray-light), var(--c-safegray-hlight));
    //             color: var(--c-safegray-darker);
    //             // padding: .5em 1em;
    //             border-radius: .25em;
    //             line-height: 1.5em;
    //             padding: .25em 1em;
    //             display: inline-block;
    //             box-shadow: 0 0 3rpx var(--c-safegray-darker);
    //             // border: 1px solid var(--c-safegray-hlight);
    //             // margin: .5em;
    //     }

    // }
}
</style>
<!--
一.单音节及音节词的拼写规则
1. j、q、x和ü、üe、ün相拼时,ü上两点要省略。例如：jū(拘)，què(确),xún(寻)。
2. n、l和ü相拼时,ü上两点要保留。例如：lǖ(旅)，nǚ(女)。
3. 声母g、k、h不和韵母o、i 、ü相拼。
4. 声母z、c、s、zh、ch、sh、r不能直接和韵母o、ü相拼。
5. 韵母i上需加声调时，i上的点要省略。例如：lì(li历)，nín(您),dǐng(顶)。
6. 韵母o一般只跟声母b、p、m、f相拼。例如：bó(脖)，pò(破)，mō(摸)，fó(佛)。也可跟y、w相拼，例如：yō(哟)，wō(窝)。
7. 韵母e，除“么(me)”字外，不跟声母b、p、m、f相拼。
8. 韵母ü不跟声母b、p、m、f相拼。
9. 用汉语拼音书写句子时，词要连写。
-->
