# vue2

### (1) vue 的生命周期

- mount 阶段
  - beforeCreate
  - created ----------- ( 实例创建 ) 完成，但是并 ( 没有挂载 )，可以获取 computed，watch，methods 等，但是不能获取 $el，$refs
  - beforeMount
  - mounted ----------- 实例被挂在后调用，( 不保证所有子组件也被挂在完成，需要在视图全部更新后执行操作，使用 vm.$nextTick，详细测试见 test-vue/life-cycle/life-cycle.html )
- update 阶段
  - beforeUpdate
  - updated
- umMount 阶段
  - beforeUnmount 3.0
  - unmounted 3.0
  - 或者改版之前的 2.0：beforeDestroy destroyed
- keep-alive 相关
  - activated ------- keepAlive 缓存的组件激活时触发
  - deactivated ----- keepAlive 缓存的组件失活时触发
- 错误相关
  - errorCaptured --- 在捕获一个来自后代组件的错误时被调用

### (2) 父子组件生命周期执行顺序

```
1. mount阶段
父组件-beforeCreate
父组件-created
父组件-beforeMount
子组件-beforeCreate
子组件-created
子组件-beforeMount
子组件-mounted
父组件-mounted


2. update阶段
父组件-beforeUpdate
子组件-beforeUpdate
子组件-updated
父组件-updated


3. unmount阶段
父组件-beforeUnmount/beforeDestroy
子组件-beforeUnmount/beforeDestroy
子组件-unmounted/destroyed
父组件-unmounted/destroyed


问题：为什么创建的时候是父组件先创建，挂载的时候是子组件先挂载
回答：<Father><Child><Child><Father> 可以类比于 ( 函数调用栈 ) 的情况，执行完child出栈，father才会执行完毕出栈
```

### (3) computed

- 特点 ( 4 个特点 )
  - 1. 只有在 computed 被访问时才会去计算，( 比如在 template 模版中被访问，methods 中被访问 )
  - 2. computed 具有缓存功能，也就是说如果之前某个 computed 的 key 被访问过了，再次访问不会进行重新计算，而是直接返回之前计算好的值
  - 3. computed 的依赖必须是响应式数据，不然依赖变化后也不会触发 computed 重新计算
  - 4. 即使 computed 的依赖变化了，但是 computed 计算的值并没有变化时，也不会重新渲染

```
computedWatcher
- this.value=undefined，即不会立即求值
- 问题：那什么时候求值？
- 回答：在 template 中访问到了 computed 定义的计算属性时会进行计算
- 原理：
  - 过程：因为computed初始化时，会在defineComputed()函数中进行Object.defineProperty(target, key, sharedPropertyDefinition)，即get/set依赖收集和派发更新
  - 最终：执行 watcher.evaluate() --> watcher.get() --> watcher.getter.call(vm, vm) --> expOrFn() --> 就是computed对象key对应的方法
- computed的特点
  - 1. computed只有在 ( 被访问时 ) 才会去进行计算，上面已经分析过了
  - 2. computed计算属性具有 ( 缓存功能 )
  - 3. computed的依赖必须是 ( 响应式数据 )，不然依赖更新，也不会重新计算
  - 4. computed的依赖项是响应式数据并且变化了，但是如果 ( 计算的结果不变 )，应用也 ( 不会重新渲染 )
- 相关原理及分析地址
  - https:juejin.cn/post/6844904184035147790
  (1) computed只有在被访问时才会重新计算
    - 因为：在new Watcher是computed watcher时，即lazy=true时，在构造函数中没有立即执行get()方法，而是在计算属性被访问时触发computed的响应式get后，执行的get方法中回去调用computed getter函数
    - 之前：上面已经分析过了
  (2) computed具有缓存功能
    - 表现：表现为如果computed中的key被访问过，下次在访问不会再重新计算，而是直接返回之前计算好的值
    - 原理：
      - dirty=true，进行 watcher.evaluate() 执行computed的key对应的函数得到计算解结果
      - watcher.evaluate() 计算到结果后，又会将 dirty=false
      - 下次再访问到computed的key时，不会重新进行 watcher.evaluate() 的计算，而是直接返回之前计算好的结果，之前的值已经缓存在watcher.value中
```

### (4) watch

