import { generateRandomColor, epsRound } from "./utils.js"

const fileName = './data/test6.json'

let dots = [[]]
let eps = 0.0001

document.querySelector("#input_stroke_size").addEventListener("change", event => {
    setInterval(parseFloat(event.target.value))
    drawAndCalculate()
})

document.querySelector("#add_button").addEventListener("click", event => {
    event.preventDefault()
    let x = parseFloat(document.querySelector("#input_x").value)
    let y = parseFloat(document.querySelector("#input_y").value)
    if ((!x && x !== 0) || !y && y !== 0) {
        console.warn("Wrong input parameters")
        return
    }
    let isInDots = false
    for (let i = 0; i < dots.length; i++) {
        if (dots[i][0] == x) {
            dots[i][1] = y
            isInDots = true
            break
        }
    }
    if (!isInDots) {
        dots.push([x, y])
    }
    drawAndCalculate()
})

document.querySelector("#get_button").addEventListener("click", event => {
    event.preventDefault()
    let x = parseFloat(document.querySelector("#input_param").value)
    if (!x && x !== 0) {
        console.warn("Wrong input parameters")
        return
    }
    getValByX(x)
})


$.getJSON(fileName, function (fileData) {
    dots = [...fileData]
    drawAndCalculate()
})

function drawAndCalculate() {
    console.clear()
    dots.sort((a, b) => a[0] - b[0])
    graphInitialize()

    let linear = linearApproximation()
    let square = squareApproximation()
    let cube = cubeApproximation()
    let pow = powApproximation()
    let exponential = exponentialApproximation()
    let logariphmical = logariphmicalApproximation()

    drawFunction(linear.func)
    drawFunction(square.func)
    drawFunction(cube.func)
    drawFunction(pow.func)
    drawFunction(exponential.func)
    drawFunction(logariphmical.func)

    console.log("Linear function:", linear.description)
    console.log("Square function:", square.description)
    console.log("Cube function:", cube.description)
    console.log("Pow function:", pow.description)
    console.log("Exp function:", exponential.description)
    console.log("Log function:", logariphmical.description)

    console.log("Linear deviation", epsRound(linear.deviation, eps))
    console.log("Square deviation", epsRound(square.deviation, eps))
    console.log("Cube deviation", epsRound(cube.deviation, eps))
    console.log("Pow deviation", epsRound(pow.deviation, eps))
    console.log("Exp deviation", epsRound(exponential.deviation, eps))
    console.log("Log deviation", epsRound(logariphmical.deviation, eps))
    drawAllDots()
}

function printLargeArray(differences) {
    let tempColumn = []
    differences.forEach(row => {
        let tempRow = []
        row.forEach(element => {
            let temp = epsRound(element, 0.0001)
            if (!temp) {
                temp = 0
            }
            tempRow.push(temp)
        })
        tempColumn.push(tempRow)
        if (tempColumn.length == 5) {
            console.table(tempColumn[0].map((_, colIndex) => tempColumn.map(row => row[colIndex])))
            tempColumn = []
        }
        tempRow = []
    })
    if (tempColumn.length != 0) {
        console.table(tempColumn[0].map((_, colIndex) => tempColumn.map(row => row[colIndex])))
    }
}


class FunctionResult {
    constructor(func, description, deviation) {
        this.#func = func
        this.#description = description
        this.#deviation = deviation
    }

    #func
    #description
    #deviation

    get func() {
        return this.#func
    }

    get description() {
        return this.#description
    }

    get deviation() {
        return this.#deviation
    }
}


function linearApproximation() {
    let calcData = calcLinearApproximation(false, false)
    if (!calcData) return false
    let a = calcData[0]
    let b = calcData[1]

    let func = (x) => a * x + b
    let description = epsRound(a, eps) + " * x + " + epsRound(b, eps)
    let deviation = getMidSquareDeviation(func)

    return new FunctionResult(func, description, deviation)
}

function powApproximation() {
    let calcData = calcLinearApproximation(true, true)
    if (!calcData) return false
    let a = Math.exp(calcData[1])
    let b = calcData[0]

    let func = (x) => a * Math.pow(x, b)
    let description = epsRound(a, eps) + " * x^" + epsRound(b, eps)
    let deviation = getMidSquareDeviation(func)

    return new FunctionResult(func, description, deviation)
}

