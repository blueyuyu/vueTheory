function defineReactive(obj, key, val, cb) {
  // obj中的每一个key 都有 闭包val
  Object.defineProperty(obj, key, {
    get() {
      console.log(`观察：在获取${obj}的值${key}`);
      return val;
    },
    set(newValue) {
      console.log(`观察：在这里改变了${val}`);
      val = newValue;
      cb && cb();
    },
  });
}

export class Observer {
  constructor(data) {
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
  //  对每一个键值操作
  //   for (const [key, value] of Object.entries(data)) {
  //     defineReactive(data, key, value, cb);
  //   }
}
