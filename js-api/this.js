/**
 * this 规则
 * 1. 默认指向 window，严格模式下指向 undefined
 * 2. 对应 function，谁调用它 this 就指向谁（在调用的时候才决定 this 是谁）
 * 3. 箭头函数内部没有 this，所以内部的 this 就是最近的 function 的 this（在定义时就已经决定了 this 指向）
 * 4. new 构造函数中的 this 指向实例对象
 */
