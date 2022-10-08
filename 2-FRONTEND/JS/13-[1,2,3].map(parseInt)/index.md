// [1,2,3].map(parseInt)

```
[1, 2, 3].map(parseInt)
相当于
[1, 2, 3].map(parseInt(value, index))
相当于
[1, 2, 3].map((value, index) => parseInt(value, index)

parseInt(1, 0) // 1 分析：radix=0，根据前面的字符串来判断，不是 0 或 0x 开头，都以 10 进制来解析 -- 表示把八进制1转成十进制 => 1
parseInt(2, 1) // NaN -------------------------------------------------------------------- 第二个参数 radix 在 2-36 之间
parseInt(3, 2) // NaN，3 不能作为二进制
// 最终结果 [1, NaN, NaN]

---

1
parseInt(string, radix)

- 作用
  - 解析参数字符串，返回解析成功的 ( 十进制整数 )，不能解析返回 ( NaN )
  - 从书面意思上就能知道：是解析成 ( 整数 )
  - 注意: 最终结果是 ( 10 进制数 ) 或者 ( NaN )
- 参数
  - string：表示需要解析的字符串，不是字符串则会将其转化为字符串
  - radix
    - 含义
      - 表示 从 `2` 到 `36` 字符串的基数
      - 例如指定 `16` 表示被解析值是十六进制数
      - radix 英语是( 基数 ) 的意思
    - 当 radix 是 ( 0，undefined，未指定 ) 三种情况时，做如下处理
      - 参数字符串以 '0x' 开头 -------------------- 将 ox 其于部分解析成十六进制的整数
      - 参数字以数字 0 开头(数字，不是字符串) -------- 将 o 其于部分解析成八进制
      - 其他类型的字符串 -------------------------- 解析为十进制的整数
- 返回值
  - 从给定的字符串中解析出的一个十进制整数
  - 要么是一个十进制整数
  - 要么是 NaN
- 例子
  - parseInt('0x11') -------------- 17
  - parseInt(010, ) --------------- 8
```