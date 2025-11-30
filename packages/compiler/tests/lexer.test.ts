import { Lexer } from "../src/lexer/lexer";
import { TokenType } from "../src/lexer/token";

describe("Lexer", () => {
  test("lexes numbers", () => {
    const lexer = new Lexer("123 456");
    const tokens = [];
    let tok;
    while ((tok = lexer.getNextToken()).type !== TokenType.EOF) {
      tokens.push(tok);
    }
    expect(tokens).toEqual([
      { type: TokenType.NUMBER, value: "123", line: 1, column: 1 },
      { type: TokenType.NUMBER, value: "456", line: 1, column: 5 },
    ]);
  });

  test("lexes identifiers and assignment", () => {
    const lexer = new Lexer("x = y");
    const tokens = [];
    let tok;
    while ((tok = lexer.getNextToken()).type !== TokenType.EOF) {
      tokens.push(tok);
    }
    expect(tokens).toEqual([
      { type: TokenType.IDENTIFIER, value: "x", line: 1, column: 1 },
      { type: TokenType.OPERATOR, value: "=", line: 1, column: 3 },
      { type: TokenType.IDENTIFIER, value: "y", line: 1, column: 5 },
    ]);
  });

  test("lexes operators", () => {
    const lexer = new Lexer("+ - * / = ( )");
    const tokens = [];
    let tok;
    while ((tok = lexer.getNextToken()).type !== TokenType.EOF) {
      tokens.push(tok);
    }
    expect(tokens.map((t) => t.value)).toEqual([
      "+",
      "-",
      "*",
      "/",
      "=",
      "(",
      ")",
    ]);
  });

  test("lexes string literals", () => {
    const lexer = new Lexer('"hello" "world"');
    const tokens = [];
    let tok;
    while ((tok = lexer.getNextToken()).type !== TokenType.EOF) {
      tokens.push(tok);
    }
    expect(tokens).toEqual([
      { type: TokenType.STRING, value: "hello", line: 1, column: 1 },
      { type: TokenType.STRING, value: "world", line: 1, column: 9 },
    ]);
  });

  test("lexes print statement", () => {
    const lexer = new Lexer("print x, y");
    const tokens = [];
    let tok;
    while ((tok = lexer.getNextToken()).type !== TokenType.EOF) {
      tokens.push(tok);
    }
    expect(tokens.map((t) => t.value)).toEqual(["print", "x", ",", "y"]);
  });
});