function exponentialApproximation() {
    let calcData = calcLinearApproximation(false, true)
    if (!calcData) return false
    let a = Math.exp(calcData[1])
    let b = calcData[0]

    let func = (x) => a * Math.exp(b * x)
    let description = epsRound(a, eps) + " * e^("+ epsRound(b, eps) + "*x)"
    let deviation = getMidSquareDeviation(func)

    return new FunctionResult(func, description, deviation)
}

function logariphmicalApproximation() {
    let calcData = calcLinearApproximation(true, false)
    if (!calcData) return false
    let a = calcData[0]
    let b = calcData[1]

    let func = (x) => a * Math.log(x) + b
    let description = epsRound(a, eps) + " * log(x) + "+ epsRound(b, eps)
    let deviation = getMidSquareDeviation(func)

    return new FunctionResult(func, description, deviation)
}


function squareApproximation() {
    let calcData = calcSquareApproximation(true, false)
    if (!calcData) return false
    let [a_0, a_1, a_2] = calcData

    let func = (x) => a_2 * Math.pow(x, 2) + a_1 * x + a_0
    let description = epsRound(a_2, eps) + " * x^2 + " + epsRound(a_1, eps) + " * x + " + epsRound(a_0, eps)
    let deviation = getMidSquareDeviation(func)

    return new FunctionResult(func, description, deviation)
}

function cubeApproximation() {
    let calcData = calcCubeApproximation(true, false)
    if (!calcData) return false
    let [a_0, a_1, a_2, a_3] = calcData

    let func = (x) => a_3 * Math.pow(x, 3) + a_2 * Math.pow(x, 2) + a_1 * x + a_0
    let description = epsRound(a_3, eps) + " * x^3 + " + epsRound(a_2, eps) + " * x^2 + " + epsRound(a_1, eps) + " * x + " + epsRound(a_0, eps)
    let deviation = getMidSquareDeviation(func)

    return new FunctionResult(func, description, deviation)
}


function calcLinearApproximation(isXLn, isYLn) {
    let SX = calcSumm(1, 0, isXLn, isYLn)
    let SXX = calcSumm(2, 0, isXLn, isYLn)
    let SY = calcSumm(0, 1, isXLn, isYLn)
    let SXY = calcSumm(1, 1, isXLn, isYLn)
    let n = dots.length
    
    let matrix = [[SXX, SX, SXY], 
                  [SX,  n,  SY]]
    let solutions = findRootsByMatrix(matrix)
    if (!solutions) {
        return false
    }
    return solutions
} 

function calcSquareApproximation() {
    let SX = calcSumm(1, 0)
    let SXX = calcSumm(2, 0)
    let SXXX = calcSumm(3, 0)
    let SXXXX = calcSumm(4, 0)
    let SY = calcSumm(0, 1)
    let SXY = calcSumm(1, 1)
    let SXXY = calcSumm(2, 1)
    let n = dots.length
    
    let matrix = [[n,   SX,     SXX,    SY], 
                  [SX,  SXX,    SXXX,   SXY], 
                  [SXX, SXXX,   SXXXX,  SXXY]]

    let solutions = findRootsByMatrix(matrix)
    if (!solutions) {
        return false
    }
    return solutions
}

function calcCubeApproximation() {
    let SX_1 = calcSumm(1, 0)
    let SX_2 = calcSumm(2, 0)
    let SX_3 = calcSumm(3, 0)
    let SX_4 = calcSumm(4, 0)
    let SX_5 = calcSumm(5, 0)
    let SX_6 = calcSumm(6, 0)
    let SY = calcSumm(0, 1)
    let SX_1Y = calcSumm(1, 1)
    let SX_2Y = calcSumm(2, 1)
    let SX_3Y = calcSumm(3, 1)
    let n = dots.length
    
    let matrix = [[n,    SX_1, SX_2, SX_3, SY],
                  [SX_1, SX_2, SX_3, SX_4, SX_1Y],
                  [SX_2, SX_3, SX_4, SX_5, SX_2Y],
                  [SX_3, SX_4, SX_5, SX_6, SX_3Y],]

    let solutions = findRootsByMatrix(matrix)
    if (!solutions) {
        return false
    }
    return solutions
} 


// ------utils------

function calcSumm(xCount, yCount, isXLn = false, isYLn = false) {
    let summ = 0
    dots.forEach(dot => {
        let mult = 1
        if (isXLn) {
            mult *= Math.pow(Math.log(dot[0]), xCount)
        } else {
            mult *= Math.pow(dot[0], xCount)
        }

        if (isYLn) {
            mult *= Math.pow(Math.log(dot[1]), yCount)
        } else {
            mult *= Math.pow(dot[1], yCount)
        }
        summ += mult
    })
    return summ
}


