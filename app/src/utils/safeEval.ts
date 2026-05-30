/** @fileoverview
 * Safe Math Evaluator — Replaces eval() and new Function() for spreadsheet/terminal math.
 * Uses a shunting-yard algorithm with RPN evaluation. Only allows decimal numbers
 * and the operators +, -, *, /, ^. Parentheses are supported.
 *
 * Security: Only characters in ALLOWED_CHARS can enter the tokenizer.
 * Any deviation throws "Invalid expression". No side effects, no globals.
 *
 * @example
 *   safeEval("(1 + 2) * 3") // => 9
 *   safeEval("2 ^ 3 + 1")  // => 9
 */

const OPERATORS: Record<string, { precedence: number; associativity: 'left' | 'right' }> = {
  '+': { precedence: 1, associativity: 'left' },
  '-': { precedence: 1, associativity: 'left' },
  '*': { precedence: 2, associativity: 'left' },
  '/': { precedence: 2, associativity: 'left' },
  '^': { precedence: 3, associativity: 'right' },
};

const ALLOWED_CHARS = /^[\d+\-*/^().\s]+$/;

function tokenize(expr: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < expr.length) {
    const c = expr[i];
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
      i++;
      continue;
    }
    if (c >= '0' && c <= '9' || c === '.') {
      let num = '';
      while (i < expr.length && (/[\d.]/.test(expr[i]))) {
        num += expr[i];
        i++;
      }
      tokens.push(num);
    } else if (c === '+' || c === '-' || c === '*' || c === '/' || c === '^') {
      tokens.push(c);
      i++;
    } else if (c === '(' || c === ')') {
      tokens.push(c);
      i++;
    } else {
      throw new Error('Invalid expression');
    }
  }
  return tokens;
}

function shuntingYard(tokens: string[]): (number | string)[] {
  const output: (number | string)[] = [];
  const stack: string[] = [];

  for (const token of tokens) {
    if (!isNaN(Number(token))) {
      output.push(Number(token));
    } else if (token === '(') {
      stack.push(token);
    } else if (token === ')') {
      while (stack.length > 0 && stack[stack.length - 1] !== '(') {
        output.push(stack.pop()!);
      }
      if (stack.length === 0 || stack[stack.length - 1] !== '(') {
        throw new Error('Invalid expression');
      }
      stack.pop(); // Remove '('.
    } else if (OPERATORS[token]) {
      while (
        stack.length > 0 &&
        stack[stack.length - 1] !== '(' &&
        ((OPERATORS[token].associativity === 'left' &&
          OPERATORS[token].precedence <=
            OPERATORS[stack[stack.length - 1]].precedence) ||
          (OPERATORS[token].associativity === 'right' &&
            OPERATORS[token].precedence <
              OPERATORS[stack[stack.length - 1]].precedence))
      ) {
        output.push(stack.pop()!);
      }
      stack.push(token);
    } else {
      throw new Error('Invalid expression');
    }
  }

  while (stack.length > 0) {
    const op = stack.pop()!;
    if (op === '(' || op === ')') {
      throw new Error('Invalid expression');
    }
    output.push(op);
  }

  return output;
}

function evaluateRPN(tokens: (number | string)[]): number {
  const stack: number[] = [];
  for (const token of tokens) {
    if (typeof token === 'number') {
      stack.push(token);
    } else if (OPERATORS[token]) {
      if (stack.length < 2) {
        throw new Error('Invalid expression');
      }
      const b = stack.pop()!;
      const a = stack.pop()!;
      switch (token) {
        case '+':
          stack.push(a + b);
          break;
        case '-':
          stack.push(a - b);
          break;
        case '*':
          stack.push(a * b);
          break;
        case '/':
          stack.push(a / b);
          break;
        case '^':
          stack.push(Math.pow(a, b));
          break;
      }
    }
  }
  if (stack.length !== 1) {
    throw new Error('Invalid expression');
  }
  return stack[0];
}

export function safeEval(expression: string): number {
  const trimmed = expression.trim();
  if (!trimmed) {
    throw new Error('Invalid expression');
  }
  if (!ALLOWED_CHARS.test(trimmed)) {
    throw new Error('Invalid expression');
  }

  const tokens = tokenize(trimmed);
  if (tokens.length === 0) {
    throw new Error('Invalid expression');
  }

  const rpn = shuntingYard(tokens);
  return evaluateRPN(rpn);
}
