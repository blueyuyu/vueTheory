// 创建一个自己的数组原型

export const myArrayPrototype = Object.create(Array.prototype)

const reactMethods = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice', // (开始下标，删除个数，添加数据)
    'sort',
    'reverse'
]
//  添加变异方法

// 新增数据也要做响应式处理

for (const method of reactMethods) {
    Object.defineProperty(myArrayPrototype,method,{
        configurable: true, // 
        enumerable: false,
        writable:true,
        value: function reactMethods(...args){
            // 先保留原有的功能
           const OriginReturnValue =  Array.prototype[method].call(this, ...args)

            console.log(`监听调用的数组的${method}方法`);

            let inserted = []
            switch (method) {
                case 'push':
                case 'unshift': {
                    inserted  = args.slice(2)
                    break;
                }                       
                default:
                    break;
            }

            // 给添加的元素做响应式处理
            this.__ob__.observeArray(inserted)

            // 通知数组响应式
            this.__ob__.dep.notify(this,this)
            // 方法的返回值要保留
            return  OriginReturnValue
        }
    })
    
}
