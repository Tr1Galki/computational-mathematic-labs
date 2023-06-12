import { epsRound, generateRandomColor, getRandomInt } from "./utils.js";

const MAX_ITERATIONS = 10000000
let eps = 0.0001;
let currentFunction = false
let currentSystem = false
let inputLeftBorder
let inputRightBorder

document.querySelector("#input_stroke_size").addEventListener("change", event => {
    setInterval(parseFloat(event.target.value))
    graphInitialize()
})

document.querySelectorAll(".radio_equation").forEach(element => element.addEventListener("click", event => {
    switch (event.target.value) {
        case "eq1" : {
            init(func1)
            break;
        }
        case "eq2" : {
            init(func2)
            break;
        }
        case "eq3" : {
            init(func3)
            break;
        }
        case "eq4" : {
            init(func4)
            break;
        }
        case "eq5" : {
            init(func5)
            break;
        }
    }
}))

document.querySelector("#input_left").addEventListener("change", event => {
    inputLeftBorder = parseFloat(event.target.value)
})

document.querySelector("#input_right").addEventListener("change", event => {
    inputRightBorder = parseFloat(event.target.value)
})

document.querySelector("#input_eps").addEventListener("change", event => {
    eps = parseFloat(event.target.value)
})


function init(func) {
    console.clear()
    currentFunction = func
    drawFunction(func)
    graphInitialize()

    if ((!inputLeftBorder && inputLeftBorder !== 0) || (!inputRightBorder && inputRightBorder !== 0)) {
        console.error("Please, enter range")
        return
    }
    if (isOutOfRange(func, inputLeftBorder, inputRightBorder)) {
        console.error("Invalid range")
        return
    }

    console.warn("Rectangle method:")
    let tableArray = [];
    let rectangleResult = integralCalculate(rectangleIntegral, func, [inputLeftBorder, inputRightBorder], 0)
    tableArray.push(rectangleResult)
    rectangleResult = integralCalculate(rectangleIntegral, func, [inputLeftBorder, inputRightBorder], 1)
    tableArray.push(rectangleResult)
    rectangleResult = integralCalculate(rectangleIntegral, func, [inputLeftBorder, inputRightBorder], 2)
    tableArray.push(rectangleResult)
    consoleTable(tableArray)

    console.warn("Trapezoid method:")
    let trapezoidResult = integralCalculate(trapezoidIntegral, func, [inputLeftBorder, inputRightBorder])
    consoleTable([trapezoidResult])

    console.warn("Simpson method:")
    let simpsonResult = integralCalculate(simpsonIntegral, func, [inputLeftBorder, inputRightBorder], 3)
    consoleTable([simpsonResult])

    calculate()
}

function calculate() {
    let c_0 = temp(2) * 19 * 2 / 288
    console.log(c_0)
    let c_1 = temp(2.4) * 75 * 2 / 288
    console.log(c_1)
    let c_2 = temp(2.8) * 50 * 2 / 288
    console.log(c_2)
    let c_3 = temp(3.2) * 50 * 2 / 288
    console.log(c_3)
    let c_4 = temp(3.6) * 75 * 2 / 288
    console.log(c_4)
    let c_5 = temp(4) * 19 * 2 / 288
    console.log(c_5)
    let result = c_0 + c_1 + c_2 + c_3 + c_4 + c_5
    console.log(result)
}

function consoleTable(arr) {
    let table = []

    for (let i = 0; i < arr.length; i++) {
        let tableElement = {      
            'integral': epsRound(arr[i].integral, eps),
            'n': arr[i].count
        }

        table.push(tableElement)
    }

    console.table(table)
}

function func1(x) {
    let result = 2 * Math.pow(x, 3) + 3.41 * Math.pow(x, 2) - 23.74 * x + 2.95
    return result
}

function func2(x) {
    let result = Math.log(x - 1) / 3
    return result

}

function func3(x) {
    let result = 3 * Math.pow(Math.pow(Math.sin(x), 3), 3) + 0.5
    return result
}

function func4(x) {
    let result = Math.log2(Math.abs(Math.pow(x, 2) - x) / 3)
    return result
}

function func5(x) {
    let result = Math.pow(2, Math.sqrt(x)) - x
    return result
}


function temp(x) {
    let result = -2 * Math.pow(x, 3) + -3 * Math.pow(x, 2) + x + 5
    return result
}



