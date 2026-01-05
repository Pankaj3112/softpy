import { compile } from "./utils";

describe("For Loops", () => {
  test("should compile range(n) loop", () => {
    const input = `
for i in range(10):
  print(i)
`;
    const output = compile(input);
    expect(output).toContain("for (var i = 0; i < 10; i += 1) {");
    expect(output).toContain("  console.log(i);");
    expect(output).toContain("}");
  });

  test("should compile range(start, end) loop", () => {
    const input = `
for i in range(1, 10):
  print(i)
`;
    const output = compile(input);
    expect(output).toContain("for (var i = 1; i < 10; i += 1) {");
    expect(output).toContain("  console.log(i);");
    expect(output).toContain("}");
  });

  test("should compile range(start, end, step) loop", () => {
    const input = `
for i in range(0, 10, 2):
  print(i)
`;
    const output = compile(input);
    expect(output).toContain("for (var i = 0; i < 10; i += 2) {");
    expect(output).toContain("  console.log(i);");
    expect(output).toContain("}");
  });

  test("should compile nested for loops", () => {
    const input = `
for i in range(5):
  for j in range(5):
    print(i + j)
`;
    const output = compile(input);
    expect(output).toContain("for (var i = 0; i < 5; i += 1) {");
    expect(output).toContain("  for (var j = 0; j < 5; j += 1) {");
    expect(output).toContain("    console.log((i + j));");
    expect(output).toContain("  }");
    expect(output).toContain("}");
  });
});
