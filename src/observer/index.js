import Dep from "./dep";

function defineReactive(obj, key, val, cb) {
    const dep = new Dep()
  // obj中的每一个key 都有 闭包val
  Object.defineProperty(obj, key, {
    get() {
      console.log(`观察：在获取${obj}的值${key}`);
      dep.depend()
      return val;
    },
    set(newValue,oldValue) {
      console.log(`观察：在这里改变了${val}`);
      // 新值旧值一样不触发
      if(newValue === val) return
      val = newValue;
      cb && cb(val);
    
      // 当数据发生变化的时候，通知收集好的所有依赖，将最新的值传过来
      dep.notify(newValue)
    },
  });
}

export class Observer {
  dep;
  constructor(data) {
    this.dep = new Dep()
    this.walk(data);
  }
  // 方法
  walk(data) {
    for (const [key, value] of Object.entries(data)) {
      defineReactive(data, key, value);
    }
  }
}

export function observe(data, cb) {
  return new Observer(data);
}
