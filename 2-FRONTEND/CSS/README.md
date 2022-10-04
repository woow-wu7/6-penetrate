# CSS

## 一些单词

```
ellipsis 省略号
orient 朝向 向东
unordered 无序的 adj // ordered有序的
parallelogram 平行四边形
paint 油漆 绘制 // repaint重绘 reflow重排
aspect 外观
```

## (1) position

- static 默认值
- inherit 继承，从父元素继承 position 的值
- relative 相对定位，相对于 - 自己正常位置进行定位
- absolute 绝对定位，相对于 - 距离最近的具有定位属性的父元素
  - 问题: 什么是具有 定位属性 的父元素？
  - 回答: 就是除了 position: static 以外的定位属性都可以
- **fixed** 基于窗口定位 - `注意transform的影响，如果祖先元素设置了transform属性，则fixed定位基于该祖先元素，而不是视口即整个窗口定位`
- **sticky** 粘性定位

### (1.1) position: sticky 粘性定位

- 定位的基准点
  - 相对于 ( 具有滚动条的，距离最近的祖先元素 )
  - 如果不存在这样的祖先元素，则是基于 ( viewport ) 视口进行定位
- 表现上来看
  - position:sticky = position:fixed + position:relative
- 详见
  - 1-position:sticky.html

### (1.2) transform 和 position:fixed 的关系

- position:fixed
  - 1. 一般情况下，是基于 ( viewport 视口 - 一般情况下是整个窗口 ) 进行定位
  - 2. 但是，如果 ( 祖先元素设置了 transform 为非 null ) 时，( position:fixed ) 就变成了 ( 基于该祖先元素定位 )
- 详见
  - 4-transform-fixed

## (2) display:none 和 visibility:hidden 的区别

- 区别
  - display:none ------- 隐藏后，不占据原来的位置
  - visibility:hidden -- 隐藏后，占据原来的位置
- 共同点:
  - 真实的 DOM 仍然存在，只是页面上不显示而已，只是通过 css 的方式隐藏
- 对比
  - 伪元素: 不在 DOM 中，相当于当前元素的第一个子元素

## (3) display: inline-block; 存在间隙的原因?

- 原因: ( 标签 ) 之间存在 ( 空白字符 )
- 解决:
  - 1. 各个标签不要换行，紧贴着写
  - 2. 父元素设置 font-size:0; 然后子元素在设置自己需要的字体大小，因为空白字符是字符，所以设置 font-size 有效

### (4) css 画三角形 triangle

- 问题
  - 问题: 当 div 的 width 和 height 设置为 0 时，同时将四边的 border 设置为不同颜色，为什么会出现 4 个三角形?
  - 回答: 因为 width 和 height 是 0，border 的四边相互遮住了
- 实现
  - 将 width 和 height 设置为 0
  - 将 border 设置为透明，然后单独设置一边的 border 即可
- 特点
  - 底边长度: 三角形底边长度 = border 长度的两倍
  - 高度: 三角形的高度 = border 的长度
  - 相反: ( border 显示的方向 ) 和 ( 三角形的朝向 ) 是 ( 相反的 )，border-bottom 是向上的三角形

```
height: 0;
width: 0;
border: 100px solid transparent;
border-bottom: 100px solid red;
```

### (4.1) css 画扇形

```
css实现扇形
- css实现扇形的方式和实现三角形的方式差不多
- css三角形的基础上 + border-radius: 100%;
---

#sector {
  width: 0;
  height: 0;
  border: 100px solid transparent;
  border-bottom: 100px solid red;

  border-radius: 100%;
}
```

### (5) 盒模型

- 标准盒模型
  - box-sizing:content-box;
  - width 和 height 只包含 ( content )
- IE 盒模型
  - box-sizing:border-box;
  - width 和 height 包含 ( content padding border ) 三者之和

### (6) 移动端 1px 物理边框 ？

- 前置知识
  - 公式: ( `物理像素 = css 像素 * 像素比` ) - 像素比: 即 几倍屏
  - 如何获取屏幕像素比: `window.devicePixelRatio`
- 实现
  - 1. 给 div 盒子设置 ( 伪元素 - 相当于当前元素的第一个子元素，不在 DOM 中 )，( 高度 1px，绝对定位在盒子底部 )
  - 2. 通过 @media screen and (-webkit-min-device-pixel-ratio: 2) 命中几倍屏
  - 3. 然后通过 transform: scaleY(0.5) 缩放 伪元素 ( 2 倍屏缩小 0.5，3 倍屏缩小 0.333 )

