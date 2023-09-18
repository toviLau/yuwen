<template>
    
    <page-meta
        page-orientation="landscape"
        root-font-size="16px"
        >
    <view class="content">
        <div class="btns">
            <div class="btn"
                 @click="randomList()">打乱
            </div>
            <div class="btn"
                 @click="show = showPopup()">筛选
            </div>
        </div>
        <div class="list">
            <div class="list-content">
                <div class="list-item"
                     v-for="i in selectArr.length < 3 && selectArr.every(item=>pyList.sm.list.includes(item)) ? selectArr : selectArr"
                     :key="i">{{ i }}
                </div>
                <div class="list-item"
                     v-for="i in selectArr.length%6 > 0 ? Math.abs(6 - selectArr.length%6) : 0"
                     :key="i"/>
            </div>
        </div>
        <div class="select"
             :style="{display: show ? 'block' : 'none'}">
            <div class="form">
<!--                <div class="switch">合并模式:-->
<!--                    <switch :checked="isMerge"-->
<!--                            color="#FFCC33"-->
<!--                            @change="s=>isMerge = s.detail.value"-->
<!--                            style="transform:scale(0.7)"/>-->
<!--                    <span class="tip"-->
<!--                          v-show="isMerge">声母可选: {{ selectLenSm }}个 - 韵母可选: {{ selectLenYm }}个</span>-->
<!--                </div>-->
                <div class="btns">
                    <button class="btn"
                            size="mini"
                            @click="reload()">恢复默认
                    </button>
                    <button class="btn"
                            size="mini"
                            @click="reload(true)">全不选
                    </button>
                </div>
                <icon type="cancel"
                      size="26"
                      color="#f0f0f0"
                      @click="show = showPopup()"/>
            </div>
            <template v-for="list in Object.keys(pyList)">
                <div class="select-li"
                     v-if="!(isMerge && ['ym1','ztrd'].includes(list))"
                     :key="list">
                    <div class="select-label">{{ pyList[list].title }}</div>
                    <div class="select-items">
                        <div class="select-item"
                             :class="{
                            active: hasInclude(item)
                         }"
                             v-for="item in pyList[list].list"
                             :key="item"
                             @click="()=>opSelectArr(item)">{{ item }}
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </view>
    </page-meta>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';

// #ifdef MP-WEIXIN
uni.showShareMenu({
    title:'四小二(8)班',
    content:'语文拼音练习',
    imageUrl: '/assets/icon.jpeg',
    path: '/pages/yuwen/index'
});
// #endif

// 有声调韵母字典表
const dictionary = {
    'ā': '`', 'á': 1, 'ǎ': 2, 'à': 3, 'ō': 4, 'ó': 5, 'ǒ': 6, 'ò': 7,
    'ē': 8, 'é': 9, 'ě': 0, 'è': '-', 'ī': '~', 'í': '!', 'ǐ': '@', 'ì': '#',
    'ū': '$', 'ú': '%', 'ǔ': '^', 'ù': '&', 'ǖ': '*', 'ǘ': '(', 'ǚ': ')', 'ǜ': '_',
};
// 拼音表
const pyList = {
    sm  : {
        title: '声母',
        list : [
            'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h',
            'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w',
        ],
    },
    ym1 : {
        title: '韵母有声调',
        list : (() => Object.keys(dictionary).map(item => dictionary[item]))(),
    },
    ym2 : {
        title: '韵母无声调',
        list : [
            'a', 'o', 'e', 'i', 'u', 'v',
            'ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 've', 'er', 'an', 'en', 'in', 'un', 'vn',
            'ang', 'eng', 'ing', 'ong',
        ],
    },
    ztrd: {
        title: '整体认读',
        list : [
            'zhi', 'chi', 'shi', 'ri', 'zi', 'ci', 'si', 'yi',
            'wu', 'yu', 'ye', 'yue', 'yuan', 'yin', 'yun', 'ying'],
    },

};
const show = ref(false); // 筛选列表是否显示
const defList = [...pyList.ym1.list]; // 默认筛选列表
const selectArr = ref([...defList]); // 已筛选列表
const isMerge = ref(false);
const selectLenSm = ref(0);
const selectLenYm = ref(0);


watch(isMerge, async (_isMerge) => {
    reload(_isMerge);
});
watch(selectArr, async (_selectArr) => {
    const _tmpList = Object.values(_selectArr);
    let count = 0
    _tmpList.forEach(res=>{
         count += pyList.sm.list.includes(res) ? 1 : 0
    })
    selectLenSm.value = 6 - count
    selectLenYm.value = ~~(30 / (6-selectLenSm.value)) - _tmpList.length + count;
}, { deep: true });

/**
 * 是否显示筛选
 * @param {boolean} status 是否显示
 */
const showPopup = status => status || !show.value;

