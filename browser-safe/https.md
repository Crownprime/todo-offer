## https

在 http 和 tcp 之间增加一个加密环节

该加密环节是对称加密和非对称加密的混合操作

1. 对称加密

    1. 客户端发送 client_random 和 加密列表给服务端

    2. 服务端发送 server_random 和挑选的加密方法返给客户端

    3. 将 client_random 和 server_random 用这种加密方法混合加密组成密钥

这种情况，中间人可以在两边拦截 client_random 和 server_random 和加密方法伪造密钥，所以并不安全

2. 添加非对称加密

    1. 客户端发送 client_random 和 加密列表给服务端

    2. 服务端发送 server_random 、挑选的加密方法和公钥返给客户端

    3. 客户端再生成 pre_random 用 公钥加密传给服务端（重要）

    4. 服务端用私钥解密 pre_random

    5. 将 client_random 和 server_random 和 pre_random 加密作为密钥

尽管中间人可以拿到 client_random、server_random、加密方法，可惜拿到的 pre_random 是加密的，私钥仅存在服务端无法获得，所以无法伪造最终的密钥。并且最终的通讯是使用加工而成的密钥做对称加密，开销也小很多。

但还存在一个问题，公钥和私钥都是由服务端提供的，如果中间人劫持客户端请求到自己的服务端，并且伪造公钥和私钥，用户就会把信息源源不断的发给劫持人的服务器。

3. 数字证书

所以所有的 HTTPS 站点都必须有数字证书，这里的数字证书就代替了上方步骤中公钥的位置。

数字证书中存在一串明文、一个hash函数、公钥。hash（明文） === 公钥解密明文，则可以保证合法