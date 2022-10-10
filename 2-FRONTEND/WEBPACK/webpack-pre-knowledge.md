# (一) webpack

### (1) webpack 生命周期钩子

- entryOption ------------- 在 webpack.config.js 文件中的 entry 处理完后调用
- afterPlugins ------------ 在 Compiler.constructor() 中遍历执行完 webpack.config.js 中的 plugins 的 plugin 后调用
- run --------------------- 在 Compiler.run() 执行后调用
- compile ----------------- 在打包函数 compile 执行前调用
- afterCompile ------------ 在打包函数 compile 执行后调用
- emit -------------------- 在把文件写入到 webpack.config.js 的 output 文件夹后执行
- done -------------------- 打包总流程执行完后调用

### (2) babel 处理 AST 的过程

- @babel/parse ------------ 将 ( js 源码字符串 ) 转成 ( AST ) 抽象语法树
- @babel/traverse --------- 遍历 AST
- @babel/types ------------ 操作 AST，即进行 增删改查
- @babel/generator -------- 将修改后的 AST 转成新的源码字符串

### (3) loader 和 plugin 执行的时机

- plugin
  - 执行时机：在 webpack.Compiler.constructor 中去执行 plugin 中的 apply 方法的
  - 扩展：
    - 插件的注册：webpack 的每个 plugin 都有一个 apply 方法，apply 方法会对插件进行 tapable 的 ----- ( tap 注册 )
    - 插件的调用：然后在不同的方法执行时去 ------------------------------------------------------- ( call 调用 )
- loader
  - 执行时机：Compiler -> run -> buildModules -> getSource

### (4) plugin

- 发布订阅模式：webpack-plugin 的发布订阅模式，是通过 tapable 来实现的
- 特点
  - 类：plugin 是一个类，因为是通过 new 的方法调用插件
  - apply 方法：每个 plugin 都有一个 apply 方法，在 new Plugin() 执行插件时被调用
  - apply 方法的参数：参数是 complier 实例，即 Complier 类 new 时生成的实例
- 过程
  - 注册 **tap**
    - 1. apply() ------> plugin 会在 Compiler.constructor 中被调用，通过调用 plugin.apply(compiler)，执行 apply 方法
    - 2. apply(compiler)内部 ---> 会调用 compiler 实例上的 ( hooks ) 属性中的 ( 不同的生命周期方法 ) 上的 ( tap ) 方法进行 plugin 插件的注册
  - 调用 **call**
    - 在 Compiler 中的不同的函数之间，通过 hooks.call() 来调用

# (二) webpack 性能优化

### (1) noParse

- module.noParse
  - 作用：让 loader 不去解析该模块的依赖关系，提升构建速度。前提是你知道该模块没有依赖任何模块
  - 类型：后面接一个正则表达式

```
module: {
  noParse: /jquery|lodash/, // 不去解析jquery或lodash的依赖关系，因为它们俩都没有依赖其他库，从而提高构建速度
  rules: []
}
```

### (2) include 和 exclude

- 作用：缩小 loader 寻找文件的范围
- 配置：module.rules[number].include 或 module.rules[number].exclude 来缩小 loader 匹配文件的范围
- loader 寻找文件的过程
  - 因为：默认 loader 会寻找 ( node_modules ) 文件夹，然后大多数情况下 loader 只需要处理 ( 本项目 ) 中的文件
  - 所以：可以通过 include 和 exclude 来做范围控制

```
module: {
  noParse: /jquery|lodash/,
  rules: [
    {
      test: /\.js$/,
      exclude: /node_modules/, // 表示 babel-loader 不去解析 node_modules 中的 js 文件，从而提升构建和打包速度
      use: {
        loader: 'babel-loader'
      }
    }
  ]
}
```

### (3) DllPlugin 和 DllReferencePlugin --------------------- 抽离第三方包，动态链接库

- 动态链接库
  - DllPlugin
    - 在单独打包 ( 第三方库 ) 时，生成 ( 动态链接库 )，一个 json 文件
  - DllReferencePlugin
    - ( 引用动态链接库 )，就不用重新在打包了，提升构建速度
