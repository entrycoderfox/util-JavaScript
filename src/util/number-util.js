/**
 * 数字工具
 * @date 20230919
 */

//定义一些共通的内容
const numReg = /^(\-|\+)?\d+(\.\d+)?$/
const numZeroReg = /^[0]+(\.[0]+)?$/
const numIntReg = /^\d+$/
const dot = '.'

const signReg = /^(\-|\+)\d+/
const negativeReg = /^(\-)\d+/
const postiveReg = /^(\+)\d+/

const negativeSign = '-'
const postiveSign = '+'
const blank = ''

/**
 * 自定义大数据类
 * 考虑只支持十进制数 
 * 目前针对原型的函数会改变实例本身的值，后期考虑使用其他方式，不影响实例本身的值
 */
export class DecimalLocal {
    
    /**
     * 构造函数
     * @param {String | Number} val 
     * @returns 
     */
    constructor(val) {
        this.intPart = ''
        this.decimalPart = ''
        // this.hasSign = false//是否有符号
        this.negative = false//是否是负数（有负号）
        this.scale = 6//默认精度为6位小数
        
        if(val == null) {//传进来的东西不存在呀
            return
        }
        if(typeof val === 'number' && Number.isNaN(val)) {
            return
        }
        if(!(typeof val == 'string' || typeof val == 'number')) {//不是预期值，直接返回吧
            if(val instanceof DecimalLocal) {//本类的其他实例对象
                const newDecimal = new DecimalLocal(val.toShowString())//创建新对象并返回
                newDecimal.scale = val.scale//将精度一并设置到新的大数对象中
                return newDecimal
            }
            return
        }
        const fullVal = val + ''//避免输入数字，直接转字符串
        let useFullVal = fullVal
        if(!fullVal || !numReg.test(fullVal)) {//数据不存在,或者不是数字
            return
        }
        if(signReg.test(useFullVal)) {//含有符号
            useFullVal = useFullVal.substring(1)

            if(negativeReg.test(fullVal) && !numZeroReg.test(useFullVal)) {//符号是负号，并且数值不为0
                this.negative = true//当前数为负数
            }
        }
        let partArr = useFullVal.split(dot)
        this.intPart = partArr[0]
        if(useFullVal.indexOf(dot) > -1) {//有小数点
            this.decimalPart = partArr[1]
        }
    }

}

const NONE_DEC = new DecimalLocal()
const ZERO = new DecimalLocal('0')
const ONE = new DecimalLocal('1')
const TWO = new DecimalLocal('2')
const TEN = new DecimalLocal('10')

/**
 * 去除整数多余的0（如果全0，则返回一个'0'）
 * @param {string | number} val 要去0的内容
 */
function removeZeroResultIntStr(val) {
    let valDecNum = new DecimalLocal(val)
    if (!valDecNum.isRealNum()) {//不是数字
        return blank
    }
    let resultVal = valDecNum.intPart
    for(let i = resultVal.length - 1; i > 0; i--) {
        if(resultVal.charAt(0) === '0') {
            resultVal = resultVal.substring(1)
        } else {
            break
        }
    }
    return resultVal
}

/**
 * 去除整数的所有0（如果全0，则返回空串''）
 * @param {string | number} val 要去0的内容
 */
function removeIntZero(val) {
    let valDecNum = new DecimalLocal(val)
    if (!valDecNum.isRealNum()) {//不是数字
        return blank
    }
    let resultVal = valDecNum.intPart
    for(let i = resultVal.length - 1; i < resultVal.length; i--) {
        if(resultVal.charAt(0) === '0') {
            resultVal = resultVal.substring(1)
        } else {
            break
        }
    }
    return resultVal
}

/**
 * 设置 小数部分 为相同长度的字符
 * @param {string} decimalPart 小数部分的内容
 * @param {integer} otherLen 另一个小数部分的长度
 */
function sameLengthDecimal(decimalPart, otherLen) {
    if(typeof otherLen !== 'number' 
        || !Number.isInteger(otherLen)
        || otherLen < 0) {
        return decimalPart
    }
    let currentDecPart = decimalPart || ''
    let curentDecLen = currentDecPart.length
    let useLen = 0
    useLen = curentDecLen >= otherLen ? 0 : (otherLen - curentDecLen) //需要转换的长度差值
    for(let i = 0; i < useLen; i++) {
        currentDecPart = currentDecPart + '0'
    }
    return currentDecPart
}

/**
 * 设置 整数部分 为相同长度的字符
 * @param {string} intPart 整数部分的内容
 * @param {integer} otherLen 另一个整数部分的长度
 */
