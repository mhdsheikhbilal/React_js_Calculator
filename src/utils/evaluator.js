const isDigit = (ch) => {
    return /[0-9.]/.test(ch);
}

export const tokenize = (expression) => {
    const tokens = [];
    let i = 0;
    
    while (i < expression.length) {
        const char = expression[i];
        
        // Skip spaces
        if (char === ' ') {
            i++;
            continue;
        }

        // Handle numbers
        if (isDigit(char)) {
            let number = char;
            i++;
            while (i < expression.length && isDigit(expression[i])) {
                number += expression[i++];
            }
            if (number.split('.').length > 2) {
                throw new Error('Invalid number format');
            }
            tokens.push({ type: 'number', value: parseFloat(number) });
            continue;
        }

        // Handle operators
        if (char === '+' || char === '*' || char === '/') {
            tokens.push({ type: 'op', value: char });
            i++;
            continue;
        }

        // Handle minus - special case for unary minus
        if (char === '-') {
            // Check if this is a unary minus
            const prevToken = tokens.length > 0 ? tokens[tokens.length - 1] : null;
            const isUnary = !prevToken || 
                           prevToken.type === 'op' || 
                           prevToken.value === '(';
            
            if (isUnary) {
                // This is a unary minus, we'll handle it differently
                tokens.push({ type: 'unary', value: 'neg' });
            } else {
                // This is a binary minus
                tokens.push({ type: 'op', value: '-' });
            }
            i++;
            continue;
        }

        // Handle parentheses
        if (char === '(' || char === ')') {
            tokens.push({ type: 'paren', value: char });
            i++;
            continue;
        }
        
        throw new Error(`Invalid Character: ${char}`);
    }
    
    return tokens;
}

function precedence(op) {
    if (op === '+' || op === '-') return 1;
    if (op === '*' || op === '/') return 2;
    if (op === 'neg') return 3; // Unary negation has highest precedence
    return 0;
}

export const toRPN = (tokens) => {
    const output = [];
    const ops = [];

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (token.type === 'number') {
            output.push(token);
        } 
        else if (token.type === 'unary') {
            // Unary negation
            ops.push(token);
        }
        else if (token.type === 'op') {
            while (ops.length > 0 && 
                   ops[ops.length - 1].type !== 'paren' &&
                   precedence(ops[ops.length - 1].value) >= precedence(token.value)) {
                output.push(ops.pop());
            }
            ops.push(token);
        } 
        else if (token.type === 'paren') {
            if (token.value === '(') {
                ops.push(token);
            } else {
                // Closing paren
                while (ops.length > 0 && ops[ops.length - 1].value !== '(') {
                    output.push(ops.pop());
                }
                if (ops.length === 0) {
                    throw new Error("Mismatched Parentheses");
                }
                ops.pop(); // Remove '('
                
                // If there's a unary operator after closing paren, apply it
                if (ops.length > 0 && ops[ops.length - 1].type === 'unary') {
                    output.push(ops.pop());
                }
            }
        }
    }

    // Process remaining operators
    while (ops.length > 0) {
        const op = ops.pop();
        if (op.type === "paren") {
            throw new Error('Mismatched Parentheses');
        }
        output.push(op);
    }

    return output;
}

export function evaluateRPN(rpn) {
    const stack = [];
    
    for (let i = 0; i < rpn.length; i++) {
        const t = rpn[i];
        
        if (t.type === 'number') {
            stack.push(t.value);
        } 
        else if (t.type === 'unary') {
            if (stack.length < 1) throw new Error('Invalid expression');
            const a = stack.pop();
            stack.push(-a); // Apply negation
        }
        else if (t.type === 'op') {
            if (stack.length < 2) throw new Error('Invalid expression');
            const b = stack.pop();
            const a = stack.pop();
            let res;
            
            switch (t.value) {
                case '+': res = a + b; break;
                case '-': res = a - b; break;
                case '*': res = a * b; break;
                case '/': 
                    if (b === 0) throw new Error('Math Error: Division by zero');
                    res = a / b; 
                    break;
                default: throw new Error('Unknown operator');
            }
            stack.push(res);
        }
    }
    
    if (stack.length !== 1) throw new Error('Invalid expression');
    return stack[0];
}

export function safeEvaluate(expr) {
    // Remove all spaces
    expr = expr.replace(/\s+/g, '');
    
    // First, handle implicit multiplication
    let processedExpr = '';
    for (let i = 0; i < expr.length; i++) {
        const currentChar = expr[i];
        const nextChar = i < expr.length - 1 ? expr[i + 1] : '';
        
        processedExpr += currentChar;
        
        // Add explicit * for implicit multiplication:
        // 1. Number followed by '('
        if (currentChar.match(/\d/) && nextChar === '(') {
            processedExpr += '*';
        }
        // 2. ')' followed by number
        else if (currentChar === ')' && nextChar.match(/\d/)) {
            processedExpr += '*';
        }
        // 3. ')' followed by '('
        else if (currentChar === ')' && nextChar === '(') {
            processedExpr += '*';
        }
        // 4. Check for case like "5-5" vs "5*-5"
        else if (currentChar.match(/[+\-*/]/) && nextChar === '-') {
            // Check if the next minus is unary
            const charAfterNext = i < expr.length - 2 ? expr[i + 2] : '';
            if (charAfterNext.match(/\d/) || charAfterNext === '(') {
                // This is like "5*-5" - it's correct as is
            }
        }
    }
    
    console.log("Processed expression:", processedExpr);
    
    // Tokenize
    const tokens = tokenize(processedExpr);
    console.log("Tokens:", tokens);
    
    // Convert to RPN
    const rpn = toRPN(tokens);
    console.log("RPN:", rpn);
    
    // Evaluate
    const result = evaluateRPN(rpn);
    console.log("Result:", result);
    
    return result;
}
