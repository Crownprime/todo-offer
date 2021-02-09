/**
 * 深拷贝
 */
// 简易版
// JSON.parse(JSON.stringify());
// 拷贝循环引用会栈溢出
// 不能拷贝正则、Date、Set、Map、函数

const deepCopy = (target, map = new WeakMap()) => {
    const isObject = target => (typeof target === 'object' || typeof target === 'function') && typeof target !== null;
    const getType = target => Object.prototype.toString(target);
    const canTraverse = {
        '[object Map]': true,
        '[object Set]': true,
        '[object Array]': true,
        '[object Object]': true,
        '[object Arguments]': true
    }
    const handleNotTraverse = (target, type) => {
        const Ctor = target.constructor;
        switch(type) {
            case '[object Boolean]':
                return new Object(Boolean.prototype.valueOf.call(target));
            case '[object Number]':
                return new Object(Number.prototype.valueOf.call(target));
            case '[object String]':
                return new Object(String.prototype.valueOf.call(target));
            case '[object Symbol]':
                return new Object(Symbol.prototype.valueOf.call(target));
            case '[object Date]':
                return new Ctor(target);
            case '[object RegExp]':
                return handleRegExp(target);
            case '[object Function]':
                return handleFunction(target);
            default:
                return new Ctor(target);

        }
    }
    const handleRegExp = target => {
        const { source, flags } = target;
        return new target.constructor(source, flags);
    }
    const handleFunction = target => {
        if (!target.prototype) return target;

        const bodyReg = /(?<={)(.|\n)+(?=)})/m;
        const paramReg = /(?<=\().+(?=\)\s+{)/;
        const funcString = target.toString();
        const param = paramReg.exec(funcString);
        const body = bodyReg.exec(funcString);
        if (!body) return null;

        if (param) {
            const paramArr = param[0].split(",");
            return new Function(...paramArr, body[0]);
        } else {
            return new Function(body[0]);
        }
    }

    // 如果不是对象类型的或者是 null 直接返回就行
    if (!isObject(target)) {
        return target;
    }
    let copySpace;
    const type = getType(target);
    if (!canTraverse[type]) {
        return handleNotTraverse(target, type);
    } else {
        let ctor = target.constructor;
        copySpace = new ctor();
    }

    // 使用 map 记录所有的拷贝对象，如果存在已经有的直接返回
    if (map.get(target)) {
        return target;
    }
    if (type === '[object Map]') {
        target.forEach((item, key) => {
            copySpace.set(deepCopy(key, map), deepCopy(item, map));
        });
    }
    if (type === '[object Set]') {
        target.forEach(item => {
            copySpace.add(deepCopy(item, map));
        });
    }
    for (let item in target) {
        // 此处要排除一些继承的属性，比如 toString 等
        if (target.hasOwnProperty(item)) {
            // 递归
            cloneSpace[item] = deepCopy(target[item], map);
        }
    }
};

let obj = { val: 100 };
obj.target = obj;
let copy = deepCopy(obj);

obj.val = 200;
console.log(copy);