# SoftPy
Toy language with python like syntax that compiles into JS.

## Todo

1.  **Phase 1: Project Setup & CLI Skeleton**
    *   Create the folder structure (`src/lexer`, `src/parser`, `src/codegen`, `src/cli`).
    *   Create a basic CLI entry point that accepts a file path.
2.  **Phase 2: Lexer - Basic Tokenization**
    *   Define `TokenType` enum and `Token` interface.
    *   Implement regex-based matching for `NUMBER`, `STRING`, `IDENTIFIER`, `OPERATOR`.
3.  **Phase 2: Lexer - Indentation Handling**
    *   Implement the logic to track indentation levels.
    *   Emit `INDENT` and `DEDENT` tokens.
4.  **Phase 3: Parser - AST Definitions**
    *   Define TypeScript interfaces for AST nodes (`Program`, `Assignment`, `FunctionDef`, etc.).
5.  **Phase 3: Parser - Statements & Expressions**
    *   Implement parsing for variable assignments (`x = 10`).
    *   Implement parsing for `print` statements.
    *   Implement parsing for binary expressions (`a + b`).
6.  **Phase 3: Parser - Control Flow & Functions**
    *   Implement parsing for `if/else` blocks.
    *   Implement parsing for `while` loops.
    *   Implement parsing for `func` definitions.
7.  **Phase 4: Code Generator**
    *   Create a visitor or recursive function to traverse the AST.
    *   Generate valid JavaScript string output.
8.  **Phase 5: Integration & Run Command**
    *   Wire up `CLI -> Lexer -> Parser -> CodeGen`.
    *   Implement `softpy run` to execute the generated JS using Node.js.