# security 前端安全

## (1) xss 跨站脚本攻击

- 概念
  - xss 是 ( cross site script 跨站脚本攻击 )
  - cross site script 原本的缩写是 css，但是为了区分层叠样式表 css，改写为 XSS
- 攻击原理
  - XSS 攻击是指攻击者在网站上注入恶意的客户端代码，通过 恶意脚本 对客服端网页进行篡改，从而在用户浏览网页时，对用户浏览器就行控制，或者获取用户隐私数据一种攻击方式
- 恶意脚本
  - 主要指 javascript 代码，有时也指 html 和 flash
- 攻击方式
  - 有多种，共同的特征是：窃取用户的隐私数据
- 攻击类型
  - 可以分为三类
  - 反射型(非持久型)
  - 储存型(持久型)
  - 基于 DOM
- **危害**
  - 利用虚假的输入 ( 表单 )，骗取用户输入的 ( 用户信息 )
  - 利用 ( 脚本 )，获取用户的 ( cookie )
  - 显示伪造的 文章 和 图片
- **如何预防 XSS 攻击？**

  - 1. 设置 httpOnly
    - cookie 是在服务端生成的，通过在响应头上的 set-cookie 字段来体现，除了设置 cookie 的值，还可设置 cookie 的属性，比如 Expires Max-Age Domain Path Secure HttpOnly
    - `Set-Cookie: key1=value1; domain=example.com; path=/blog; HttpOnly;Secure;`
      - Expires Max-Age
      - Domain Path
      - Secure 表示只允许 HTTPS
      - **HttpOnly** 表示 cookie 无法通过脚本获取
        - js --------------> document.cookie 读写 cookie
        - XMLHttpRequest --> xhr.getResponseHeader('Set-Cookie') 获取 cookie
  - 2. 过滤检查

    - 对 input, textArea, form 表单做特殊符号的过滤检查
    - HtmlEncode：对 html 标签进行转换
    - JavascriptEncode：对 js 一些特殊符号进行转码

      ```
        (1) HtmlEncode：对html标签进行转换
        <  --------------------- &lt
        >  --------------------- &gt
        &  --------------------- &amp
        '' --------------------- &quot
        空格 ------------------- &nbsp


        (2) JavascriptEncode：对js一些特殊符号进行转码
        \n --------------------- \\n
        \r --------------------- \\r
        "  --------------------- \\"
      ```

  - 3. 事件对象上的 e.origin

    - 比如通过 postMessage 进行多标签通信时，在接受消息的标签页上通过 `window.onmessage = (e) => {}` 获取 e.origin 进行判断

      ```
      发消息
      ---
      const targetWindow = window.open(
        "http://127.0.0.1:5500/FRONTEND/JS/1-cross-domain/%E8%B7%A8%E5%9F%9F%E9%80%9A%E4%BF%A1-%E6%94%B6%E6%B6%88%E6%81%AF.html",
        "新标签页"
      );
      button.addEventListener(
        "click",
        () =>
          targetWindow.postMessage("这是通过 window.open() 发送的消息", "*"),
        false
      );
      ```

      ```
      收消息
      ---
      window.onmessage = (e) => {
        console.log("e.origin :>> ", e.origin); // 通过 e.origin 查看发送消息的源信息是否是可信的网页
        console.log("这是通过 window.open() 接收到的消息", e.data);
      };
      ```

## (2) csrf 跨站请求伪造攻击

- 概念
  - csrf 是 ( cross site request forgery 跨站请求伪造 ) 的缩写
  - CSRF 是一种劫持受信任用户向服务器发送非预期请求的攻击方式
  - forgery 是伪造的意思
- 原理
  - 主要是通过获取用户在目标网站的 cookie，骗取目标网站的服务器的信任，在用户已经登录目标站的前提下，访问到了攻击者的钓鱼网站，攻击者直接通过 url 调用目标站的接口，伪造用户的行为进行攻击，通常这个行为用户是不知情的。
  - 即获取了 cookie，就可以做很多事情：比如以你的名义发送邮件、发信息、盗取账号、购买商品、虚拟货币转账等等
- **预防 CSRF 攻击**
  - **验证码**
    - CSRF 往往是在用户不知情的情况下构建了网络请求，而验证码会强制用户必须与应用进行交互才能完成最终的请求
  - **Referer** 检查
    - HTTP ( 请求头 ) 中有 ( Referer ) 字段，表示请求来源地址，通过 Refer 可以检查请求是否来自合法的源，服务器只对合法的源予以响应
    - 扩展
      - Referer 发送的条件
        - 不发送 Referer: 地址栏输入网址 和 书签
        - 发送 Referer: 网页链接 表单 网页加载静态资源，比如加载图片、脚本、样式
        - 链接: https://www.ruanyifeng.com/blog/2019/06/http-referer.html
  - **token**
    - CSRF 主要就是获取 cookie，所以要防御的话，就需要在请求中加入攻击者不能伪造的信息，并且该信息不能保存在 cookie 中
- 案例

```
案例：

CSRF攻击的思想：（核心2和3）
1、用户浏览并登录信任网站（如：淘宝）
2、登录成功后在浏览器产生信息存储（如：cookie）
3、用户在没有登出淘宝的情况下，访问危险网站
  // 注意：如果该cookie在没有设置过期时间或者为null，默认是会话时间session-cookie，关闭浏览器后cookie会被清除
  // Expires，Max-Age可以设置cookie的过期时间
  // 所以这里强调了是没有登出的情况，就有cookie被获取的风险
  // 如果cookie设置了具体的过期时间，有效期内都可能被获取
4、危险网站中存在恶意代码，代码为发送一个恶意请求（如：购买商品/余额转账）
  // 该请求，携带刚刚在浏览器产生的信息(cookie)，进行恶意请求
5、淘宝验证请求为合法请求（区分不出是否是该用户发送）
  // 用HTTP中的header头中的 Refer 来预防
  // refer 可以检查请求源，只有合法的请求来源服务器才予以响应
6、达到了恶意目标
```
