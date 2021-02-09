## 回流重绘

开销：回流>重绘>合成

### 回流

1. 回流触发原因

    1. 几何属性变化

    2. DOM 增减或者移动

    3. 读写 offset、scroll、client 属性时

    4. 调用 window.getComputedStyle

2. 回流是从 DOM 树生成重新走一遍，开销非常大

### 重绘

1. 触发条件

    * 修改了样式，元素位置信息不需要更新

2. 不用建树，直接绘制列表

### 合成

transform、opacity、filter 修改，是跳到合成步骤，即GPU加速

### 意义

* 避免频繁使用 style，而采用 class 方式

* 使用 createDocumentFragment 对 DOM 批量操作（createDocumentFragment： 创建虚拟节点）

* resize 和 scroll 等需要防抖/节流处理

* will-change 提升图层，实现 GPU 加速