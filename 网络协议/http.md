## 报文结构

起始行 + 头部 + 空行 + 实体

### 起始行

1. 请求起始行

    方法+路径+HTTP版本（如 GET /home HTTP1.1）

2. 响应起始行

    HTTP版本+状态码+原因（如 HTTP1.1 200 OK）

### 头部

都遵循 Key: Val 的模式。值得注意的是 key 的命名是在ASCII较小的范围内，不区分大小写，不能使用_

### 空行

用于区分头部和实体

### 实体

具体的数据

## HTTP 请求方式的区别

从本质上只是约定的语义，但还是存在细微区别：GET 和 POST 为例：

1. 缓存，get 请求会被浏览器缓存

2. 编码，get 是 url 编码，只能接收 ASCII 字符

3. 参数，get 参数放在 url 里，较 post 来说限制较多且不安全

4. 幂等，get 是幂等的，而 post 不是（幂等，即做同样的操作结果相同）

5. TCP角度，tcp 会把 post 请求的 header 和 body 拆分传输，header 传输接收到服务器的 100 contiune 之后继续发送 body

## 状态码

* 1xx 中间状态，还有后续操作

* 2xx 表示成功

* 3xx 重定向状态，表示资源位置变更，需要重新请求

* 4xx 请求报文有误

* 5xx 服务端错误

### 1xx

* 100 Contiune。 继续

* 101 Switching Protocols。HTTP 升级到 WebSocket 同意

### 2xx

* 200 OK。成功

* 204 No Content。与 200 类似，但没有body实体

* 206 Partial Content。表示部分内容，用于分块下载和断点传输

### 3xx

* 301 永久重定向，浏览器会做缓存优化，下次在访问会直接访问重定向的地址。

* 302 临时重定向，浏览器不会缓存

* 304 协商缓存命中

### 4xx

* 400 笼统的请求错误

* 403 禁止访问

* 404 资源未找到

* 405 请求方法不被允许

* 406 资源无法满足客户端条件

* 408 服务端等待时间超时

* 409 请求冲突

* 413 请求体数据过大

* 414 url 数据量过大

* 429 请求次数太多

* 431 请求头数据过大

### 5xx

* 500 笼统的服务器出错

* 501 服务器还不支持该功能

* 502 服务器访问正常，但自身逻辑出错

* 503 服务器繁忙，无法响应


## 定长和不定长的数据传输

* Content-Length 来声明定长数据长度

* Transfer-Encoding: chunked 表示不定长，基于长连接的发送，直到遇到 chunked 大小为 0 的包表示结束

## 大文件传输

* 首先服务器要先支持该选项

    Accept-Range: None

* 客户端请求头 Range: bytes=0-9, 11-16

* 服务端响应

    * 单段 Content-Range: bytes=0-9/100

    * 多段
    
        Content-Type: multipart/byteranges; boundary=1111

        --1111

        Content-Type: text/plain

        Content-Range: 0-9/100

        /n body

        --1111

        ....

        --1111--

        其中 boundary 表示分割字符串，使用 -- 分隔符 分割部分，每个部分都有独立的头部，且在最后一个分隔符后增加 -- 表示结束

## 表单提交

### Content-Type: Application/x-www-form-urlencoded

数据会被使用 key=val&key=val 的形式连接并用 url 编码方式编码

### Content-Type: multipart/form-data; boundary=xxx

实际生产中使用 form-data 居多，毕竟不用 url 编码

值得留意的是 boundary 一般为浏览器自动封装好的，我们开发业务代码的时候并不需要添加

数据同样遵循分包传输的方式用 boundary 分割，每个字段都是独立包，如：

Content-Disposition: form-data;name="key";

Content-Type: text/plain

val

--boundary

...

--boundary--

## HTTP1.1 解决对头阻塞

* 多路并行，一个域名 chrome 最多支持 6 路

* 域名分片，同一资源分散到不同域名，就可以有更多路的并发

## Cookie

* Expires & Max-Age

    生命周期字段，expires 过期字段；max-age 过期间隔时间

* Domain & path

    作用域

* Secure

    表示仅 HTTPS 传递该 Cookie

* HttpOnly

    不能通过 js 访问

* SameSite

    Strict、Lax、None：对于禁止非同源网站携带 Cookie、仅允许表单的 get 请求和 a 标签、没有限制

## 代理服务器

### 功能

* 均衡负载

* 保障安全

* 缓存代理

    代理服务器缓存功能可以减缓源服务器的流量压力，其缓存收到源服务器和客户端的双方控制

    * 源服务器控制

        主要依靠 Cache-Control 字段的 public、private、s-max-age、must-revalidate（客户端缓存过期去源服务器获取）、proxy-revalidate（代理缓存过期去源服务器获取）

    * 客户端控制

        max-scale: x（宽容，允许在代理过期之后的x 秒内仍然使用）

        min-fresh: y（保持缓存新鲜，需要在代理缓存过期的 y 秒前才有效）

        only-if-cached（仅接收代理缓存，如果代理服务器缓存失效返回 504）

### 头字段

* Via

    假设经历 client - proxy1 - proxy2 - server

    请求头：Via: proxy1, proxy2

    响应头: Via: proxy2，proxy1

    Via 的顺序即为 HTTP 传递顺序

* X-forwarded-for

    为谁而转发，记录的是请求方的 ip 地址。
    
    这意味着每次代理转发请求都需要去解析请求头这个字段并修改为自己的 ip，这回极大降低效率，并且 HTTPS 是不允许修改请求体的。

    * 代理协议

        在请求行上多加一行，格式：PROXY + TCP4/TCP6 + 请求地址 + 响应地址 + 请求端口 + 响应端口

        ```
            PROXY TCP4 0.0.0.1 0.0.0.2 80 80
            GET / HTTP1.1
            ...
        ```

