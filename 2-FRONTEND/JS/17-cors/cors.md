# cors

- 名词解释
  - cors 表示 ( 跨域资源共享 )
  - cross-origin-resource-sharing
- 条件
  - CORS 需要浏览器和服务器同时支持
- 分类
  - 简单请求
  - 非简单请求

### (1) 简单请求

- 条件
  - 1.请求的方法: 必须是 http1.0 的三种方法之一 GET POST HEAD
  - 2.HTTP 头信息不超出以下字段
    - Accept
    - Accept-Language
    - Content-Language
    - Last-Event-ID
    - Content-Type:只限三个值 application/x-www-form-urlencoded multipart/form-data text/plain
- 非简单请求
  - 凡是不同时满足上面两个条件，就属于 ( 非简单请求 )