function getMidSquareDeviation(func) {
    let summ = 0
    dots.forEach(dot => {
        summ += Math.pow(func(dot[0]) - dot[1], 2)
    })
    //S = summ
    return Math.sqrt(summ / dots.length)
}

function getValByX(x) {
    function setObj(value) {
        this.value = value;
    }

    const output = {};

    output.x = new setObj(epsRound(x, 0.0001))
    output.linear = new setObj(epsRound(linearApproximation().func(x), 0.0001))
    output.square = new setObj(epsRound(squareApproximation().func(x), 0.0001))
    output.cube = new setObj(epsRound(cubeApproximation().func(x), 0.0001))
    output.pow = new setObj(epsRound(powApproximation().func(x), 0.0001))
    output.exponential = new setObj(epsRound(exponentialApproximation().func(x), 0.0001))
    output.logariphmical = new setObj(epsRound(logariphmicalApproximation().func(x), 0.0001))
    
    console.table(output)
}


function findRootsByMatrix(matrix) {
    for (let i = 0; i < matrix.length - 1; i++) {
        let max = i
        for (let m = i + 1; m < matrix.length; m++) {
            if (matrix[m][i] > matrix[max][i]) {
                max = m;
            }
        }
        if (max != i) {
            for (let j = 0; j <= matrix.length; j++) {
                let c = matrix[i][j];
                matrix[i][j] = matrix[max][j];
                matrix[max][j] = c;
            }
        }
        for (let k = i + 1; k < matrix.length; k++ ) {
            let multiplier = matrix[k][i] / matrix[i][i];
            for (let j = i; j <= matrix.length; j++) {
                matrix[k][j] -= multiplier * matrix[i][j];
            }
        }
        
    }

    if (!getDeterminantByTriangle(matrix)) {
        return false
    }

    let solutions = []
    for (let i = matrix.length - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < matrix.length; j++) {
            sum += matrix[i][j] * solutions[j];
        }
        solutions[i] = (matrix[i][matrix.length] - sum) / matrix[i][i];
    }

    return solutions
}

function getDeterminantByTriangle(matrix) {
    let determinant = 1;
    for (let i = 0; i < matrix.length; i++) {
        determinant *= matrix[i][i];
        
    }
    return determinant;
}


// ------canvas------


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
const DOT_COUNTS = 10000

function setInterval(newInterval) {
    // STROKE_INTERVAL = WIDTH / (MULTIPLY * STROKE_COUNT)
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
        let label = (-((stroke_step * STROKE_COUNT / MULTIPLY) - i / MULTIPLY))
        let x = i + STROKE_TEXT_MARGIN
        let y = DPI_HEIGHT / 2 - 2 * STROKE_TEXT_MARGIN
        context.fillText(label, x, y)
    }

    //Y strokes (text)
    for (let i = stroke_step; i < DPI_HEIGHT; i += stroke_step) {
        let label = Math.round((stroke_step * STROKE_COUNT / MULTIPLY) - i / MULTIPLY)
        let x = DPI_WIDTH / 2 + STROKE_TEXT_MARGIN;
        let y = i - 2 * STROKE_TEXT_MARGIN
        context.fillText(label, x, y)
    }

    context.stroke()
    context.closePath()
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

    let size = STROKE_COUNT * STROKE_INTERVAL
    for (let x = -size; x < size; x += size / DOT_COUNTS) {
        context.lineTo(x * MULTIPLY + DPI_WIDTH / 2, DPI_HEIGHT / 2 - (func(x) * MULTIPLY))
    }

    context.stroke()
    context.closePath()
    context.lineWidth = 4
}

function drawAllDots(color) {
    if (!color) {
        color = generateRandomColor()
    }

    const context = canvas.getContext("2d")

    for (let i = 0; i < dots.length; i++) {
        drawDot(context, dots[i][0], dots[i][1], color, STROKE_LENGTH)
    }

}

function drawDot(context, x, y, color, size) {
    context.beginPath()
    context.strokeStyle = color
    context.arc(x * MULTIPLY + DPI_WIDTH / 2, DPI_HEIGHT / 2 - y * MULTIPLY, size, 0 * Math.PI, 2 * Math.PI)
    context.stroke()
    context.closePath()
}

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) / (MULTIPLY / 2) - WIDTH / MULTIPLY
    getValByX(x)
}

canvas.addEventListener('mousedown', (e) => {
    getCursorPosition(canvas, e)
});


graphInitialize()
