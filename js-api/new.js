/**
 * 如果模拟实现 new 的效果
 */

/**
 * 首先要知道 new 做了什么
 * 1. 让实例可以访问私有属性
 * 2. 让实例可以访问构造函数原型(constructor.prototype)所在原型链上的属性
 * 3. 让构造函数返回的结果不是引用数据类型
 */

// 先思考为什么我们会使用 new，理论上是一种面向对象的编程
// 我们定义出 Persion 对象就可以轻松批量定义老人和儿童
function Persion(name, age) {
    this.name = name;
    this.age = age;
    this.walk = function () {};
};

// 要明白 child 和 oldman 都是由 Persion 创造的实例继承 Persion 所有的属性
// 但是 child oldman Persion 之间没有共享内存，是完全独立的变量
const child = new Persion("job", 1);
const oldman = new Persion("mark", 100);

/**
 * 模拟 new
 * @param {*} ctor 
 * @param  {...any} args 
 */
function newFactory(ctor, ...args) {
    if (typeof ctor !== 'function') {
        throw "first param must be a function";
    }
    // new 必须开辟一片全新的内存
    let obj = new Object();
    // 把 ctor 上所有原型都拷贝到新对象上
    // 使用 Object.create 的原因是因为其类似继承
    obj.__proto__ = Object.create(ctor.prototype);
    // 调用 ctor 的构造方法，把 this 指向新对象，并且传递参数
    let res = ctor.apply(obj, args);
    // 如果构造方法返回了 Object 或者 Function 则返回构造方法返回的东西（排除 null）
    if ((typeof res === 'object' && res !== null) || typeof res === 'function') {
        return res;
    }
    // 否则返回新对象
    return obj;
}

// instanceof 检查 object 的原型链上是否是 constructor.prototype
console.log(newFactory(Persion, 'mob', 100) instanceof Persion);
