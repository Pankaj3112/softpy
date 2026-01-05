import { compile } from "./utils";

describe("Control Flow", () => {
  test("should compile if statement", () => {
    const input = `
if True:
  print("True")
`;
    const output = compile(input);
    expect(output).toContain("if (true) {");
    expect(output).toContain('  console.log("True");');
    expect(output).toContain("}");
  });

  test("should compile if-else statement", () => {
    const input = `
if True:
  print("True")
else:
  print("False")
`;
    const output = compile(input);
    expect(output).toContain("if (true) {");
    expect(output).toContain('  console.log("True");');
    expect(output).toContain("} else {");
    expect(output).toContain('  console.log("False");');
    expect(output).toContain("}");
  });

  test("should compile if-elif-else statement", () => {
    const input = `
if x:
  print("x")
elif y:
  print("y")
else:
  print("z")
`;
    const output = compile(input);
    expect(output).toContain("if (x) {");
    expect(output).toContain('  console.log("x");');
    expect(output).toContain("} else if (y) {");
    expect(output).toContain('  console.log("y");');
    expect(output).toContain("} else {");
    expect(output).toContain('  console.log("z");');
    expect(output).toContain("}");
  });

  test("should compile nested if statements", () => {
    const input = `
if x:
  if y:
    print("y")
`;
    const output = compile(input);
    expect(output).toContain("if (x) {");
    expect(output).toContain("  if (y) {");
    expect(output).toContain('    console.log("y");');
    expect(output).toContain("  }");
    expect(output).toContain("}");
  });
});
