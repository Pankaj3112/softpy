// This TypeScript file contains multiple formatting and linting issues

const myFunction = (name: string, age: number) => {
  console.log("Hello, " + name + "! You are " + age + " years old.");

  let unusedVariable = 42; // Unused variable (ESLint should warn about this)

  return { name: name, age: age };
};

console.log(myFunction("Alice", 25)); // Incorrect spacing, missing semicolon, inconsistent quotes
