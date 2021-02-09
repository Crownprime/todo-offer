/**
 * 模拟 bind
 */
/**
 *  bind 做了一件事
 * 普通函数：改变 this 指向
 * 构造函数：改变 this 指向，要保证 prototype 不丢失
 * 要注意 bind 可以接受额外的参数，这些参数将会按顺序放在生成的新方法中运行（优先新方法中的传参）
 */
// 需要特别注意 bind 不能改变构造函数的 this 指向
// let obj = {
//     a: '1',
//     console() {
//         console.log(this);
//     }
// };
// let Fn = function() {
//     this.a = "2";
//     this.console = function() {
//         console.log(this);
//     }
// }
// let Fn2 = Fn.bind(obj);
// let fn2 = new Fn2();
// fn2.console();
// fn2 内部的 this 指向依然指向实例本身
// 使用 bind 之后 prototype 并没有丢失，所以在 new 的时候 prototype 会被创建到新对象的 __proto__ 上去，并且该新对象会被用于构造函数的apply方法当作第一个参数传入

Function.prototype.bind = function(context, ...args) {
    if (typeof this !== 'function') {
        throw "bind only be used in function";
    }
    // 保存一下 this，指向的就是方法本身
    let self = this;
    let fnBound = function() {
        // 这里有两种情况
        // 如果 this instanceof self ,其中 this 为调用的时候的对象，如果是构造方法则指向实例本身，他的原型是 self
        // 为 true，表示该方法构造函数，this 要指向实例
        // 如果为 false 表示是普通方法，this 指向指定的对象
        self.apply(this instanceof self ? this : context, args.concat([].slice.call(arguments)));
    }
    // 为其原型上绑定实例，该项不能丢失
    fnBound.prototype = Object.create(this.prototype);

    return fnBound;
}
