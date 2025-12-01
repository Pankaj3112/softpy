import {
  Program,
  Statement,
  Assignment,
  ExpressionStatement,
  Expression,
  NumberLiteral,
  StringLiteral,
  Identifier,
  BinaryExpression,
  CallExpression,
  BooleanLiteral,
  UnaryExpression,
} from "../parser/ast";

export class CodeGenerator {
  // ------------------ Entry Point ------------------
  public generate(node: Program): string {
    return node.body.map((stmt) => this.generateStatement(stmt)).join("\n");
  }

  // ------------------ Statement Generation ------------------
  private generateStatement(stmt: Statement): string {
    switch (stmt.type) {
      case "Assignment":
        return this.generateAssignment(stmt);
      case "ExpressionStatement":
        return this.generateExpressionStatement(stmt);
      default:
        return this.unreachable(stmt);
    }
  }

  private generateAssignment(node: Assignment): string {
    // Add `let` for all top-level assignments
    const left = this.generateExpression(node.left);
    const right = this.generateExpression(node.right);
    return `let ${left} = ${right};`;
  }

  private generateExpressionStatement(node: ExpressionStatement): string {
    return `${this.generateExpression(node.expression)};`;
  }

  // ------------------ Expression Generation ------------------
  private generateExpression(expr: Expression): string {
    switch (expr.type) {
      case "NumberLiteral":
        return this.generateNumberLiteral(expr);
      case "StringLiteral":
        return this.generateStringLiteral(expr);
      case "BooleanLiteral":
        return this.generateBooleanLiteral(expr);
      case "Identifier":
        return this.generateIdentifier(expr);
      case "BinaryExpression":
        return this.generateBinaryExpression(expr);
      case "CallExpression":
        return this.generateCallExpression(expr);
      case "UnaryExpression":
        return this.generateUnaryExpression(expr);
      default:
        return this.unreachable(expr);
    }
  }

  private generateNumberLiteral(node: NumberLiteral): string {
    return node.value;
  }

  private generateStringLiteral(node: StringLiteral): string {
    return `"${node.value}"`;
  }

  private generateBooleanLiteral(node: BooleanLiteral): string {
    return node.value === "True" ? "true" : "false";
  }

  private generateIdentifier(node: Identifier): string {
    return node.name;
  }

  private generateBinaryExpression(node: BinaryExpression): string {
    const left = this.generateExpression(node.left);
    const right = this.generateExpression(node.right);

    if (node.operator === "and") {
      return `${left} && ${right}`;
    }
    if (node.operator === "or") {
      return `${left} || ${right}`;
    }

    return `${left} ${node.operator} ${right}`;
  }

  private generateCallExpression(node: CallExpression): string {
    const args = node.args
      .map((arg) => this.generateExpression(arg))
      .join(", ");

    switch (node.callee.name) {
      case "print":
        return `console.log(${args})`;
      default:
        break;
    }

    return `${node.callee.name}(${args})`;
  }

  private generateUnaryExpression(node: UnaryExpression): string {
    const argument = this.generateExpression(node.argument);
    switch (node.operator) {
      case "NOT":
        return `!${argument}`;
      default:
        throw new Error(`Unsupported unary operator: ${node.operator}`);
    }
  }

  // ------------------ Utility ------------------
  private unreachable(x: never): never {
    throw new Error(`Unexpected AST node: ${JSON.stringify(x)}`);
  }
}
