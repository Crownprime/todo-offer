## TCP 和 UDP

TCP 是面向连接的、可靠的、基于字节流的传输层协议

UDP 是面向无连接的传输层协议

相较于 UDP，TCP有以下优势：

* 面向连接

    连接就是客户端和服务端的连接。要经历三次握手和四次分手来确保连接有效。

* 可靠的

    TCP 是有状态和可控制的连接

    * TCP 精确记录的哪些数据被发送、哪些数据被接受，而且确保包顺序到达，不会出错

    * 出现网络波动或丢包的情况，TCP 可以自主控制发送速度或者重新发送

* 面向字节流

    TCP 将 IP 层的 IP 包变成来字节流

## TCP 三次握手

三次握手是为了确认双方都是发送和接收数据的能力

1. 客户端发送 SYN，seq = x

2. 服务端接收到客户端包后发送 SYN，ACK，seq = y，ack = x + 1

3. 客户端接收服务端确认消息后发送 ACK，ack = y + 1

### SYN 是消耗型的序列号

可以发现发送方的 seq 被接收方得到后返回的 ack 都会 + 1。

也就是发送方在确认上次的报文是否成功被接收到是查看下条接收到的消息的 ack 是否是自己发送的 SYN 值 + 1。那为什么直接确认 SYN 呢？

* TCP 的报文是有顺序的，SYN 递增可以用来对接收到的报文排序

* 假设 SYN 不会自增，ACK 的确认只能依靠接收消息的先后关系。那么网络波动或者超时重发造成的冗余包都会导致确认消息混乱。

### 为什么两次不够

由于 TCP 连接往往是一方首先发起连接。三次握手的特征是被连接方需要二次确认发起连接方的发送消息能力。

由于存在网络延迟超时重发等问题，某些包可能在连接关闭以后又到达被连接方，如果没有不需要第三次确认，被连接方直接打开连接等待数据会造成不必要的浪费。

### 握手的时候可以携带数据吗？

第三次握手的时候客户端可以携带数据，服务端在收到 ACK 无误的情况可以直接拿到数据

而前两次握手不能携带数据，不然黑客可以在首次请求携带大量数据攻击服务端

### TCP 可以同时握手吗，会怎样？

是存在同时握手的情况，这种情况会其实只需要握手两次，进行四个数据包的传输。

1. 客户端、服务端同时发送 SYN，seq = x ｜ SYN，seq = y

2. 客户端接收到服务端信息时发送 SYN，ACK，seq = x，ack = y + 1；服务端接收到客户端信息发送 SYN，ACK，seq = y，ack = x + 1

## 四次挥手

1. 客户端发送结束信号，FIN，seq = x

2. 服务端接收到信号之后发送，ACK，ack = x + 1

    * 此信号的必要性，服务端接到结束信号还需要一定处理时间才能关闭（包括数据处理、发送完正在发送的数据）。所以先发送一个信号告诉客户端已经收到 FIN 信号。

3. 服务端结束了所有数据的发送，进入 LASR-ACK 状态，FIN，ACK，seq = y，ack = x + 1

4. 客户端发送 ACK，ack = y + 1。等待 2 个 MSL 后关闭连接。服务端收到该信息之后关闭连接。

    * 客户端要留足 2MSL（报文最大生存时间），即报文在双端一来一回的时间。如果在此期间继续接到服务端报文则重复发送 ACK

### 同时关闭会怎么样

同时关闭要比单方面简单一些？因为双方都没有多余数据，可以干脆的断开连接。

1. 客户端和服务端同时发送结束信号，FIN seq = x ｜ FIN，seq = y

2. 客户端和服务端接收到对方的结束信号之后都回复 ACK，ACK，ack = y + 1 ｜ ACK，ack = x + 1。并且双方等待 2MSL 之后关闭连接。

## SYN FLOOD 攻击

