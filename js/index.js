var CHINESE_ARR = ['月', '丁', '户', '下', '上', '西', '水', '金', '木', '北', '玉', '五', '七', '木', '禾', '人', '入', '八', '几', '儿', '了', '又', '丸', '己', '已', '巳', '弓', '子', '女', '寸', '飞', '也', '山', '巾', '广', '门', '开', '斗', '牙', '比', '互', '毛', '氏', '歹', '气', '爪', '父', '月', '丹', '乌', '方', '火', '为', '亡', '己', '子', '兀', '丁', '厂', '心', '手', '毛', '片', '牛', '犬', '玄', '玉', '瓜', '瓦', '豆', '止', '石', '龙', '穴', '立', '里', '和', '见', '贝', '页', '自', '耳', '舌', '虫', '血', '舟', '车', '舟', '衣', '雨', '网', '齿', '革', '骨', '鬼', '鱼', '鸟', '马', '隹', '鹿', '麦', '麻', '黍', '豆', '禾', '竹', '瓜', '果', '采', '立', '里', '金', '木', '水', '火', '石', '丝', '革', '父', '春', '夏', '秋', '冬', '糸', '长', '门', '户', '学', '生', '老', '师', '男', '风', '飞', '鸟', '鱼', '虫', '隹', '马', '牛', '羊', '豕', '齿', '革', '骨', '角', '瓜', '果', '麦', '豆', '禾', '竹', '网', '羽', '长', '门', '户', '花', '女', '儿', '童', '风', '飞', '鸟', '鱼', '虫', '兽', '一', '四', '五', '六', '七', '八', '九']
var CHAR_ARR = ['A', 'B', 'C', 'D', 'K', 'E', 'F', 'G', 'H', 'J', 'K', 'M', 'N', 'R', 'V', 'W', 'Y']
var NUM_ARR = ['42', '37', '34', '12', '23', '47', '55', '27']
const KEY_CODE_ARR = [39, 40, 37, 38];
const maxFontSize = 200; // 最大字号
const minFontSize = 12; // 最小字号
let currentDirection;
let keyInterval;
let gameStatus = 0; // 状态，1为启动
let operateObj = {
    errorCount: 0, // 错误次数
    successCount: 0, // 成功次数
    currentFontSize: maxFontSize,
    step: 1, // 步数
    textChange: "DOWN", // 文字大小改变的指令， DOWN 为减小，UP 为加大
    stepRoundCount: 0, // 第几轮
    allRoundCount: -1,
};
let area = {
    clearness: {begin: 0, end: 0}, // 清晰区？
    vague: {begin: 0, end: 0}, // 模糊区？
    blind: {begin: 0, end: 0} // 无法看的区域？
}
let globalTimer;
let seconds = 0;
let minutes = 0;
$(function () {
    $('.star-btn').click(function () {
        // 点击开始按钮
        gameStatus = 1;
        gotoStep(1);
        changeText();
        resetKeyInterval();
        startGlobalTimer();
        $('.star-btn').hide();
        $('.suspend-btn').show();
        $('.finish-btn').show();
    });
    $('.suspend-btn').click(function () {
        // 暂停
        gamePause();
    });

    $('.restore-btn').click(function () {
        // 继续
        gameRestore();
    });

    $('.finish-btn').click(function () {
        // 结束
        gameOver();
    });

    // 监听按键
    $(document).keydown(function (e) {
        if (KEY_CODE_ARR.includes(e.which) && gameStatus === 1) {
            // 如果按键方向正确
            if (KEY_CODE_ARR.indexOf(e.which) + 1 === currentDirection) {
                operateObj.successCount += 1; // 正确次数加1
                settlement(); // 计划下一步该干什么
                resetOperateErrorCount(); // 重置错误次数
            } else {
                // 答案错误
                keyError();
            }
            if (gameStatus === 1) {
                resetKeyInterval();
            }
        } else if (e.which == 32 || e.which == 13) {
            if (gameStatus == 1) {
                gamePause()
            } else if (gameStatus == 0) {
                $('.star-btn').click();
            } else {
                gameRestore()
            }
        } else if (e.which == 27) {
            gameOver();
        }
    });
})

// 开启计时器
function startGlobalTimer() {
    globalTimer = setInterval(updateTimer, 1000);
}

// 停止计时器
function stopGlobalTimer() {
    if (globalTimer) {
        clearInterval(globalTimer);
    }
}

// 计时器显示
function updateTimer() {
    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
    }
    if (minutes >= 20) {
        gameOver()
    }
    let displayMinutes = minutes < 10 ? "0" + minutes : minutes;
    let displaySeconds = seconds < 10 ? "0" + seconds : seconds;
    $('.time').empty().append(displayMinutes + "：" + displaySeconds);
}

// 答案错误的处理
function keyError() {
    operateObj.errorCount += 1;
    settlement();
    resetOperateSuccessCount();
}