- watch 对象的 key 对应的 value 的类型
  - function --- 表示 key 变化时执行的函数
  - string ----- 表示 ( 方法名 ) 或 ('a.b') -> data.a 对象 .b 属性
  - object ----- 对象中一定要有 handler 方法，{ handler, immediate, deep, sync }
  - array ------ 以上的组合
  - 最终都会把不同类型的 handler 转换成函数，然后执行 vm.$watch(expOrFn, handler, options)
  - 官网说明：https:cn.vuejs.org/v2/api/#watch
- watch 对象的 value 是对象时，支持的属性
  - handler: watch 的回调函数，参数是 newValue, oldValue
  - deep：表示深度监听
  - immediate：表示立即执行 callback，不用等到 key 变化时才去执行
  - sync：表示 ( 同步 watch 对象中的 handler 先执行 )，( 普通的 watch 对象的 handler 后执行 )
- **watch 注意点**
  - 2022-10-06
  - 遇到问题: **当 watch 的值是一个嵌套的对象时，修改改对象的属性，watch 的回调是不会执行的**
  - 如何解决:
    - 1. 可以使用 watch 的对象模式，并设置 deep:true
    - 2. 在设置 watch 对象的 key 时，直接 a.b.c 取到需要改变的属性
  - 扩展: **data 的响应式不受嵌套对象深度的影响，即嵌套多深修改属性都会响应式**

```
watch 注意点
---

data() {
  return {
    obj: {
      obj2: {
        age: 10,
      },
    },
  };
},
watch: {
  "obj.obj2.age": function () { console.log(111); }, // --- age变化，watch回调会执行
  "obj.obj2": {
    handler: function () { console.log(222); }, // -------- age变化，watch回调不会执行
  },
  "obj.obj2": {
    handler: function () { console.log(333); }, // -------- age变化，watch回调会执行，因为设置了 deep: true
    deep: true
  }
}
```

### (5) nextTick

```
nextTick
- this.$nextTick()
- Vue.nextTick()
---

1. 作用
  - 在下次DOM更新循环结束后，执行延时回调
  - 在 ( 修改数据 ) 后，立即使用 nextTick 获取 ( 更新后的DOM )
  - 当你在 Vue 中更改响应式状态时，最终的 DOM 更新并不是同步生效的，而是由 Vue 将它们缓存在一个队列中，直到下一个“tick”才一起执行，这样是为了确保每个组件无论发生多少状态改变，都仅执行一次更新
2. 原理
  - 利用从 微任务 到 宏任务 的逐渐降级
  - promise -> mutationObserver -> setImmediate -> setTimeout
  - 扩展
    - 微任务
      - promise
      - process.nextTick
      - mutationObserver - 观察DOM节点的变化
    - 宏任务
      - setTimeout
      - setInterval
      - setImmediate
      - requestAnimationFrame 帧动画 ( 精确，流畅，tab隐藏就回结束 )
3. 使用
  - 1. 传入参数回调，在参数回调中获取最新的DOM ------------ 参数回调
  - 2. 返回一个promise，可以通过then的方式获取最新的DOM --- promise
  - 3. 可以使用 async 函数做包装 ----------------------- vue3中可以使用async
  - Vue.nextTick(function () { // DOM 更新了 })
  - Vue.nextTick().then(function () { // DOM 更新了 })
  - methods: { async increment() { await nextTick() // DOM 此时已经更新 } }
4. 案列
  - https://github.com/woow-wu7/vue2-research/blob/master/src/views/Loading.vue
5. 官网说明
  - https://cn.vuejs.org/api/general.html#nexttick
```

### (6) Object.defineProperty 的缺点

```
Object.defineProperty 的缺点
---

对象
- 问题：添加和删除属性，不会响应式，只会在修改属性时才会响应式
- 解决：
  - Vue.set()
  - vm.$set()

数组
- 问题
  - 下标修改：通过 数组下标 修改数组成员的值，不会响应式
  - 长度：修改数组长度时，不会响应式
- 解决
  - Vue.set()
  - vm.$set()
  - 利用 vue 重写的 7 种数组方法，然后手动的处触发响应式
    - push pop unshift shift splice
    - sort reverse
```

### (6) keep-alive 的原理

