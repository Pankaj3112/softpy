export enum TokenType {
  // Literals
  NUMBER,
  STRING,
  IDENTIFIER,

  // Structure
  NEWLINE,
  COMMENT,
  EOF,

  // Operators
  PLUS,
  MINUS,
  STAR,
  SLASH,
  MOD,
  ASSIGN, // =
  EQUAL, // ==
  NOT_EQUAL, // !=
  LT,
  GT, // < >
  LTE,
  GTE, // <= >=

  // Punctuation / delimiters
  LPAREN,
  RPAREN,
  COMMA,
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}
