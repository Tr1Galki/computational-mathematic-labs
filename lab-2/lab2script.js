import { generateRandomColor, getRandomInt } from "./utils.js";

const MAX_ITERATIONS = 3000
let eps = 0.00001;
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
        case "eq4" : {
            initFunction(func4)
            break;
        }
        case "eq5" : {
            initFunction(func5)
            break;
        }
        case "sys1" : {
            initSystem(systemEquations1)
            break;
        }
        case "sys2" : {
            initSystem(systemEquations2)
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


function initFunction(func) {
    console.clear()
    currentFunction = func
    currentSystem = false
    drawFunction(func)
    graphInitialize()

    if ((!inputLeftBorder && inputLeftBorder !== 0) || (!inputRightBorder && inputRightBorder !== 0)) {
        console.error("Please, enter range")
        return
    }
    let roots = rootsByTable(func, inputLeftBorder, inputRightBorder)
    if (roots.isOutOfRange) {
        console.warn("range is incorrect!")
        return
    }
    if (roots.intervals.length == 0) {
        console.warn("there is no roots at this range!")
        return
    }

    console.warn("Half division method:")
    let halfDivisionResult = getAllRoots(halfDivision, func, roots.intervals)
    consoleTable(halfDivisionResult)
    
    console.warn("Newton's method:")
    let newtonsResult = getAllRoots(newtons, func, roots.intervals)
    consoleTable(newtonsResult)

    console.warn("Simple iteration method:")
    let simpleIterationResult = getAllRoots(simpleIteration, func, roots.intervals)
    consoleTable(simpleIterationResult)

}

function initSystem(func) {
    console.clear()

    currentFunction = false
    currentSystem = func
    graphInitialize()

    if ((!inputLeftBorder && inputLeftBorder !== 0) || ((!inputRightBorder && inputRightBorder !== 0))) {
        console.error("Please, enter initial approximation")
        return
    }

    let simpleIterationResult = systemSimpleIteration(func().funcs, func().phis, [inputLeftBorder, inputRightBorder])
    if (!simpleIterationResult.result || isNaN(simpleIterationResult.result[0]) || isNaN(simpleIterationResult.result[1]) || 
        !isFinite(simpleIterationResult.result[0]) || !simpleIterationResult.result[1]) {
        let message = "Delta_x and Delta_Y are out of ODZ\nSystem does not coverage"
        console.log(message)
        return
    } 
    console.log(simpleIterationResult.message + "\nx = " + simpleIterationResult.result[0] + "\ny = " + simpleIterationResult.result[1])
    console.log("right answer: " + func().funcs[0](simpleIterationResult.result[0], simpleIterationResult.result[1]))
    console.log("right answer: " + func().funcs[1](simpleIterationResult.result[0], simpleIterationResult.result[1]))
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



function systemEquations1() {
    function funcFirst(x, y) {
        return 0.1 * Math.pow(x, 2) + x + 0.2 * Math.pow(y, 2) - 0.3
    }

    function funcSecond(x, y) {
        return 0.2 * Math.pow(x, 2) + y + 0.1 * x * y - 0.7
    }

    function phi_1(x, y) {
        return 0.3 - 0.1 * Math.pow(x, 2) - 0.2 * Math.pow(y, 2)
    }

    function phi_2(x, y) {
        return 0.7 - 0.2 * Math.pow(x, 2) - 0.1 * x * y
    }

    function graph_1(x) {
        return Math.sqrt((0.3 - 0.1 * (Math.pow(x, 2)) - x) / 0.2)
    }

    function graph_2(x) {
        return -Math.sqrt((0.3 - 0.1 * (Math.pow(x, 2)) - x) / 0.2)
    }

    function graph_3(x) {
        return (0.7 - 0.2 * Math.pow(x, 2)) / (1 + 0.1 * x)
    }

    return new systemEquationResult([funcFirst, funcSecond], [phi_1, phi_2], [graph_1, graph_2, graph_3])
}

function systemEquations2() {
    function funcFirst(x, y) {
        return x ** 2 + y ** 2 - 1
    }

    function funcSecond(x, y) {
        return Math.sqrt(Math.abs(x)) - y - 0.5
    }

    function phi_1(x, y) {
        return Math.sqrt(1 - y ** 2)
    }

    function phi_2(x, y) {
        return Math.sqrt(Math.abs(x)) - 0.5
    }

    function graph_1(x) {
        return -Math.sqrt(1 - x ** 2)
    }

    function graph_2(x) {
        return Math.sqrt(1 - x ** 2)
    }

    function graph_3(x) {
        return Math.sqrt(Math.abs(x)) - 0.5
    }

    return new systemEquationResult([funcFirst, funcSecond], [phi_1, phi_2], [graph_1, graph_2, graph_3])
}


class systemEquationResult {
    constructor(funcs, phis, graphs) {
        this.#funcs = funcs
        this.#phis = phis
        this.#graphs = graphs
    }

    #funcs
    #phis
    #graphs

    get funcs() {
        return this.#funcs
    }

    get phis() {
        return this.#phis
    }

    get graphs() {
        return this.#graphs
    }

    get func1() {
        return func1[0]
    }

    get func2() {
        return func1[1]
    }
}

function convergentTest(func, approximation) {
    const d = 0.00001
    const [x0, y0] = approximation
    const df_dx = (func[1](x0 + d, y0) - func[1](x0, y0)) / d
    const df_dy = (func[1](x0, y0 + d) - func[1](x0, y0)) / d
    const dgy_dx = (func[0](x0 + d, y0) - func[0](x0, y0)) / d
    const dgy_dy = (func[0](x0, y0 + d) - func[0](x0, y0)) / d
    const J = df_dx * dgy_dy - df_dy * dgy_dx
    return Math.abs(J)
}


// Simple iteration method for system of equations
function systemSimpleIteration(system, phis, approximation) {
    let deltaX = 1
    let deltaY = 1
    let [x, y] = approximation
    let iterations = 0
    let isConvergent = convergentTest(system, approximation)
    console.log("J = ", isConvergent)
    while ((Math.abs(deltaX) > eps || Math.abs(deltaY) > eps) && iterations < MAX_ITERATIONS) {
        let phiX = phis[0](x, y)
        let phiY = phis[1](x, y)
        deltaX = x - phiX
        deltaY = y - phiY
        x = phiX
        y = phiY
        iterations++
        console.log(deltaX, deltaY)
    }
    console.log(iterations)
    if (iterations == MAX_ITERATIONS) {
        // let message = "J = " + isConvergent  + '\n'
        let message = "The sequence does not converge"
        return new SystemMethodResult(null, message)
    }
        
    let message = "the sequence converge\n"
    // message += ("J = " + isConvergent + '\n')
    message += ("Iterations count: " + iterations)
    return new SystemMethodResult([x, y], message)
}

class SystemMethodResult {
    constructor(result, message) {
        this.#result = result
        this.#message = message
    }

    #result
    #message

    get result() {
        return this.#result
    }

    get message() {
        return this.#message
    }
}

function derivative(func, x, dx) {
    dx = dx || eps
    return (func(x + dx) - func(x)) / dx
}



function rootsByTable(func, left, right) {
    let prevRoot
    let currentRoot = func(left)
    let outOfRange = false
    const intervals = []
    for (let x = left + eps * 2; x < right; x += eps * 2) {
        prevRoot = currentRoot
        currentRoot = func(x)
        if (isNaN(currentRoot)) {
            outOfRange = true
        }
        if (prevRoot * currentRoot < 0) {
            intervals.push(x)
        }
    }
    return new TableResult(intervals, outOfRange)
}

class TableResult {
    constructor(intervals, isOutOfRange) {
        this.#intervals = intervals
        this.#isOutOfRange = isOutOfRange
    }

    #intervals
    #isOutOfRange

    get intervals() {
        return this.#intervals
    }

    get isOutOfRange() {
        return this.#isOutOfRange
    }
}


// Программная реализация задачи
// нелинейное уравнение
// 1 – Метод половинного деления
// 3 – Метод Ньютона
// 5 - Метод простой итерации 
// система нелинейных уравнений
// 7 - Метод простой итерации



class MethodResult {
    constructor(x, f_x, count) {
        this.#x = x
        this.#f_x = f_x
        this.#count = count
    }

    #x
    #f_x
    #count

    get x() {
        return this.#x
    }

    get f_x() {
        return this.#f_x
    }

    get count() {
        return this.#count
    }
}


function getAllRoots(method, func, intervals) {
    let roots = []
    let funcResults = []
    let iterationsList = []
    intervals.forEach(element => {
        let res = method(func, element - 0.25, element + 0.25)
        roots.push(res.x)
        funcResults.push(res.f_x)
        iterationsList.push(res.count)
    })
    return ([roots, funcResults, iterationsList])
}


// half division methos
function halfDivision(func, left, right) {
    let iterations = 0
    let x
    while ((Math.abs(left - right) > eps || Math.abs(func(x)) > eps && iterations < MAX_ITERATIONS)) {
        x = (left + right) / 2
        if (func(left) * func(x) > 0) {
            left = x
        } else {
            right = x
        }
        iterations++
    }
    x = (left + right) / 2
    return new MethodResult(x, func(x), iterations)
}


//Newton's method
function newtons(func, left, right) {
    let iterations = 0
    let x_0 = left
    let x = x_0
    let h_0
    while ((Math.abs(func(x)) > eps && Math.abs(func(x) / derivative(func, x)) > eps && Math.abs(x-x_0) > eps && 
        iterations < MAX_ITERATIONS) || iterations == 0) {
        x_0 = x
        h_0 = func(x) / derivative(func, x)
        x = x_0 - h_0
        iterations++
    }
    return new MethodResult(x, func(x), iterations)
}


// Simple iteration method
function simpleIteration(func, left, right) {
    function phi(x) {
        return x + (-1 / derivative(func, x)) * func(x)
    }

    let iterations = 0
    let x_0 = phi(left)
    let x = phi(x_0)
    let n = 2
    
    while (Math.abs(x - x_0) > eps && iterations < MAX_ITERATIONS) {
        x_0 = x
        x = phi(x_0)
        n++
        iterations++
    }

    return new MethodResult(x, func(x), iterations)
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
    } else if (currentSystem) [
        currentSystem().graphs.forEach(element => {
            drawFunction(element)
        })
    ]
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