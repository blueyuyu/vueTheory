import Dep from "./dep.js";

function parsePath(path){
  const keys = path.split('.') // ['a','b','c']
  return function(obj){
    for (const key of keys) {
      obj = obj[key]
    }
    return obj
  }
}

export default class watcher {
  vm;
  exp;
  cb;
  value; // 计算属性的value.缓存的
  getter; // 用于 支持watch 的.语法
  lazy = false; // 懒数据
  dirty = false; // 脏数据，数据变化，computed数据没有发生变化

  constructor(vm, exp, cb, options = {}) {
    this.vm = vm;
    this.exp = exp;
    this.cb = cb;

    console.log('watch exp',typeof exp);
    
    if(typeof exp === 'function'){
      this.getter = exp
    }else{
      this.getter = parsePath(this.exp)
    }

    this.getter =  parsePath(this.exp) // 支持watch 的点语法

    this.lazy = !!options.lazy;
    // 如果刚开始是懒惰的，就不会计算，所以第一次应该获取为dirty = true
    this.dirty = this.lazy;
    // 不是lazy 才需要获取，重新计算
    if (!this.lazy) {
      this.value = this.get(); // 要存起来
    }
  }
  get() {
    // 先把watcher 存到一个公共的地方
    Dep.target = this;
    // const _data = ;
    let value = this.getter.call(this.vm,this.vm._data);

    // if (typeof this.exp === "function") {
    //   value = this.exp.call(this.vm);
    // } else {
    //   value = _data[this.exp];
    // }
    // _data[this.exp] 触发 =》get => dep.depend() =>

    // 收集完成之后清空
    Dep.target = null;
    return value;
  }
  // 给Dep的notify
  update() {
    // 是懒惰的，说明是计算属性，
    // 先标记为肮脏
    if (this.lazy) {
      this.dirty = true;
    } else {
      // this.cb && this.cb(this.vm, newValue, oldValue);
      this.run()
    }
  }

  run(){
    // 存储旧值
    const oldValue =  this.value;
    // 新的值，获取并且覆盖
    this.value = this.get()

    if(this.value !== oldValue){
      this.cb && this.cb.call(this.vm,this.value,oldValue)
    }
  }
}
