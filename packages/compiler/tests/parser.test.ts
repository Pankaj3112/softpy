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
});
