从输入 url 到页面呈现发生了什么

## 网络

### 发起网络请求

#### 构建请求行

``` GET url HTTP/1.1 ```

#### 强缓存命中

如果强缓存命中，则无需发起网络请求，直接使用本地缓存（跳过所有网络步骤）

强缓存是否命中是判断 header 中的 ```expires``` 或者 ```cache-control``` 字段

1. expires 是 HTTP1.0 定义的字段，返回一个时间戳，在时间戳内则缓存命中

2. cache-control 是 HTTP1.1 新增字段，优先级更高

    * max-age 和 s-max-age，多少秒内有效；s-max-age 优先级更高；在代理服务器中仅 s-max-age 有效

    * public 和 private，private 是默认值，禁止代理服务器缓存；因此若设置了 s-max-age 就相当于是 public

    * no-cache 和 no-store，优先级比 max-age 高，no-cache 是直接走协商缓存，no-store 就是强制不缓存

3. pragma 是 HTTP1.0 非正规的属性，很少用，不过优先级是最高的有 no-cache 和 no-store，意义和 cache-control 相同

#### DNS 解析

一般来说 url 是一个域名，浏览器会进行 DNS 解析得到对应的 ip，若本地没有缓存则会去最近的 DNS 服务器查找（若 DNS 服务器也没有则继续向上级查找，直至根 DNS 服务器）

若对应的域名解析配置了 cname 则会解析出对应 cdn 服务器的域名，然后再根据 cdn 域名去解析 cdn 的 ip，一般 cdn 的服务商会有相应的均衡负载策略（比如根据地理位置），给出最佳的响应的服务器 ip 地址

#### TCP 连接

TCP 连接是可靠的传输层协议，建立该连接会经历三个阶段：

1. 三次握手

2. 数据传输

3. 四次挥手

#### HTTP 请求

发起 HTTP 请求，有三个主要内容：

1. 请求行，由请求方式、请求 uri 和 HTTP 协议的版本组成

    * 

2. 请求头，常见的 Cache-Control、If-Modified-Since、If-None-Match、Cookie、User-Agent 等

    * 需要注意 Content-Length 标记了传输内容的长度，如果该属性不正确可能导致数据被截断或者超时

    * 在传输大文件等传输长度未知时，会设置 Transfer-Encoding: chunked 意为分块传输，传输到块的大小为 0 时则表示结束，此时 Content-Length 无效

    * 若 Connection: keep-alive 时，Content-Length 和 Transfer-Encoding 就至关重要；当其为 close 时，关闭 tcp 连接就意味着传输结束，上述两个属性就可有可无了

3. 请求体

#### HTTP 响应

响应的表现与请求基本一致

若响应的状态码出现 403 意味着命中协商缓存，则表示客户端需要从本地取出缓存文件使用，服务器不会传输该请求资源，协商缓存的判定方法有两种：

1. last-modified & If-Modified-Since

    * 缓存响应头会携带该文件最后改动的时间戳，以 Last-Modified 传递给客户端。当客户端发起请求会将本地缓存的时间戳以 If-Modified-Since 传递给服务器做校验，若文件无更新则命中缓存

    * 存在缺陷，若服务器文件为全量发布，该文件可能改动时间戳变化了但文件本身没有变化，引起不必要的数据传输

2. etag & If-None-Match

    * 与上述原理类似，只是将时间戳改为文件哈希值，弥补了其缺陷。由于比 Last-Modified 描述精准，所以优先级更高

    * 缺点，生成哈希值开销比较大