* X-real-ip

    记录真实的 ip，不论经历多少转发，记录的都是最初的客户端 ip

## 跨域

浏览器遵循同源政策，即协议、主机、端口号都相同则认为是同源站点。非同源站点有以下限制：

* 不能读取和修改对方 DOM

* 不能读取和修改对方 Cookie、LocalStorage、IndexedDB

* 限制 XMLHttpRequest 请求

浏览器在渲染进程中将同一个站点的进程放到一个沙箱中（防止CPU一直存在的Spectre和Meltdown漏洞），而其中的网络请求是依靠操作系统网络主进程发送然后依靠套接字（Unix Domain Socket）进行进程通信传递数据。

网络主进程在接收到服务器响应之后会检查跨域以及 cors，若不符合就会把响应体全都丢弃。所以从此处也可以看出跨域限制是客户端的一种限制。

### cors（跨域资源共享）

服务器会将 Access-Controll-Allow-Origin 字段添加到响应头中，浏览器收到响应校验本次请求是否包含在其中，如果不在则舍弃@

其中非简单请求，一开始并不会将请求全部发送出去，而且发送一个 options 方式的预检请求，其中包含两个关键头：

Access-Control-Request-Method 表示请求使用那种方式

Access-Control-Request-Headers 表示请求要加上哪些请求头

而响应头会返回返回相应字段：

Access-Controll-Allow-Origin: *

Access-Controll-Allow-Methods: GET, POST

Access-Controll-Allow-Headers: X-Custom-Header

Access-Controll-Allow-Credentials: true

如果预检请求不符合要求则直接报错，后续正在的请求也不会发送出去

* 简单请求

    1. GET、POST 或者 HEAD 请求

    2. 请求头仅包含 Accept、Accept-Language、Content-Language、Content-Type，其中 Content-Type 取值限定在 application/x-www-form-urlencodeed、multipart/form-data、text/plain 三种

### 解决跨域问题

* 最简单的就是修改服务器响应头 Access-Controll-Allow-Origin 允许该站点访问

* JSONP

    由于 script 不遵循同源政策，所以可以将响应结果封装到一段 js 代码中，并且调用指定的方法传入数据运行。只要在客户端提前声明该方法，然后加载这段 js 代码即可拿到响应数据。

    ```
    function jsonp(_url, params, _callbackName) {
        let url = _url;
        let paramsStr = -1 === _url.indexOf("?") ? '' : '&';
        let callbackName = _callbackName + Math.random().toString().replace(".", "");
        for (let key in params) {
            paramsStr += `${ key }=${ params[key] }&`;
        }
        paramsStr += `callback=${ callbackName }`;
        url += paramsStr;

        return new Promise((resolve, reject) => {
            let el = document.createElement("script");
            el.src = url;
            document.body.appendChild(el);
            document.body.removeChild(el);
            window[callbackName] = function(data) => {
                delete window[callbackName];
                resolve(data);
            };
        });
    }
    ```

* Nginx 代理

    跨域主要原因在于客户端页面和服务端接口不在一个域名下，因此可以使用 nginx 将页面转发到接口域名下或者将接口反向代理到页面域名下统一域名。

## TLS1.2

TLS1.2 不再采用 rsa，而采用 ECDHE 加密，相较之下客户端在发送收尾信息之后可以直接抢跑发送 HTTP 信息，而不再需要等到服务器确认之后发送，节省了一个 RTT 时间。

1. 客户端发起请求包含（client_random，TLS版本，加密套件列表）

2. 服务端返回（server_random, server_params, 确认TLS版本，加密套件，数字证书）

3. 客户端验证数字证书，如果通过则发送给服务端 client_params，同时自身通过 ECDHE 算法传入 server_params 和 client_params 计算出 pre_random。借助 server_random, client_random 和 pre_random 伪随机计算出 secret。

4. 服务端接收到 client_params 后也需要走一边证书验证流程校验客户端是否正常，然后用同样的方法计算出 secret。

至此非对称加密就完成，之后都使用 secret 对称加密通话。

## TLS1.3

TLS1.3 彻底废除的 RSA 算法，同时每次握手生产的密钥都是不同的，保证即使本次握手密钥泄露也不会影响以前的通信（向前安全性）

同时客户端在第一次发送请求时直接包含了 client_params，服务器不必再等待客户端验证证书。节省了一个 RTT 时间。所以 TLS1.3 被成为 1-RTT 握手。

### 优化

* 会话复用

    Session ID 或 Session Ticket，一种存在服务器一种存在客户端的凭证。重新连接时只要查找到历史凭证则直接复用之前的密钥省去了生存密钥的流程。

* PSK

    优化到 0-RTT，只需要在会话复用的基础上，在首次请求中携带 HTTP 数据即可。同样这也存在被攻击的风险。

## HTTP2.0

### 优化

* 头部压缩

    建立一张哈希表，头部的数据不再传递具体的值，而是哈希表索引，可以大大减少传输的数据量。

    取消了请求行，将请求行放入头中，只不过键名前带“:”用来区分普通头

* 多路复用

    http 请求都被拆分为二进制帧，这些帧乱序的发送给服务端，也就解决了队头堵塞的问题。乱序的帧通过 steamID 组合起来（需要注意的是，这里的乱序是指不同的HTTP请求是乱序发送的，对于同一个请求是顺序发送的）

    steamID 自增且不重复，到达上限之后重开一个 TCP 连接从头开始

    流的通讯机制和 TCP 类似，发送 headers 帧打开连接，发送 steam_end 表示结束，发送方准备完毕之后回复 steam_end 关闭连接

* 服务器推送

    允许服务端发送额外的内容到客户端