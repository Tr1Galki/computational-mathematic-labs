import { generateRandomColor, epsRound } from "./utils.js"

const MAX_ITERATIONS = 3000000
let eps = 0.0001;
let currentFunction = func1
let leftLimit = 0
let rightLimit = 1
let y_0 = 1
let intervalsCount = 4
let rungeIntervals = 5000

document.querySelector("#input_stroke_size_x").addEventListener("change",  event => {
    setInterval(parseFloat(event.target.value), parseFloat(document.querySelector("#input_stroke_size_y").value))
    initFunction()
})

document.querySelector("#input_stroke_size_y").addEventListener("change", event => {
    setInterval(parseFloat(document.querySelector("#input_stroke_size_x").value), parseFloat(event.target.value))
    initFunction()
})

document.querySelector("#input_y_0").addEventListener("change", event => {
    y_0 = parseFloat(event.target.value)
    initFunction()
})

document.querySelector("#input_left").addEventListener("change", event => {
    leftLimit = parseFloat(event.target.value)
    initFunction()
})

document.querySelector("#input_right").addEventListener("change", event => {
    rightLimit = parseFloat(event.target.value)
    initFunction()
})

document.querySelector("#input_eps").addEventListener("change", event => {
    eps = parseFloat(event.target.value)
    initFunction()
})

document.querySelector("#input_intervals").addEventListener("change", event => {
    intervalsCount = parseFloat(event.target.value)
    initFunction()
})

class FunctionResult {
    constructor (diffFunc, realFunc) {
        this.#diffFunc = diffFunc
        this.#realFunc = realFunc
    }

    #diffFunc
    #realFunc

    get diffFunc() {
        return this.#diffFunc
    }

    get realFunc() {
        return this.#realFunc
    }
}

function func1() {
    let diff = (x, y) => y + Math.sin(x)
    let real = (x) => {
        //y_0 = c*x + t
        //y_0 - t = c*x
        //(y_0 - t) / x = c 

        let tempResult = -Math.sin(leftLimit) / 2 - Math.cos(leftLimit) / 2
        let mult = Math.exp(leftLimit)
        let c = (y_0 - tempResult) / mult

        return -Math.sin(x) / 2 - Math.cos(x) / 2 + c * Math.exp(x)
    }
    return new FunctionResult(diff, real)
}

function func2() {
    let diff = (x, y) => Math.pow(x, 2) - 2 * y
    let real = (x) => {
        //y_0 = c*x + t
        //y_0 - t = c*x
        //(y_0 - t) / x = c 

        let tempResult = Math.pow(leftLimit, 2) / 2 - leftLimit / 2 + 1 / 4
        let mult = Math.exp(-2 * leftLimit)
        let c = (y_0 - tempResult) / mult

        return c / Math.exp(2 * x)  + Math.pow(x, 2) / 2 - x / 2 + 1 / 4
    }
    return new FunctionResult(diff, real)
}

function func3() {
    let diff = (x, y) => x * y / 2
    let real = (x) => {
        let c = y_0 / Math.exp(Math.pow(leftLimit, 2) / 4)
        return c * Math.exp(Math.pow(x, 2) / 4)
    }
    return new FunctionResult(diff, real)
}

document.querySelectorAll(".radio_equation").forEach(element => element.addEventListener("click", event => {
    switch (event.target.value) {
        case "eq1" : {
            initFunction(func1)
            break;
        }
        case "eq2" : {
            initFunction(func2)
            break;
        }
        case "eq3" : {
            initFunction(func3)
            break;
        }
    }
}))


function initFunction(func = currentFunction) {
    console.clear()
    currentFunction = func
    graphInitialize()
    drawFunction(func().realFunc)
    let diff = func().diffFunc
    
    console.warn("Eiler's method:")
    let eilerResult = updatedEiler(diff, leftLimit, rightLimit, intervalsCount)
    console.log(eilerResult)
    drawFunctionByDots(eilerResult.dots, 14)

    console.warn("Runge's method:")
    let rungeResult = rungeKnutt(diff, leftLimit, rightLimit, intervalsCount)
    console.log(rungeResult)
    drawFunctionByDots(rungeResult.dots, 9)

    console.warn("Adams's method:")
    let adamsResult = adams(diff, leftLimit, rightLimit, intervalsCount, func().realFunc)
    console.log(adamsResult)
    drawFunctionByDots(adamsResult.dots, 3)

}

