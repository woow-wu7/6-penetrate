# CSS

## (1) position

- static 默认值
- inherit 继承，从父元素继承 position 的值
- relative 相对定位，相对于 - 自己正常位置进行定位
- absolute 绝对定位，相对于 - 距离最近的具有定位属性的父元素
  - 问题: 什么是具有 定位属性 的父元素？
  - 回答: 就是除了 position: static 以外的定位属性都可以
- **fixed** 基于窗口定位 - `注意transform的影响`
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
  - 3. 然后通过 transform: scaleY(0.5) 缩放 伪元素

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
