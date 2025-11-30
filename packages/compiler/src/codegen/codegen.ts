import {
  Program,
  Statement,
  Assignment,
  ExpressionStatement,
  Expression,
  NumberLiteral,
  Identifier,
  BinaryExpression,
  CallExpression,
} from "../parser/ast";

export class CodeGenerator {
  public generate(node: Program): string {
    return node.body.map((stmt) => this.generateStatement(stmt)).join("\n");
  }

  private generateStatement(stmt: Statement): string {
    switch (stmt.type) {
      case "Assignment":
        // Add `let` for all top-level assignments
        return `let ${this.generateExpression(stmt.left)} = ${this.generateExpression(stmt.right)};`;
      case "ExpressionStatement":
        return `${this.generateExpression(stmt.expression)};`;
      default:
        return this.neverReached(stmt);
    }
  }

  private generateExpression(expr: Expression): string {
    switch (expr.type) {
      case "NumberLiteral":
        return expr.value;
      case "Identifier":
        return expr.name;
      case "BinaryExpression":
        return `${this.generateExpression(expr.left)} ${expr.operator} ${this.generateExpression(expr.right)}`;
      case "CallExpression":
        const args = expr.args
          .map((arg) => this.generateExpression(arg))
          .join(", ");
        if (expr.callee.name === "print") {
          return `console.log(${args})`;
        }
        return `${expr.callee.name}(${args})`;
      default:
        return this.neverReached(expr);
    }
  }

  private neverReached(x: never): never {
    throw new Error(`Unexpected case: ${JSON.stringify(x)}`);
  }
}
