# unplugin-comment-mock [![NPM version](https://img.shields.io/npm/v/unplugin-comment-mock?color=a1b858&label=)](https://www.npmjs.com/package/unplugin-comment-mock)

[`English Doc`](./README.md)

## 特性

- 在本地开发模式时，通过注释来`mock`数据，避免影响生产代码。

```ts
  // #comment-mock 2 
  const foo = 1;  // 会被替换成2 
```

- 约定`mock`文件名称，自动向上遍历查找`mock`文件。

## 安装

```bash
npm i unplugin-comment-mock
```

## 使用

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import commentMock from 'unplugin-comment-mock/vite'

export default defineConfig(({ command }) => {
  const isDev = command === "serve";
  return {
    plugins: [
      isDev ? commentMock({ /* options */ }) : null
    ].filter(Boolean),
  }
})
```

Example: [`playground/`](./playground/)

<br></details>

<details>
<summary>Rspack</summary><br>

```ts
// rspack.config.ts
import commentMock from 'unplugin-comment-mock/rspack'

const isDev = process.env.NODE_ENV === "development"
export default defineConfig({
  plugins: [
    isDev ? commentMock({ /* options */ }) : null,
  ].filter(Boolean),
})
```

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

## 配置

```ts
commentMock(/* options */)
```

- mockFileName: 存放mock数据的文件名称。
    - 类型: `string | string[]`
    - 默认值: `["mock", "__mock__"]`
- mockFileExt: 存放mock数据的文件后缀。
    - 类型: `string | string[]`
    - 默认值: `[".js", ".ts"]`

## 规则限制

- 单行且以 `#comment-mock` 开头的注释才会生效。
- 保留变量 `__origin` 或者 `__o` 代替自身值。
- 约定存放 `mock` 数据文件，不要手动引入，会自动向上查找引用。

### 例子

[`更多例子`](./test/transform/transform.test.ts)

- 原始类型会被直接替换

```ts
/* 编译前 */
// #comment-mock 2
const foo = 1;
// #comment-mock Symbol('d')
let bar = 2;
// #comment-mock
bar = 3;

/* 编译后 */
// #comment-mock 2
const foo = 2;
// #comment-mock Symbol('d')
let bar = Symbol('d');
// #comment-mock
bar = 3;
```

- 引用类型会自动查找 `mock` 文件

```ts
/* 编译前 */
// #comment-mock mockFoo(1)
const foo = 1;
// #comment-mock mockBar(__o)
const bar = 2;

/* 编译后 */
import { mockFoo, mockBar } from './__mock__.ts'
// #comment-mock mockFoo(1)
const foo = mockFoo(1);
// #comment-mock mockBar(__o)
const bar = mockBar(2); // __o 被替换成 2
```

## 工具函数

### 引入方式

`import { ** } from unplugin-comment-mock/utils`

### populateArray(...inventory)

```ts
type KeyFn<T> = (partialTarget: T, index: number) => boolean
type InventoryKey<T> = number | RegExp | KeyFn<T>
type InventoryKey<T> = number | RegExp | KeyFn<T>

function populateArray<T = Record<string, any>>(
    ...inventory: Record<string | symbol, any> | [InventoryKey<T>, InventoryValue<T>][],
): T[]
```

- 支持索引、正则表达式、函数等构建对象数组。当数组元素是普通对象时会合并对象，其他情况直接覆盖该元素。
- 参数inventory元素支持对象或者数组。如果是对象，则被认为是对象的属性，如果是数组，则被认为是构建对象的键值对。
    - 参数元素为数组时，键对象支持数字、正则表达式、函数。值对象支持函数或直接是目标数组的元素。

[`更多例子`](./test/utils.test.ts)

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