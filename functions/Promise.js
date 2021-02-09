/**
 * 实现 Promise.all
 * 其有几个重要性质：
 * 1. list 中的异步方法同时发送（而不是等待上一个返回才发送下一个）
 * 2. 如果成功，则要按照顺序返回结果数组（不能谁先到谁放在前面）
 * 3. 如果有一个失败，则直接返回失败的信息
 * @param {*} list 
 */
function PromiseAll(list) {
    // Promise.all 本质上还是一个 Promise ,所以要返回一个 Promise
    return new Promise((resolve, reject) => {
        let resList = [];
        // 计数是确保所有数据都到达之后需要 resolve
        let count = 0;
        for (let i = 0; i < list.length; i++) {
            // 过滤一下非法的输入
            if (!list[i]) {
                count++;
                continue;
            }
            list[i]().then(data => {
                // 需要按顺序放入
                resList[i] = data;
                count++;
                // 如果已经是最后一个了就可以返回了
                if (count >= list.length) {
                    resolve(resList);
                }
            })
            .catch(err => {
                // 如果其中一个有问题则直接返回当前错误
                reject(err);
            });
        }
    })
}


/**
 * 一些应用的可能性：
 * 因为连接数原因，要求批量的发送请求
 * eg：一共有 list 请求，每次发送 n 个
 */
async function PromiseCount(list, n) {
    let resList = [];
    while(list.length) {
        let putList = [];
        for (let i = 0; i < n; i++) {
            if (list.length) {
                putList.push(list.shift());
            }
        }
        resList.push(...await Promise.all(putList));
    }
    return resList;
}