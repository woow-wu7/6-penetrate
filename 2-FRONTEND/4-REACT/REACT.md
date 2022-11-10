# react

### (一) react 的生命周期

- ![](https://img.php.cn/upload/image/106/115/918/1657710414760203.png)
- ![](https://www.qycn.com/uploads/allimg/2022/07/1832878126727222825.png)

```
(一) 旧的生命周期
挂载阶段: constructor componentWillMount render componentDidMount
更新阶段:
  - props: componentWillReceiveProps shouldComponentUpdate componentWillUpdate render componentDidUpdate
  - state: shouldComponentUpdate componentWillUpdate render componentDidUpdate
  - forceUpdate: componentWillUpdate render componentDidUpdate
卸载阶段:
  - componentWillUnmount
```

```
(二) 新的生命周期
- 废除了几个生命周期: componentWillMount、componentWillReceiveProps、componentWillUpdate

- 新的生命周期
  - 挂载阶段: constructor getDerivedStateFromProps render componentDidMount
  - 更新阶段:
    - props: getDerivedStateFromProps shouldComponentUpdate render getSnapshotBeforeUpdate componentDidUpdate
    - state: getDerivedStateFromProps shouldComponentUpdate render getSnapshotBeforeUpdate componentDidUpdate
    - forceUpdate: getDerivedStateFromProps  render getSnapshotBeforeUpdate componentDidUpdate
```

# (二) Diff 算法

- 传统算法的复杂度 ` O(n^3)`，其中 n 是节点数
- `diff` 算法可以把复杂度降低到 `O(n)`
- 类型：`tree diff` `component diff` `element-diff`

### 1. tree diff

- 跨层级的移动操作非常少，可以忽略不计
- 关键词：
  - 逐层比较，不存在将会删除整个不一样的树，并不再向下比较，只需遍历一次即可完成对整棵树的比较
- **diff 过程：**
  - **逐层对同一层级的节点进行比较**
  - React 通过 updateDepth 更新深度对 Virtual DOM 树进行层级控制
  - 对`树`进行`分层比较`，两棵树只对`同一层次的节点`进行比较，如果该`节点不存在`，则`该节点及其子节点会被完全删除`，`不会在进一步比较`
  - 只需要遍历`一次`，就能完成整棵树的比较
  - 先创建，后删除
- **跨层级移动了怎么办**？
  - diff 只会考虑 ( **同层级的节点位置变换** )，如果跨层级的化，只有 ( **创建** ) 和 ( **删除** ) 节点的操作
- **优化**：
  - 所以在开发中，要尽量避免跨层级的组件的移动的情况，直接创建和删除消耗性能，
  - 可以通过 CSS 隐藏或显示节点，而不是真的移除或添加 DOM 节点 ( 在频繁切换时 )

### 2. component diff

- **diff 过程**：
  - **同一类型的组件，按原策略，逐层进行比较**
  - **不同类型的组件，会被判定为脏组件，则会替换掉整个组件的所有节点**
  - **对于同一类型的组件，有可能其 Virtual DOM 没有任何变化(props,state 未变化时)，是没有必要再进行逐层比较的，此时，可以通过 shouldComponentUpdate() 返回 false，来进行进行性能优化，不再进行逐层的比较**
  - 如果判断类型：即 class 名(组件名)一样就是同一类型

### 3. element diff

- 当节点处于同一层级时，diff 将会有三种操作：`插入INSERT_MARKUP`，`删除REMOVE_NODE`，`移动MOVE_EXISTING`
- **移动操作的一些概念**
  - **`oldIndex`**：元素在旧集合中的位置
  - **`lastIndex`**：取 oldIndex 和上一次的 lastIndex 的较大值，lastIndex 的初始值是 0，类似游标的概念
  - **`移动：oldIndex < lastIndex 移动，移动的位置是下表lastIndex对应的位置`**
  - **`不移动：oldIndex > lastIndex 不移动`**
- **情况一**
  - **--------- 新旧集合中存在相同节点但位置不同时 ---------**
  - **diff 过程**
  - **1. 先通过 ( 唯一的 key ) 逐个判断 ( 新集合中的元素 ) 在 ( 旧集合 ) 中是否存在**
  - **2. 如果存在，就会进行移动操作，具体的 ( 移动规则 ) 如下**
    ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f19c7c1c2952413588517290e4375c2e~tplv-k3u1fbpfcp-watermark.image)

第一步：

- 元素：B
- B 在旧集合中的位置：`oldIndex = 1`
- B 比较时的游标，刚开始游标默认值是 0：`lastIndex = 0`
- 比较：`oldIndex > lastIndex 不移动`
- 下一轮比较前的游标更新：取 oldIndex=1 和 lastIndex=0 的最大值 `lastIndex = 1`
  第二步：
- 元素：A
- A 在旧集合中的位置：`oldIndex = 0`
- A 比较时的游标：`lastIndex = 1`
- 比较：`oldIndex < lastIndex 移动`
- A 移动到的位置：`移动到A元素在新集合中的位置对应的位置`
- 下一轮比较前的游标更新：取 oldIndex=0 和 lastIndex=1 的最大值 `lastIndex = 1`
  第三步：
- 元素：D
- D 在旧集合中的位置：`oldIndex = 3`
- D 比较时的游标：`lastIndex = 1`
- 比较：`oldIndex > maxIndex 不移动`
- 下一轮比较的游标更新：取 oldIndex=3 和 lastIndex=1 的最大值 `lastIndex = 3`
  第四步：
- 元素：C
- C 在旧集合中的位置：`oldIndex = 2`
- C 比较时的游标：`lastIndex = 3`
- 比较：`oldIndex < lastIndex 移动`
- C 移动到的位置：`移动到元素C在新集合中的位置对应的位置`
- 下一轮比较前的游标更新：取 oldIndex=2 和 lastIndex=3 的最大值 `lastIndex = 3`

---

**情况二**

- **--------- 新集合中有新加入的节点，旧集合中有删除的节点 ---------**
- **diff 过程**  
  ![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/19f974fb80ac4c98b69c1543d095be76~tplv-k3u1fbpfcp-watermark.image)  
  第一步：
- 元素 B，oldIndex=1, lastIndex=0, oldInex>lastIndex 不移动，更新后的 lastIndex=1
  第二步：
- 元素 E
- 先判断是新建，删除，或者移动操作的哪一种
- 新建：`E在新集合中存在，在就集合中不存在，新建E`
- 新建的位置：在 E 元素在新集合中的位置对应的位置，`新建E`
- 下一轮比较前的游标更新：`lastIndex = 1`
  第三步：
- 元素 C，oldIndex=2, lastIndex=1, oldIndex>lastIndex 不移动，更新后的 lastIndex=2
  第四步：
- 元素 A
- A 在就集合中的位置：`oldIndex=0`
- A 比较时的游标：`lastIndex=2`
- 比较：`oldIndex < lastIndex移动`
- 移动到的位置是：`A元素在新集合中的位置对应的位置`
- 下一轮比较前的游标更新：`lasIndex = 2`
  第五步：
- 元素 D
- 在新集合中不存在，在旧集合中存在，删除操作，直接删除 D

### diff 算法总结

- 把传统的 O(n^3) 的复杂度降低到了 O(n)，n 表示节点数
- 存在 `treeDiff` `componentDiff` `elementDiff`
- `treeDiff` 跨层级移动非常少，逐层比较
- `componentDiff` 判断是不是同类型的组件，区分脏组件和逐层比较，以及 VitureDOM 没变通过 shouldComponentUpdate 来做优化
- `elementDiff`重点理解移动的算法规则
- **特殊情况**：
  - 在第一个元素和最后一个元素交换时，oldIndex 是集合中的最大值，这会导致除了第一个元素不移动，后面的 oldIndex<最大值 lastIndex，**`导致除了第一个元素外，所有元素都会移动`**
    ![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dc649675074b4f0ab1f4e57721dbdb24~tplv-k3u1fbpfcp-watermark.image)