function sameLengthInteger(intPart, otherLen) {
    if(otherLen < 0) {
        return intPart
    }
    let currentIntPart = intPart || ''
    let curentIntLen = currentIntPart.length
    let useLen = 0
    useLen = curentIntLen >= otherLen ? 0 : (otherLen - curentIntLen) //转换的长度差值
    for(let i = 0; i < useLen; i++) {
        currentIntPart = '0' + currentIntPart
    }
    return currentIntPart
}

/**
 * string类型的数字相加
 * @param {string} val1 
 * @param {string} val2 
 */
function sumStrVal(val1, val2) {
    if(!val1 || !val2) {//值不对，没办法计算
        return
    }
    //val1、val2的长度应当相同，并且都是整数格式的字符串
    const len = val1.length
    let sumFullVal = ''
    let carry = 0//进位数值，默认为0
    for(let i = len - 1; i >= 0; i--) {
        let val1Num = parseInt(val1[i])//val1当前位的值
        let val2Num = parseInt(val2[i])//val2当前位的值
        let subSumNum = val1Num + val2Num + carry//当前位的合计值
        
        sumFullVal = (subSumNum % 10) + sumFullVal
        carry = Number.parseInt(subSumNum / 10)
    }
    if(carry > 0) {//计算完成，还有需要进位的值
        sumFullVal = carry + sumFullVal
    }
    return sumFullVal
}

/**
 * string类型的数字相减
 * @param {string} val1 
 * @param {string} val2 
 */
function subStrVal(val1, val2) {
    if(!val1 || !val2) {//值不对，没办法计算
        return
    }
    //val1、val2的长度应当相同，并且都是整数格式的字符串
    const len = val1.length
    let subFullVal = ''

    let carry = 0//进位数值，默认为0(向前一位借多少)
    for(let i = len - 1; i >= 0; i--) {
        let val1Num = parseInt(val1[i])//val1当前位的值
        let val2Num = parseInt(val2[i])//val2当前位的值
        let subCalNum = val1Num - val2Num - carry//当前位的合计值
        
        carry = 0
        while(subCalNum < 0) {//结果小于0
            subCalNum += 10 //向上一级借1
            carry++ //每次向上级借1，进位就累加1
        }
        subFullVal = (subCalNum % 10) + subFullVal
        // carry = Number.parseInt(subCalNum / 10)
    }
    if(carry > 0) {//计算完成，还有需要进位的值
        subFullVal = carry + subFullVal
    }
    return subFullVal
}

/**
 * string类型的数字相乘
 * @param {string} val1 
 * @param {string} val2 
 */
function multiStrVal(val1, val2) {
    if(!val1 || !val2) {//值不对，没办法计算
        return
    }
    //val1、val2都应当是整数格式的字符串
    val1 = removeZeroResultIntStr(val1)
    val2 = removeZeroResultIntStr(val2)
    const len1 = val1.length
    const len2 = val2.length
    let sumFullVal = '0'
    // let carry = 0//进位数值，默认为0
    for(let i1 = len1 - 1; i1 >= 0; i1--) {
        let subCarry = 0//每部使用的进位数值，默认为0
        let subFullVal = ''
        for(let i2 = len2 - 1; i2 >= 0; i2--) {
            let val1Num = parseInt(val1[i1])//val1当前位的值
            let val2Num = parseInt(val2[i2])//val2当前位的值
            let subMultiNum = val1Num * val2Num + subCarry//当前位的乘积
            
            subFullVal = (subMultiNum % 10) + subFullVal
            subCarry = Number.parseInt(subMultiNum / 10)
        }
        if(subCarry > 0) {
            subFullVal = subCarry + subFullVal
        }
        let hasMorePow = len1 - i1 - 1//后面需要补多少0
        for(let i = hasMorePow; i > 0; i--) {
            subFullVal = subFullVal + '0'
        }
        sumFullVal = sameLengthInteger(sumFullVal, subFullVal.length)//总和长度确定
        subFullVal = sameLengthInteger(subFullVal, sumFullVal.length)//总和长度确定

        sumFullVal = sumStrVal(sumFullVal, subFullVal)//总和
    }
    
    return sumFullVal
}

/**
 * string类型的数字除法
 * @param {string} val1 被除数
 * @param {string} val2 除数
 * @param {integer} decNeedLen 计算时需要精确到的小数位数 
 */
