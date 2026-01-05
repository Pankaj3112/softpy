import { Token, TokenType } from "./token";

export class Lexer {
  private input: string;
  private pos = 0;
  private line = 1;
  private column = 1;

  private indentStack: number[] = [0];
  private pendingTokens: Token[] = [];
  private atLineStart = true;

  private keywords: Record<string, TokenType> = {
    and: TokenType.AND,
    or: TokenType.OR,
    not: TokenType.NOT,
    if: TokenType.IF,
    elif: TokenType.ELIF,
    else: TokenType.ELSE,
    while: TokenType.WHILE,
  };

  constructor(input: string) {
    this.input = input;
  }

  // ------------------ Public Method ------------------
  public getNextToken(): Token {
    // Return pending tokens first (DEDENT tokens)
    if (this.pendingTokens.length > 0) {
      return this.pendingTokens.shift()!;
    }

    // Handle indentation at line start
    if (this.atLineStart && !this.isEOF()) {
      const indentToken = this.handleIndentation();
      if (indentToken) return indentToken;
    }

    this.skipWhitespace();

    if (this.isEOF()) {
      // Emit remaining DEDENTs at EOF
      if (this.indentStack.length > 1) {
        this.indentStack.pop();
        return this.createToken(TokenType.DEDENT, "", this.column);
      }
      return this.createToken(TokenType.EOF, "", this.column);
    }

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

  // ------------------ Indentation Handling ------------------
  private handleIndentation(): Token | null {
    const startCol = this.column;
    let indentLevel = 0;

    // Count spaces/tabs at line start
    while (
      !this.isEOF() &&
      (this.currentChar() === " " || this.currentChar() === "\t")
    ) {
      if (this.currentChar() === "\t") {
        indentLevel += 8; // Treat tab as 8 spaces
      } else {
        indentLevel += 1;
      }
      this.advance();
    }

    // Skip blank lines and comments - don't process indentation for them
    if (
      this.isEOF() ||
      this.currentChar() === "\n" ||
      this.currentChar() === "#"
    ) {
      this.atLineStart = false;
      return null;
    }

    this.atLineStart = false;

    const currentIndent = this.indentStack[this.indentStack.length - 1] ?? 0;

    if (indentLevel > currentIndent) {
      // INDENT
      this.indentStack.push(indentLevel);
      return this.createToken(TokenType.INDENT, "", startCol);
    } else if (indentLevel < currentIndent) {
      // DEDENT (possibly multiple)
      while (
        this.indentStack.length > 1 &&
        (this.indentStack[this.indentStack.length - 1] ?? 0) > indentLevel
      ) {
        this.indentStack.pop();
        this.pendingTokens.push(
          this.createToken(TokenType.DEDENT, "", startCol),
        );
      }

      // Check for indentation error
      if (
        (this.indentStack[this.indentStack.length - 1] ?? 0) !== indentLevel
      ) {
        throw new Error(
          `Indentation error at line ${this.line}: inconsistent indentation`,
        );
      }

      // Return first DEDENT, rest are pending
      return this.pendingTokens.shift()!;
    }

    // Same indentation level
    return null;
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
    return /[=+\-*/(),%<>!:~]/.test(char);
  }

  private skipWhitespace() {
    while (
      !this.isEOF() &&
      (this.currentChar() === " " || this.currentChar() === "\t") &&
      !this.atLineStart
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
    this.atLineStart = true; // Reset for next line
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
      case ":":
        return this.createToken(TokenType.COLON, ":", startCol);
      case "~":
        return this.createToken(TokenType.BITWISE_NOT, "~", startCol);
    }

    throw new Error(
      `Unknown operator ${char} at line ${this.line}, column ${startCol}`,
    );
  }
}
