import { Parser } from "../src/parser/parser";
import { TokenType } from "../src/lexer/token";
import { Lexer } from "../src/lexer/lexer";

describe("Parser", () => {
  test("parses assignment", () => {
    const lexer = new Lexer("x = 10");
    const tokens = [];
    let tok;
    while ((tok = lexer.getNextToken()).type !== TokenType.EOF) {
      tokens.push(tok);
    }
    tokens.push(tok); // Push EOF

    const parser = new Parser(tokens);
    const ast = parser.parse();

    expect(ast).toEqual({
      type: "Program",
      body: [
        {
          type: "Assignment",
          left: { type: "Identifier", name: "x" },
          right: { type: "NumberLiteral", value: "10" },
        },
      ],
    });
  });

  test("parses binary expression", () => {
    const lexer = new Lexer("10 + 20");
    const tokens = [];
    let tok;
    while ((tok = lexer.getNextToken()).type !== TokenType.EOF) {
      tokens.push(tok);
    }
    tokens.push(tok);

    const parser = new Parser(tokens);
    const ast = parser.parse();

    expect(ast).toEqual({
      type: "Program",
      body: [
        {
          type: "ExpressionStatement",
          expression: {
            type: "BinaryExpression",
            left: { type: "NumberLiteral", value: "10" },
            operator: "+",
            right: { type: "NumberLiteral", value: "20" },
          },
        },
      ],
    });
  });

  test("parses print statement", () => {
    const lexer = new Lexer('print "Hello"');
    const tokens = [];
    let tok;
    while ((tok = lexer.getNextToken()).type !== TokenType.EOF) {
      tokens.push(tok);
    }
    tokens.push(tok);

    const parser = new Parser(tokens);
    const ast = parser.parse();

    expect(ast).toEqual({
      type: "Program",
      body: [
        {
          type: "ExpressionStatement",
          expression: {
            type: "CallExpression",
            callee: { type: "Identifier", name: "print" },
            args: [{ type: "StringLiteral", value: "Hello" }],
          },
        },
      ],
    });
  });

  test("parses print statement with multiple args", () => {
    const lexer = new Lexer('print "Hello", 123');
    const tokens = [];
    let tok;
    while ((tok = lexer.getNextToken()).type !== TokenType.EOF) {
      tokens.push(tok);
    }
    tokens.push(tok);

    const parser = new Parser(tokens);
    const ast = parser.parse();

    expect(ast).toEqual({
      type: "Program",
      body: [
        {
          type: "ExpressionStatement",
          expression: {
            type: "CallExpression",
            callee: { type: "Identifier", name: "print" },
            args: [
              { type: "StringLiteral", value: "Hello" },
              { type: "NumberLiteral", value: "123" },
            ],
          },
        },
      ],
    });
  });

  test("parses multiple statements", () => {
    const lexer = new Lexer("x = 1\ny = 2");
    const tokens = [];
    let tok;
    while ((tok = lexer.getNextToken()).type !== TokenType.EOF) {
      tokens.push(tok);
    }
    tokens.push(tok);

    const parser = new Parser(tokens);
    const ast = parser.parse();

    expect(ast).toEqual({
      type: "Program",
      body: [
        {
          type: "Assignment",
          left: { type: "Identifier", name: "x" },
          right: { type: "NumberLiteral", value: "1" },
        },
        {
          type: "Assignment",
          left: { type: "Identifier", name: "y" },
          right: { type: "NumberLiteral", value: "2" },
        },
      ],
    });
  });

  test("parses if-elif-else statement", () => {
    const input = `
if x:
  print "x"
elif y:
  print "y"
else:
  print "z"
`;
    const lexer = new Lexer(input);
    const tokens = [];
    let tok;
    while ((tok = lexer.getNextToken()).type !== TokenType.EOF) {
      tokens.push(tok);
    }
    tokens.push(tok);

    const parser = new Parser(tokens);
    const ast = parser.parse();

    expect(ast).toEqual({
      type: "Program",
      body: [
        {
          type: "IfStatement",
          condition: { type: "Identifier", name: "x" },
          consequent: [
            {
              type: "ExpressionStatement",
              expression: {
                type: "CallExpression",
                callee: { type: "Identifier", name: "print" },
                args: [{ type: "StringLiteral", value: "x" }],
              },
            },
          ],
          alternate: [
            {
              type: "ElifClause",
              condition: { type: "Identifier", name: "y" },
              consequent: [
                {
                  type: "ExpressionStatement",
                  expression: {
                    type: "CallExpression",
                    callee: { type: "Identifier", name: "print" },
                    args: [{ type: "StringLiteral", value: "y" }],
                  },
                },
              ],
            },
            {
              type: "ElseClause",
              consequent: [
                {
                  type: "ExpressionStatement",
                  expression: {
                    type: "CallExpression",
                    callee: { type: "Identifier", name: "print" },
                    args: [{ type: "StringLiteral", value: "z" }],
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test("parses nested if statement", () => {
    const input = `
if x:
  if y:
    print "y"
`;
    const lexer = new Lexer(input);
    const tokens = [];
    let tok;
    while ((tok = lexer.getNextToken()).type !== TokenType.EOF) {
      tokens.push(tok);
    }
    tokens.push(tok);

    const parser = new Parser(tokens);
    const ast = parser.parse();

    expect(ast).toEqual({
      type: "Program",
      body: [
        {
          type: "IfStatement",
          condition: { type: "Identifier", name: "x" },
          consequent: [
            {
              type: "IfStatement",
              condition: { type: "Identifier", name: "y" },
              consequent: [
                {
                  type: "ExpressionStatement",
                  expression: {
                    type: "CallExpression",
                    callee: { type: "Identifier", name: "print" },
                    args: [{ type: "StringLiteral", value: "y" }],
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test("parses unary expressions", () => {
    const lexer = new Lexer("not x");
    const tokens = [];
    let tok;
    while ((tok = lexer.getNextToken()).type !== TokenType.EOF) {
      tokens.push(tok);
    }
    tokens.push(tok);

    const parser = new Parser(tokens);
    const ast = parser.parse();

    expect(ast).toEqual({
      type: "Program",
      body: [
        {
          type: "ExpressionStatement",
          expression: {
            type: "UnaryExpression",
            operator: "not",
            argument: { type: "Identifier", name: "x" },
          },
        },
      ],
    });
  });

  test("parses operator precedence", () => {
    const lexer = new Lexer("1 + 2 * 3");
    const tokens = [];
    let tok;
    while ((tok = lexer.getNextToken()).type !== TokenType.EOF) {
      tokens.push(tok);
    }
    tokens.push(tok);

    const parser = new Parser(tokens);
    const ast = parser.parse();

    expect(ast).toEqual({
      type: "Program",
      body: [
        {
          type: "ExpressionStatement",
          expression: {
            type: "BinaryExpression",
            left: { type: "NumberLiteral", value: "1" },
            operator: "+",
            right: {
              type: "BinaryExpression",
              left: { type: "NumberLiteral", value: "2" },
              operator: "*",
              right: { type: "NumberLiteral", value: "3" },
            },
          },
        },
      ],
    });
  });
});