function divStrVal(val1, val2, decNeedLen) {
    debugger
    if(!val1 || !val2 || decNeedLen == null || !(decNeedLen >= 0)) {//值不对，没办法计算
        return
    }
    //val1、val2都应当是整数格式的字符串
    val1 = removeZeroResultIntStr(val1)
    val2 = removeZeroResultIntStr(val2)
    let val1Len = val1.length//被除数的长度，用来判断是否超过了长度

    let divIntPart = ''//商的整数部分
    let divDecPart = ''//商的小数部分
    let getBelowDec = false//得到的商属于小数部分

    let divDecLen = 0//商，小数部分的长度
    // let getFullDiv = false//是否已经获取到全部的商（可以整除的情况才是true）
    let divCalIndex = 0//取被除数的下标
    let subNumForDiv = ''//每次计算一位商时，使用的被除数
    // let subNumForLastTime = ''//每次计算商时，前一次计算剩余的数
    // while(divDecLen <= decNeedLen && !getFullDiv) {//只要精度计算没到位，就一直算
        while(divDecLen <= decNeedLen) {//只要精度计算没到位，就一直算
        //先将上一次计算剩余的数去0
        // subNumForLastTime = removeIntZero(subNumForLastTime)
        subNumForDiv = removeIntZero(subNumForDiv)
        if (divCalIndex < val1Len) {//还有数字没有参数计算
            // subNumForDiv = subNumForLastTime + val1[divCalIndex]
            subNumForDiv = subNumForDiv + val1[divCalIndex]
        } else {//原本的数字已经全都参与运算，只能补0
            // subNumForDiv = subNumForLastTime + '0'
            subNumForDiv = subNumForDiv + '0'
            getBelowDec = true//得到的结果为小数部分
        }
        if (NumCompare(val2, subNumForDiv) > 0) {//商的这一位只能是0
            if(getBelowDec) {
                divDecPart = divDecPart + '0'
                divDecLen++
            } else {
                divIntPart = divIntPart + '0'
            }
            // subNumForLastTime = subNumForDiv + ''
            divCalIndex++
            continue
        }
        for(let i = 9; i > 0; i--) {//从大到小尝试商，如果能满足要求，就break
            let multiRate = i + ''
            multiRate = sameLengthInteger(multiRate, val2.length)
            let subMultiNum = multiStrVal(multiRate, val2)
            if (NumCompare(subNumForDiv, subMultiNum) >= 0) {//可以使用当前的值作为这一位的商
                if(getBelowDec) {
                    divDecPart = divDecPart + i
                    divDecLen++
                } else {
                    divIntPart = divIntPart + i
                }
                //计算剩余值
                subMultiNum = sameLengthInteger(subMultiNum, subNumForDiv.length)
                subNumForDiv = sameLengthInteger(subNumForDiv, subMultiNum.length)
                subNumForDiv = subStrVal(subNumForDiv, subMultiNum)
                break
            }
        }
        divCalIndex++
    }
    let resultVal = removeZeroResultIntStr(divIntPart)
    if (divDecPart) {//有小数部分
        resultVal = resultVal + dot + divDecPart
    }
    return resultVal
}

/**
 * 对比两个大数对象是否相等
 * 暂时不考虑符号问题，也就是说，对于有符号的数字，可能有问题
 * @param {DecimalLocal} decimalLocal 
 * @returns 
 */
DecimalLocal.prototype.compareTo = function(decimalLocal) {
    if(!decimalLocal) {//要对比的对象不存在
        return 
    }
    if(!this.isRealNum() || !decimalLocal.isRealNum()) {//不是数字，无法对比
        return
    }
    let localIntPart = this.intPart || ''
    let localDecimalPart = this.decimalPart || ''

    let targetIntPart = decimalLocal.intPart || ''
    let targetDecimalPart = decimalLocal.decimalPart || ''

    /*
    let localIntPartLength = localIntPart.length
    let localDecimalPartLength = localDecimalPart.length

    // let targetIntPartLength = targetIntPart.length
    let targetDecimalPartLength = targetDecimalPart.length

    let intPartLength = localIntPartLength >= targetIntPartLength ? localIntPartLength : targetIntPartLength
    let decimalPartLength = localDecimalPartLength >= targetDecimalPartLength ? localDecimalPartLength : targetDecimalPartLength

    for(let i = 1; i <= intPartLength; i++) {
        if(i > localIntPartLength) {
            localIntPart = '0' + localIntPart
        }
        if(i > targetIntPartLength) {
            targetIntPart = '0' + targetIntPart
        }
    }
    
    
    for(let i = 1; i <= decimalPartLength; i++) {
        if(i > localDecimalPartLength) {
            localDecimalPart = localDecimalPart + '0'
        }
        if(i > targetDecimalPartLength) {
            targetDecimalPart = targetDecimalPart + '0'
        }
    }
    */
    localIntPart = sameLengthInteger(localIntPart, targetIntPart.length)
    targetIntPart = sameLengthInteger(targetIntPart, localIntPart.length)

    localDecimalPart = sameLengthDecimal(localDecimalPart, targetDecimalPart.length)
    targetDecimalPart = sameLengthDecimal(targetDecimalPart, localDecimalPart.length)

    //整数、小数部分已经设为等长，直接按照ascii码值比较即可
    if(localIntPart > targetIntPart) {//整数部分比大小
        return 1
    } else if (localIntPart < targetIntPart) {
        return -1
    }

    if(localDecimalPart > targetDecimalPart) {//小数部分比大小
        return 1
    } else if (localDecimalPart < targetDecimalPart) {
        return -1
    }
    //走到这一步，说明两边的ascii值一样啊，那就是两个数一样喽
    return 0
}

