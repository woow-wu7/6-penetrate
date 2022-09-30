# (1) type 类型别名 VS interface 接口

```
type 类型别名 VS interface 接口
---

1. 是否会新建一个类型
   - interface --> 会新建一个类型
   - type -------> 不会新建类型，它只是给这个类型 ( 取了一个新的名字 )，来 ( 引用这个类型 )
2. 是否能 extends 和 implements
   - type -------> 不能被 ( extends继承 和 implements实现 )
3. 作用
   - type 主要用于：原始值，联合类型，元组等任何需要你手写的类型，和无法通过interface来描述的类型
4. 鼠标hover时
   - type会显示具体的类型
   - interface则会显示是接口，具体的类型还需要通过在接口中查看
```
