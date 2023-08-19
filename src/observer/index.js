import Dep from "./dep";
import { isObject } from "../utils";
import { myArrayPrototype } from "./array";

// window.deps = []
// 
function dependArray(arr){
  for (const item of arr) {
    if(item.__ob__){
      item.__ob__.dep.depend()
    }
    // 如果里面是数组，又要去调用自己
    if(Array.isArray(item)){
      dependArray(item)
    }
  }
}

export function defineReactive(obj, key, val, cb) {
    const dep = new Dep()
    // window.deps.push(dep)
  // obj中的每一个key 都有 闭包val
  // observe(val)

  const childOb = observe(val);

  Object.defineProperty(obj, key, {
    // 公共描述符
    configurable: true,
    enumerable:true,
    // 触发的b1的setter ，就会触发b1的dep的notify
    // 由于此时也需要通知b的watcher
    // 需要
    get() {
      console.log(`观察：在获取${key}的值${val}`);
      dep.depend()
      // console.log('definePro观察者',dep.subs)

      // 重点理解，这里一定要收集
      if(childOb){
        // 将当前的watcher 收集到当前对象的__obj__中，
        // 
        childOb.dep.depend()
      }
      // 此处 obj[key]栈溢出？？？
      return val;
    },
    set(newValue) {
      // console.log(`观察：在这里改变了${val}`);
      // 新值旧值一样不触发
      if(newValue === val) return
      // 这个赋值的东西也可能是{}
      observe(newValue)    
      
      const oldValue = val
      
      val = newValue;
      cb && cb(newValue,oldValue);
    
      // 当数据发生变化的时候，通知收集好的所有依赖，将最新的值传过来
      dep.notify()

      // obj.__ob__.dep.notify(newValue,oldValue)
     
    },
  });
}

export class Observer {
  dep;
  constructor(data) {
    this.dep = new Dep()

    // 通过数据 找到Observer对象
    Object.defineProperty(data,'__ob__',{
      value: this
    })

    // 处理数组
    if(Array.isArray(data)){

      // 要去修改原型，成自己的数组原型
      Object.setPrototypeOf(data,myArrayPrototype)
      this.observeArray(data)
    }else{
      this.walk(data);
    }
    
  }
  // 方法
  walk(data) {
    for (const [key, value] of Object.entries(data)) {
      defineReactive(data, key, value);
    }
  }

  observeArray(data){
    for (const value of data) {
      observe(value)
    }
  }
}

export function observe(data) {
  // 类型判断，这里没考虑数组
 // if(typeof data  !== 'object' || data === null) return ;
  if(!isObject(data)) return;

  if(typeof data.__ob__ === 'undefined'){
    return new Observer(data);
  }

  return data.__ob__;
}
