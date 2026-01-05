import { compile } from "./utils";

describe("Logical Operators", () => {
  test("should compile and", () => {
    const input = "print(True and False)";
    const output = compile(input);
    expect(output).toContain("console.log((true && false));");
  });

  test("should compile or", () => {
    const input = "print(True or False)";
    const output = compile(input);
    expect(output).toContain("console.log((true || false));");
  });

  test("should respect precedence with and/or", () => {
    const input = "print(True or False and True)";
    // AND has higher precedence than OR
    const output = compile(input);
    expect(output).toContain("console.log((true || (false && true)));");
  });
});