```
.container {
  position: relative;
}
.container::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: red;
}

@media screen and (-webkit-min-device-pixel-ratio: 2) {
  .container::after {
    transform: scaleY(0.5);
  }
}

@media screen and (-webkit-min-device-pixel-ratio: 3) {
  .container::after {
    transform: scaleY(0.33);
  }
}
```

## (7) em 和 rem

- 相同点
  - 两者都是 ( 相对单位 )
- 不同点
  - **em**
    - em 作为 font-size 属性的单位时 ---> 1em 表示的是 ( 父元素 ) 的 font-size 大小
    - em 作为其他属性的单位时 -----------> 1em 表示的是 ( 自身 ) font-size 的大小
  - **rem**
    - 特点
      - rem 是根据 html 元素的 font-size 作为基准
      - 1rem = html 的 font-size 的大小
    - 前置知识
      - `物理像素 = css 像素 * 像素比(几倍屏)`
      - **deviceWidth/ui 设计稿的总宽度 = 某元素的实际宽度/该元素 ui 宽度**
    - 实现原理
      - 动态计算 html 元素的 font-size
        - 1. 通过 js 方式 --> document.documentElement.style.fontSize = document.documentElement.clientWidth / 750 + 'px'
        - 2. 通过 css 方式 -> html{ font-size: 100vw /750 }

## (8) block inline inline-block 三者的区别 ?

- 常见的 block 元素 --------- 设置 width 和 height 有效
  - form
  - table
  - p
  - div
  - h1-h6
  - ul li
- 常见的 inline 元素 -------- 设置 width 和 height 无效
  - span
  - a
- **常见的 inline-block ----- 设置 width 和 height 有效**
  - input
  - textarea
  - select
  - img

## (9) css 选择器

- **元素型选择器**
  - Element 元素选择器
  - 通配符选择器
  - #id 选择器
  - .类选择器
- **关系型选择器**
  - E > F 子选择器
  - E F 后代选择器
  - E+F 相邻选择器，选择符合条件的 ( 相邻的兄弟元素 )，( E 元素后相邻的兄弟元素 F )
  - E~F 兄弟选择器，选择符合条件的 ( 所有兄弟元素 )，不强调相邻 ( E 元素后面的所有兄弟元素 )
- **属性选择器**
  - E[att]
  - E[att="val"] att 属性值是 val 的元素
  - E[att~="val"] 选择具有 att 属性且属性值其中一个等于 val 的 E 元素（包含只有一个值且该值等于 val 的情况）
  - E[att^="val"] 开头：选择 att 属性以 val 开头的元素
  - E[att$="val"] 结尾
  - E[att*="val"] 包含
- **伪类伪元素选择器**
  - 伪类选择器
    - E:hover
    - E:focus
    - E:link
    - E:active
    - E:visited
  - 伪元素选择器
    - E::before
    - E::after

### (9.1) css 选择器的权重

- !important > 内联(行内)样式 > id > ( class 类, 伪类, 属性选择器 ) > ( 标签元素选择器，伪元素选择器 ) > ( 通配符选择器，关系型选择器 )

## (10) @import 和 link 的区别？

- 类型
  - html：link 是 html 标签，除了加载 css，link 标签上还具有其他属性 rel 属性
  - css：@import 是 css 语法，只有导入样式的作用
- DOM 可操作性
  - js 可以操作 DOM，而 link 标签属于 DOM;
  - js 不能操作 @import
- 权重
  - link 标签引入的样式 权重 > @import 引入的样式
- 加载顺序
  - link：加载 css 和页面一起加载
  - @import：页面加载完成后，再加载 css
- 兼容性
  - link 是 html 标签
  - @import 是 css2 的语法，ie5 以上才兼容，兼容性比较差
- 总
  - 总体上 link 比 @import 好

## (11) HTML5 的一些新特性

- 新的语义化标签
  - section
  - header
  - footer
  - aside
  - main
  - nav
- 新的媒体标签
  - video
  - audio
- 新的绘画标签
  - canvas
  - svg
- 拖放
  - drag
  - drop
- 本地存储
  - localStorage
  - sessionStorage
- 地理位置
  - GeoLocation
- webWorker
- webSocket
- 新的表单控件
  - date
  - time
  - email
  - url
  - search

## (12) pointer-events 用 css 方式设置 ( 事件穿透 )

- 作用：可以设置 ( 事件穿透 )
- 具体：指定在什么特定的情况下，target 可以设置为 ( 鼠标事件 ) 的 ( target )
- 详细
  - pointer-events: none; ------- 表示 ( 该 css 选择器对应的 target 永远不会成为鼠标事件的 target )，即不会对 ( 鼠标事件进行响应 )
  - pointer-events: auto -------- 默认值，对鼠标事件进行响应
  - pointer 是 指针 的意思

