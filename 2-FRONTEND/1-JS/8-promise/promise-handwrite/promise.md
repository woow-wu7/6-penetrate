# promise

### promise 的特点

- promise 的状态不受外界影响
- promise 状态一旦改变就不会再变

### promise 的缺点

- promise 一旦新建，就会立即执行，中途无法取消
- promise 内部抛出的错误，如果不设置 ( 回调函数 )，不会反应到外部
- 当 promise 处于 pending 状态，无法得知当前发展到哪一个阶段 ( 刚刚开始还是即将完成 )

### resolve 函数的作用

- 将 promise 的状态从 pending 变成 fulfilled
- 在异步操作成功时调用
- 并将异步操作的结果作为参数传递出去

### (1) 原型方法

- Promise.prototype.then()
- Promise.prototype.catch()
- Promise.prototype.finally()

### (2) 静态方法

- Promise.all()
- Promise.race()
- Promise.any()
- Promise.allSettled()
- Promise.resolve()
- Promise.reject()
- Promise.try()
