import Dep from './dep.js';

export default class watcher {
    vm;
    exp;
    cb;
    constructor(vm,exp,cb){
        this.vm = vm
        this.exp = exp
        this.cb = cb
        this.get()
    }
    get(){
        // 先把watcher 存到一个公共的地方
        Dep.target = this
        const _data = this.vm._data
        // _data[this.exp] 触发 =》get => dep.depend() =>
        const value = _data[this.exp]
        // 收集完成之后清空
        Dep.target = null 
        return value
    }
    // 给Dep的notify
    update(newValue,oldValue) {
        this.cb && this.cb(this.vm,newValue,oldValue)
    }
}