// 打乱
const randomList = () => {
    const random = () => Math.random().toFixed(1) - 0;
    selectArr.value
        .sort(() => random() < 0.5 ? 1 : random() > 0.5 ? -1 : 0)
        .sort(() => random() < 0.5 ? 1 : random() > 0.5 ? -1 : 0);
};

/**
 * 重载选择
 * @param {boolean} isClear 是否清空
 * @return {any[]}
 */
const reload = (isClear = false) => {
    if (isMerge.value) isMerge.value = isClear;
    !isClear
        ? selectArr.value.splice(0, selectArr.value.length, ...defList)
        : selectArr.value.splice(0, selectArr.value.length);
    randomList();
};


/**
 * 筛选列表是否已包涵 s 字符
 * @param {string} s 被判断的字符
 */
const hasInclude = s => selectArr.value.includes(s);

/**
 * [添加/删除]选中字符
 * @param {string} i 被[添加/删除]的字符
 * @param {number} maxStrlen 最多选择
 */
const opSelectArr = (i, maxStrlen = 30) => {
    hasInclude(i)
        ? selectArr.value.splice(selectArr.value.findIndex(j => j === i), 1)
        : selectArr.value.length < maxStrlen ? selectArr.value.push(i) : uni.showToast({
            title   : `最多选 ${ maxStrlen } 个`,
            duration: 2000,
            icon    : 'none',
        });
};

onMounted(() => randomList());

</script>

<style lang="less">
.content {
    display: flex;
    align-items: flex-start;
    height: 100vh;
}

@font-face {
    // 引入拼音字体库
    font-family: 'pinyin';
    src: url('../../assets/font/pinyinok.ttf?v=1') format('truetype');
}

.line {
    position: relative;

    &:before, &:after {
        font-size: inherit;
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        border-top: 1px dashed #f0f0f099;
    }

    &:before {
        margin-top: -.15em;
    }

    &:after {
        margin-top: .25em;
    }
}

.list {
    flex: 1;
    background-color: #ea894a;
    padding: 0.5em 0.75em;
    border: 3px solid #ab5200;
    border-radius: 0.5em;
    height: 100%;
    margin: 0 .25em;
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
        font-family: 'pinyin', serif !important; // 列表使用拼音字体显示
        display: flex;
        align-items: center;
        box-sizing: border-box;
        justify-content: center;

        font-style: normal;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        padding: .01em 0;
        color: #fff;
        text-align: center;
        font-size: 8vw;
        //line-height: 1em;
        line-height: 0;
        border: 1px solid #c9ec87;
        .line;

        &:hover {
            background-color: #4c8a01;
        }
    }
}

.btns {
    display: flex;
    flex-direction: column;

    .btn {
        background-color: #e8e5e5;
        padding: .5em 1em;
        border-radius: .5em;
        display: inline-block;
        border: 1px solid #f0f0f0;
        margin: .5em;
    }
}

.select {
    display: none;
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    max-height: 90%;
    width: 95%;
    left: 2.5%;
    margin-left: -3px;
    border: 6px solid #d3763a;
    border-radius: 5px;
    background-color: #67b900f0;
    box-shadow: 0 0 2px 2px #a05525;
    color: #f0f0f0;
    font-size: 14rpx;
    padding-bottom: .5em;

    .form {
        //position: absolute;
        display: flex;
        right: -4px;
        top: -1.8em;
        line-height: 1.2em;
        text-align: center;
        padding: .15em;
        background-color: #5ca502;
        margin-bottom: .5em;

        .switch {
            margin: 0 1em;
            flex: 1;
            text-align: left;
        }

        .btns {
            flex: 1; // -----
            width: 12em;
            display: flex;
            flex-direction: row;
            margin: 0 1em;
            justify-content: flex-start;
            //justify-content: center;
            align-items: center;

            .btn {
                padding: 0.25em 1em;
                border-radius: 0.5em;
                display: inline-block;
                border: 1px solid #f0f0f0;
                margin: 0 0.5em;
                line-height: 1em;
                height: 2em;
            }
        }
    }

    .select-li {
        padding: .25em;
        display: flex;
        margin: 0 .5em;

        .select-label {
            width: 6em;
        }

        .select-items {
            flex: 1;
            display: flex;
            flex-wrap: wrap;
        }
    }

    .select-item {
        border: 1px solid #c9ec87;
        order: 1px solid #c9ec87;
        padding: 0.1em 0.2em;
        box-sizing: content-box;
        flex: 1 0 auto;
        max-width: 2em;
        min-width: 1.2em;
        text-align: center;
        margin: -1px -1px 0 0;
        font-family: 'pinyin', serif !important;
        font-size: 2.8vw;
        .line;

        &.active {
            background-color: #4c8a01;

        }
    }
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
