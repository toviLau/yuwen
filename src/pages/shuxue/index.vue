<template>
  <view class="content">
    <div class="list">
      <div
        class="list-item"
        v-for="(v, i) in numlist"
        @click="ckItem(i)"
        :class="{
          'cur-item': i === curidx && submited === 0,
          right: v[4] === 1,
          wrong: v[4] === 0 && !['',undefined].includes(v[3]) ,
        }"
      >
        {{
          `${v[0]} ${["+", "-"][v[2]]} ${v[1]} = ${
            curidx !== undefined && numlist[i][3]!==undefined ? numlist[i][3] : ""
          }`
        }}
      </div>
    </div>
    <div
      class="footer"
      v-show="curidx !== undefined"
      :class="{
        dsb:
          curidx &&
          (numlist[curidx][3] === undefined ? '' : numlist[curidx][3] + '')
            .length > 2,
      }"
    >
      <div class="pan" v-if="submited === 0 && curidx !== ''">
        <div class="pan-item" v-for="i in 10" @click="keyNum(i - 1)">
          {{ i - 1 }}
        </div>
        <div class="pan-item pan-enter" @click="subEnter()">查看得分</div>
        <div class="pan-item pan-del" @click="keyNum('del')">⇐</div>
      </div>
      <div class="fen" v-if="submited === 1">
        <div class="fen-title">宝贝你的得分:</div>
        <div class="score">{{ score }}</div>
        <div class="comment">{{ comment }}</div>
        <div class="fen-btns">
          <div class="fen-item fen-edit" @click="edit()">去订正</div>
          <div class="fen-item fen-new" @click="newList()">做新题</div>
        </div>
      </div>
    </div>
  </view>
</template>

<script setup>
import { onMounted, ref, reactive, watch } from "vue";
import { random } from "../../module/tools";

const numlist = reactive([]);
const submited = ref(0);
const score = ref(0);
const comment = ref("");
const curidx = ref();

function createList() {
  numlist.length = 0;
  for (let i = 0; i < 50; i++) {
    const numArr = [random(8, "1-90") - 0, random(8, "1-90") - 0];
    const notation = Math.random() > 0.5 ? 1 : 0;
    if (notation === 1 && numArr[0] < numArr[1]) numArr.reverse();
    if (notation === 0 && numArr[0] + numArr[1] > 100) {
      numArr[0] > numArr[1]
        ? (numArr[0] = random(8, `1-${100 - numArr[1]}`) - 0)
        : (numArr[1] = random(8, `1-${100 - numArr[0]}`) - 0);
    }
    numlist.push(numArr.concat(notation, undefined));
    edit();
    curidx.value = "";
  }
}
createList();
const ckItem = (idx) => {
  curidx.value = idx;
  if (numlist[idx][4] === 0 && submited.value !== 1) numlist[idx][4] = "";
};
const keyNum = (key) => {
  const val =
    numlist[curidx.value][3] === undefined ? "" : numlist[curidx.value][3] + "";
  numlist[curidx.value][3] = key === "del"
      ? (numlist[curidx.value][4] !== 1 ? val.substring(0, val.length - 1) : val)
      : (numlist[curidx.value][4] !== 1 && val.length < 3 ? val + key - 0 : val - 0);
};

const subEnter = () => {
  numlist.map((res) => {
    const _val = res[2] === 0 ? res[0] + res[1] : res[0] - res[1];
    res[4] = _val === res[3] ? 1 : 0;
  });
  const rightLen = numlist.filter((res) => res[4] === 1).length;
  const totleLen = numlist.length;
  score.value = Math.floor((100 * rightLen) / totleLen);
  submited.value = 1;
  const commentArr = [
    "真棒，继续保持哟 ^_^",
    "哎呀！就差一点点，要加油哦~~",
    "还不错，但是要加油呀*_*",
    "好好学习，天天向上",
    "相信自己，努力一下，会有好成绩的。",
    "不要偷懒哦~~ 你一半都还没做完呢。"
  ];
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
  const fillLen = numlist.filter((res) => res[3]).length;
  if(totleLen*0.5>fillLen) comment.value = commentArr[5];
  
};
function edit() {
  submited.value = 0;
  curidx.value = ''
}
const newList = () => {
  createList();
};
</script>

<style lang="less">
.content {
  height: 100%;
  display: flex;
  flex-direction: column;
  //   height: 100vh;
  .list {
    display: flex;
    align-content: flex-start;
    flex: 1;
    overflow: auto;
    flex-wrap: wrap;
    padding: 0.25em 0;
    .list-item {
      border-bottom: 1px solid #999;
      font-size: 32rpx;
      line-height: 2.8em;
      width: 42%;
      margin: 0 auto;
      padding: 0 1em;
      box-sizing: border-box;
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
      &.cur-item:not(.right) {
        box-shadow: 0 0 0 4rpx #b6aafa;
        border-bottom: none;
        border-radius: 5rpx;
        &:after {
          animation: guang-biao-shan-shuo 2s infinite;
        }
      }
      @keyframes guang-biao-shan-shuo {
        20% {
          opacity: 0;
        }
        50% {
          opacity: 1;
        }
        80% {
          opacity: 0;
        }
      }
      &:after {
        content: "";
        display: inline-block;
        width: 0.5em;
        border-bottom: 5rpx #999 solid;
        margin-bottom: -0.5em;
        opacity: 0;
      }
    }
  }
  .footer {
    box-shadow: 0 0 15px #ececec;
    padding: 0.5em 0;
    .pan {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-evenly;
      &.dsb {
        .pan-item {
          background-color: #fcfcfc;
          color: #ccc;
        }
      }
    }
    .pan-item, .fen-item {
        width: 16%;
        margin: 1%;
        line-height: 2em;
        text-align: center;
        box-shadow: 0 0 0 1rpx #cfcfcf;
        background-color: #f0f0f0;
        border-radius: 5rpx;
        &.pan-enter,
        &.pan-del,
        &.fen-new,
        &.fen-edit {
            width: 33%;
            color: #fcfcfc;
            box-shadow: none;
        }
        &.pan-del, &.fen-new {
            background-color: #ed5d46;
        }
        &.pan-enter, &.fen-edit {
            background-color: #2ce02c;
        }
        &:active{
            opacity: .618;
        }
    }
    .fen {
      .fen-title {
        background-color: #e9e9e9;
        margin-top: -0.5em;
        line-height: 2em;
        padding: 0 1em;
      }
      .score {
        text-align: center;
        font-size: 64rpx;
        line-height: 1.25em;
        margin-top: 0.125em;
        color: #ed5d46;
        position: relative;
        &:after,&:before{
            content:'';
            // border: 1rpx solid #ed5d46;
            position: absolute;
            left: 50%;
            // width: 3em;
            height: 4rpx;
            background-color: #ed5d46;
        }
        &:after{
            margin-left: -0.816em;
            width: 1.8em;
            bottom: 10rpx;
            transform: rotate(-6deg);
        }
        &:before{
            margin-left: -0.7em;
            width: 2em;
            bottom: 5rpx;
            transform: rotate(-5deg);
        }
      }
      .fen-btns {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-evenly;

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
        font-size: 26rpx;
        line-height: 1.5em;
        padding-bottom: 0.5em;
      }
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