/**
 * 对比两个大数对象是否相等（仅匹配两边的绝对值）
 * @param {DecimalLocal} decimalLocal 
 * @returns 
 */
DecimalLocal.prototype.compareAbsTo = function(decimalLocal) {
    if(!decimalLocal) {//要对比的对象不存在
        return 
    }
    if(!this.isRealNum() || !decimalLocal.isRealNum()) {//不是数字，无法对比
        return
    }
    let localIntPart = this.intPart || ''
    let localDecimalPart = this.decimalPart || ''

    let targetIntPart = decimalLocal.intPart || ''
    let targetDecimalPart = decimalLocal.decimalPart || ''


    localIntPart = sameLengthInteger(localIntPart, targetIntPart.length)
    targetIntPart = sameLengthInteger(targetIntPart, localIntPart.length)

    localDecimalPart = sameLengthDecimal(localDecimalPart, targetDecimalPart.length)
    targetDecimalPart = sameLengthDecimal(targetDecimalPart, localDecimalPart.length)

    //整数、小数部分已经设为等长，直接按照ascii码值比较即可
    if(localIntPart > targetIntPart) {//整数部分比大小
        return 1
    } else if (localIntPart < targetIntPart) {
        return -1
    }

    if(localDecimalPart > targetDecimalPart) {//小数部分比大小
        return 1
    } else if (localDecimalPart < targetDecimalPart) {
        return -1
    }
    //走到这一步，说明两边的ascii值一样啊，那就是两个数一样喽
    return 0
}

/**
 * 对比两个大数对象是否相等（带符号对比）
 * @param {DecimalLocal} decimalLocal 
 * @returns 
 */
DecimalLocal.prototype.compareWithSignTo = function(decimalLocal) {
    if(!decimalLocal) {//要对比的对象不存在
        return 
    }
    if(!this.isRealNum() || !decimalLocal.isRealNum()) {//不是数字，无法对比
        return
    }
    let currentDec = new DecimalLocal(this).removeZero()
    let targetDec = new DecimalLocal(decimalLocal).removeZero()

    if(!currentDec.negative && targetDec.negative) {//本数为非负数，另外一个为负数
        return 1
    } else if(currentDec.negative && !targetDec.negative) {//本数为负数，另外一个为非负数
        return -1
    } else if(currentDec.negative && targetDec.negative) {//两个均为非负数
        return currentDec.getAbs().compareAbsTo(targetDec.getAbs())
    } else if(!currentDec.negative && !targetDec.negative) {//两个均为负数
        return targetDec.getAbs().compareAbsTo(currentDec.getAbs())
    }
    //两个数的值有问题
}

/**
 * 对于大数，乘以10的多少次幂
 * 比如，入参传2，则乘以100（10的2次方）；入参传-3，则除以1000（10的-3次方）
 * @param {number} lgRateNum 以10为底的对数
 * @returns 
 */
DecimalLocal.prototype.lgRate = function(lgRateNum) {
    if(!this.isRealNum()) {//不是合法值
        return this
    }
    if(lgRateNum == null || isNaN(lgRateNum) || typeof lgRateNum !== 'number') {//类型不对
        return NONE_DEC
    }
    if(!this.intPart) {//整数部分不存在，不是预期的值
        return NONE_DEC
    }
    if(lgRateNum === 0) {//倍率不变
        return new DecimalLocal(this.toShortNumStr())
    }
    if(lgRateNum > 0) {//这个数字要变大
        for(let i = 0; i < lgRateNum; i++) {
            if(this.decimalPart.length > 0) {//小数部分有值
                this.intPart = this.intPart + this.decimalPart.charAt(0)//整数部分的末尾添加一个字符，字符为小数部分的左侧第一个字符
                this.decimalPart = this.decimalPart.substring(1)//小数部分的左侧第一个字符移除
            } else if (this.decimalPart.length <= 0) {//小数部分没有值
                this.intPart = this.intPart + '0'//整数末尾补0
            }

        }
    } else if (lgRateNum < 0) {//这个数字要变小
        for(let i = 0; i > lgRateNum; i--) {
            this.decimalPart = this.intPart.charAt(this.intPart.length - 1) + this.decimalPart//整数部分的最后一位放到小数第一位
            this.intPart = this.intPart.substring(0, this.intPart.length - 1)
            if(this.intPart.length <= 0) {//整数部分长度不足
                this.intPart = '0' + this.intPart//在整数部分的开头补0
            }
        }
    }

    //去除整数部分前面多余的0
    for(let i = 0; i < this.intPart.length - 1; i++) {
        if(this.intPart.charAt(0) === '0') {
            this.intPart = this.intPart.substring(1)
        } else {
            break
        }
    }
    return this
}

