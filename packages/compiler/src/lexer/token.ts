export enum TokenType {
  NUMBER = "NUMBER",
  STRING = "STRING",
  IDENTIFIER = "IDENTIFIER",
  OPERATOR = "OPERATOR",
  NEWLINE = "NEWLINE",
  INDENT = "INDENT",
  DEDENT = "DEDENT",
  EOF = "EOF",
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}
