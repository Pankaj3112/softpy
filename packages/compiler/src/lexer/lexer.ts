import { Token, TokenType } from "./token";

export class Lexer {
  private input: string;
  private pos = 0;
  private line = 1;
  private column = 1;

  private keywords: Record<string, TokenType> = {
    and: TokenType.AND,
    or: TokenType.OR,
    not: TokenType.NOT,
    // add more here
  };

  constructor(input: string) {
    this.input = input;
  }

  // ------------------ Public Method ------------------
  public getNextToken(): Token {
    this.skipWhitespace();
    if (this.isEOF()) return this.createToken(TokenType.EOF, "");

    const char = this.currentChar();

    if (char === "\n") return this.newlineToken();
    if (char === '"') return this.stringToken();
    if (char === "#") return this.commentToken();
    if (this.isDigit(char)) return this.numberToken();
    if (this.isBooleanStart(char)) return this.booleanToken();
    if (this.isIdentifierStart(char)) return this.identifierOrKeywordToken();
    if (this.isOperatorChar(char)) return this.operatorToken();

    throw new Error(
      `Unknown character ${char} at line ${this.line}, column ${this.column}`,
    );
  }

  // ------------------ Helpers ------------------
  private currentChar(): string {
    return this.input[this.pos] ?? "\0";
  }

  private peekChar(offset = 1): string {
    return this.input[this.pos + offset] ?? "\0";
  }

  private advance() {
    if (this.currentChar() === "\n") {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    this.pos++;
  }

  private isEOF(): boolean {
    return this.pos >= this.input.length;
  }

  private isDigit(char: string): boolean {
    return /\d/.test(char);
  }

  private isIdentifierStart(char: string): boolean {
    return /[a-zA-Z_]/.test(char);
  }

  private isBooleanStart(char: string): boolean {
    return char === "T" || char === "F";
  }

  private isIdentifierPart(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char);
  }

  private isOperatorChar(char: string): boolean {
    return /[=+\-*/(),%<>]/.test(char);
  }

  private skipWhitespace() {
    while (
      !this.isEOF() &&
      (this.currentChar() === " " || this.currentChar() === "\t")
    ) {
      this.advance();
    }
  }

  private createToken(
    type: TokenType,
    value: string,
    startCol?: number,
  ): Token {
    return {
      type,
      value,
      line: this.line,
      column: startCol ?? this.column,
    };
  }

  // ------------------ Token Parsers ------------------
  private newlineToken(): Token {
    const token = this.createToken(TokenType.NEWLINE, "\n", this.column);
    this.advance();
    return token;
  }

  private stringToken(): Token {
    const startCol = this.column;
    let result = "";
    this.advance(); // skip opening quote

    while (!this.isEOF() && this.currentChar() !== '"') {
      result += this.currentChar();
      this.advance();
    }

    if (this.isEOF()) {
      throw new Error(
        `Unterminated string at line ${this.line}, column ${startCol}`,
      );
    }

    this.advance(); // skip closing quote
    return this.createToken(TokenType.STRING, result, startCol);
  }

  private commentToken(): Token {
    const startCol = this.column;
    let result = "";
    this.advance(); // skip '#'

    while (!this.isEOF() && this.currentChar() !== "\n") {
      result += this.currentChar();
      this.advance();
    }

    return this.createToken(TokenType.COMMENT, result, startCol);
  }

  private numberToken(): Token {
    const startCol = this.column;
    let result = "";

    while (!this.isEOF() && this.isDigit(this.currentChar())) {
      result += this.currentChar();
      this.advance();
    }

    return this.createToken(TokenType.NUMBER, result, startCol);
  }

  private booleanToken(): Token {
    const startCol = this.column;
    let result = "";

    if (this.input.startsWith("True", this.pos)) {
      result = "True";
      for (let i = 0; i < 4; i++) this.advance();
    } else if (this.input.startsWith("False", this.pos)) {
      result = "False";
      for (let i = 0; i < 5; i++) this.advance();
    } else {
      throw new Error(
        `Invalid boolean literal at line ${this.line}, column ${startCol}`,
      );
    }

    return this.createToken(TokenType.BOOLEAN, result, startCol);
  }

  private identifierOrKeywordToken(): Token {
    const startCol = this.column;
    let result = "";

    while (!this.isEOF() && this.isIdentifierPart(this.currentChar())) {
      result += this.currentChar();
      this.advance();
    }

    const type = this.keywords[result] ?? TokenType.IDENTIFIER;
    return this.createToken(type, result, startCol);
  }

  // -------- Operator Lexer (updated for new TokenTypes) --------
  private operatorToken(): Token {
    const startCol = this.column;
    const char = this.currentChar();
    const next = this.peekChar();

    // Multi-char operators
    if (char === "=" && next === "=") {
      this.advance();
      this.advance();
      return this.createToken(TokenType.EQUAL, "==", startCol);
    }
    if (char === "!" && next === "=") {
      this.advance();
      this.advance();
      return this.createToken(TokenType.NOT_EQUAL, "!=", startCol);
    }
    if (char === "<" && next === "=") {
      this.advance();
      this.advance();
      return this.createToken(TokenType.LTE, "<=", startCol);
    }
    if (char === ">" && next === "=") {
      this.advance();
      this.advance();
      return this.createToken(TokenType.GTE, ">=", startCol);
    }

    // Single-char operators & punctuation
    this.advance();
    switch (char) {
      case "+":
        return this.createToken(TokenType.PLUS, "+", startCol);
      case "-":
        return this.createToken(TokenType.MINUS, "-", startCol);
      case "*":
        return this.createToken(TokenType.STAR, "*", startCol);
      case "/":
        return this.createToken(TokenType.SLASH, "/", startCol);
      case "%":
        return this.createToken(TokenType.MOD, "%", startCol);
      case "=":
        return this.createToken(TokenType.ASSIGN, "=", startCol);
      case "(":
        return this.createToken(TokenType.LPAREN, "(", startCol);
      case ")":
        return this.createToken(TokenType.RPAREN, ")", startCol);
      case ",":
        return this.createToken(TokenType.COMMA, ",", startCol);
      case "<":
        return this.createToken(TokenType.LT, "<", startCol);
      case ">":
        return this.createToken(TokenType.GT, ">", startCol);
    }

    throw new Error(
      `Unknown operator ${char} at line ${this.line}, column ${startCol}`,
    );
  }
}
