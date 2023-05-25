function generateRandomColor() {
    return "#" + Math.floor(Math.random()*16777215).toString(16)
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function epsRound(val, eps) {
    let multiplier = 1 / eps
    return Math.round(val * multiplier) / multiplier
}

export { generateRandomColor, getRandomInt, epsRound }