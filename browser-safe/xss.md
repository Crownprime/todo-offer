## xss —— Cross Site Scripting（跨站点脚本攻击）

### 哪些操作

1. 窃取 Cookie

2. url 参数提交非法参数

3. 表单提交恶意脚本

4. 路由器等代理劫持，修改文档流

### 应对方法

1. 参数和输入必须要过滤

2. 保护 Cookie（HttpOnly）

3. 限制域名资源加载、静止向其他域提交数据