/**
 * 设置小数的位数
 * @param {number} scale 小数部分保留多少位，暂未取近似值，直接去掉多余部分
 * @returns 
 */
DecimalLocal.prototype.setScale = function(scale) {
    if(!this.isRealNum()) {//不是有效的值
        return this
    }
    if(scale == null || isNaN(scale) || typeof scale !== 'number' || scale < 0) {//类型不对
        return this
    }
    let useDecimal = new DecimalLocal(this.toShortNumStr())
    let decimalPartLength = useDecimal.decimalPart.length
    if(scale === 0) {//不要小数部分
        useDecimal.decimalPart = ''
    } else if (scale < decimalPartLength) {//要截取小数部分
        useDecimal.decimalPart = useDecimal.decimalPart.substring(0, scale)
    } else {//scale > decimalPartLength，要设置0
        for(let i = 0; i < (decimalPartLength - scale); i++) {
            useDecimal.decimalPart = useDecimal.decimalPart + '0'
        }
    }


    return useDecimal
}

/**
 * 获取当前数字的绝对值
 * @returns 
 */
DecimalLocal.prototype.getAbs = function() {
    let absStrVal = this.intPart || ''

    if(this.decimalPart) {
        absStrVal = absStrVal + dot + this.decimalPart
    }
    return new DecimalLocal(absStrVal)
}


/**
 * 加法计算（根据绝对值计算）
 * @param {DecimalLocal} otherNum 另一个参与运算的数
 * @returns 
 */
 DecimalLocal.prototype.addByAbs = function(otherNum) {
    if(!this.isRealNum() || otherNum == null || !otherNum.isRealNum()) {//入参不对，不是可以计算的数字
        return NONE_DEC
    }
    let currentDecimal = new DecimalLocal(this).removeZero()
    let otherDecimal = new DecimalLocal(otherNum).removeZero()

    if (currentDecimal.compareAbsTo(ZERO) === 0) {
        return otherDecimal
    }
    if (otherDecimal.compareAbsTo(ZERO) === 0) {
        return currentDecimal
    }

    //选取小数部分
    let currentDec = currentDecimal.decimalPart || ''
    let otherDec = otherDecimal.decimalPart || ''

    let useCurDec = sameLengthDecimal(currentDec, otherDec.length)
    let useOtherDec = sameLengthDecimal(otherDec, currentDec.length)

    const decLen = useCurDec.length || 0

    let sumDecWith = sumStrVal(useCurDec, useOtherDec) || ''
    let sumDecLen = sumDecWith.length || 0
    let sumDecCarry = ''
    if (sumDecLen > decLen) {
        let sumDecCarryNum = Number.parseInt(sumDecWith.substring(0, sumDecLen - decLen)) || ''//理论上，sumDecLen - decLen的值只有0或者1
        sumDecCarry = sumDecCarryNum + ''

        sumDecWith = sumDecWith.substring(1)
    }

    //选取整数部分
    let currentInt = currentDecimal.intPart || ''
    let otherInt = otherDecimal.intPart || ''

    let useCurInt = sameLengthInteger(currentInt, otherInt.length)
    let useOtherInt = sameLengthInteger(otherInt, currentInt.length)

    let sumIntWith = useCurInt
    if(sumDecCarry) {
        const sumWithDecCarry = sumStrVal(sumIntWith, sameLengthInteger(sumDecCarry, useCurInt.length)) || ''
        sumIntWith = sumWithDecCarry
    }
    let sumIntWithOther = sumStrVal(sumIntWith, useOtherInt) || ''
    if(sumIntWithOther) {
        sumIntWith = sumIntWithOther
    }


    let sumDecimal = null
    if(sumDecWith) {//有小数部分
        sumDecimal = new DecimalLocal(sumIntWith + dot + sumDecWith) 
    } else {
        sumDecimal = new DecimalLocal(sumIntWith)
    }
    return sumDecimal
 }


/**
 * 减法计算（根据绝对值计算）
 * @param {DecimalLocal} otherNum 另一个参与运算的数
 * @returns 
 */