## (13) 如何修改 transform 变换时的原点？

- 原点
  - 默认原点: transform 变换时，默认的原点是 ( 中心点 )
  - 修改原点: transform-origin 属性可以 ( 修改原点 )
- transform-origin
  - transform-origin: x-axis y-axis z-axis;
  - 单位：可以是 百分数，px，top 等等

## (14) css 设置小于 12px 的字体

```
1. 前置知识
- 浏览器上能设置的最小字体是 12px，当小于12px的字体会当作12px来处理

2. 解决方案
- zoom
- transform: scale() + transform-origin: left;


zoom
- zoom表示变焦，可以改变页面上元素的尺寸
- zoom:50% 和 zoom:0.5 都表示缩小到原来的一半


transform
- transform: scale(0.5)
- transform-origin: left;
- 注意：
  - 出现问题：transform: scale(0.5) 进行字体缩放后，字体虽然变小了，但是位置缺变化了
  - 分析原因：因为transform的操作，默认的 ( 原点 ) 是 ( 正中心位置 )
  - 如何解决：transform-origin: left;
  - 扩展: 结合13中 ( transform-origin ) 改变原点来学习
- 额外知识
  - 描述：transform 是 ( 不会 ) 引起 ( reflow回流 ) 的，只会 ( repaint重绘 )
  - 原因：
    - 浏览器渲染会经过 parseHTML -> parseStylesheet -> evaluateScript -> layout -> paint -> composite
    - 分层
      - transform ------------ 是在 composite合成层
      - width，left，margin --- 是在 layout 层，不在同一层
      - 分层的目的: 是为了减少重绘制的时间
    - GPU加速: transform还能开启 GPU 加速
```

## (15) 单行省略号 和 多行省略号

```
单行省略号
---
overflow: hidden;
text-overflow: ellipsis; // 文本溢出显示省略号，ellipsis是省略号的意思
white-space: nowrap;
```

```
多行省略号
---
overflow: hidden;
text-overflow: ellipsis; // 前面两个属性和单行省略号相同

display: -webkit-box;
-webkit-box-orient: vertical; // 指定朝向是垂直方向上
-webkit-line-clamp: 2; // 指定多少行后显示省略号
```

## (16) ul 和 ol 的区别？

- 区别
  - ul 无序列表 -------- unordered list 无序列表
  - ol 有序列表 -------- ordered list 有序列别
- 记忆
  - u 是 unordered 的缩写
  - o 是 ordered 的缩写
- 问题
  - 问题: 去除 ul 和 ol 的 ( 默认样式 )
  - 回答: `list-style: none;`

## (17) css 实现向右的箭头

- border-top + border-right
- transform: rotate(45deg)

## (18) css 实现平行四边形

- transform: skew(x-angle,y-angle)
  - x-angle 水平倾斜的角度
  - y-angle 垂直倾斜的角度
- 详细：https://juejin.cn/post/7029703494877577246

## (19) repaint 重绘 和 reflow 重排(回流) 和 合成

- repaint 重绘
  - 对 DOM 的修改只导致了 ( 样式 ) 的变化，并没有改变 ( 几何属性 )，浏览器不需要从新计算几何样式，而是从新绘制新的样式，这个过程叫做重绘 repaint
  - 跳过了 ( 布局树 ) 和 ( 建图层树 )
- reflow 重排
  - 对 DOM 的修改引发了 DOM 几何尺寸的变化(宽高，隐藏等)，浏览器需要 ( 重新计算 ) 元素的几何属性
  - 同时 ( 其他元素的集合属性 和 位置也将受到影响 )，浏览器需要重新将计算结果绘制出来，这个过程叫做回流 reflow
- composite 合成
  - 就是更改了一个既不要 ( 布局 layout ) 也不要 ( 绘制 paint ) 的属性，那么渲染引擎会跳过布局和绘制，直接执行后续的 ( 合成 composite ) 操作，这个过程就叫合成
- 特点
  - reflow 一定会 repaint
  - repaint 不会定会 reflow
- **常见的会引起 ( 重排-回流 ) 的操作有哪些？**
  - 页面首次渲染
  - 浏览器窗口大小变化
  - 元素尺寸和位置变化 width height position
  - fontSize
  - 显示/隐藏元素
  - 添加/删除元素
  - 激活 css 伪类
  - offsetWidth, width, clientWidth, scrollTop/scrollHeight 的计算， 会使浏览器将渐进回流队列 Flush，立即执行回流