- 总结
  - 案例：比如我们使用到了 react 和 reactDom，就可以利用 DllPlugin 单独打包，然后当我们修改了业务组件时，就不用重新打包 react 和 reactDom，而是通过 DllReferencePlugin 直接引用之前打包好的
  - 效果：提升构建速度和本地开发时，修改组件后重新打包的时间

### (4) optimization.splitChunks.cacheGroups ---------------- 抽离自己的业务组件 或 第三方包

- 作用：抽离 ( 公共组件 和 第三方组件 )
- 具体
  - optimization -> splitChunks -> cacheGroups -> venders|commons

```
optimization: {
  minimizer: {}, // 压缩css和js的配置项
  splitChunks: { // 分割chunk
    cacheGroups: { // 缓存组
      commons: { // 公共组件

      },
      venders: { // 第三方组件
        name: '', // 打包后的名字
        minChunks: 1, // 被引用的最小次数，大于等于该数字时就会单独打包成一个chunk
        priority: 11, // 表示优先级，值越大表示优先级越高
        minSize: 1, // 最小的大小，大于等于该值就会单独打包
      }
    }
  }
}
```

### (5) webpack.ignorePlugin

- 作用
  - 忽略引入的这个 ( 库 - 中引入的文件 )
  - 忽略后，则可以自己手动引入该库需要在本项目中用到的一些文件，从而减少包的大小

### (6) happyPack

- 作用：开启多线程打包
- 分类：
  - 可以开启对 js 资源的多线程打包，开启对 css 资源对多线程打包
  - 即可以针对不同的资源，决定是否开启多线程打包

### (7) webpack 自带的一些优化

- **tree-shaking**
  - 条件：必须使用 es6 中的 ( import ) 语法，( tree-shaking ) 会自动在 ( 编译阶段 ) 注意不是代码运行阶段， ( 删除 ) 掉模块中 ( 没有被使用到的代码 )
  - 扩展：tree-shaking 的原理
    - import
      - 因为：import 语法是 ES6 中的模块化方案
      - 优点：该方案的优点是在 ( 编译阶段 ) 就知道 ( 模块的依赖关系 )，和 ( 输入输出的变量 )
    - map 映射
      - 1. 统计模块中的 export 的变量
      - 2. 统计业务方代码使用到的 import 变量
      - 3. 对比 12，就能知道 ( 该模块中哪些变量被使用到了 )，对没有使用到的变量打上 ( 标记 )
    - 压缩
      - 在压缩代码阶段，比如插件 uglify-js 就会在压缩阶段 ( 删除没有使用到的代码 )
- **scope-host**
  - webpack 会自动优化一些可以优化的代码
  - 比如：声明多个变量，然后相加的操作，webpack 就会合并变量

### (8) fileLoader 和 urlLoading

- fileLoader
  - 将 ( 图片 ) 打包到文件夹中，并将 ( 图片地址 ) 返回回来
- urlLoader
  - 作用: 转 Base64 的图片
  - 优点: 将图片转成 Base64 的图片，其实是将图片信息集成到了 css 文件中，css 文件是提前加载的，不会单独加载图片从而实现预加载。
  - 缺点: Base64 图片，会增加 css 文件的大小，增加首屏渲染的时间
  - 1. urlLoader 具有 fileLoader 的功能外
  - 2. 还可以通过 ( option.limit ) 来指定一个 ( 值 )，当 ( 图片大小 ) 小于该阈值时，会将图片转成 ( Base64 ) 的图片
- 扩展
  - 如何实现图片预加载 https://juejin.cn/post/6893681741240909832

# (三) webpack interview

### (1) hash chunkhash contenthash

- **hash**
  - 作用：整个项目的 ( 任何一个文件 ) 修改，整个项目打包后的 ( 所有文件的 hash ) 都会变化
  - 缺点：如果只是修改了一个文件，导致整个打包后的所有文件 hash 都会变化，( 缓存就会失效 )
