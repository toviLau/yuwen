/**
 * @Author       : ToviLau 46134256@qq.com
 * @Date         : 2023-09-26 07:04:50
 * @LastEditors  : ToviLau 46134256@qq.com
 * @LastEditTime : 2023-10-02 19:53:31
 */
import Bignumber from 'BigNumber.js'
/**
 * 产生随机字符
 * @author  toviLau tovi@nutfun.com
 * @date   2016-06-10T16:45:40+0800
 * @param  cType  {num}   类型(默认1)
 *                       -1: 指定区间
 *                       1: 数字(int)
 *                       2: 小写字母
 *                       3: 小写字母数字
 *                       4: 大写字母
 *                       5: 大写字母数字
 *                       6: 大小写字母混合
 *                       7: 大小写字母数字混合
 *                       8: x-z区间数字
 * @param   cLen {number|string}   长度(默认1)
 * @param   customize {array}   字符区间(arguments[0] = -1 时有效,默认字符：0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ)
 * @return  {string}   随机字符
 * @example
 *      console.log(random(1)) // 544 (数字,3位长度)
 *      console.log(random(1, 8)) // 26525759 (数字,8位长度)
 *      console.log(random(2, 8)) // xjunprcm (小写字母,8位长度)
 *      console.log(random(3, 8)) // iwd70x7m (小写字母数字,8位长度)
 *      console.log(random(4, 8)) // FUUQELNF (大写字母,8位长度)
 *      console.log(random(5, 8)) // KM6PPHC5 (大写字母数字,8位长度)
 *      console.log(random(6, 8)) // mYyFuxbT (大小写字母混合,8位长度)
 *      console.log(random(7, 8)) // G3Yz3Q9Z (大小写字母数字混合,8位长度)
 *      console.log(random(8, '16-32')) // 21 (两个数字之间随机数)
 *      console.log(random(-1, 16, 'aAaBcs')) // AacacBccABAAcaca (自定义字符随机,16位长度)
 */
function random(cType = 1, cLen = 1, customize = "") {
    let chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const splitExp = /[,|-]/g;
    const len =
        typeof cLen === "number" ? (cLen > 64 ? 64 : cLen < 1 ? 1 : cLen) : 3;
    let areaLen = "";
    let areaIdx = "";
    let res = "";
    switch (cType) {
        case 2: // 小写字母
        case 4: // 大写字母
        case 6: // 大小写字母混合
            for (let i = 0; i < len; i++) {
                areaLen = 26;
                areaIdx = Math.floor(Math.random() * areaLen + 10);
                switch (cType) {
                    case 2: // 小写字母
                        res += chars[areaIdx].toLowerCase();
                        break;
                    case 4: // 大写字母
                        res += chars[areaIdx];
                        break;
                    case 6: // 大小写字母混合
                        res += Math.floor(Math.random() * 2)
                            ? chars[areaIdx]
                            : chars[areaIdx].toLowerCase();
                        break;
                }
            }
            break;
        case 3: // 小写字母数字
        case 5: // 大写字母数字
        case 7: // 大小写字母数字混合
            for (let i = 0; i < len; i++) {
                areaLen = 36;
                areaIdx = Math.floor(Math.random() * areaLen);
                switch (cType) {
                    case 3: // 小写字母数字
                        res += chars[areaIdx].toLowerCase();
                        break;
                    case 5: // 大写字母数字
                        res += chars[areaIdx];
                        break;
                    case 7: // 大小写字母数字混合
                        res += Math.floor(Math.random() * 2)
                            ? chars[areaIdx]
                            : chars[areaIdx].toLowerCase();
                        break;
                }
            }
            break;
        case 8: // x-z 区间数
            chars = cLen.split(/[,|-]/g).sort();
            // Math.random() * max-min+1+min
            res = Math.floor(
                Math.random() * (Number(chars[0]) - Number(chars[1]) + 1) +
                Number(chars[1])
            );
            break;
        case -1: // 指定区间(默认使用字典数据)
            chars = splitExp.test(customize)
                ? unDupArr(customize.split(splitExp))
                : unDupArr(customize.split("")); // 拆成数组并滤重
            for (let i = 0; i < len; i++) {
                areaIdx = Math.floor(Math.random() * chars.length - 1);
                res += chars[areaIdx];
            }
            break;
        case 1: // 纯数字
        default:
            for (let i = 0; i < len; i++) {
                areaLen = 10;
                areaIdx = Math.floor(Math.random() * areaLen);
                res += chars[areaIdx];
            }
    }
    return res;
}