function consoleTable(arr) {
    let table = []

    for (let i = 0; i < arr[0].length; i++) {
        let tableElement = {
            x: Math.round(arr[0][i]*10000)/10000,      
            "f(x)": Math.round(arr[1][i]*10000)/10000,
            iterations: arr[2][i]
        }

        table.push(tableElement)
    }

    console.table(table)
}


class Dot {
    constructor (x, y) {
        this.#x = x
        this.#y = y
    }

    #x
    #y

    get x() {
        return this.#x
    }

    get y() {
        return this.#y
    }
}

class MethodResult {
    constructor (dots, intervals) {
        this.#dots = dots
        this.#intervals = intervals
    }

    #dots
    #intervals

    get dots() {
        return this.#dots
    }

    get intervals() {
        return this.#intervals
    }
}

function updatedEiler(func, left, right, count_h) {
    let defaultResult = calculating(2)
    let halfResult = calculating(3, count_h * 2)

    if (rungeRule(defaultResult[defaultResult.length - 1].y, halfResult[halfResult.length - 1].y, 2)) {
        return new MethodResult(calculating(), count_h)
    }

    return updatedEiler(func, left, right, count_h * 2)


    function calculating(count = count_h, new_count_h = count_h) {
        let result = [new Dot(left, y_0)]
        let delta_h = (right - left) / new_count_h

        for (let i = 0; i < count; i++) {
            let last_x = result[result.length - 1].x
            let last_y = result[result.length - 1].y
    
            let curr_x = last_x + delta_h / 2
            let curr_func = func(last_x, last_y)
            let curr_y = last_y + delta_h / 2 * curr_func
            let delta_y = delta_h * func(curr_x, curr_y)
    
            result.push(new Dot(last_x + delta_h, last_y + delta_y))
        }
        return result
    }
} 


function rungeKnutt(func, left, right, count_h, isUsedByOtherMethod = false) {
    let defaultResult = calculating(2)
    let halfResult = calculating(3, count_h * 2)
    
    if (rungeRule(defaultResult[defaultResult.length - 1].y, halfResult[halfResult.length - 1].y, 4) || isUsedByOtherMethod) {
        rungeIntervals = count_h
        return new MethodResult(calculating(), count_h)
    }

    return rungeKnutt(func, left, right, count_h * 2)

    function calculating(count = count_h, new_count_h = count_h) {
        let result = [new Dot(left, y_0)]
        let delta_h = (right - left) / new_count_h
        
        for (let i = 0; i < count; i++) {
            let last_x = result[result.length - 1].x
            let last_y = result[result.length - 1].y
    
            let k_1 = func(last_x, last_y)
            let k_2 = func(last_x + delta_h / 2, last_y + delta_h * k_1 / 2)
            let k_3 = func(last_x + delta_h / 2, last_y + delta_h * k_2 / 2)
            let k_4 = func(last_x + delta_h, last_y + delta_h * k_3)
            
            let delta_y = delta_h / 6 * (k_1 + 2 * k_2 + 2 * k_3 + k_4)
    
            result.push(new Dot(last_x + delta_h, last_y + delta_y))
        }   
        
        return result
    }
} 

function rungeRule(y, half_y, p, this_eps = eps) {
    if (Math.abs(y - half_y) / (Math.pow(2, p) - 1) <= this_eps) {
        return true
    }
    return false
}