// 设置下次出现文字的时间间隔
function resetKeyInterval() {
    stopKeyInterval();
    let timeout = 3000; // 默认3秒
    switch (operateObj.step) {
        case 1:
            timeout = 3000; // 如果是第一步，间隔 3 秒
            break
        case 2:
        case 3:
            timeout = 2000; // 如果是第二步，第三步，间隔 2 秒
            break
        case 4:
            timeout = 4000; // 如果是第四步，间隔 4 秒
            break
        default:
    }

    keyInterval = setInterval(() => {
        keyError();
    }, timeout);
}

function stopKeyInterval() {
    if (keyInterval) {
        clearInterval(keyInterval);
    }
}

// 根据步骤，决定如何显示
function settlement() {
    let nextStep = false;
    switch (operateObj.step) {
        case 1:
            nextStep = settlementStep1();
            break
        case 2:
            nextStep = settlementStep2();
            break
        case 3:
            nextStep = settlementStep3();
            break
        case 4:
            nextStep = settlementStep4();
            break
        default:
    }
    // 如果需要进入下一步，就改变字体大小
    if (!nextStep) {
        nextFontSize();
    }
}

// 第一步逻辑
function settlementStep1() {
    let doNext = false;
    if (operateObj.currentFontSize < minFontSize) {  // 如果当前字号小余最小字号
        // clearness 清楚状态
        area.clearness.begin = maxFontSize - ((maxFontSize - minFontSize) / 2); // 设置开始字号为：最小和最大字号的中间值
        area.clearness.end = maxFontSize; // 设置结束字号为：最大字号
        // vague 模糊状态
        area.vague.begin = minFontSize; // 设置开始字号为：最小字号
        area.vague.end = area.clearness.begin; // 设置结束字号为：清楚状态的开始字号（这行代码不起作用）
        area.vague.end = minFontSize; // 设置结束字号为：最小字号
        doNext = true; // 标记进入下一步
    }


    if (operateObj.errorCount >= 3) { // 如果连续出错 3 次
        if (area.clearness.end === 0) { 
            area.clearness.begin = maxFontSize - ((maxFontSize - operateObj.currentFontSize) / 2);
            area.clearness.end = maxFontSize;
        }
        if (area.vague.end === 0) {
            area.vague.begin = operateObj.currentFontSize;
            area.vague.end = area.clearness.begin;
        }
        if (area.blind.end === 0) {
            area.blind.begin = minFontSize;
            area.blind.end = area.vague.begin;
        }
        doNext = true;
    }
    if (doNext) {
        gotoStep(2);
    }
    return doNext;
}

// 第二步逻辑
function settlementStep2() {
    let doNext = false;
    if (isFullStepRound()) {
        doNext = true;
    } else {
        if ((operateObj.successCount >= 50 && operateObj.textChange === 'UP') // 如果成功次数 >= 50 次，并且是在增大字号
            || (operateObj.errorCount >= 3 && operateObj.textChange === 'DOWN') // 或者，错误次数 >= 3 次，并且是在减小字号
            || (operateObj.currentFontSize >= 200 && operateObj.textChange === 'UP') // 或者，当前字号 >= 200 并且是在增大字号
            || (operateObj.currentFontSize <= area.clearness.begin && operateObj.textChange === 'DOWN') // 或者，当前字号 <= clearness 的开始字号，并且是在减小字号
        ) {
            textChange(); // 改变字号变换的方向
            operateObj.stepRoundCount += 0.5; // 步骤数加 0.5 
            resetOperateSuccessAndErrorCount();
            if (isFullStepRound()) { // 如果完成了完整步骤，进入下一步
                doNext = true;
            }
        }
    }
    if (doNext) {
        gotoStep(3);
    }
    return doNext;
}

// 第三步逻辑
function settlementStep3() {
    let doNext = false;
    if (isFullStepRound()) {
        doNext = true;
    } else {
        if ((operateObj.successCount >= 40 && operateObj.textChange === 'UP') // 如果成功次数 >= 40 次，并且是在增大字号
            || (operateObj.errorCount >= 3 && operateObj.textChange === 'DOWN') // 或者，错误次数 >= 3 次，并且是在减小字号
            || (operateObj.currentFontSize >= 200 && operateObj.textChange === 'UP') // 或者，当前字号 >= 200，并且在增大字号
            || (operateObj.currentFontSize <= area.vague.begin && operateObj.textChange === 'DOWN') // 或者，当前字号 <= vague 的开始字号，并且是在减小字号
        ) {
            textChange(); // 改变字号变换方向
            operateObj.stepRoundCount += 0.5;
            resetOperateSuccessAndErrorCount();
            if (isFullStepRound()) {
                doNext = true;
            }
        }
    }
    if (doNext) {
        gotoStep(4);
    }
    return doNext;
}