DecimalLocal.prototype.subByAbs = function(otherNum) {
    if(!this.isRealNum() || otherNum == null || !otherNum.isRealNum()) {//入参不对，不是可以计算的数字
        return NONE_DEC
    }
    let currentDecimal = new DecimalLocal(this).removeZero()
    let otherDecimal = new DecimalLocal(otherNum).removeZero()

    if (otherDecimal.compareAbsTo(ZERO) === 0) {
        return currentDecimal
    }
    if (currentDecimal.compareAbsTo(ZERO) === 0) {
        otherDecimal.negative = !otherDecimal.negative
        return otherDecimal
    }
    if (currentDecimal.compareAbsTo(otherDecimal) === 0) {
        return ZERO
    }

    if(currentDecimal.compareTo(otherDecimal) < 0) {//对比传入的两个数，取绝对值较大的数放在前面
        const temp = currentDecimal
        currentDecimal = otherDecimal
        otherDecimal = temp
    }

    
    //选取小数部分
    let currentDec = currentDecimal.decimalPart || ''
    let otherDec = otherDecimal.decimalPart || ''

    let useCurDec = sameLengthDecimal(currentDec, otherDec.length)
    let useOtherDec = sameLengthDecimal(otherDec, currentDec.length)

    const decLen = useCurDec.length || 0

    let subDecWith = subStrVal(useCurDec, useOtherDec) || ''
    let subDecLen = subDecWith.length || 0
    let subDecCarry = ''
    if (subDecLen > decLen) {//有向上级借值
        let subDecCarryNum = Number.parseInt(subDecWith.substring(0, subDecLen - decLen)) || ''//理论上，长度的差值只有0或者1
        subDecCarry = subDecCarryNum + ''

        subDecWith = subDecWith.substring(1)
    }

    //选取整数部分
    let currentInt = currentDecimal.intPart || ''
    let otherInt = otherDecimal.intPart || ''

    let useCurInt = sameLengthInteger(currentInt, otherInt.length)
    let useOtherInt = sameLengthInteger(otherInt, currentInt.length)

    // let subIntWith = ''
    let subIntWith = useCurInt
    if(subDecCarry) {
        const subWithDecCarry = subStrVal(useCurInt, sameLengthInteger(subDecCarry, useCurInt.length)) || ''
        subIntWith = subWithDecCarry
    }
    let subIntWithOther = subStrVal(subIntWith, useOtherInt) || ''
    if(subIntWithOther) {
        subIntWith = subIntWithOther
    }


    let subDecimal = null
    if(subDecWith) {//有小数部分
        subDecimal = new DecimalLocal(subIntWith + dot + subDecWith) 
    } else {
        subDecimal = new DecimalLocal(subIntWith)
    }
    return subDecimal
}


/**
 * 乘法计算（根据绝对值计算）
 * @param {DecimalLocal} otherNum 另一个参与运算的数
 * @returns 
 */
DecimalLocal.prototype.multiByAbs = function(otherNum) {
    if(!this.isRealNum() || otherNum == null || !otherNum.isRealNum()) {//入参不对，不是可以计算的数字
        return NONE_DEC
    }
    let currentDecimal = new DecimalLocal(this).removeZero()
    let otherDecimal = new DecimalLocal(otherNum).removeZero()

    if (currentDecimal.compareAbsTo(ZERO) === 0 || otherDecimal.compareAbsTo(ZERO) === 0) {
        return ZERO
    }
    if (currentDecimal.compareAbsTo(ONE) === 0 ) {
        return otherDecimal
    }
    if (otherDecimal.compareAbsTo(ONE) === 0) {
        return currentDecimal
    }

    //获取小数部分的长度
    let currentDecLen = currentDecimal.decimalPart.length
    let otherDecLen = otherDecimal.decimalPart.length

    let allDecLen = currentDecLen + otherDecLen//小数整体的长度，用于结果的小数计算

    //去掉小数点，小数变整数
    let currDecToInt = currentDecimal.intPart + currentDecimal.decimalPart
    let otherDecToInt = otherDecimal.intPart + otherDecimal.decimalPart

    //逐位相乘并相加
    let multiNumIntString = multiStrVal(currDecToInt, otherDecToInt)
    let multiNumIntDec = new DecimalLocal(multiNumIntString)

    let multiNumDec = multiNumIntDec.lgRate(0 - allDecLen)

    return multiNumDec
}


/**
 * 除法计算（根据绝对值计算）
 * @param {DecimalLocal} otherNum 另一个参与运算的数
 * @returns 
 */