function isOutOfRange(func, left, right) {
    let currentRoot
    let outOfRange = false
    for (let x = left; x < right; x += eps * 2) {
        currentRoot = func(x)
        if (isNaN(currentRoot) || !isFinite(currentRoot)) {
            outOfRange = true
        }
    }
    let x = 0
    currentRoot = func(x)
    if (x >= left && x <= right && (isNaN(currentRoot) || !isFinite(currentRoot))) {
        outOfRange = true
    }
    x = 1
    currentRoot = func(x)
    if (x >= left && x <= right && (isNaN(currentRoot) || !isFinite(currentRoot))) {
        outOfRange = true
    }
    return outOfRange
}

class IntegrationResult {
    constructor(integral, count) {
        this.#integral = integral
        this.#count = count
    }

    #integral
    #count

    get integral() {
        return this.#integral
    }

    get count() {
        return this.#count
    }
}


function integralCalculate(method, func, intervals, type) {
    let k
    if (type == 3) {
        k = 4
    } else if (type == 0 || type == 1){
        k = 1
    } else {
        k = 2
    }
    let n = 4
    let oldRes = method(func, intervals, n, type)
    n *= 2
    let currRes = method(func, intervals, n, type)

    while (Math.abs(currRes.value - oldRes.value) / (Math.pow(2, k) - 1) > eps) {
        n *= 2
        oldRes = currRes
        currRes = method(func, intervals, n, type) 
        if (currRes.iterations > MAX_ITERATIONS) {
            return new IntegrationResult(currRes.value, currRes.iterations)
        }
    }

    return new IntegrationResult(currRes.value, n)
}


class MethodResult {
    constructor(value, iterations) {
        this.#value = value
        this.#iterations = iterations
    }

    #value
    #iterations

    get value() {
        return this.#value
    }

    get iterations() {
        return this.#iterations
    }
}


//type 0 = левые
//1 = левые
//2 = левые
function rectangleIntegral(func, intervals, n, type) {
    let [a, b] = intervals
    let h_0 = Math.abs(b - a) / n
    let y = 0
    let iterations = 0;

    switch(type) {
        case 0: {
            for (let i = 0; i < n; i++) {
                let x = a + h_0 * i
                y += func(x)
                iterations++
            }
            break
        }
        case 1: {
            for (let i = 1; i <= n; i++) {
                let x = a + h_0 * i
                y += func(x)
                iterations++
            }
            break
        }
        default: {
            for (let i = 0; i < n; i++) {
                let x = a + h_0 * i + h_0 / 2
                y += func(x)
                iterations++
            }
            break
        }
    }

    let ans = h_0 * y

    return new MethodResult(ans, iterations)
}

function trapezoidIntegral(func, intervals, n) {
    let [a, b] = intervals
    let h_0 = Math.abs(b - a) / n
    let y = 0
    let iterations = 0;

    for (let i = 1; i < n; i++) {
        let x = a + h_0 * i
        y += func(x)
        iterations++
    }

    let ans = h_0 / 2 * (func(a) + func(b) + 2 * y)

    return new MethodResult(ans, iterations)
}

function simpsonIntegral(func, intervals, n) {
    let [a, b] = intervals
    let h_0 = Math.abs(b - a) / n
    let sum = 0
    let iterations = 0;

    for (let i = 1; i < n; i += 2) {
        let x_0 = a + (i - 1) * h_0
        let x_1 = x_0 + h_0
        let x_2 = x_1 + h_0
        sum += func(x_0) + 4 * func(x_1) + func(x_2)
        iterations++
    }

    let ans = h_0 / 3 * sum

    return new MethodResult(ans, iterations)
}


// function getAllRoots(method, func, intervals) {
//     let roots = []
//     let funcResults = []
//     let iterationsList = []
//     intervals.forEach(element => {
//         let res = method(func, element - 0.25, element + 0.25)
//         roots.push(res.x)
//         funcResults.push(res.f_x)
//         iterationsList.push(res.count)
//     })
//     return ([roots, funcResults, iterationsList])
// }


// // half division methos
// function halfDivision(func, left, right) {
//     let iterations = 0
//     let x
//     while ((Math.abs(left - right) > eps || Math.abs(func(x)) > eps && iterations < MAX_ITERATIONS)) {
//         x = (left + right) / 2
//         if (func(left) * func(x) > 0) {
//             left = x
//         } else {
//             right = x
//         }
//         iterations++
//     }
//     x = (left + right) / 2
//     return new MethodResult(x, func(x), iterations)
// }


// //Newton's method
// function newtons(func, left, right) {
//     let iterations = 0
//     let x_0 = left
//     let x = x_0
//     let h_0
//     while ((Math.abs(func(x)) > eps && Math.abs(func(x) / derivative(func, x)) > eps && Math.abs(x-x_0) > eps && 
//         iterations < MAX_ITERATIONS) || iterations == 0) {
//         x_0 = x
//         h_0 = func(x) / derivative(func, x)
//         x = x_0 - h_0
//         iterations++
//     }
//     return new MethodResult(x, func(x), iterations)
// }


