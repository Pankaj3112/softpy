import { Token, TokenType } from "./token";

export class Lexer {
  private input: string;
  private pos = 0;
  private line = 1;
  private column = 1;

  constructor(input: string) {
    this.input = input;
  }

  // ------------------ Public Method ------------------
  public getNextToken(): Token {
    this.skipWhitespace();

    if (this.isEOF()) {
      return this.createToken(TokenType.EOF, "");
    }

    const char = this.currentChar();

    if (char === "\n") return this.newlineToken();
    if (char === '"') return this.stringToken();
    if (char === "#") return this.commentToken();
    if (this.isDigit(char)) return this.numberToken();
    if (this.isIdentifierStart(char)) return this.identifierToken();
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

  private isIdentifierPart(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char);
  }

  private isOperatorChar(char: string): boolean {
    return /[=+\-*/(),%]/.test(char);
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

  private identifierToken(): Token {
    const startCol = this.column;
    let result = "";

    while (!this.isEOF() && this.isIdentifierPart(this.currentChar())) {
      result += this.currentChar();
      this.advance();
    }

    return this.createToken(TokenType.IDENTIFIER, result, startCol);
  }

  private operatorToken(): Token {
    const startCol = this.column;
    const char = this.currentChar();
    this.advance();
    return this.createToken(TokenType.OPERATOR, char, startCol);
  }
}
