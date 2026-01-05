import { compile } from "./utils";

describe("Comparison Operators", () => {
  test("should compile equality", () => {
    const input = "print(1 == 1)";
    const output = compile(input);
    expect(output).toContain("console.log((1 == 1));");
  });

  test("should compile inequality", () => {
    const input = "print(1 != 2)";
    const output = compile(input);
    expect(output).toContain("console.log((1 != 2));");
  });

  test("should compile less than", () => {
    const input = "print(1 < 2)";
    const output = compile(input);
    expect(output).toContain("console.log((1 < 2));");
  });

  test("should compile greater than", () => {
    const input = "print(2 > 1)";
    const output = compile(input);
    expect(output).toContain("console.log((2 > 1));");
  });

  test("should compile less than or equal", () => {
    const input = "print(1 <= 1)";
    const output = compile(input);
    expect(output).toContain("console.log((1 <= 1));");
  });

  test("should compile greater than or equal", () => {
    const input = "print(2 >= 2)";
    const output = compile(input);
    expect(output).toContain("console.log((2 >= 2));");
  });
});
