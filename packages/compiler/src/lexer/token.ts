export enum TokenType {
  // Literals
  NUMBER,
  STRING,
  IDENTIFIER,
  BOOLEAN,

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

  // Logical Operators
  AND, // and
  OR, // or
  NOT, // not

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
