## CSRF —— Cross-sit request forgery 跨站点请求伪造

### 什么操作

核心思想是在自己的钓鱼网站上，有隐式的向被攻击网址的脚本。用户的访问都是黑客的流量攻击

### 如何防范

1. Cookie 的 SameSite（太重要了）

    * Strict、Lax、None

2. CSRT Token，主要应用于模板渲染的应用，渲染是签发 Token

3. 验证 Origin 和 Referer（这个可以伪造）