- **只会 composite 合成的属性，不会重绘重排回流**
  - transform
  - opacity
  - filter
  - 所以动画最好使用 transform opacity 等属性来实现，结合 32 一起看

## (20) sticky-footer 效果

- 效果定义
  - 当内容不足一屏时，保持在屏幕最底部
  - 当内容超过一屏时，在内容的最底部，随着内容滚动
- 实现方式
  - padding-bottom + margin-top
  - flex 布局
  - calc 动态计算
- 详见 `14-sticky-footer-**.html`

```padding-bottom + margin-top
padding-bottom + margin-top
- 特点: 适合 ( footer高度固定 ) 的情况，兼容性好
---

section{main footer}
section 和 其上的所有父元素都要设置 height: 100%;
main 的 box-sizing: border-box; 因为默认是标准盒子
main ------> min-height: 100%; padding-bottom: 200px; box-sizing: border-box;
footer ----> margin-top: -200px;
```

```flex布局
flex布局
- 特点: 适合 ( footer高度不确定 ) 的情况
---

section{main footer}
section ---> display: flex; flex-direction: column; min-height: 100%; 同时 section 以上的父元素都要设置 height: 100%才可以
main ------> flex: 1;
```

```calc
calc
- 特点: 也只是适合于 ( footer 高度固定 ) 的情况
---

section{main footer}
section 和其上的所有父元素都要设置 height: 100%;
main ------> min-height: calc(100% - footer 的高度) // 这里一定要注意是 min-height，不能是height，不然main的内容会溢出
```

## (21) 水平垂直居中布局

- 绝对定位
  - 知道盒子的大小: margin: -高度的一半 -宽度的一半;
  - 不知道盒子的大小: transform: translate(-50%, -50%);
- flex
  - 父 display: flex;
  - 父 justify-content: center;
  - 父 align-items: center;
- table-cell 布局
  - 父 display: table-cell;
  - 父 text-align: center;
  - 父 vertical-align: middle;
  - 子 display: inline-block;
- grid 布局
  - 父 display: grid;
  - 子 justify-self: center; align-self: center;

## (22) 双栏布局

- 绝对定位
- flex 布局
- float
  - container{left, right} 容器及以上的元素高度都设置为 100%;
  - left ---> float: left; height: 100%;
  - right --> margin-left: left 的宽度；其实可以不设置
  - 记得要清楚浮动带来的影响

## (23) 三栏布局(圣杯布局) - 中间自适应，两边固宽

- float
  - container{left, right} 容器及以上的元素高度都设置为 100%;
  - left ----> float: left;width=200px;
  - right ---> float: right;width=200px;
  - center --> margin-left: 200px; margin-right: 200px; 其实可以不设置
- 注意点
  - 标签的书写顺序是 left right center，将 center 放在最后面
  - ( center ) 的设置 ( margin-left+marin-right ) 可以使用 ( overflow: hidden ) 来代替

## (24) BFC 块级格式化上下文

- BFC 是 block formatting context 块级格式化上下文的缩写
- 具有 BFC 特性的元素，可以看作是隔离了的 ( 独立元素 )，容器中的元素不会在 布局上 影响其他元素
- **如何触发 BFC？** 共 5 种方法
  - 根元素
  - 浮动
  - 绝对定位
  - overflow 除了 visible 以外的值，比如 hidden，scroll，auto
  - display: flex table-cell inline-block
- BFC 的应用
  - 去除 margin 重叠 - 使相互影响的 ( 两个标签位于两个 BFC 中 )
  - 清除浮动 - 解决 ( 浮动元素的父元素高度塌陷 ) 的问题

## (25) title 和 alt 的区别？

- title
  - title 可以作为标签，也可以作为标签的属性
  - 标签: title 作为标签，用在 head 标签中，表示 ( 网页的标题 )
  - 属性: title 作为属性，在 `<a title="">` 标签中表示 ( hover 时的文字说明 )，注意是 a 标签
- alt
  - alt 只能作为标签属性
  - 用于 ( img input textarea )，表示 ( 标签加载失败后的 文字说明 )

## (26) filter: drop-shadow()

- 具有 alpha 通道的阴影
- 语法
  - `filter: drop-shadow(offset-x offset-y blur-radius spread-radius注意阴影大小这个参数大多数浏览器不支持 color)`
- 注意 drop-shadow() 和 box-shadow 的区别
  - box-shadow 属性在元素的整个框后面创建一个矩形阴影
  - drop-shadow() 过滤器则是创建一个符合图像本身形状 (alpha 通道) 的阴影

