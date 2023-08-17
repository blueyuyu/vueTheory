export default class Dep {
    subs = [] // 存放当前的依赖 watcher 实例
    constructor(){

    }
    // 添加依赖
    addSub(){
    }

    // 收集依赖
    depend(){
        if(Dep.target){
            this.subs.push(Dep.target)
        }
    }

    // 通知依赖
    notify(newValue,oldValue){
        for (const watcher of this.subs) {
            watcher.update(newValue,oldValue)
        }
    }
}