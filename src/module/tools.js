
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
function random (cType = 1, cLen = 1, customize = '') {
    let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const splitExp = /[,|-]/g
    const len
    = typeof cLen === 'number' ? (cLen > 64 ? 64 : cLen < 1 ? 1 : cLen) : 3
    let areaLen = ''
    let areaIdx = ''
    let res = ''
    switch (cType) {
        case 2: // 小写字母
        case 4: // 大写字母
        case 6: // 大小写字母混合
            for (let i = 0; i < len; i++) {
                areaLen = 26
                areaIdx = Math.floor(Math.random() * areaLen + 10)
                switch (cType) {
                    case 2: // 小写字母
                        res += chars[areaIdx].toLowerCase()
                        break
                    case 4: // 大写字母
                        res += chars[areaIdx]
                        break
                    case 6: // 大小写字母混合
                        res += Math.floor(Math.random() * 2)
                            ? chars[areaIdx]
                            : chars[areaIdx].toLowerCase()
                        break
                }
            }
            break
        case 3: // 小写字母数字
        case 5: // 大写字母数字
        case 7: // 大小写字母数字混合
            for (let i = 0; i < len; i++) {
                areaLen = 36
                areaIdx = Math.floor(Math.random() * areaLen)
                switch (cType) {
                    case 3: // 小写字母数字
                        res += chars[areaIdx].toLowerCase()
                        break
                    case 5: // 大写字母数字
                        res += chars[areaIdx]
                        break
                    case 7: // 大小写字母数字混合
                        res += Math.floor(Math.random() * 2)
                            ? chars[areaIdx]
                            : chars[areaIdx].toLowerCase()
                        break
                }
            }
            break
        case 8: // x-z 区间数
            chars = cLen.split(/[,|-]/g).sort()
            // Math.random() * max-min+1+min
            res = Math.floor(
                Math.random() * (Number(chars[0]) - Number(chars[1]) + 1)
          + Number(chars[1])
            )
            break
        case -1: // 指定区间(默认使用字典数据)
            chars = splitExp.test(customize)
                ? unDupArr(customize.split(splitExp))
                : unDupArr(customize.split('')) // 拆成数组并滤重
            for (let i = 0; i < len; i++) {
                areaIdx = Math.floor(Math.random() * chars.length - 1)
                res += chars[areaIdx]
            }
            break
        case 1: // 纯数字
        default:
            for (let i = 0; i < len; i++) {
                areaLen = 10
                areaIdx = Math.floor(Math.random() * areaLen)
                res += chars[areaIdx]
            }
    }
    return res
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

/**
 * 计算表达式答案
 * @param {array} data [数1, 数2, 运算符]
 */ 
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

/**
 * 播放音频
 * @author ToviLau 46134256@qq.com
 * @param name {string} 音频地址
 * @param loop {boolean} 是否循环播放
 * @param volume 音量大小(1-20)
 * @return 当前媒体实例对象
 */
function playSound ({ name: src, loop = false, volume = 10 }) {
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

export {
    random,
    mergeData,
    playSound,
    expressionResult
}