```
drop-shadow
---

box-shadow: h-shadow v-shadow blur spread color inset;

drop-shadow(offset-x offset-y blur-radius spread-radius color)
- 属性基本和box-shadow一样
- 注意
  - drop-shadow 是一个函数
  - 第四个设置项 spread-radius 阴影大小，大多数浏览器不支持
- 案例
  - FRONTEND/CSS/19-drop-shadow.html
```

## (27) filter: brightness()

- 表示让图表更亮或者更暗
- filter: brightness(amount)
  - 参数 amount 是数量的意思，是一个数值

## (28) 图片等比例放大缩小

- 详见 `FRONTEND/CSS/20-image-equal-ratio.html`

```
图片等比例放大缩小 - 三种方法
---

1
width: 100%;
height: auto;

2
width: 100%;
height: 0;
padding-bottom: 75%; // 宽高比4:3

3
width: 100%;
aspect-ration: 4/3;
// 宽高比4:3
// aspect-ratio: <width-ratio>/<height-ratio>
// aspect 是外观的意思
```

## (29) :nth-of-type 伪类

- p:nth-of-type(2)
  - p:nth-of-type(2) 命中的是父元素的子元素中的 - p 标签中的第二个 p 标签
- p:nth-child(2)
  - p:nth-child(2) 命中的是父元素的第二个子元素，注意 ( 父元素的第二个子元素类型 ) 必须和 ( 伪类调用者的类型 ) 一致才会命中
- 详见: `FRONTEND/CSS/21-nth-of-type.html`

## (30) :not() 伪类

```
:not(.child1) {
  /* 选中除了 .child1 的元素 */
  color: red;
}
```

## (31) word-wrap 和 word-break

```
word-wrap: break-word; 整个单词一起换行
word-break: break-all; 单词内换行
```

## (32) transform 为什么不会引起 回流(重排) ？

- 原因
  - 因为 GPU 进程会为其开启一个新的复合图层(也叫 GPU 硬件加速)，不会影响默认复合图层（就是普通文档流），即脱离了文档流，所以并不会影响周边的 DOM 结构，而属性的改变也会交给 GPU 处理，不会进行重排
  - 使 GPU 进程开启一个新的复合图层的方式还有 3D 动画，过渡动画 transform，以及 opacity 属性，还有一些标签，这些都可以创建新的复合图层。这些方式叫做硬件加速方式
- 对比
  - ( 绝对定位 ) 虽然可以脱离文档流，但是没有新建图层，所以会 reflow
  - 结合 19 一起看
- 扩展
  - 还有哪些属性不会引起 reflow 和 repaint
    - transform
    - opacity
    - filter

## (33) Element.offsetHeight 和 Element.clientHeight

- Element.clientHeight = ( 自身高度 ) + ( padding ) + ( 滚动条高度 )
- Element.offsetHeight = ( 自身高度 ) + ( padding ) + ( 滚动条高度 ) + ( border 的高度 )
- 总结
  - offsetHeight 比 clientHeight 多了 border 的高度
  - **注意: ( 上下都有 border，padding，所以是两倍 )**

## (34) HTMLCollection 和 NodeList 的区别 ？

```
NodeList 和 HTMLCollection 的区别？
---

1. 动态集合 和 静态集合
- HTMLCollection 是动态集合，DOM树 ( 新增 和 删除 ) 可以感知，但是能感知 ( 修改 )
- NodeList ----- 是静态集合，DOM树 ( 新增 和 删除 ) 无法感知，但是能感知 ( 修改 )

2. 子节点类型
- HTMLCollection 只能包含元素节点
- NodeList ----- 可以包含任意类型的节点

3. 查询的方法
- HTMLCollection -- document.getElementsByTagName()
- NodeList -------- document.querySelectorAll()

// (1)
// 如何记忆：
// - 多对多
//    - getElementsByTagName 比  querySelectorAll 长
//    - HTMLCollection 比 NodeList 长
// - elements
//    - HTMLCollection中只包含element元素节点，而 getElementsByTagName 名字中包含了 Elements

// (2)
// Node.childNodes 返回 NodeList
// Element.children 返回 HTMLCollection

4. 方法
- HTMLCollection -- 没有 forEach，只能使用 for 循环遍历
- NodeList -------- forEach
```

### (35) html 和 xml 的区别 ?

```
html和xml的区别 ?
---

1. html中不区分大小写，xml中严格区分大小写
2. html中属性可以不带值，xml中属性必须有值
3. html中的标签是预定义的固有标签，不可扩展，xml中的标签不是固定的，可以自定义，可以扩展
4. html是用来显示数据的，xml是用来描述数据结构，存储数据的
```
