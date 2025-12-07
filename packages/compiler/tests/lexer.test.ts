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
      { type: TokenType.ASSIGN, value: "=", line: 1, column: 3 },
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

  test("lexes booleans", () => {
    const lexer = new Lexer("True False");
    const tokens = [];
    let tok;
    while ((tok = lexer.getNextToken()).type !== TokenType.EOF) {
      tokens.push(tok);
    }
    expect(tokens).toEqual([
      { type: TokenType.BOOLEAN, value: "True", line: 1, column: 1 },
      { type: TokenType.BOOLEAN, value: "False", line: 1, column: 6 },
    ]);
  });

  test("lexes comments", () => {
    const lexer = new Lexer("# This is a comment\nx = 1 # Inline comment");
    const tokens = [];
    let tok;
    while ((tok = lexer.getNextToken()).type !== TokenType.EOF) {
      tokens.push(tok);
    }
    // Comments are skipped by getNextToken if not explicitly handled or if handled as hidden channel
    // Looking at lexer.ts, it seems commentToken() returns a token.
    // Let's check lexer.ts again.
    // Yes, if (char === "#") return this.commentToken();
    // And commentToken returns a token of type COMMENT.

    expect(tokens).toEqual([
      {
        type: TokenType.COMMENT,
        value: " This is a comment",
        line: 1,
        column: 1,
      },
      { type: TokenType.NEWLINE, value: "\n", line: 1, column: 20 },
      { type: TokenType.IDENTIFIER, value: "x", line: 2, column: 1 },
      { type: TokenType.ASSIGN, value: "=", line: 2, column: 3 },
      { type: TokenType.NUMBER, value: "1", line: 2, column: 5 },
      { type: TokenType.COMMENT, value: " Inline comment", line: 2, column: 7 },
    ]);
  });

  test("lexes comparison operators", () => {
    const lexer = new Lexer("== != <= >=");
    const tokens = [];
    let tok;
    while ((tok = lexer.getNextToken()).type !== TokenType.EOF) {
      tokens.push(tok);
    }
    expect(tokens.map((t) => t.value)).toEqual(["==", "!=", "<=", ">="]);
  });

  test("lexes logical operators", () => {
    const lexer = new Lexer("and or not");
    const tokens = [];
    let tok;
    while ((tok = lexer.getNextToken()).type !== TokenType.EOF) {
      tokens.push(tok);
    }
    expect(tokens.map((t) => t.type)).toEqual([
      TokenType.AND,
      TokenType.OR,
      TokenType.NOT,
    ]);
  });

  test("lexes if-elif-else keywords", () => {
    const lexer = new Lexer("if elif else");
    const tokens = [];
    let tok;
    while ((tok = lexer.getNextToken()).type !== TokenType.EOF) {
      tokens.push(tok);
    }
    expect(tokens.map((t) => t.type)).toEqual([
      TokenType.IF,
      TokenType.ELIF,
      TokenType.ELSE,
    ]);
  });

  test("lexes indentation", () => {
    const input = `
if x:
    print x
    if y:
        print y
print z
`;
    const lexer = new Lexer(input);
    const tokens = [];
    let tok;
    while ((tok = lexer.getNextToken()).type !== TokenType.EOF) {
      tokens.push(tok);
    }

    // Expected sequence:
    // NEWLINE (empty line) -> skipped? No, lexer.ts: skipWhitespace skips spaces/tabs/newlines?
    // Wait, lexer.ts:
    // if (char === "\n") return this.newlineToken();
    // But skipWhitespace() might consume it if it's considered whitespace.
    // Let's check skipWhitespace in lexer.ts.
    // It's not shown in the read_file output. I should check it.
    // But usually indentation is tricky.

    // Let's assume standard python-like lexing:
    // IF x COLON NEWLINE INDENT PRINT x NEWLINE IF y COLON NEWLINE INDENT PRINT y NEWLINE DEDENT DEDENT PRINT z NEWLINE

    const types = tokens.map((t) => t.type);
    expect(types).toEqual([
      TokenType.NEWLINE, // First empty line
      TokenType.IF,
      TokenType.IDENTIFIER,
      TokenType.COLON,
      TokenType.NEWLINE,
      TokenType.INDENT,
      TokenType.IDENTIFIER,
      TokenType.IDENTIFIER,
      TokenType.NEWLINE,
      TokenType.IF,
      TokenType.IDENTIFIER,
      TokenType.COLON,
      TokenType.NEWLINE,
      TokenType.INDENT,
      TokenType.IDENTIFIER,
      TokenType.IDENTIFIER,
      TokenType.NEWLINE,
      TokenType.DEDENT,
      TokenType.DEDENT,
      TokenType.IDENTIFIER,
      TokenType.IDENTIFIER,
      TokenType.NEWLINE,
    ]);
  });
});
