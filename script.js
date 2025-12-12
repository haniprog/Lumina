const toggleSwitch = document.getElementById('themeToggle');
const body = document.body;


function enableDarkMode() {
    body.classList.remove('light-mode');
    localStorage.setItem('theme', 'dark');
}


function enableLightMode() {
    body.classList.add('light-mode'); 
    localStorage.setItem('theme', 'light');
}


if (localStorage.getItem('theme') === 'dark') {
    toggleSwitch.checked = true;
    enableDarkMode();
} else {
    toggleSwitch.checked = false;
    enableLightMode();
}


toggleSwitch.addEventListener('change', function() {
    if (this.checked) {
        enableDarkMode();
    } else {
        enableLightMode();
    }
});

// KEYWORDS 
const keywords = new Set([
    "int", "float", "string", "char", "bool", "void", 
    "true", "false", "null",                          
    "if", "elif", "else", "switch", "case", "default", 
    "while", "for", "break", "continue",              
    "function", "return", "try", "catch",             
    "class", "import", "print"                        
]);

// RESERVED WORDS 
const reservedWords = new Set([
    "const", "enum", "await", "async", "public", "private"
]);

// NOISE WORDS 
const noiseWords = new Set([]); // Not finalized

// DELIMITER MAP 
const delimiterMap = {
    '{': 'OPEN_BRACE',
    '}': 'CLOSE_BRACE',
    '(': 'OPEN_PAREN',
    ')': 'CLOSE_PAREN',
    '[': 'OPEN_BRACKET',
    ']': 'CLOSE_BRACKET',
    ';': 'SEMICOLON',
    ':': 'COLON',
    ',': 'COMMA',
    '.': 'DOT'
};

// OPERATOR MAP 
const operatorMap = {
    '+': 'OP_ADD',
    '-': 'OP_SUBTRACT',
    '*': 'OP_MULTIPLY',
    '/': 'OP_DIVIDE',
    '%': 'OP_MODULO',
    '=': 'OP_ASSIGN',
    '<': 'OP_LESS_THAN',
    '>': 'OP_GREATER_THAN',
    '!': 'OP_NOT',
    '&&': 'OP_AND', 
    '||': 'OP_OR',
    "+=": "OP_ADD_ASSIGN",
    "-=": "OP_SUB_ASSIGN",
    "*=": "OP_MUL_ASSIGN",
    "/=": "OP_DIV_ASSIGN",
    "%=": "OP_MOD_ASSIGN",
    "==": "OP_EQUAL_TO",
    "!=": "OP_NOT_EQUAL",
    "<=": "OP_LESS_EQUAL",
    ">=": "OP_GREATER_EQUAL",
};

function analyzeCode() {
    const inputCode = document.getElementById('sourceInput').value; 
    const tokens = lexicalAnalyzer(inputCode);
    displayTokens(tokens);
}

function clearAll() {
    document.getElementById('sourceInput').value = '';
    document.getElementById('resultBody').innerHTML = `
        <tr><td colspan="3" style="text-align:center; color:gray;">Ready to analyze...</td></tr>
    `;
}

document.getElementById('fileUpload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('sourceInput').value = e.target.result;
        };
        reader.readAsText(file);
    }
});

