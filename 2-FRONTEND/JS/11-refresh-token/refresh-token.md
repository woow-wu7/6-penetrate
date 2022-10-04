# access-token 和 refresh-token

### (1) 一些特点

- access-token
  - 因为参与每次请求，使用频繁，且与用户数据直接关联，安全性方面比较敏感，所以 --------- ( 过期时间短 )
  - 即使 Access Token 泄漏也将很快失效
- refresh-token
  - Refresh Token 仅用于获取新的 Access Token，使用频率较低，不与用户数据直接关联，-- ( 过期时间长 )
  - Refresh Token 仅用于获取新的 Access Token

### (2) 原理

```
1. 用户登录后，服务器返回 Access Token 和  Refresh Token
2. 以后每次请求都携带 Access Token
3. 如果
    - 请求时 Access Token 过期
      - 1. 服务端会返回相应的状态码 ( 前后端双方约定，比如 40001，表示 Access Token 过期 )
      - 2. 然后前端就利用 Refresh Token 去请求专门的验证接口，获取新的 Access Token
    - Refresh Token 也过期
      - 请求专门的验证接口时，发现 Refresh Token 也过期，就返回登录页面
```

### (3) 一些要处理的问题

```
1.
问题: 当  Access Token 过期，一般一个页面会请求多个接口，这样每个接口都调用一遍刷新token，即 ( 存在并发请求 )
期望: 我们希望的是如果token过期了，我们只调用一次刷新token接口]
解决:
  - 锁 和 队列
    - 锁: 利用一个标志位 isRefreshing = false; 表示是否正在刷新 Access Token
    - 队列: 存储处理完成后需要执行的请求
  - 详见
    - 方案讨论 https://juejin.cn/post/6911546899057082382

2.
提升用户体验: 不能中断请求，而是使用新的请求替换原来的请求
```

### (4) 实现详情

```

import { processResponse } from "@/api.js";

const axiosInstance = axios.create({......});

// 响应拦截
axiosInstance.interceptors.response.use(
  (response) => processResponse(response, axiosInstance),
  (error) => {
    return Promise.reject(error);
  }
);
```

```
api.js
---

let isRefreshing = false; // 是否正在刷新，保证一个页面有多个请求时，只进行一次 refresh-token，不用每个都去refresh
let handlers: any[] = [];
export const addHandler = (request: any) => handlers.push(request);
export const continueFetch = () => {
  handlers.forEach((request) => request());
  handlers = [];
};

// 响应拦截处理函数
export const processResponse = (response: any, axiosInstance: any) => {
  return new Promise((resolve) => {
    let {
      data: { data, code },
      config,
    } = response as any;

    // 前后端约定 20000 表示 Access-Token 过期
    if (code === 20000) {
      const authStr = localStorage.getItem("auth");
      // 未登录，去登录页面
      if (!authStr) {
        router.push("/login");
      } else {
        // 是否正在刷新操作
        // - 不是就先放进队列，再进入进行refresh在请求
        // - 是就直接放进队列
        if (!isRefreshing) {
          // 1. ---------------------------------------------------------- 登录过期，从新进行业务请求的请求函数 放进队列
          addHandler(async () => {
            const res = await axiosInstance(config); // 从新请求
            resolve(res); // 返回请求结果
          });

          const { refresh_token } = JSON.parse(authStr);
          postAuth({
            client_id: "front_end",
            client_secret: "123",
            grant_type: "refresh_token",
            refresh_token,
          })
            .then((res) => {
              if (res.data) {
                localStorage.setItem("auth", JSON.stringify(res.data)); // 刷新 Access-Token
                continueFetch(); // 2. ----------------------------------- 从新请求队列中的请求函数 flush队列，此时的请求的config已经是刷新后的Access-Token
              }
            })
            .catch((err) => {
              if (err.response.status == 400) {
                router.push("/login");
              }
            });
        } else {
          addHandler(async () => {
            const res = await axiosInstance(config); // 从新请求
            resolve(res); // 返回请求结果
          });
        }
      }
    }

    // token没过期，正常的请求，响应拦截直接返回
    else {
      resolve(data);
    }
  });
};
```

# 资料

- refresh-token 的原理
  - https://blog.51cto.com/u_15082391/4521181
- 请求前拦截处理和请求后拦截处理的优缺点
  - https://segmentfault.com/a/1190000020210980
- 方案
  - 不同方案对比: https://segmentfault.com/a/1190000020210980
  - 详细: https://juejin.cn/post/6911546899057082382
  - https://www.i4k.xyz/article/qq_42821539/99714579
