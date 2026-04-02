// Elements \\
format_input = document.getElementById("format-input");
generate_btn = document.getElementById("generate-btn");
count_input = document.getElementById("count-input");
results_list = document.getElementById("results-list");
preview = document.getElementById("format-preview-text");

token_chips = document.getElementById("tokens-chips");
modifier_chips = document.getElementById("modifier-chips");

syntax_toggle = document.getElementById("syntax-toggle");
syntax_block = document.getElementById("syntax-block");


// Constants \\
const WORD_TYPES ={
    adj: generateAdjective,
    noun: generateNoun,
    n1: () => generateNumber(1),
    n2: () => generateNumber(2),
    n3: () => generateNumber(3),
    n4: () => generateNumber(4),
};

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
};

// Fetch wordlists \\
var adjectives = [];
fetch("https://raw.githubusercontent.com/Yorxck/namegen/refs/heads/dev/words/adjectives.txt")
    .then(response => response.text())
    .then(text => {adjectives = text.split("\n").map(s => s.trim())})
    .catch(err => {
        console.error(err);
    });

var nouns = [];
fetch("https://raw.githubusercontent.com/Yorxck/namegen/refs/heads/dev/words/nouns.txt")
    .then(response => response.text())
    .then(text => {nouns = text.split("\n").map(s => s.trim())})
    .catch(err => {
        console.error(err);
    });

// Functions \\
function parseInput(s) {
    let result = s.replace(/%([^%]+)%/g, (_, inner) => resolveToken(inner));

    return result;
}

function resolveToken(s) {
    const parts = s.split(":");
    const type = parts.at(-1);
    const mods = parts.slice(0, -1);

    let word = WORD_TYPES[type]?.();
    if (!word) return `%${s}%`;

    for (const mod of mods) {
        word = MODIFIERS[mod]?.(word) || word;
    }

    return word;
}

function generateAdjective() {
    return adjectives[Math.floor(Math.random() * adjectives.length)];
}

function generateNoun() {
    return nouns[Math.floor(Math.random() * nouns.length)];
}

function generateNumber(l) {
    min = Math.pow(10, l-1);
    max = ( Math.pow(10, l) - 1 );

    return Math.round(Math.random() * (max - min) + min);
}

function leetify(s) {
    const eligible = [...s].reduce((acc, ch, i) => {
        if (i > 0 && LEET_REPLACE[ch.toLowerCase()]) acc.push(i)
        return acc
    }, [])
    if (eligible.length === 0) return s
    const i = eligible[Math.floor(Math.random() * eligible.length)]
    return s.slice(0, i) + LEET_REPLACE[s[i].toLowerCase()] + s.slice(i + 1)
}

// Bind events \\
generate_btn.addEventListener("click", () => {
    results_list.innerHTML = ""

    for(let i=0; i < count_input.value; i++) {
        let result = parseInput(format_input.value);

        let div = document.createElement("div");
        div.className = "result-item";

        let result_text = document.createElement("span");
        result_text.className = "result-text"
        result_text.innerText = result;
        div.append(result_text)

        let copy_btn = document.createElement("button")
        copy_btn.className = "copy-btn"
        copy_btn.innerText = "copy"
        div.append(copy_btn)

        copy_btn.addEventListener("click", () => {
            navigator.clipboard.writeText(result)
            
            copy_btn.classList.add("copied")
        })

        results_list.append(div)
    }

    localStorage.setItem("last_format", format_input.value)
});

format_input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.keyCode === 13) {
        generate_btn.click()
    }
})

format_input.addEventListener("input", e => {
    preview.innerText = parseInput(e.target.value) || "—"
})

syntax_toggle.addEventListener("click", () => {
    syntax_block.classList.toggle("syntax-block--collapsed")

    localStorage.setItem("syntax_collapsed", syntax_block.classList.contains("syntax-block--collapsed"))
})

for (const chip of token_chips.children) {
    chip.addEventListener("click", e => {
        format_input.value += `%${chip.getAttribute("data")}%`
    })
}

for (const chip of modifier_chips.children) {
    chip.addEventListener("click", e => {
        format_input.value = format_input.value.replace(/%([^%]+)%(?=[^%]*$)/, `%${chip.getAttribute("data")}:$1%`)
    })
}

format_input.value = localStorage.getItem("last_format") || "%cap:adj%%cap:noun%%n2%"

if (localStorage.getItem("syntax_collapsed") === "true") {
    syntax_block.classList.add("syntax-block--collapsed")
}