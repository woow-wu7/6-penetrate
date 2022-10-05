// 1
// in
// - 鼠标hover 查看 Obj
type T = "name" | "age";
type Obj = {
  [k in T]: any;
};
