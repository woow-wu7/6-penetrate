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
    - 比如通过 postMessage 进行多标签通信时

## (2) csrf 跨站请求伪造攻击

- 概念
  - csrf 是 ( cross site request forgery 跨站请求伪造 ) 的缩写
  - CSRF 是一种劫持受信任用户向服务器发送非预期请求的攻击方式
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
