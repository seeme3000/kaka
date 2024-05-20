var CHINESE_ARR = ['月', '丁', '户', '下', '上', '西', '水', '金', '木', '北', '玉', '五', '七', '木', '禾', '人', '入', '八', '几', '儿', '了', '又', '丸', '己', '已', '巳', '弓', '子', '女', '寸', '飞', '也', '山', '巾', '广', '门', '开', '斗', '牙', '比', '互', '毛', '氏', '歹', '气', '爪', '父', '月', '丹', '乌', '方', '火', '为', '亡', '己', '子', '兀', '丁', '厂', '心', '手', '毛', '片', '牛', '犬', '玄', '玉', '瓜', '瓦', '豆', '止', '石', '龙', '穴', '立', '里', '和', '见', '贝', '页', '自', '耳', '舌', '虫', '血', '舟', '车', '舟', '衣', '雨', '网', '齿', '革', '骨', '鬼', '鱼', '鸟', '马', '隹', '鹿', '麦', '麻', '黍', '豆', '禾', '竹', '瓜', '果', '采', '立', '里', '金', '木', '水', '火', '石', '丝', '革', '父', '春', '夏', '秋', '冬', '糸', '长', '门', '户', '学', '生', '老', '师', '男', '风', '飞', '鸟', '鱼', '虫', '隹', '马', '牛', '羊', '豕', '齿', '革', '骨', '角', '瓜', '果', '麦', '豆', '禾', '竹', '网', '羽', '长', '门', '户', '花', '女', '儿', '童', '风', '飞', '鸟', '鱼', '虫', '兽', '一', '四', '五', '六', '七', '八', '九']
var CHAR_ARR = ['A', 'B', 'C', 'D', 'K', 'E', 'F', 'G', 'H', 'J', 'K', 'M', 'N', 'R', 'V', 'W', 'Y']
var NUM_ARR = ['42', '37', '34', '12', '23', '47', '55', '27']
const KEY_CODE_ARR = [39, 40, 37, 38];
const maxFontSize = 200;
const minFontSize = 12;
let currentDirection;
let keyInterval;
let gameStatus = 0;
let operateObj = {
    errorCount: 0,
    successCount: 0,
    currentFontSize: maxFontSize,
    step: 1,
    textChange: "DOWN",
    stepRoundCount: 0,
    allRoundCount: -1,
};
let area = {
    clearness: {begin: 0, end: 0},
    vague: {begin: 0, end: 0},
    blind: {begin: 0, end: 0}
}
let globalTimer;
let seconds = 0;
let minutes = 0;
$(function () {
    $('.star-btn').click(function () {
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
        gamePause();
    });

    $('.restore-btn').click(function () {
        gameRestore();
    });

    $('.finish-btn').click(function () {
        gameOver();
    });
    $(document).keydown(function (e) {
        if (KEY_CODE_ARR.includes(e.which) && gameStatus === 1) {
            if (KEY_CODE_ARR.indexOf(e.which) + 1 === currentDirection) {
                operateObj.successCount += 1;
                settlement();
                resetOperateErrorCount();
            } else {
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

function startGlobalTimer() {
    globalTimer = setInterval(updateTimer, 1000);
}

function stopGlobalTimer() {
    if (globalTimer) {
        clearInterval(globalTimer);
    }
}

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

function keyError() {
    operateObj.errorCount += 1;
    settlement();
    resetOperateSuccessCount();
}

function resetKeyInterval() {
    stopKeyInterval();
    let timeout = 3000;
    switch (operateObj.step) {
        case 1:
            timeout = 3000;
            break
        case 2:
        case 3:
            timeout = 2000;
            break
        case 4:
            timeout = 4000;
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
    if (!nextStep) {
        nextFontSize();
    }
}

function settlementStep1() {
    let doNext = false;
    if (operateObj.currentFontSize < minFontSize) {
        area.clearness.begin = maxFontSize - ((maxFontSize - minFontSize) / 2);
        area.clearness.end = maxFontSize;
        area.vague.begin = minFontSize;
        area.vague.end = area.clearness.begin;
        area.vague.end = minFontSize;
        doNext = true;
    }


    if (operateObj.errorCount >= 3) {
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

function settlementStep2() {
    let doNext = false;
    if (isFullStepRound()) {
        doNext = true;
    } else {
        if ((operateObj.successCount >= 50 && operateObj.textChange === 'UP')
            || (operateObj.errorCount >= 3 && operateObj.textChange === 'DOWN')
            || (operateObj.currentFontSize >= 200 && operateObj.textChange === 'UP')
            || (operateObj.currentFontSize <= area.clearness.begin && operateObj.textChange === 'DOWN')
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
        gotoStep(3);
    }
    return doNext;
}

function settlementStep3() {
    let doNext = false;
    if (isFullStepRound()) {
        doNext = true;
    } else {
        if ((operateObj.successCount >= 40 && operateObj.textChange === 'UP')
            || (operateObj.errorCount >= 3 && operateObj.textChange === 'DOWN')
            || (operateObj.currentFontSize >= 200 && operateObj.textChange === 'UP')
            || (operateObj.currentFontSize <= area.vague.begin && operateObj.textChange === 'DOWN')
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
        gotoStep(4);
    }
    return doNext;
}

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

function gotoStep(step) {
    operateObj.step = step;
    switch (step) {
        case 1:
            changeText(200);
            break
        case 2:
            operateObj.allRoundCount += 1;
            if (operateObj.allRoundCount >= 2) {
                gameOver();
            }
            changeText(200);
            break
        case 3:
            changeText(area.vague.end);
            break
        case 4:
            if (area.blind.end <= 12) {
                gotoStep(2);
            } else {
                changeText(area.blind.end);
            }
            break
        default:
    }
    resetOperateSuccessAndErrorCount();
    operateObj.stepRoundCount = 0;
}

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

function nextFontSize() {
    switch (operateObj.textChange) {
        case "DOWN":
            operateObj.currentFontSize -= 2;
            break
        case "UP":
            operateObj.currentFontSize += 2;
            break
    }

    changeText();
}

function changeText(fontSize) {
    let text;
    if (operateObj.step >= 4) {
        text = randomByArrays([...CHAR_ARR]);
    } else {
        text = randomByArrays([...CHINESE_ARR, ...CHAR_ARR, ...NUM_ARR]);
    }
    $('.font-txt').text(text);
    changeTextFontSize(fontSize);
    changeDirection(1);
}

function changeTextFontSize(fontSize) {
    fontSize = fontSize || operateObj.currentFontSize;
    operateObj.currentFontSize = fontSize;
    $('.font-txt').css('fontSize', `${fontSize}px`);
}

function changeDirection(scale) {
    currentDirection = randomByArrays([1, 2, 3, 4]);
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
