从输入 url 到页面呈现发生了什么

## 渲染

### 建图层树

由于 DOM 节点并不是单纯的从上至下排列，还存在层叠，所以还需要建立图层树，专门处理合成层（合成层会得到GPU加速）

某些特殊情况，其节点会被单独提取为一个合成层：

1. HTML 根元素

2. position 不为 static 且设置了 z-index

3. opacity 不为 1

4. transform 不为 none

5. filter 不为 none（filter：对图片的一些特效）

6. isolation 为 isolate（isolation: isolate 创建一个新的层叠上下文）

7. will-change 是以上任意一种（will-change：告诉浏览器某些属性即将变化）

8. 需要剪裁的地方（比如有子元素超出父元素大小，出现滚动条）

9. 层叠等级低的节点被提升为单独的图层之后，所有比他层叠等级高的节点都会成为一个单独的图层（会出现层爆炸）

https://juejin.cn/post/6844903966573068301

### 生成绘制列表

### 生成图块和生成位图

图层会被切割成小块，优先绘制可视区域窗口的。

合成层的位图是交给GPU合成的，会快很多

### 显示器显示内容

