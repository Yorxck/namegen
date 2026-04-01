format_input = document.getElementById("format-input");
generate_btn = document.getElementById("generate-btn");
results = document.getElementById("results-list");

const WORD_TYPES ={
    adj: generateAdjective,
    noun: generateNoun,
    n1: () => generateNumber(0),
    n2: () => generateNumber(1),
    n3: () => generateNumber(2),
    n4: () => generateNumber(3),
}

const MODIFIERS = {
    upper: s => s.toUpperCase(),
    lower: s => s.toLowerCase(),
    cap: s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(),
    leet: s => leetify(s)
};

const LEET_REPLACE = {
    "e": "3",
    "i": "1",
    "o": "0",
    "s": "5",
    "t": "7",
    "l": "1",
    "g": "9",
    "b": "8"
}

let adjectives = []
fetch("/adjectives.txt")
    .then(response => response.text())
    .then(text => {adjectives = text.split("\n").map(s => s.trim())})
    .catch(err => {
        console.error(err);
    })

let nouns = []
fetch("/nouns.txt")
    .then(response => response.text())
    .then(text => {nouns = text.split("\n").map(s => s.trim())})
    .catch(err => {
        console.error(err);
    })

generate_btn.addEventListener("click", () => {
    let result = parseInput(format_input.value)

    console.log(result)
});

function parseInput(s) {
    let result = s.replace(/%([^%]+)%/g, (_, inner) => resolveToken(inner))

    return result
}

function resolveToken(s) {
    const parts = s.split(":")
    const type = parts.at(-1)
    const mods = parts.slice(0, -1)

    let word = WORD_TYPES[type]?.()
    if (!word) return `%${s}%`

    for (const mod of mods) {
        word = MODIFIERS[mod]?.(word) || word
    }

    return word
}

function generateAdjective() {
    return adjectives[Math.floor(Math.random() * adjectives.length)]
}

function generateNoun() {
    return nouns[Math.floor(Math.random() * nouns.length)]
}

function generateNumber(l) {
    min = Math.pow(10, l)
    max = ( Math.pow(10, l+1) - 1 )

    return Math.round(Math.random() * (max - min) + min);
}

function leetify(s) {
    
}