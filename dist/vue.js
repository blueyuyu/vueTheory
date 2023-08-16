(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

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
      }
    });
  }
  class Observer {
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
  function observe(data, cb) {
    return new Observer(data);
    //  对每一个键值操作
    //   for (const [key, value] of Object.entries(data)) {
    //     defineReactive(data, key, value, cb);
    //   }
  }

  // 代理,代理这里是不可以defineReactive()会导致取值复制失效
  function _proxy(data) {
    // 箭头函数内的this,是外层的this
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        get() {
          console.log(`代理对象获取${data[key]}`);
          return data[key];
        },
        set(newData) {
          // 这里是一定要data[key]
          data[key] = newData;
          console.log("代理:值改变", data[key]);
        }
      });
    });
  }
  function initData() {
    // 观察_data上的键值存取操作
    observe(this._data);
    // 数据代理，可以通过实例直接访问
    _proxy.call(this, this._data);
  }
  function Vue(options) {
    const vm = this;
    vm.$options = options;
    vm._data = typeof options.data === "function" ? options.data() : options.data;
    initData.call(vm); // 直接调用this指向window,用call改变this
  }

  return Vue;

}));
//# sourceMappingURL=vue.js.map