function adams(func, left, right, intervals, realFunc = currentFunction().realFunc) {
    let count_h = intervals
    if (count_h <= 4) {
        return rungeKnutt(func, left, right, count_h)
    }

    let resultDots
    
    let isAccurate = false
    while (!isAccurate) {
        let runge = rungeKnutt(func, left, left + (right - left) / count_h * 3, 3, true)
        resultDots = runge.dots
        let delta_h = (right - left) / count_h
        for (let i = 0; i < count_h - 3; i++) {
    
            let last_x = resultDots[resultDots.length - 1].x
            let last_y = resultDots[resultDots.length - 1].y
            
            let f_i_1 = func(last_x, last_y)
            let f_i_2 = func(resultDots[resultDots.length - 2].x, resultDots[resultDots.length - 2].y)
            let f_i_3 = func(resultDots[resultDots.length - 3].x, resultDots[resultDots.length - 3].y)
            let f_i_4 = func(resultDots[resultDots.length - 4].x, resultDots[resultDots.length - 4].y)
    
            let delta_f_1 = f_i_1 - f_i_2
            let delta_f_2 = f_i_1 - 2 * f_i_2 + f_i_3
            let delta_f_3 = f_i_1 - 3 * f_i_2 + 3 * f_i_3 - f_i_4
            
            let new_y = last_y + delta_h * f_i_1 + Math.pow(delta_h, 2) / 2 * delta_f_1 +
                        5 / 12 * Math.pow(delta_h, 3) * delta_f_2 + 3 / 8 * Math.pow(delta_h, 4) * delta_f_3
            

            resultDots.push(new Dot(last_x + delta_h, new_y))
            
            if (Math.abs(realFunc(last_x + delta_h) - new_y) < eps) {
                isAccurate = true
            }
        } 
        count_h *= 2
    }

    return new MethodResult(resultDots, count_h / 2)
}


// Canvas part -------------------------------------------

const canvas = document.querySelector("#graph")
const WIDTH = 700
const HEIGHT = 700
const DPI_WIDTH = WIDTH * 2
const DPI_HEIGHT = HEIGHT * 2
const COLOR_WHITE = "#A0A0A0"
const COLOR_GREY = "#808080"
const COLOR_BLACK = "#101010"
const STROKE_LENGTH = 12
const STROKE_COUNT = 10
const STROKE_TEXT_MARGIN = 4
const STROKE_FONT = "bold 15pt Consolas"
const STROKE_WIDTH = 3
let STROKE_INTERVAL_X = 0.5
let STROKE_INTERVAL_Y = 0.5
let MULTIPLY_X = WIDTH / (STROKE_COUNT * STROKE_INTERVAL_X)
let MULTIPLY_Y = WIDTH / (STROKE_COUNT * STROKE_INTERVAL_Y)
const stroke_step = WIDTH / STROKE_COUNT
const DOT_COUNTS = 1000

function setInterval(newIntervalX, newIntervalY) {
    // STROKE_INTERVAL = WIDTH / (MULTIPLY * STROKE_COUNT)
    // STROKE_INTERVAL * (MULTIPLY * STROKE_COUNT) = WIDTH
    // MULTIPLY * STROKE_COUNT = WIDTH / STROKE_INTERVAL
    // MULTIPLY = WIDTH / (STROKE_COUNT * STROKE_INTERVAL)
    STROKE_INTERVAL_X = newIntervalX
    STROKE_INTERVAL_Y = newIntervalY
    MULTIPLY_X = WIDTH / (STROKE_COUNT * STROKE_INTERVAL_X)
    MULTIPLY_Y = WIDTH / (STROKE_COUNT * STROKE_INTERVAL_Y)
}


function graphInitialize() {
    const context = canvas.getContext("2d");
    setSize(canvas);
    drawCoordinates(context)
}

function setSize(graph) {
    graph.style.width = WIDTH + "px"
    graph.style.height = HEIGHT + "px"
    graph.width = DPI_WIDTH
    graph.height = DPI_HEIGHT
}