Dos/DDos 攻击。伪造大量 IP，并行发送 TCP 连接请求。

* 半连接队列被占满

* 由于服务端得不到第三次握手的回应会不断的超时重发，占用资源

### 半连接队列和全连接队列

在 TCP 连接建立之前的 SYN 都会被推入半连接队列，而连接之后的报文则进入全连接队列

### 应对方法

1. 增大半连接队列

2. 减少重试次数

3. SYN Cookie 技术，收到第一次握手报文并不立即分配资源，根据收到的 SYN 计算一个 Cookie，连同 Cookie 发送 ACK，只有第三次握手报文携带 Cookie 才分配资源。

## TCP 报文头部

### 源 IP、源端口、目标 IP、目标端口

TCP连接通过源 IP、源端口、目标 IP、目标端口作为唯一标示。

而报文头部仅含有源端口和目标端口，因为 IP 已经在 IP 层处理了。

源端口、目标端口各占 2 各字节的空间

### 序列号

即 seq，用于标记报文顺序和连接时交换的

ISN，即初始的 seq，并非一个固定值，而是一个每 4ms + 1 ，溢出则置 0 的置，主要目的是防止 seq 被猜测拦截导致的恶意攻击。

seq 为 4 个字节大小

### 确认号

即 ack，用于确认小于该 ack 的报文全部被接收到

与 seq 相同，为 4 个字节

### 标记位

SYN、ACK、FIN、RST、PSH。均占 1 位大小

* SYN，用于确定 seq 是否有效

* ACK，用于确定 ack 是否有效

* FIN，用于确定是否关闭连接

* RST，强制断开连接

* PSH，即 push，告知该数据包得到应该立即交给上层，不能缓存

### 窗口大小

2 个字节，但远远不够，所以在可选项中存在缩放窗口的比例因子

### 校验和

用于校验数据是否有损坏，损坏则直接丢弃等待重传

2 个字节

### 可选项

种类（1 个字节） + 长度（1个字节） + 值

* timeStamp 时间戳

* MSS 允许从对方接收最大报文大小

* SACK 选择确认选项

* window scale 窗口缩放选项

## TCP 快速打开（TFO）

首次握手时，服务端通过 SYN 计算 Cookie，放到 Fast Open字段中传递给客户端储存。

通过这种方式，三次握手流程大大缩短

1. 客户端发起请求，SYN、Cookie、Http 请求

2. 服务器验证 Cookie 无误后直接响应 Http请求，发送 SYN，ACK 同时发送 Http 响应

3. 客户端接收到 ACK 之后返回 ACK 完成三次握手

虽然仍然走完了三次握手的流程，但 Http 响应得以在 1 个 RTT 时间内提前传输。

## TCP 中时间戳的作用

时间戳是在可选字段中，共 10 个字节【类型 1 字节 + 长度 1 字节 + 时间戳 8 字节】

* 用于计算 RTT

* 用于防止 SYN 溢出置 0 之后的回绕

## 超时重传

当发出去的报文，在一定时间内没有被响应，则认为服务端没有接收到该报文，则需要重新传送。

### RTO 超时重传时间

由于网络波动并不稳定，每次 RTT 并不相同，所以经过一定计算

1. 经典方法

    SRTT = a * SRTT + (1- a) * RTT

    a 为平滑因子，建议值为 0.8（0.8-0.9）

    RTO = min(ubound, max(lbound, b * SRTT))

    b 为加权因子，一般为1.3-2.0，ubound为上界，lbound为下界

    由于 a 较小，每次的 RTT 对 RTO 的影响太小了，在一些 RTT 波动较大的地方并不适用

2. 标准方法 Jacobson/Karels 算法

    SRTT = (1 - a) * SRTT + a * RTT

    a 取值 0.125，值得注意的是 RTT 对 SRTT 影响变得更小了

    RTTVAR = (1 - b) * RTTVAR + b * | SRTT - RTT |

    b 为 0.25，此处计算了 SRTT 和 RTT 之间的差值，用于影响最后的结果

    RTO = c * SRTT + d * RTTVAR

    c 一般为 1，d一般为 4

    该方法在计算 SRTT 的基础之上，RTO 又很好的受每次 RTT 的影响