function lexicalAnalyzer(input) {
    let tokens = [];
    let i = 0;
    let line = 1;

    while (i < input.length) {
        let char = input[i];

        // WHITESPACE
        if (/\s/.test(char)) {
            if (char === '\n') line++;
            i++;
            continue;
        }

        // COMMENTS 
        if (char === '/') {
            let nextChar = input[i+1];
            if (nextChar === '/') { 
                i += 2;
                while (i < input.length && input[i] !== '\n') i++;
                continue;
            }
            if (nextChar === '*') { 
                i += 2;
                while (i < input.length) {
                    if (input[i] === '*' && input[i+1] === '/') {
                        i += 2;
                        break;
                    }
                    if (input[i] === '\n') line++;
                    i++;
                }
                continue;
            }
        }

        // WORDS (Identifiers, Keywords, Reserved)
        if (/[a-zA-Z_]/.test(char)) {
            let word = "";
            while (i < input.length && /[a-zA-Z0-9_]/.test(input[i])) {
                word += input[i];
                i++;
            }
            
            if (keywords.has(word)) tokens.push({ 
                lexeme: word, 
                token: "KW_" + word.toUpperCase(), 
                type: "Keyword" 
            });
            else if (reservedWords.has(word)) tokens.push({ 
                lexeme: word, 
                token: "RES_" + word.toUpperCase(), 
                type: "Reserved Word" 
            });
            else if (noiseWords.has(word)) tokens.push({ // Not finalized
                lexeme: word, 
                token: "NW_" + word.toUpperCase(), 
                type: "Noise Word"  
            });
            else tokens.push({ 
                lexeme: word, 
                token: "ID", 
                type: "Identifier" 
            });
            continue;
        }

        // NUMBERS (Int & Float)
        if (/[0-9]/.test(char)) {
            let num = "";
            let hasDot = false;
            while (i < input.length && (/[0-9]/.test(input[i]) || input[i] === '.')) {
                if (input[i] === '.') {
                    if (hasDot) break;
                    hasDot = true;
                }
                num += input[i];
                i++;
            }
            tokens.push({ 
                lexeme: num, 
                token: hasDot ? "LIT_FLOAT" : "LIT_INT", 
                type: hasDot ? "Float Literal" : "Integer Literal" });
            continue;
        }

        // STRINGS 
        if (char === '"') {
            let str = '"';
            i++;
            while (i < input.length && input[i] !== '"') {
                str += input[i];
                i++;
            }
            if (i < input.length) { str += '"'; i++; }
            tokens.push({ 
                lexeme: str, 
                token: "LIT_STRING", 
                type: "String Literal" 
            });
            continue;
        }

        //* CHARACTERS 
        if (char === "'") {
            let start = i;   
            i++; 

        if (i >= input.length) {
            tokens.push({
                lexeme: "'",
                token: "ERROR_CHAR",
                type: "Error"
            });
            break;
        }

        let value = input[i];  
        i++;
        
        if (value === "'" || i >= input.length || input[i] !== "'") {
            tokens.push({
                lexeme: input.slice(start, i + 1),
                token: "ERROR_INVALID_CHAR_LITERAL",
                type: "Error"
            });
            while (i < input.length && input[i] !== "'") i++;
            if (i < input.length) i++; 
            continue;
        }
        i++;

        tokens.push({
            lexeme: `'${value}'`,
            token: "LIT_CHAR",
            type: "Character Literal"
        });
        continue;
        }
        
        // OPERATORS
        let twoChars = char + (input[i + 1] || "");     
        if (operatorMap[twoChars]) {
            tokens.push({ 
                lexeme: twoChars, 
                token: operatorMap[twoChars], 
                type: "Operator" 
            });
            i += 2; 
            continue;
        }

        if (operatorMap[char]) {
            tokens.push({ 
                lexeme: char, 
                token: operatorMap[char], 
                type: "Operator" 
            });
            i++; 
            continue;
        }

        // DELIMITERS
        if (delimiterMap[char]) {
            tokens.push({ 
                lexeme: char, 
                token: delimiterMap[char], 
                type: "Delimiter" 
            });
            i++;
            continue;
        }

        // ERROR HANDLING
        console.error(`Unknown symbol at line ${line}: ${char}`);
        tokens.push({ 
            lexeme: char, 
            token: "ERR_UNKNOWN", 
            type: "Error" 
        });
        i++;
    }
    return tokens;
}

function displayTokens(tokenList) {
    const tableBody = document.getElementById("resultBody");
    
    if (tableBody) {
        tableBody.innerHTML = ""; 

        tokenList.forEach(t => {
            const row = document.createElement("tr");
            
            row.innerHTML = `
                <td>${t.lexeme}</td>
                <td>${t.token}</td>
                <td>${t.type}</td>
            `;
            tableBody.appendChild(row);
        });
    }
}