- **chunkhash**
  - 对比：相对于 hash，则 chunkhash 影响文件的 ( 范围变小 )
  - 原理：
    - 根据不同的入口文件(Entry)进行依赖文件解析、构建对应的 chunk，生成对应的哈希值
    - ( 不同入口 entry )，会打包成不同的 ( chunk ), 打包生成的 chunk 的 hash 不一样
  - 总结：
    - 1. 也就是说：如果有两个入口 entry，就会打包成两个 chunk，这两个 chunk 的 hash 值不一样
    - 2. 我们修改其中一个 chunk 中的组件文件，只会影响的该 chunk 打包后的文件 hash，另一个 chunk 不受影响
  - 例子：
    - 策略：比如一个项目有 6 个组件，123 打包为一个 thunk1 输出一组 js/css，456 打包为另一个 thunk2 输出另一组 js/css
    - 结果： 如果使用 chunkhash，打包完成后 chunk1 的 hash 和 chunk2 的 hash 就不一样，改动了 123，456 的 chunk2 的 hash 就不会变，缓存仍然有效
- **contenthash**
  - 对比：contenthash 在 hash，chunkhash，contenthash 三者中，( 影响范围最小 )
  - 案例
    - 遇到问题
      - 使用 chunkhash，如果 index.css 被 index.js 引用了，那么 ( css 文件和 js 文件 ) 就会 ( 共用相同的 chunkhash 值 )
      - 如果 index.js 更改了代码，css 文件就算内容没有任何改变，由于是该模块发生了改变，导致 css 文件会重复构建
    - 解决方法
      - 使用 ( **mini-css-extract-plugin** ) 里的 ( contenthash ) 值，保证即使 css 文件所处的模块里就算其他类型的文件内容改变，比如 js 改变，只要 css 文件内容不变，那么不会重复构建
- 使用
  - 问题：在哪些地方可以使用到 hash chunkhash contenthash
  - 回答：凡是在 webpack.config.js 中具有 ( filename ) 属性的地方都可以使用 ( 占位符的方式 [hash|chunkhash|content] ) 使用到这几种 hash

### (2) cross-env 和 webpack.DefinePlugin 和 mode 三者的区别？

- cross-env
  - node 环境变量：cross-env 定义的是 -------------------- node 中的环境变量
- webpack.DefinePlugin
  - 浏览器环境变量：webpack.definePlugin() 定义是的 ----- 浏览器中的环境变量
- mode
  - node 环境变量：mode 是指定 --------------------------- 浏览器中的环境变量
- 以下表达式等价
  - ( mode: 'development' ) === webpack.definePlugin({'process.env.NODE_ENV': JSON.stringify('development')})
- 问题
  - 问题：如何同步浏览器环境 和 node 环境的环境变量呢？
  - 回答：
    - 1. 在 package.json 的 script 中设置 cross-env 的 NODE_ENV 的是 'development'
    - 2. 在 webpack.config.js 中将 ( mode 的值设置为 process.env.NODE_ENV ) 或者 ( webpack.definePlugin({process.env.NODE_ENV: JSON.stringify('development') }) )
- 源码
  - 源码地址：https://github.com/woow-wu7/8-divine/blob/main/examples/main.js
  - 源码地址 2: https://github.com/woow-wu7/7-compiler/blob/main/webpack.config.js

```
总结
---
1
浏览器中的环境变量有两种方式指定
- 以下两种等价
  - 1. 通过 webpack.config.js 中的 mode:xxxx 来指定
  - 2. 通过 webpack.config.js 中的 webpack.definePlugin({process.env.NODE_ENV: JSON.stringify('xxxx') })
- 原理
  - cross-env NODE_ENV=xxxx ---> webpack.config.js中就可以通过 process.env.NODE_ENV 获取到 xxxx ---> 再把 mode: process.env.NODE_ENV ---> 则浏览器中的 process.env.NODE_ENV 就等于了 xxxx
```
