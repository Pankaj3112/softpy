export enum TokenType {
  // Literals
  NUMBER = "NUMBER",
  STRING = "STRING",
  IDENTIFIER = "IDENTIFIER",
  BOOLEAN = "BOOLEAN",

  // Structure
  NEWLINE = "NEWLINE",
  INDENT = "INDENT",
  DEDENT = "DEDENT",
  COMMENT = "COMMENT",
  EOF = "EOF",

  // Operators
  PLUS = "PLUS",
  MINUS = "MINUS",
  STAR = "STAR",
  SLASH = "SLASH",
  MOD = "MOD",
  ASSIGN = "ASSIGN", // =
  EQUAL = "EQUAL", // ==
  NOT_EQUAL = "NOT_EQUAL", // !=
  LT = "LT",
  GT = "GT", // < >
  LTE = "LTE",
  GTE = "GTE", // <= >=

  // Logical Operators
  AND = "AND", // and
  OR = "OR", // or
  NOT = "NOT", // not

  // Conditional Keywords
  IF = "IF",
  ELSE = "ELSE",
  ELIF = "ELIF",

  // Punctuation / delimiters
  LPAREN = "LPAREN",
  RPAREN = "RPAREN",
  COMMA = "COMMA",
  COLON = "COLON",
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}