/**
 * 合并两数据
 * @param {array} data1 [数1,数2, 运算符]
 * @param {array} data2 [数1,数2, 运算符]
 * @return [[数1-1,数1-2, 运算符],数2, 运算符] || [数1,[数2-1,数2-2, 运算符], 运算符]
 */
function mergeData(data1, data2) {
    const idx = Math.random() > 0.5 ? 1 : 0;
    data2[idx] = data1;
    if (data2[2] === 1) {
        const _data1 = Array.isArray(data2[0]) ? expressionResult(data2[0]) : data2[0] - 0;
        const _data2 = Array.isArray(data2[1]) ? expressionResult(data2[1]) : data2[1] - 0;
        const _tmp = data2.pop();
        if (_data1 < _data2) data2.reverse();
        data2.push(_tmp);
    }
    return data2;
}

/**
 * 计算表达式答案
 * @param {array} data [数1, 数2, 运算符, 运算结果]
 */
function expressionResult(data) {
    if (!Array.isArray(data)) return data
    const _tmp = [
        expressionResult(data[0]),
        expressionResult(data[1]),
    ];

    const BN = new Bignumber(_tmp[0])

    switch (data[2]) {
        case 0:
            return BN.plus(_tmp[1]) - 0;
        case 1:
            return BN.minus(_tmp[1]) - 0;
        case 2:
            return BN.multipliedBy(_tmp[1]) - 0;
        case 3:
            return BN.dividedBy(_tmp[1]) - 0;
    }
}

/**
 * 播放音频
 * @author ToviLau 46134256@qq.com
 * @param {string} name 音频地址
 * @param {boolean} loop 是否循环播放
 * @param {number} volume 音量大小(1-20)
 * @param {string} instanceName 实例名称
 * @return 当前媒体实例对象
 */
function playSound({ src, loop = false, volume = 10, instanceName, sessionCategory = 'ambient' }) {
    /** 
     * @Description  :  
     * @Author       : ToviLau 46134256@qq.com
     * @Date         : 2023-10-03 16:31:11
     * @LastEditors  : ToviLau 46134256@qq.com
     * @LastEditTime : Do not edit
     * @param         {object} player: audio对象
     **/    
    const audioPlay = player => {
        Object.assign(player, {
            src,
            // volume: volume / (20 - (volume / 15)),
            volume: volume / 20,                    
            autoplay: true,
            loop,
            sessionCategory
        });
        player.onEnded(() => {
            player.destroy()
        });
    }

    const audio = uni.createInnerAudioContext();
    // const _instanceName = 'ToviPlayer_' + (instanceName || random(6, 32))
    // Object[_instanceName] = Object[_instanceName] || uni.createInnerAudioContext();
    audioPlay(audio)
    return audio
}

// 生成键盘按键数据
function createKeyboardCode() {
    /**
     * {
     *    easyKey: 简约模式下显示,
     *    fullKey: 九宫模式下显示,
     *    idx: id,
     *    name: 键名,
     *    value: 键值
     * }
     */

    // 1-9 数字
    const keyboardCodeArr = new Array(9).fill({ easyKey: 1, fullKey: 1 }).map((item, idx) => {
        return Object.assign({}, item, {
            idx: random(7, 16),
            name: idx + 1,
            value: idx + 1,
        })
    })

    //  简约模式下的 "."
    keyboardCodeArr.splice(5, 0, {
        easyKey: 1,
        fullKey: 0,
        idx: random(7, 16),
        name: '.',
        value: '.'
    })

    keyboardCodeArr.push({
        //  九宫模式下的 "."
        easyKey: 0,
        fullKey: 1,
        idx: random(7, 16),
        name: '.',
        value: '.'
    }, {
        //数字 0
        easyKey: 1,
        fullKey: 1,
        idx: random(7, 16),
        name: 0,
        value: 0
    }, {
        easyKey: 1,
        fullKey: 1,
        idx: random(7, 16),
        name: '下一题',
        value: 'next'
    })
    return keyboardCodeArr
}

export {
    random,
    mergeData,
    playSound,
    expressionResult,
    createKeyboardCode
};