// // Simple iteration method
// function simpleIteration(func, left, right) {
//     function phi(x) {
//         return x + (-1 / derivative(func, x)) * func(x)
//     }

//     let iterations = 0
//     let x_0 = phi(left)
//     let x = phi(x_0)
//     let n = 2
    
//     while (Math.abs(x - x_0) > eps && iterations < MAX_ITERATIONS) {
//         x_0 = x
//         x = phi(x_0)
//         n++
//         iterations++
//     }

//     return new MethodResult(x, func(x), iterations)
// }




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
let STROKE_INTERVAL = 1
let MULTIPLY = WIDTH / (STROKE_COUNT * STROKE_INTERVAL)
const stroke_step = WIDTH / STROKE_COUNT

function setInterval(newInterval) {
    // STROKE_INTERVAL = WIDTH / (MULTIPLY *S TROKE_COUNT)
    // STROKE_INTERVAL * (MULTIPLY * STROKE_COUNT) = WIDTH
    // MULTIPLY * STROKE_COUNT = WIDTH / STROKE_INTERVAL
    // MULTIPLY = WIDTH / (STROKE_COUNT * STROKE_INTERVAL)
    STROKE_INTERVAL = newInterval
    MULTIPLY = WIDTH / (STROKE_COUNT * STROKE_INTERVAL)
}


function graphInitialize() {
    const context = canvas.getContext("2d");
    setSize(canvas);
    drawCoordinates(context)
    if (currentFunction) {   
        drawFunction(currentFunction)
    }
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
    context.moveTo(DPI_WIDTH, DPI_HEIGHT/2)
    context.lineTo(DPI_WIDTH - STROKE_LENGTH * 2, DPI_HEIGHT / 2 - STROKE_LENGTH)
    context.moveTo(DPI_WIDTH, DPI_HEIGHT/2)
    context.lineTo(DPI_WIDTH - STROKE_LENGTH * 2, DPI_HEIGHT / 2 + STROKE_LENGTH)
    //Y arrow
    context.moveTo(DPI_WIDTH / 2, 0)
    context.lineTo(DPI_WIDTH / 2 + STROKE_LENGTH, STROKE_LENGTH * 2)
    context.moveTo(DPI_WIDTH / 2, 0)
    context.lineTo(DPI_WIDTH / 2 - STROKE_LENGTH, STROKE_LENGTH * 2)
    
    context.font = STROKE_FONT

    //X strokes (lines)
    for (let i = stroke_step; i < DPI_WIDTH; i += stroke_step) {
        context.moveTo(i, DPI_HEIGHT/2 - STROKE_LENGTH)
        context.lineTo(i, DPI_HEIGHT/2 + STROKE_LENGTH)
    }

    //Y strokes (lines)
    for (let i = stroke_step; i < DPI_HEIGHT; i += stroke_step) {
        context.moveTo(DPI_WIDTH/2 - STROKE_LENGTH, i)
        context.lineTo(DPI_WIDTH/2 + STROKE_LENGTH, i)
    }

    context.stroke()
    context.closePath()

    context.beginPath()
    context.fillStyle = COLOR_WHITE

    //X strokes (text)
    for (let i = stroke_step; i < DPI_WIDTH; i += stroke_step) {
        let label = (-((stroke_step * STROKE_COUNT / MULTIPLY) - i / MULTIPLY))
        let x = i + STROKE_TEXT_MARGIN
        let y = DPI_HEIGHT / 2 - 2*STROKE_TEXT_MARGIN
        context.fillText(label, x, y)
    }

    //Y strokes (text)
    for (let i = stroke_step; i < DPI_HEIGHT; i += stroke_step) {
        let label = Math.round((stroke_step * STROKE_COUNT / MULTIPLY) - i / MULTIPLY)
        let x = DPI_WIDTH / 2 + STROKE_TEXT_MARGIN;
        let y = i - 2*STROKE_TEXT_MARGIN
        context.fillText(label, x, y)
    }

    context.stroke()
    context.closePath()
}

function drawFunction(func, color) {
    if (!color) {
        color = generateRandomColor()
    }

    const context = canvas.getContext("2d")
    context.beginPath()
    context.strokeStyle = color
    
    for (let x = -DPI_WIDTH/2; x < DPI_WIDTH/2; x+=0.005) {
        context.lineTo(x * MULTIPLY + DPI_WIDTH/2, DPI_HEIGHT/2 - (func(x) * MULTIPLY))
    }

    context.stroke()
    context.closePath()
}

graphInitialize()