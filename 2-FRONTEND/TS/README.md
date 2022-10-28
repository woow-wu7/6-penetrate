# (一) type 类型别名 VS interface 接口

- [掘金-Typescript](https://juejin.cn/post/6999807282343051277#heading-1)
- [掘金-封装 06-从 0 开始封装一个 VUE3-UI 组件库](https://juejin.cn/post/7131232733841817631#heading-7)
- [github-6penetrate](https://github.com/woow-wu7/6-penetrate/tree/main/2-FRONTEND/TS)

```
type 类型别名 VS interface 接口
---

1. 是否会新建一个类型
   - interface --> 会新建一个类型
   - type -------> 不会新建类型，它只是给这个已有的类型 ( 取了一个新的名字 )，来 ( 引用这个类型 )
2. 是否能 extends 和 implements
   - type -------> 不能被 ( extends继承 和 implements实现 )
3. 作用
   - type 主要用于：原始值，联合类型，元组等任何需要你手写的类型，和无法通过interface来描述的类型
4. 鼠标hover时
   - type会显示具体的类型
   - interface则会显示是接口，具体的类型还需要通过在接口中查看

尽量使用 interface
```

# (二) 范型工具类型

### (1) Record

```
Record
- 是一种工具类
- Record<Keys， Type>
  - keys: 表示对象的属性 - 键
  - type: 表示对象的属性 - 值
  - 用于将 ( 一种类型属性 ) 映射到 ( 另一种类型 )
- Record的实现
  - type Record<K extends keyof any, T> = { [P in K]: T; };
---

例1
type roles = 'tester' | 'developer' | 'manager'
const staffCount: Record<roles, number> = {
  tester: 10,
  developer: 20,
  manager: 1
}
表示：roles联合类型的每个属性值的类型都是number

---
例2
interface Staff { name: string; salary: number;}
type StaffJson = Record<keyof Staff, string>; // keyof 获取 interface 的所有 ( 属性名 ) 的 - 联合类型
const product: StaffJson = {
  name: "John",
  salary: "3000",
};
表示：interface中的所有属性名的联合类型中的 ( 每个属性的属性值 ) 的类型是 string

---
例3
interface CatInfo {
   age: number,
   breed: string
}
type CatName = 'miffy'| 'boris' // 字符串字面量类型
const cats: Record<CatName, CatInfo> ={
   miffy: {age: 10, breed: "Persian"},
   boris: {age:5, breed: 'Maine Coon'},
};

---
例4
Record<string, any>
- 表示 key 是 string
- 表示 value 是 any
```

### (2) Partial

```
Partial
- Partial<T>
- 将 ( 类型 ) 定义的 ( 所有属性 ) 都修改为 ( 可选的 )
- Partial的实现
  - type Partial<T> = { [P in keyof T]?: T[P]; };
---

type Coord = Partial<Record<'x' | 'y', number>>;
// 这里是 Record 和 Partial 的组合
// - Record 等同于一个interface，key是第一个参数所有属性，值类型是第二个参数
// - Partial 变为可选属性
// 等同于
type Coord = { x?: number; y?: number; }
```

### (3) Pick -------- 对比 Omit

```
Pick
- 从类型定义的属性中，选取 ( 指定一组的属性 )，返回一个 ( 新的类型定义 )
- 从字面意思也能知道是 ( 摘取部分属性 )
- Pick的实现
  - type Pick<T, K extends keyof T> = { [P in K]: T[P]; };
---

例1
type Coord = Record<'x' | 'y', number>;
type CoordX = Pick<Coord, 'x'>;
// 等同于
type CoordX = { x: number; }

---
例2
type Animal = {
  name: string,
  category: string,
  age: number,
  eat: () => number
}
const bird: Pick<Animal, "name" | "age"> = { name: 'bird', age: 1 }
```

### (4) ReturnType

```
ReturnType
- ReturnType<T>
- 获取函数返回值类型
---

function f1(s: string) {
   return { a: 1, b: s };
}

type T10 = ReturnType<() => string>;  // string
type T2 = ReturnType<(s: string) => number[]>; // number[]
type T11 = ReturnType<(s: string) => void>;  // void
type T12 = ReturnType<(<T>() => T)>;  // {}
type T14 = ReturnType<typeof f1>;  // { a: number, b: string }

type T13 = ReturnType<(<T extends U, U extends number[]>() => T)>;  // number[]
type T15 = ReturnType<any>;  // any
type T16 = ReturnType<never>;  // any
type T17 = ReturnType<string>;  // Error
type T18 = ReturnType<Function>;  // Error
```

### (5) ReadOnly

```
ReadOnly
- ReadOnly<Type>
- 将类型 T 中包含的属性设置为readonly，并返回一个新类型
- ReadOnly<type> 实现
  - type Readonly<T> = { readonly [P in keyof T]: T[P]; }
---

interface Person {
   name: string
   age: number
}
const person: Readonly<Person> = {
   name: 'lpp',
   age: 18
}
person.age = 20; // 无法分配到 "age" ，因为它是只读属性。ts(2540)
```

### (6) Exclude

```
Exclude
- Exclude<T, U> = T extends U ? never : T;
- Exclude 就是将前面类型的与后面类型对比，( 过滤出前面独有的属性 )
- 排除
---

const str: Exclude<'a' | '1' | '2', 'a' | 'y' | 'z'> = '1'; // str 的类型是 "1" | "2"
```

### (7) Omit -------- 对比 Pick

```
Omit
- type Omit = Pick<T, Exclude<keyof T, K>>
- 省略
---

type UserState = {
  name: string
  age: number
}
type Person = Omit<UserState, 'age'>
// 等价于
type Person {
   name: string
}

---
type Person2 = Pick<UserState, 'age'>
// 等价于
type Person {
   age: number
}
```

# (三) keyof 索引类型查询操作符

- keyof 是 ( 索引类型查询操作符 )，返回 ( 已知的公共属性名的联合 )
- 扩展：接着可以使用 [k in keyof T] 来进行遍历

```
keyof
- 索引类型查询操作符
- 返回 已知公共属性名的联合
---

例1
interface Person {
   name: string;
   age: number;
}
let personProps: keyof Person; // 'name' | 'age'

---
例2
三和四组合案例
- ( K extend P ) 表示即K继承P，则K具有P相同的属性
- keyof T 索引类型操作操作符，返回公共属性名的联合
- T[K] 索引访问操作符
function pluck<T, K extends keyof T>(o: T, names: K[]): T[K][] {
  return names.map(n => o[n]);
}
interface Person {
   name: string;
   age: number;
}
let person: Person = {
   name: 'Jarid',
   age: 35
};
let strings: string[] = pluck(person, ['name']); // ok, string[]
```

# (四) T[K] 索引访问操作符

```
T[K]
---

例1
interface Person {
   name: string;
   age: number;
}
Person['name'] // string


---
例2
三和四组合案例
function pluck<T, K extends keyof T>(o: T, names: K[]): T[K][] {
  return names.map(n => o[n]);
}
interface Person {
   name: string;
   age: number;
}
let person: Person = {
   name: 'Jarid',
   age: 35
};
let strings: string[] = pluck(person, ['name']); // ok, string[]
```

# (五) in

- in 运算符作用主要有两个
  - 在类型中使用: **可以用来遍历 联合类型 和 枚举类型**
  - 在值中使用: 判断对象中是否存在某个 key 注意包括 ( 自身属性 ) 和 ( 继承属性 )

```
in
---

type T = 'name' | 'age';
type Obj = {
  [k in T]: any
}
// 1. in 用来遍历联合类型 -> type Obj = { name: any, age: any}


---
enum City {
  BEIJING = 2,
  SHANGHAI,
  GUANGZHOU,
}
type City3 = {
  [key in City]: string;
};
// 2. in 用来遍历枚举类型 -> type City3 = { 2: string; 3: string; 4: string; }


---
const obj: Obj = {
  name: 'woow_wu7',
  age: 20
}
console.log('name' in obj)
// 3. in 用来判断 obj 对象中是否存在 name 属性，缺点是不能识别 ( 自身属性 ) 还是 ( 继承属性 )


var obj = {};
'toString' in obj // true，即非自身属性时，继承的属性也会返回true
```

# (6)public private protected 的区别？

- public 公有属性
- private 私有属性 ------- 不能在声明它的类的外部使用，比如 ( 子类 或 实例 或 子类实例 都不能访问 )
- protected 保护属性 ----- 实例不能访问，子类实例不能访问，但是子类可以访问
- 实战 本项目/2-FRONTEND/TS/index.ts