DecimalLocal.prototype.divByAbs = function(otherNum, decLen=6) {
    if(!this.isRealNum() || otherNum == null || !otherNum.isRealNum()) {//入参不对，不是可以计算的数字
        return NONE_DEC
    }
    let currentDecimal = new DecimalLocal(this).removeZero()
    let otherDecimal = new DecimalLocal(otherNum).removeZero()
    if(otherDecimal.compareAbsTo(ZERO) === 0) {//除数不能为0
        return
    }
    if (currentDecimal.compareAbsTo(ZERO) === 0) {//被除数为0
        return ZERO
    }
    if (otherDecimal.compareAbsTo(ONE) === 0) {//除数为1，返回被除数
        return currentDecimal
    }

    //获取小数部分的长度
    let currentDecLen = currentDecimal.decimalPart.length
    let otherDecLen = otherDecimal.decimalPart.length

    let changeDecLen = otherDecLen - currentDecLen//小数长度的差值，用以对结果做小数点位置的修改

    let decLenNeedWhenCal = changeDecLen + decLen//实际做计算时，需要的小数点长度

    //去掉小数点，小数变整数
    let currDecToInt = currentDecimal.intPart + currentDecimal.decimalPart
    let otherDecToInt = otherDecimal.intPart + otherDecimal.decimalPart

    //计算商
    let multiNumIntString = divStrVal(currDecToInt, otherDecToInt, decLenNeedWhenCal)
    let multiNumIntDec = new DecimalLocal(multiNumIntString)

    let multiNumDec = multiNumIntDec.lgRate(changeDecLen)

    return multiNumDec
}


/**
 * 加法计算（根据原始值计算）
 * @param {DecimalLocal} otherNum 另一个参与运算的数
 * @returns 
 */
 DecimalLocal.prototype.addByOriginal = function(otherNum) {
    if(!this.isRealNum() || otherNum == null || !otherNum.isRealNum()) {//入参不对，不是可以计算的数字
        return NONE_DEC
    }
    let result = null
    //A + B = C
    let num1IsNeg = this.negative
    let num2IsNeg = otherNum.negative
    let num1Abs = this.getAbs()
    let num2Abs = otherNum.getAbs()

    if(!num1IsNeg && !num2IsNeg) {//两个都是非负数
        result = num1Abs.addByAbs(num2Abs)
    } else if (num1IsNeg && num2IsNeg) {//两个都是负数
        result = num1Abs.addByAbs(num2Abs)
        result.negative = true
    } else if ((!num1IsNeg && num1Abs.compareAbsTo(num2Abs) >= 0) 
        || (!num2IsNeg && num2Abs.compareAbsTo(num1Abs) >= 0)) {//非负数的绝对值比较大
        result = num1Abs.subByAbs(num2Abs)
    } else if ((num1IsNeg && num1Abs.compareAbsTo(num2Abs) > 0) 
        || (num2IsNeg && num2Abs.compareAbsTo(num1Abs) > 0)) {//负数的绝对值比较大
        result = num1Abs.subByAbs(num2Abs)
        result.negative = true
    } else {//值不对
        result = NONE_DEC
    }

    return result
 }


 /**
  * 减法计算（根据原本的值计算）
  * @param {DecimalLocal} otherNum 另一个参与运算的数
  * @returns 
  */
DecimalLocal.prototype.subByOriginal = function(otherNum) {
    if(!this.isRealNum() || otherNum == null || !otherNum.isRealNum()) {//入参不对，不是可以计算的数字
        return NONE_DEC
    }
    let result = null
    //A - B = C
    let num1IsNeg = this.negative
    let num2IsNeg = otherNum.negative
    let num1Abs = this.getAbs()
    let num2Abs = otherNum.getAbs()
    if (!num1IsNeg && num2IsNeg) {//A是非负数，B是负数
        result = num1Abs.addByAbs(num2Abs)
    } else if (num1IsNeg && !num2IsNeg) {//A是负数，B是非负数
        result = num1Abs.addByAbs(num2Abs)
        result.negative = true
    } else if ((num1IsNeg && num2IsNeg && num1Abs.compareAbsTo(num2Abs) <= 0)
        || (!num1IsNeg && !num2IsNeg && num1Abs.compareAbsTo(num2Abs) >= 0)) {//A与B符号相同，且C非负
        result = num1Abs.subByAbs(num2Abs)
    } else if ((num1IsNeg && num2IsNeg && num1Abs.compareAbsTo(num2Abs) > 0)
        || (!num1IsNeg && !num2IsNeg && num1Abs.compareAbsTo(num2Abs) < 0)) {//A与B符号相同，且C为负
        result = num1Abs.subByAbs(num2Abs)
        result.negative = true
    } else {//数值不对
        result = NONE_DEC
    }

    return result
}


/**
 * 乘法计算（根据原本值计算）
 * @param {DecimalLocal} otherNum 另一个参与运算的数
 * @returns 
 */
