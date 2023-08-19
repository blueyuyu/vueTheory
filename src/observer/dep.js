export default class Dep {
    subs = [] // 存放当前的依赖 watcher 实例
    static target = null // 用于存放当前属性
    constructor(){

    }
    // 添加依赖
    addSub(){
    }

    // 收集依赖
    depend(){
        if(Dep.target && !this.subs.includes(Dep.target)){
            this.subs.push(Dep.target)
        }
    }
    // 通知依赖
    notify(){
        for (const watcher of this.subs) {
            watcher.update()
        }
    }
}