## 流量控制

流量控制主要为发送端和接收端做流量控制，保证发送接收的效率始终维持在双端可以接收的范围内

### 滑动窗口

所有数据包已队列形式存在，其中包含：

* 已发送已确认的数据包

* 已发送未确认的数据包

* 未发送可以发送的数据包

* 未发送不能发送的数据包

而选取以滑动窗口的形式存在，滑动窗口内包含的为上述已发送但为确认的数据包和未发送可以发送的数据包，而窗口大小的调节则直接影响了数据包发送速率，这也是流量控制的主要原理

### 确认滑动窗口大小

1. 双方均有初始的滑动窗口大小，设为 a。当发送端发送 a 大小数据包到接收端

2. 接收端接收之后，只能马上处理 b （b <= a）个数据包，剩余数据包 a - b 放入缓冲队列，此时很明显表明发送速率 a 让接收端难以承受。对于接收端而言，有 a - b 个数据被放入缓冲队列，那么队列还空余 a - (a - b) = b 的空间，接收端将剩余空间放入 ACK 中回传给发送端

3. 发送端接收到信息，首先有 b 个数据包已经得到了确认，那么滑动窗口向右移动 b 个单位，然后调整窗口大小到 b 已适应接收端处理效率

## 拥塞控制

TCP 拥塞控制主要依靠：慢启动、拥塞避免、快速重传和快速恢复

上文提到的滑动窗口收到接收方的影响（rwnd）但并没有考虑到网络因素，如果存在接收方处理速度较快，但网络质量不佳，发送方大量发送数据拥堵造成大量丢包是不可取的。所以拥塞控制策略维护一个拥塞窗口（cwnd）。发送窗口 = min(rwnd，cwnd)

### 慢启动

刚启动时并不知道网络质量如何，所以限定 cwnd 为一个较小的值，每次 ACK 之后 cwnd 翻倍增长。

### 拥塞避免

当到达拥塞阈值之后，cwnd 增长速度放慢，每个 ACK 仅增长 1 / cwnd 倍。

拥塞阈值在快速恢复步骤中被确定

### 快速重传

假设 1，2，3，5，6均已到达，唯独 4 丢包，接收方仍然发送 ACK 为 3。当发送发接收到连续三个相同的 ACK 即可判定存在丢包，则将该包重新发送。

#### 选择性重传

接收方发现丢包之后发送的 ACK 中还可以携带额外数据表明哪些区间的数据已经到达，比如 5，6已经到达。则重传时5，6就可以不用发送。

### 快速恢复

当发现丢包现象，表明已经出现网络拥堵，则需要快速恢复：

此时的cwnd设定为拥塞阈值，cwnd 调整为原来的一半，同时 cwnd 恢复线性增长。

## Nagle 算法和延迟确认

两者一起使用（延迟发送+延迟确认）可能会带来较大的延迟问题

### Nagle 算法

当每个数据包很小，发送大量数据包这种频繁操作效率极低，所以 Nagle算法做出规定：

第一个包可以直接发送，哪怕很小

后续的包满足任意条件也可以发送：

1. 包大小达到 MSS（Max Segment Size 最大段大小）

2. 前面所有包的 ACK 都得到确认

### 延迟确认

假设 SYN1 和 SYN2 都快速的到达了，那么不需要发送两个 ACK，直接发送一个 ACK = seq2 即可。

但同时规定这种延迟确认的行为必须小于 500ms。而且遇到以下行为必须立即发送：

1. 接收到大于一个 frame 的报文，且必须要调整窗口大小

2. quickack 模式

3. 发现了乱序包

