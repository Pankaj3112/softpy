# Softpy Compiler

Softpy is a minimal CLI for running `.spy` files.

## Installation

You can install Softpy globally:

```bash
npm install -g @softpy/compiler
````

Or use it locally in a project:

```bash
npm install @softpy/compiler
npx softpy example.spy
```

---

## Usage

Create a `.spy` file with your code. For example, `example.spy`:

```text
x = 10
y = 5
z = x + y

print x, "+", y, "=", z
```

Run it with:

```bash
softpy example.spy
```

Output:

```
10 + 5 = 15
```

---

## Supported Features (v0.0.1)

* Variable assignment: `x = 10`
* Arithmetic operations: `+`, `-`, `*`, `/`
* Printing output: `print x, "+", y, "=", z`

> Only the above syntax is supported in this version. More features coming soon!

---

## License

MIT