// 第四步逻辑
function settlementStep4() {
    let doNext = false;
    if (isFullStepRound()) {
        doNext = true;
    } else {
        if ((operateObj.successCount >= 40 && operateObj.textChange === 'UP')
            || (operateObj.errorCount >= 3 && operateObj.textChange === 'DOWN')
            || (operateObj.currentFontSize >= 200 && operateObj.textChange === 'UP')
            || (operateObj.currentFontSize <= minFontSize && operateObj.textChange === 'DOWN')
        ) {
            textChange();
            operateObj.stepRoundCount += 0.5;
            resetOperateSuccessAndErrorCount();
            if (isFullStepRound()) {
                doNext = true;
            }
        }
    }
    if (doNext) {
        gotoStep(2);
    }
    return doNext;
}

// 进入指定步骤
function gotoStep(step) {
    operateObj.step = step; // 改变当前步骤
    switch (step) {
        case 1:
            changeText(200); // 如果是第一步，改变文字 200 
            break
        case 2:
            operateObj.allRoundCount += 1; // 如果第二步执行了两次，就结束游戏
            if (operateObj.allRoundCount >= 2) {
                gameOver();
            }
            changeText(200);
            break
        case 3:
            changeText(area.vague.end); // 如果是第三步，改变文字为模糊的最小值
            break
        case 4: 
            // 如果是第四步
            if (area.blind.end <= 12) { // 如果显示的字号小到 12 号，就跳到第 2 步
                gotoStep(2);
            } else {
                changeText(area.blind.end); // 否则就改变文字为 blind 的最小值
            }
            break
        default:
    }
    resetOperateSuccessAndErrorCount();
    operateObj.stepRoundCount = 0;
}

// 完成了一个完整流程
function isFullStepRound() {
    return operateObj.stepRoundCount >= 2
}

function gameRestore() {
    if (gameStatus === 1) {
        return;
    }
    $('.suspend-btn').show();
    $('.restore-btn').hide();
    $('.game-status').empty();
    gameStatus = 1;
    resetKeyInterval();
    startGlobalTimer();
}

function gamePause() {
    if (gameStatus === -1) {
        return;
    }
    $('.suspend-btn').hide();
    $('.restore-btn').show();
    $('.game-status').append('(暂停中)')
    gameStatus = -1;
    stopKeyInterval();
    stopGlobalTimer();
}

function gameOver() {
    $('.font-txt').hide();
    $('.finish-box').show();
    $('.top').hide();
    $('.btn-box').hide();
    gameStatus = -1;
    stopKeyInterval();
    let countDown = 5;

    let timer = setInterval(function () {
        countDown--;
        $('.finish-time').empty().append(countDown);


        if (countDown <= 0) {
            clearInterval(timer);
            location.reload();
        }
    }, 1000);
}

// 计算下一步的文字大小
function nextFontSize() {
    switch (operateObj.textChange) {
        case "DOWN":
            operateObj.currentFontSize -= 2; // 减少 2 个字号
            break
        case "UP":
            operateObj.currentFontSize += 2; // 增大 2 个字号
            break
    }

    changeText();
}

// 改变文字，传入参数为文字大小
function changeText(fontSize) {
    let text;
    if (operateObj.step >= 4) { // 如果是第 4 步，或者以后，则从字母中随机挑选文字
        text = randomByArrays([...CHAR_ARR]);
    } else {
        text = randomByArrays([...CHINESE_ARR, ...CHAR_ARR, ...NUM_ARR]); // 否则从中文、字母、数字中随机挑选文字
    }
    $('.font-txt').text(text);
    changeTextFontSize(fontSize);
    changeDirection(1); // 缩放比例为 100%
}

// 改变文字大小
function changeTextFontSize(fontSize) {
    fontSize = fontSize || operateObj.currentFontSize;
    operateObj.currentFontSize = fontSize;
    $('.font-txt').css('fontSize', `${fontSize}px`);
}

// 改变文字方向，参数为缩放比例， 1 表示 100%
function changeDirection(scale) {
    currentDirection = randomByArrays([1, 2, 3, 4]); // 四个方向随机选择一个，1: 90度，2: 180度，3: 270度，4: 不动
    $('.font-txt').css({
        transform: `rotate(${currentDirection * 90}deg) scale(${scale})`
    });
}

function randomByArrays(arrays) {
    return arrays[Math.floor(Math.random() * arrays.length)];
}

function resetOperateErrorCount() {
    operateObj.errorCount = 0;
}

function resetOperateSuccessCount() {
    operateObj.successCount = 0;
}

function resetOperateSuccessAndErrorCount() {
    resetOperateErrorCount();
    resetOperateSuccessCount();
}

function textChange() {
    operateObj.textChange = operateObj.textChange === "DOWN" ? "UP" : "DOWN";
}
