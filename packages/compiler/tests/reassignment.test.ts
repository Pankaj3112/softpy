import { compile } from "./utils";

describe("Variable Reassignment", () => {
  test("should compile reassignment in while loop correctly", () => {
    const input = `
x = 1
while x < 10:
  print(x)
  x = x + 1
`;
    const output = compile(input);
    expect(output).toContain("var x = 1;");
    expect(output).toContain("while ((x < 10)) {");
    expect(output).toContain("  console.log(x);");
    expect(output).toContain("  var x = (x + 1);");
    expect(output).toContain("}");
  });

  test("should compile reassignment in if block correctly", () => {
    const input = `
x = 1
if x < 10:
  x = 2
print(x)
`;
    const output = compile(input);
    expect(output).toContain("var x = 1;");
    expect(output).toContain("if ((x < 10)) {");
    expect(output).toContain("  var x = 2;");
    expect(output).toContain("}");
    expect(output).toContain("console.log(x);");
  });
});