- keep-alive 是内置的 ( 抽象组件 )
- 抽象组件的特点：( 2 个特点 )
  - 1. 自身不会渲染成 DOM 元素，即不占据 DOM 元素
  - 2. 不在父组件链中，即抽象组件的 ( 父组件 ) 和 ( 子组件 ) 直接形成父子关系
- props
  - include
  - exclude
  - max
- 生命周期
  - activated
  - deactivated
- 缓存策略
  - LRU
  - latest recently used 最近最少使用
- 源码
  - src/core/components/keep-alive.js
- 扩展: 常见的缓存策略
  - LRU 最近最少使用 - 强调访问时间
  - LFU 最不经常使用 - 强调访问次数
  - FIFO 先进先出
  - 链接: [常见的缓存策略](https://github.com/woow-wu7/6-penetrate/blob/main/2-FRONTEND/JS/20-%E5%B8%B8%E8%A7%81%E7%9A%84%E7%BC%93%E5%AD%98%E7%AD%96%E7%95%A5/%E5%B8%B8%E8%A7%81%E7%BC%93%E5%AD%98%E7%AD%96%E7%95%A5.md)

### (7) diff 算法

- `总流程：el或template --> AST+optimize+generate --> render() --> createElement生成vnode --> vm.$update --> patch --> diff --> 生成真实的DOM`
- 分类：treeDiff componentDiff elementDiff
- 总体：**逐层比较，深度优先遍历**
  - 1. 节点是组件，走 componentDiff
       - 判断组件类型是否一样，根据组件名称和组件类型判断
         - 类型一样，按原策略逐层比较
         - 类型不一样，脏组件，暴力删除
  - 2. 节点是元素节点，走 elementDiff
       - 添加，删除，移动
  - 3. 具体比较细节
       - 判断 newVnode 和 oldVnode 是否是 ( 同一个虚拟节点 )，即 ( key 和 css 选择器 都要相同 )
         - 不是同一个虚拟节点 ---> 暴力插入新节点，删除旧节点
         - 是同一个虚拟节点
         - (1) 判断 newVnode 和 oldVnode 是否是同一个 ( 内存中的对象 )
           - 是 ---> 不做任何操作
           - 不是 -> 继续往下执行(2)
         - (2) newVnode 和 oldVnode 都只有 text 属性
           - text 相同 ---> 不做任何操作
           - text 不相同 -> 直接修改 DOM 为 newVnode 的 text
         - (3) newVnode 只有 children，oldVnode 只有 text
           - 1. 将 newVnode 的 children 插入到 oldVnode 对应的真实 DOM 的 前面
           - 2. 同时 删除 oldVnode 对应的 DOM 中的 text
         - (4) newVnode 和 oldVnode 都有 children
           - 四个指针 + 递归
           - 1. 新前与旧前比较 -----> 命中-指针后移，按上面的策略进行 patch，没命中往下走，执行(2)
           - 2. 新后与旧后比较 -----> 命中-指针前移，按上面的策略进行 patch，没命中往下走，执行(3)
           - 3. 新后与旧前比较 -----> 命中-旧前指针后移动，新后指针前移，需要移动节点，把 ( 新前 ) 移动到 ( 旧后之后 )；没命中往下走，执行(4)
           - 4. 新前与旧后比较 -----> 命中-新前指针后移，旧后指针前移，需要移动节点，把 ( 新前 ) 移动到 ( 旧前之前 )
           - 指针：前往后移，后往前移

### (8) 用 index 作为 key 的缺点

- key 的作用：用于 diff 算法中的唯一标记
- index 作用为 key 的缺点：
  - 描述：比如当渲染 list 为 3 个 input 框，在每个 input 框中输入 123，当我们删除 2 时，此时 3 的 input 框会变成 2
  - 原因：因为删除 2 后，原来 3 的 index 变成了 2，(key) 和 (css 选择器 input) 都没变，认为还是之前的 2
- 总结
  - 在 静态列表 中，可以使用 index 作为 key
  - 再 动态列表 中，不能使用 index 作为 key，原因如上
- vue：本项目/test-vue/key/test-key.html
- react：https://juejin.cn/post/7029703494877577246

### (9) vue style 标签中的 scoped 的作用

- `结合 (17) 来一起看`
- scoped
  - 是 html5 新增加的属性
  - 是一个 boolean 值，表示 ( 则样式仅仅应用到 style 元素的 - 父元素及其子元素 )
- vue 中的 scoped
  - 作用：样式只作用于该组件，和其他组件即使是同一个 class 类名，也互不影响
  - 原理：
    - 通过给 ( HTML 元素节点添加唯一的属性 )，然后通过 ( css 属性选择器 ) 选中该节点
    - 1. 在 html 的 css 选择器对应的标签节点中，添加自定义属性 ( data-v-hash 值 )
    - 2. 在 css 选择器 - 添加 ( **属性选择器** ) - ( a[data-v-hash 值] )
    - 3. 这样就可以选中唯一的 ( 类 class 的选中的节点 - 并且属性是 data-v-hash 值的 ) 节点
- 扩展
  - **css 选择器的权重**
  - !important > 内联(行内)样式 > id > ( class 类, 伪类, 属性选择器 ) > ( 标签元素选择器，伪元素选择器 ) > ( 通配符选择器，关系型选择器 )
- 案例

```
<template>
  <div class="loading">
</template>
<style scoped>
  .loading {
    border: 2px solid blue;
  }
</style>


1. html处理为
- 添加自定义属性 data-v-hash 值
<div data-v-ffa58c1c class="loading">

2. css处理为
- 属性选择器 loading[data-v-hash值]
loading[data-v-ffa58c1c] {
  border: 2px solid blue;
}
```

### (10) vue2 中 v-if 和 v-for 的优先级

- **注意：在 vue3 中修改了优先级顺序，v-if > v-for 了，所以不能写在同一个标签上，但无论 vue3 还是 vue2 都不要把 v-if 和 v-for 写在同一个元素上**，
- 问题
  - 问题: 为什么不要把 v-for 和 v-if 写在同一个元素上？
  - 回答: 因为 vue2 源码中是先遍历在进行判断，即使我们只渲染列表中一小部分元素，当 v-if 改变值，导致重渲染的时，就会遍历整个列表，这会比较浪费
  - 扩展: vue3 中则完全相反，v-if 的优先级高于 v-for，所以 v-if 执行时，它调用的变量还不存在，就会导致异常
  - 如何解决: 1.将 v-if 提升到外部 2.计算属性，过滤后在渲染
- 处理时机
  - ( v-if,v-for ) 指令的处理发生在 ( 模版编译阶段 )
- 优先级
  - vue2: 当 v-if 和 v-for 一起使用时，优先级 ( v-for > v-if )
  - vue3: v-if > v-for
  - 原因
    - 因为
      - 在源码中，在进行 if 判断的时候，v-for 是比 v-if 先进行判断的
      - 文件位置：src/compiler/codegen/index.js
    - ( 模版 template ) 最终会被编译为 ( render 函数 )
      - v-for 在编译时会被编译成 ( \_l 函数 )，即 renderList 方法
      - v-if 在编译时会被编译成 ( 三元表达式 )；不命中的情况会创建一个空的 vnode 即 ( 没有文本的注释节点 )
  - 具体被编译结果如下

```
1. template
<div>
	<div v-for="value in [1,2]" v-if="true"></div>
</div>


2. 编译结果
- 先v-for生成每个节点，在通过v-if进行判断
function render() {
  with(this) {
    return _c('div', _l(([1, 2]), function (value) {
      return (true) ? _c('div') : _e()
    }), 0)
  }
}

3. 编译网站
https://v2.template-explorer.vuejs.org/

4. 扩展
v-if 和 v-show 的区别
v-if ---> 编译阶段，控制是否渲染
v-show -> 运行时阶段，控制样式，相当于该元素 ( 默认的display ) 和 ( display:none ) 之间切换
```

- 避免：避免在同一元素上同时使用 v-for 和 v-if
- 解决：
  - 1. 如果是对列表进行过滤，可以使用 ( 计算属性 ) 将要渲染的节点过滤后，在交给 ( v-for ) 去渲染
  - 2. 如果是安条件渲染，可以将 ( v-if 提高到容器元素上 )，在容器元素内部再使用 ( v-for )
  - 官网：https://cn.vuejs.org/v2/style-guide/#%E9%81%BF%E5%85%8D-v-if-%E5%92%8C-v-for-%E7%94%A8%E5%9C%A8%E4%B8%80%E8%B5%B7%E5%BF%85%E8%A6%81
- 资料
  - https://juejin.cn/post/6844904183619944462
  - https://juejin.cn/post/6941995130144587789
- v-for
  - 可以遍历 ( 数组，对象，字符串，数字, Iterate 接口的数据 )
  - Array | Object | number | string | Iterable (2.6 新增)
  - v-for 源码位置：本项目/src/core/instance/render-helpers/render-list.js
- 案例
  - 本项目/test-vue/v-if+v-show/vIf-vShow.html

### (11) template -> render 编译的过程

- 模版编译分为三个阶段：parse 解析阶段，optimize 优化阶段，generate 代码生成阶段
- 1. parse
  - 解析阶段
  - 将 template 转成 AST
  - 通过 ( 栈 ) 来保证 ( 树形结构 )
- 2. optimize
  - 优化阶段
  - 对 ( 静态节点 和 静态根节点 ) 做优化
    - 问题：
      - 问题：什么是静态节点和静态根节点？
      - 回答：
        - 静态节点：有一种节点，在首次渲染后，无论状态怎么改变，它都不会变的节点叫 ( 静态节点 )，( 静态节点只包含纯文本，不包含任何变量 )
        - 静态根节点：就是所有的节点都是静态节点的 ( 父节点 )
    - 问题：
      - 问题：如何识别 静态节点 ？
      - 回答：如果一个 dom 元素标签中，只含有纯文本，而不含任何变量，即为 ( 静态节点 )
  - 如何优化
    - 整个过程：template(HTML) -> AST -> render -> Vnode -> patch ( diff 对比+生成真实 DOM )
    - 具体优化：
      - 因为 ( 静态节点和静态根节 ) 点不会变化，所以是 ( 不需要做 diff 算法比对 ) 的，所以不做 diff，提升性能
      - 具体就是两点
        - 1. 在 AST 中找出所有静态节点并打上标记；
        - 2. 在 AST 中找出所有静态根节点并打上标记；
  - 扩展
    - 问题：react 中有 shouldComponentUpdate，为什么 vue 中不需要
    - 回答：
      - 因为 vue 是基于 ( 模版 )，即在 ( 模版编译阶段 ) 就知道哪些节点不需要做 diff 算法比对，因为静态节点和静态根节点不需要做 diff 算法
      - 即模版编译节点的 optimize 阶段要做的事情
  - 扩展
    - patchFlag: vue3 对动态节点做了优化，做 pathFlag 标记动态节点，更新组件 template 中的动态节点部分，而不是真个组件一起更新
    - 连接: NOTE/VUE3.md
- 3. generate
  - 代码生成阶段
  - 主要做的事情：
    - 生成 render 函数，供组件在挂载时调用
    - 即 ( AST -> render )
  - render 函数有几种？两种
    - 一种是：手写 render 函数时，直接调用手写的 render
    - 另一种：如果没有手写的 render，就会把 template 编译成 render
  - 具体过程
    - 递归
    - 从顶向下依次递归 AST 中的每一个节点，根据 ( 不同的 AST 节点类型 ) 创建 ( 不同的 VNode 类型 )

### (12) 事件修饰符的原理

- 常见的事件修饰符
  - stop ---------- 阻止传播，相当于 event.stopPropagation
  - prevent ------- 阻止默认，相当于 event.preventDefault
  - capture ------- 在捕获阶段触发
  - once ---------- 只触发一次
  - passive ------- 不会阻止 event.preventDefault
  - self ---------- ( 绑定事件的节点 ) 和 ( 事件触发的节点 ) 要是 ( 同一个节点 ) 才会触发
  - left ---------- 鼠标左键触发
  - right
  - middle

```
1
addEventListener
target.addEventListener(type, listener|具有handleEvent方法的对象[, useCapture｜{capture,once,passive}]);

2
绑定事件的三种方法
- HTML中通过 ( onClick="要执行的代码" )
- js中通过 DOM节点.onclick=function(){}
- js中通过 DOM节点.addEventListener('click', listener, useCapture)
- 优缺点
  - HTML
    - HTML标签中使用使用 ( on+事件名="需要执行的代码" )
    - 1. 只能在 ( 冒泡阶段 ) 触发
    - 2. 违反了 HTML 和 JS 分离的原则
  - 事件属性
    - 1. 只能在 ( 冒泡阶段 ) 触发
    - 2. 同一个事件，只能绑定 ( 一个监听函数 )，不能绑定多个
  - addEventListener
    - 1. 能指定事件触发的阶段，第三个参数是对象时，通过 capture 指定是否在捕获阶段触发，false则在冒泡阶段触发
    - 2. 同一个事件可以绑定多个监听函数
  - 总结
    - 推荐使用 addEventListener

3
事件修饰符的原理
- 主要依靠：( 模版编译 ) 原理，即在模版编译时做相关处理
- 1. prevent stop 在 ( 模版编译 ) 时，会直接在 ( 事件监听函数 ) 中添加 event.preventDefault 和 event.stopPropagation
- 2. capture，once，passive 在 ( 模版编译 ) 时，会在 ( 事件名前 ) 增加 ( 标识~!& )
  - capture ------> !
  - once ---------> ~
  - passive ------> &
  - 具体
    - html -------> <div @click.stop.prevent.once.capture></div> )
    - render -----> function render() { with(this) { return _c('div', [_c('div', { on: { "~!click": function ($event) {} } })]) } }
- 3. 键盘事件同理
```

### (13) $attrs 和 $listeners 和 $slots/$scopedSlots

- vm.$attrs
  - 包含：没有在 ( props ) 中声明的 ( attribute ) 属性，( 比如传入了 3 个属性，而子组件中 props 只声明了一个属性，则另外两个在 $attrs 中 )
  - 不包含：style 和 class
  - 传入组件内部：可以通过 v-bind="$attrs" 传入内部组件——在创建高级别的组件时非常有用
  - 案例：本项目/test-vue/$attrs/$attrs-$listeners.html
- vm.$listeners
  - 包含：了父作用域中的 v-on 事件监听器
  - 不包含：(不含 .native 修饰器的) v-on 事件监听器
  - 传入组件内部：可以通过 v-on="$listeners" 传入内部组件——在创建更高层次的组件时非常有用
  - 案例：本项目/test-vue/$attrs/$attrs-$listeners.html
- 注意点：
  - 如果 ( 事件 ) 是通过 ( v-bind ) 的方式传递，仍然是一个 ( 属性 )，走 props 和 $attrs
  - 如果 ( 事件 ) 是通过 ( v-on ) 的方式传递，才会走 $listeners
- 扩展
  - 问题：vue 传递数据的方式
  - 回答：
    - props $attrs $listeners $slots $scopedSlots
    - vm.$emit
    - provide/inject -------- 不保证是响应式的
    - vuex router
    - eventbus 数据总线，比如原型链继承
    - $parent --------------- 父实例 - ( 例子:本项目/test-vue/test-$parent-$children.html )
    - $children ------------- 当前实例的直接子组件(数组) - (数组中的直接子组件)不能保证顺序，不是响应式 - ( 注意在vue3中$children 已经被删除，可以用 Template Refs 获取 )

### (14) 为什么大 Vue 不使用 class 而是使用构造函数呢？

- 因为 vue 可以把不同的方法挂载原型链上，把实现代码单独抽离成文件，方便管理
- 而 class 的话，所有非静态属性(原型属性)都必须在 class 内部声明，不利于大型工程文件管理

### (15) 手写 v-model 双向数据绑定

- 详见：本项目/test-vue/v-model/handwrite-v-model.html

### (16) 环境变量

- 详见 1
  - (5) 环境变量
  - https://github.com/woow-wu7/8-divine
- 案例
  - https://github.com/woow-wu7/4-joyo-lingjing-h5/blob/main/.env

### (17) vue 中，当父子组件都添加了 scoped 时，如何在父组件中修改子组件的样式？

- `结合 (9) 来一起看`
- 关键词：
  - ( >>> ) ( /deep/ ) ( ::v-deep ) ( :deep(){} )
  - scoped
- 扩展问题：vue 中 scoped 的原理，详见 (9)

```
vue中，当父子组件都添加了scoped时，如何在父组件中修改子组件的样式？
---
1
问题描述
- 因为
  - 1. 在vue组件中style通过 ( scoped ) 可以在 ( 本组件的所有元素上添加 data-v-hash )
  - 2. 当 父组件和子组件 都添加了 scoped 时
    - 子组件的 ( 根元素 ) 上会有 ( 两个 ) data-v-hash，一个是自己的，一个是父组件的
    - 子组件的 ( 其他元素 ) 上只有 ( 一个 ) data-v-hash，是自己的
- 所以
  - 在父子组件都添加了scoped时，父组件就不能通过 ( class类名 )，来选中 ( 子组件除了根元素以外的其他元素 )，因为 hash 不一样
- 如何解决
  - 通过 >>> /deep/ ::v-deep :deep() 来解决
  - 推荐使用 :deep(css选择器) {}
---
(1) deep
- 表现
  - css 是 >>>
  - scss 是 /deep/
  - scss 是 ::v-deep -------- 注意：这种写法已经被弃用，使用 :deep(){} 代替
  - scss 是 :deep(){}
- 写法
  - 写法上一共有 4 种写法

<!-- 写法4 使用:deep(<inner-selector>) -->
<style lang="scss" scoped>
  :deep(.ant-card-head-title){
    background: yellowgreen;
  }
</style>

<!-- 写法1 使用::v-deep -->
<style lang="scss" scoped>
  ::v-deep .ant-card-head-title{
    background: yellowgreen;
  }
</style>

<!-- 写法2 使用>>> 操作符-->
<style scoped>
>>>.ant-card-head-title{
  background: yellowgreen;
}
</style>

<!-- 写法3 使用/deep/ -->
<style scoped>
 /deep/.ant-card-head-title{
  background: yellowgreen;
}
</style>
---
(2) 在vue文件中，使用不带 scope 的 style
```

### (18) 虚拟 DOM 的优缺点？

- 优点
  - 跨平台 ( node 和浏览器中都可以，node 中没有真实的 DOM，便于实现服务端渲染等 )
  - 保证性能下限
  - 无需手动操作 DOM
- 缺点
  - 无法进行极致优化

### (19) provide 和 inject 的原理？

- [链接-vue2 源码分析-provide 和 inject](https://github.com/woow-wu7/7-vue2-source-code-analysis/blob/main/src/core/instance/inject.js#L18:17)
- [链接-资料](http://www.kangchangyi.com/article/Vue/provide%E3%80%81inject%E7%9A%84%E5%AE%9E%E7%8E%B0%E5%8E%9F%E7%90%86.html#%E5%8E%9F%E7%90%86)
- [vue2 官网](https://v2.cn.vuejs.org/v2/api/#provide-inject)
- [vue3 官网](https://cn.vuejs.org/api/options-composition.html#inject)

```
provide 和 inject 原理解析
---

1. 在 option 每个组件配置中可以声明 provide 选项对象
    - key是要传入inject中对应的key
    - value是可以被inject获取的值
2. 在初始化时，Vue 会在每个 vm 挂载 _provided 对象，即 vm._provided
    - key和value都和provide中的一一对应
3. 在初始化时，Vue 会遍历组件中的 inject (数组或对象) 中的 key，会去当前组件父组件的 vm._provided 找
    - 找到，直接返回
    - 没有找到，则通过 vm.$parent 继续往上找，直到找到根组件为止
      - 找到后将值返回作为inject的返回值
      - 没有找到则使用默认值作为inject的返回值
```

```
provide 和 inject 注意点
---

遇到问题: provide和inject并不保证响应式
解决方案: provide的属性值用 computed 进行包装
官网说明: https://cn.vuejs.org/guide/components/provide-inject.html#working-with-reactivity
```

### (20) v-model 和 .sync 的区别？

- v-model
  - 相当于 <my-component :value="value" @input="value = $event.target.value" >
- .sync
  - 相当于 <my-component :value="msg" @update:value="(val) => value = val" >
- 两者的区别
  - v-model 主要用于 input，textarea，并且一个组件只能有一个 v-model
  - .sync 一个组件可以有多个 .sync
- 资料
  - https://juejin.cn/post/6943488981703065614
  - vue3 中使用 v-model https://www.jianshu.com/p/df114269d751
  - vue2 官网 https://v2.cn.vuejs.org/v2/guide/components-custom-events.html#sync-%E4%BF%AE%E9%A5%B0%E7%AC%A6
  - vue3 中有变化

### (21) v-permission 自定义指令实现

- 链接: https://github.com/woow-wu7/6-penetrate/blob/main/2-FRONTEND/VUE/v-permission-directive.html

# 相关链接

- https:github.com/woow-wu7/7-vue2-source-code-analysis/blob/main/src/core/observer/watcher.js
