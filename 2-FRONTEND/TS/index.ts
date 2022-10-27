// 1
// in
// - 鼠标hover 查看 Obj
type T = "name" | "age";
type Obj = {
  [k in T]: any;
};

// 2
// Exclude
const str: Exclude<"a" | "1" | "2", "a" | "y" | "z"> = "1";

// 3
// Omit
type UserState = {
  name: string;
  age: number;
};

type Person = Omit<UserState, "age">;
// 等价于
// type Person {
//    name: string
// }

// 4
// Pick
type Person2 = Pick<UserState, "age">;
// 等价于
// type Person2 {
//    age: number
// }
