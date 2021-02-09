/**
 * 实现 call
 */
Function.prototype.call = function(context = window, ...args) {
    // 使用 Symbol 防止属性覆盖
    let key = Symbol();
    // 把次方法赋值到指定对象内执行
    context[key] = this;
    let result = context[key](...args);
    // 执行完之后移除
    delete context[key];
    return result;
}

/**
 * 实现 apply
 */
Function.prototype.apply = function(context = window, args = []) {
    let key = Symbol();
    context[key] = this;
    let result = context[key](...args);
    delete context[key];
    return result;
}

/**
 * 使用 es5 的方法处理输入参数
 */
// Function.prototype.call = function(context) {
//     // context = context || window;
//     // var args = [];
//     // for (var i = 1; i < arguments.length; i++) {
//     //     args.push('arguments[' + i + ']');
//     // }
    
//     // context.$fn = this;
//     // var result = eval("context.$fn(" + args.join(',') + ")");
//     // delete context.$fn;
//     // return result;W
//     context.$fn(arguments);
// }

// // test
// function test() {
//     return this.a;
// }
// console.log(test.call({ a: "2" }, 1, 2));
// console.log(test.apply({ a: "2" }));
