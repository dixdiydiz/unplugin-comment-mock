# unplugin-comment-mock [![NPM version](https://img.shields.io/npm/v/unplugin-comment-mock?color=a1b858&label=)](https://www.npmjs.com/package/unplugin-comment-mock)

[`中文文档`](./README_zh.md)

## Features

- Mock data through comments during local development without affecting production code.

```ts
  // #comment-mock 2 
  const foo = 1;  // Will be replaced with 2
```

- Automatically traverse upwards to locate mock files by convention.

## Installation

```bash
npm i unplugin-comment-mock
```

## Usage

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import commentMock from 'unplugin-comment-mock/vite'

export default defineConfig({
  plugins: [
    commentMock({ /* options */ }),
  ],
})
```

Example: [`playground/`](./playground/)

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import commentMock from 'unplugin-comment-mock/rollup'

export default {
  plugins: [
    commentMock({ /* options */ }),
  ],
}
```

<br></details>

<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [
    require('unplugin-comment-mock/webpack')({ /* options */ })
  ]
}
```

<br></details>

<details>
<summary>Vue CLI</summary><br>

```ts
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [
      require('unplugin-comment-mock/webpack')({ /* options */ }),
    ],
  },
}
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild'
import Starter from 'unplugin-comment-mock/esbuild'

build({
  plugins: [Starter()],
})
```

<br></details>

## Configuration

```ts
commentMock(/* options */)
```

- mockFileName: Name of the mock data file.
    - Type: string | string[]
    - Default: ["mock", "__mock__"]
- mockFileExt: File extensions for mock data files.
    - Type: string | string[]
    - Default: [".js", ".ts"]

## Rules

- Only single-line comments starting with `#comment-mock` take effect.
- Reserved variables `__origin` or `__o` represent the original value.
- Follow the mock file naming convention - no manual importing required; auto-detected upwards.

## Examples

- Primitive values are directly replaced

```ts
/* Before compilation */
// #comment-mock 2
const foo = 1;
// #comment-mock Symbol('d')
let bar = 2;
// #comment-mock
bar = 3;

/* After compilation */
const foo = 2;
let bar = Symbol('d');
bar = 3; // Original value remains as no mock value provided
```

- Reference types automatically import `mock` files

```ts
/* Before compilation */
// #comment-mock mockFoo(1)
const foo = 1;
// #comment-mock mockBar(__o)
const bar = 2;

/* After compilation */
import { mockFoo, mockBar } from './__mock__.ts'
const foo = mockFoo(1);
const bar = mockBar(2); // __o replaced with original value 2
```

## Utility Functions

### Import

`import { ** } from 'unplugin-comment-mock/utils'`

### populateArray(...inventory)

```ts
type KeyFn<T> = (partialTarget: T, index: number) => boolean
type InventoryKey<T> = number | RegExp | KeyFn<T>
type InventoryKey<T> = number | RegExp | KeyFn<T>

function populateArray<T = Record<string, any>>(
    ...inventory: Record<string | symbol, any> | [InventoryKey<T>, InventoryValue<T>][],
): T[]
```

- Constructs object arrays using indices, regex, or functions. Merges objects when array elements are plain objects;
  otherwise overwrites elements.
- inventory accepts objects or arrays. Objects are treated as properties; arrays as key-value pairs for construction.
    - For array elements: Keys support numbers, regex, or functions. Values support functions or direct array elements.

[`More Example`](./test/utils.test.ts)

```ts
/**
 * [{ foo: 1, index: 0 }, { index: 1 }, null, { bar: 3, index: 3 }]
 */
populateArray(
  {
    length: 4,
  },
  [0, { foo: 1 }],
  [(_prevValue, i) => i === 3, { bar: 3 }],
  [
    /.*/,
    (_prevValue, index) => index === 2 ? null : ({
      index,
    })
  ],
)
```
