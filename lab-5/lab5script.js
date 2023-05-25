import { generateRandomColor, epsRound } from "./utils.js"

const fileName = './data/test.json'

let dots = [[]]
let differences = [[]]
let deltas = [[]]

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
    findDefferences()
    console.warn("matrix of differences:")
    printLargeArray(differences)
    drawFunction(lagrange, 10)
    drawFunction(newtonDevidedDiffs)
    if (isSameDeltaX()) {
        findDeltas()
        console.warn("matrix of deltas:")
        printLargeArray(deltas)
        drawFunction(newtonEndedDiffs)
    } else {
        console.error("Newton with ended differences can not be calculated")
    }
    
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

function lagrange(x) {

    let ans = 0

    for (let i = 0; i < dots.length; i++) {
        let chisl = 1
        let znam = 1
        let currX = dots[i][0]

        for (let j = 0; j < i; j++) {
            chisl *= x - dots[j][0]
            znam *= currX - dots[j][0]
        }
        for (let j = i + 1; j < dots.length; j++) {
            chisl *= x - dots[j][0]
            znam *= currX - dots[j][0]
        }

        ans += dots[i][1] * chisl / znam;
    }

    return ans
}



function newtonDevidedDiffs(x) {
    let ans = 0

    for (let i = 0; i < differences.length; i++) {
        let mult = 1
        for (let j = 0; j < i; j++) {
            mult *= x - dots[j][0]
        }
        ans += differences[i][0] * mult
    }

    return ans
}


function newtonEndedDiffs(x) {  
    let ans = 0
    let isLeftSide = true
    let nearestDot = findNearestDots(x)
    let t = (x - dots[nearestDot][0]) / (dots[1][0] - dots[0][0])

    if (nearestDot > dots.length / 2) {
        isLeftSide = false
    }

    let maxIters
    if (isLeftSide) {
        maxIters = deltas.length - nearestDot
    } else {
        maxIters = nearestDot
    }
    
    for (let i = 0; i < maxIters; i++) {
        let mult = 1
        for (let j = 0; j < i; j++) {
            mult *= t - j
        }
        ans += deltas[i][nearestDot] * mult / factorial(i)
        if (!isLeftSide) {
            nearestDot -= 1
        } 
    }

    return ans
}



// ------utils------

function getValByX(x) {
    function setObj(value) {
        this.value = value;
    }

    const output = {};

    output.x = new setObj(epsRound(x, 0.0001))
    output.lagrange = new setObj(epsRound(lagrange(x), 0.0001))
    output.newton_devided = new setObj(epsRound(newtonDevidedDiffs(x), 0.0001))
    if (isSameDeltaX()) {
        output.newton_ended = new setObj(epsRound(newtonEndedDiffs(x), 0.0001))
        output.methods_difference_absolute = new setObj(epsRound(Math.abs(newtonEndedDiffs(x) - lagrange(x)), 0.0001))
        output.methods_difference_relative = new setObj(epsRound((Math.abs(newtonEndedDiffs(x) - lagrange(x)) / newtonEndedDiffs(x) * 100), 0.001))
    }

    console.table(output)
}

function findDefferences() {
    differences = []
    for (let i = 0; i < dots.length; i++) {
        let tempArr = []
        if (i == 0) {
            for (let j = 0; j < dots.length; j++) {
                tempArr.push(dots[j][1])
            }
        } else {
            for (let j = 0; j < differences[i - 1].length - 1; j++) {
                tempArr.push((differences[i - 1][j + 1] - differences[i - 1][j]) / (dots[j + i][0] - dots[j][0]))
            }
        }
        differences.push(tempArr)
    }
}

function findDeltas() {
    deltas = []

    for (let i = 0; i < dots.length; i++) {
        let tempArr = []
        if (i == 0) {
            for (let j = 0; j < dots.length; j++) {
                tempArr.push(dots[j][1])
            }
        } else {
            for (let j = 0; j < deltas[i - 1].length - 1; j++) {
                tempArr.push(deltas[i - 1][j + 1] - deltas[i - 1][j])
            }
        }
        deltas.push(tempArr)
    }  
}

function isSameDeltaX() {
    if (dots.length < 2) {
        return true
    }

    let delta = epsRound(dots[1][0] - dots[0][0], 0.0001)
    for (let i = 2; i < dots.length; i++) {
        if (epsRound(dots[i][0] - dots[i - 1][0], 0.0001) != delta) {
            return false
        }
    } 

    return true
}

function findNearestDots(x) {
    let left = 0 
    let right = dots.length - 1

    while (right - left > 1) {
        let middle = Math.trunc((right + left) / 2)
        if (x < dots[middle][0]) {
            right = middle
        } else {
            left = middle
        }
    }

    if (Math.abs(dots[left][0] - x) > Math.abs(dots[right][0] - x)) {
        return right
    } 
    return left
}

function factorial(x) {
    let ans = 1
    for (let i = 1; i <= x; i++) {
        ans *= i
    }
    return ans
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
const DOT_COUNTS = 1000

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