DecimalLocal.prototype.multiByOriginal = function(otherNum) {
    if(!this.isRealNum() || otherNum == null || !otherNum.isRealNum()) {//入参不对，不是可以计算的数字
        return NONE_DEC
    }
    let result = null
    //A * B = C
    let num1IsNeg = this.negative
    let num2IsNeg = otherNum.negative
    let num1Abs = this.getAbs()
    let num2Abs = otherNum.getAbs()
    if (num1IsNeg === num2IsNeg) {//A、B符号相同
        result = num1Abs.multiByAbs(num2Abs)
    } else if (!num1IsNeg === num2IsNeg) {//A、B符号相反
        result = num1Abs.multiByAbs(num2Abs)
        result.negative = false
    } else {
        result = NONE_DEC
    }

    return result
}


/**
 * 除法计算（根据原本值计算）
 * @param {DecimalLocal} otherNum 另一个参与运算的数
 * @returns 
 */
DecimalLocal.prototype.divByOriginal = function(otherNum, decLen=6) {
    debugger
    if(!this.isRealNum() || otherNum == null || !otherNum.isRealNum()) {//入参不对，不是可以计算的数字
        return NONE_DEC
    }
    
    let result = null
    //A / B = C
    let num1IsNeg = this.negative
    let num2IsNeg = otherNum.negative
    let num1Abs = this.getAbs()
    let num2Abs = otherNum.getAbs()
    if (num1IsNeg === num2IsNeg) {//A、B符号相同
        result = num1Abs.divByAbs(num2Abs, decLen)
    } else if (!num1IsNeg === num2IsNeg) {//A、B符号相反
        result = num1Abs.divByAbs(num2Abs, decLen)
        result.negative = false
    } else {
        result = NONE_DEC
    }

    return result
}


/**
 * 设置展示的字符
 * @returns 
 */
DecimalLocal.prototype.toShowString = function() {
    if(!this.isRealNum()) {//内容不对，不是真实的数字
        return blank
    }
    let result = ''
    if(this.negative) {//是负数
        result = negativeSign + result
    }
    result = result + this.intPart
    if(this.decimalPart) {//存在小数部分
        result = result + dot + this.decimalPart
    }
    return result
}

/**
 * 删除无用的0（整数部分左侧的0，小数部分右侧的0）
 */
DecimalLocal.prototype.removeZero = function() {
    
    //去除整数部分前面多余的0
    for(let i = this.intPart.length - 1; i > 0; i--) {
        if(this.intPart.charAt(0) === '0') {
            this.intPart = this.intPart.substring(1)
        } else {
            break
        }
    }
    //去除小数部分后面多余的0
    for(let i = (this.decimalPart.length - 1); i >= 0; i--) {
        if(this.decimalPart.charAt(i) === '0') {//末尾为0
            this.decimalPart = this.decimalPart.substring(0, i)//将末尾数字去除
        } else {
            break
        }
    }
    return this
}

/**
 * 大数 转 字符串
 * @returns {String}
 */
DecimalLocal.prototype.toShortNumStr = function() {
    if(!this.isRealNum()) {
        return blank
    }
    const shorDecimal = this.removeZero()
    if(!shorDecimal.intPart) {//整数部分没有值
        return blank
    }
    let resStr = ''
    if (shorDecimal.negative) {//是负数
        resStr = negativeSign + resStr
    }
    resStr = resStr + shorDecimal.intPart
    if (shorDecimal.decimalPart) {//存在小数部分
        resStr = resStr + dot + shorDecimal.decimalPart
    }
    return resStr
}

/**
 * 校验是否是真实的数字
 */
DecimalLocal.prototype.isRealNum = function() {
    if(!this.intPart || !numIntReg.test(this.intPart)) {//整数部分不存在或者值不对
        return false
    }
    if(this.decimalPart && !numIntReg.test(this.decimalPart)) {//小数部分存在，且值不对
        return false
    }
    return true
}

/**
 * 数据对比
 * @param  {String | Number} numObj1 
 * @param  {String | Number} numObj2
 */
export function NumCompare(numObj1, numObj2) {
    if(numObj1 == null || numObj2 == null) {//没办法对比呀
        return
    }
    let decObj1 = new DecimalLocal(numObj1)//变为大数据对象
    let decObj2 = new DecimalLocal(numObj2)//变为大数据对象
    if(decObj1 == null || decObj2 == null) {//转换失败，数据不是预计的类型或值
        return
    }
    if(!decObj1.isRealNum() || !decObj2.isRealNum()) {//转换失败，数据不是预计的类型或值
        return
    }
    return decObj1.compareTo(decObj2)
}