function drawCoordinates(context) {

    context.beginPath()
    context.strokeStyle = COLOR_GREY
    context.lineWidth = STROKE_WIDTH

    //X axis
    context.moveTo(0, DPI_HEIGHT / 2)
    context.lineTo(DPI_WIDTH, DPI_HEIGHT / 2)
    //Y axis
    context.moveTo(DPI_WIDTH / 2, 0)
    context.lineTo(DPI_WIDTH / 2, DPI_HEIGHT)
    //X arrow
    context.moveTo(DPI_WIDTH, DPI_HEIGHT / 2)
    context.lineTo(DPI_WIDTH - STROKE_LENGTH * 2, DPI_HEIGHT / 2 - STROKE_LENGTH)
    context.moveTo(DPI_WIDTH, DPI_HEIGHT / 2)
    context.lineTo(DPI_WIDTH - STROKE_LENGTH * 2, DPI_HEIGHT / 2 + STROKE_LENGTH)
    //Y arrow
    context.moveTo(DPI_WIDTH / 2, 0)
    context.lineTo(DPI_WIDTH / 2 + STROKE_LENGTH, STROKE_LENGTH * 2)
    context.moveTo(DPI_WIDTH / 2, 0)
    context.lineTo(DPI_WIDTH / 2 - STROKE_LENGTH, STROKE_LENGTH * 2)

    context.font = STROKE_FONT

    //X strokes (lines)
    for (let i = stroke_step; i < DPI_WIDTH; i += stroke_step) {
        context.moveTo(i, DPI_HEIGHT / 2 - STROKE_LENGTH)
        context.lineTo(i, DPI_HEIGHT / 2 + STROKE_LENGTH)
    }

    //Y strokes (lines)
    for (let i = stroke_step; i < DPI_HEIGHT; i += stroke_step) {
        context.moveTo(DPI_WIDTH / 2 - STROKE_LENGTH, i)
        context.lineTo(DPI_WIDTH / 2 + STROKE_LENGTH, i)
    }

    context.stroke()
    context.closePath()

    context.beginPath()
    context.fillStyle = COLOR_WHITE

    //X strokes (text)
    for (let i = stroke_step; i < DPI_WIDTH; i += stroke_step) {
        let label = epsRound(-((stroke_step * STROKE_COUNT / MULTIPLY_X) - i / MULTIPLY_X), 0.01)
        let x = i + STROKE_TEXT_MARGIN
        let y = DPI_HEIGHT / 2 - 2 * STROKE_TEXT_MARGIN
        context.fillText(label, x, y)
    }

    //Y strokes (text)
    for (let i = stroke_step; i < DPI_HEIGHT; i += stroke_step) {
        let label = epsRound((stroke_step * STROKE_COUNT / MULTIPLY_Y) - i / MULTIPLY_Y, 0.01)
        let x = DPI_WIDTH / 2 + STROKE_TEXT_MARGIN;
        let y = i - 2 * STROKE_TEXT_MARGIN
        context.fillText(label, x, y)
    }

    context.stroke()
    context.closePath()
}

function drawFunctionByDots(dots, width, color) {
    if (!color) {
        color = generateRandomColor()
    }

    const context = canvas.getContext("2d")
    context.beginPath()
    context.strokeStyle = color

    if (width) {
        context.lineWidth = width
    }

    dots.forEach(dot => {
        context.lineTo(dot.x * MULTIPLY_X + DPI_WIDTH / 2, DPI_HEIGHT / 2 - (dot.y * MULTIPLY_Y))
    })

    context.stroke()
    context.closePath()
    context.lineWidth = 4
}

function drawFunction(func, width, color) {
    if (!color) {
        color = generateRandomColor()
    }

    const context = canvas.getContext("2d")
    context.beginPath()
    context.strokeStyle = color

    if (width) {
        context.lineWidth = width
    }

    let size = STROKE_COUNT * STROKE_INTERVAL_X
    for (let x = -size; x < size; x += size / DOT_COUNTS) {
        if (Math.abs(func(x)) > 10000) {
            continue
        }
        context.lineTo(x * MULTIPLY_X + DPI_WIDTH / 2, DPI_HEIGHT / 2 - (func(x) * MULTIPLY_Y))
    }

    context.stroke()
    context.closePath()
    context.lineWidth = 4
}

graphInitialize()

initFunction()
