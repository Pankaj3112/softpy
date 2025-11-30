import { Token, TokenType } from "./token";

export class Lexer {
  private input: string;
  private pos = 0;
  private line = 1;
  private column = 1;

  constructor(input: string) {
    this.input = input;
  }

  public getNextToken(): Token {
    if (this.pos >= this.input.length) {
      return {
        type: TokenType.EOF,
        value: "",
        line: this.line,
        column: this.column,
      };
    }

    const char = this.input[this.pos] ?? "\0";

    // Skip spaces
    if (char === " " || char === "\t") {
      this.advance();
      return this.getNextToken();
    }

    // Newline
    if (char === "\n") {
      this.advance();
      return {
        type: TokenType.NEWLINE,
        value: "\n",
        line: this.line - 1,
        column: this.column,
      };
    }

    // Numbers
    if (/\d/.test(char)) {
      return this.number();
    }

    // Identifiers (variables)
    if (/[a-zA-Z_]/.test(char)) {
      return this.identifier();
    }

    // Operators (for now just +, -, =)
    // if (/[=+\-*/]/.test(char)) {
    //   this.advance();
    //   return {
    //     type: TokenType.OPERATOR,
    //     value: char,
    //     line: this.line,
    //     column: this.column,
    //   };
    // }

    if (/[=+\-*/()]/.test(char)) {
      const startCol = this.column;
      this.advance();
      return {
        type: TokenType.OPERATOR,
        value: char,
        line: this.line,
        column: startCol,
      };
    }

    throw new Error(
      `Unknown character ${char} at line ${this.line}, column ${this.column}`,
    );
  }

  private advance() {
    if (this.input[this.pos] === "\n") {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    this.pos++;
  }

  private number(): Token {
    let result = "";
    const startCol = this.column;
    while (this.pos < this.input.length && /\d/.test(this.input[this.pos]!)) {
      result += this.input[this.pos];
      this.advance();
    }
    return {
      type: TokenType.NUMBER,
      value: result,
      line: this.line,
      column: startCol,
    };
  }

  private identifier(): Token {
    let result = "";
    const startCol = this.column;
    while (
      this.pos < this.input.length &&
      /[a-zA-Z0-9_]/.test(this.input[this.pos]!)
    ) {
      result += this.input[this.pos];
      this.advance();
    }
    return {
      type: TokenType.IDENTIFIER,
      value: result,
      line: this.line,
      column: startCol,
    };
  }
}
