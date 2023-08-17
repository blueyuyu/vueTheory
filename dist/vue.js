(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    class Dep {
      subs = []; // 存放当前的依赖 watcher 实例
      constructor() {}
      // 添加依赖
      addSub() {}

      // 收集依赖
      depend() {
        if (Dep.target) {
          this.subs.push(Dep.target);
        }
      }

      // 通知依赖
      notify(newValue, oldValue) {
        for (const watcher of this.subs) {
          watcher.update(newValue, oldValue);
        }
      }
    }

    function defineReactive(obj, key, val, cb) {
      const dep = new Dep();
      // obj中的每一个key 都有 闭包val
      Object.defineProperty(obj, key, {
        get() {
          console.log(`观察：在获取${obj}的值${key}`);
          dep.depend();
          return val;
        },
        set(newValue, oldValue) {
          console.log(`观察：在这里改变了${val}`);
          // 新值旧值一样不触发
          if (newValue === val) return;
          val = newValue;
          cb && cb(val);

          // 当数据发生变化的时候，通知收集好的所有依赖，将最新的值传过来
          dep.notify(newValue);
        }
      });
    }
    class Observer {
      dep;
      constructor(data) {
        this.dep = new Dep();
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
    }

    class watcher {
      vm;
      exp;
      cb;
      constructor(vm, exp, cb) {
        this.vm = vm;
        this.exp = exp;
        this.cb = cb;
        this.get();
      }
      get() {
        // 先把watcher 存到一个公共的地方
        Dep.target = this;
        const _data = this.vm._data;
        // _data[this.exp] 触发 =》get => dep.depend() =>
        const value = _data[this.exp];
        // 收集完成之后清空
        Dep.target = null;
        return value;
      }
      // 给Dep的notify
      update(newValue, oldValue) {
        this.cb && this.cb(this.vm, newValue, oldValue);
      }
    }

    // 代理,代理这里是不可以defineReactive()会导致取值复制失效
    // 此处代理
    function _proxy(data) {
      // 箭头函数内的this,是外层的this
      //   Object.keys(data).forEach((key) => {
      //     Object.defineProperty(this, key, {
      //       get() {
      //         console.log(`代理对象获取${data[key]}`)
      //         return data[key];
      //       },
      //       set(newData) {
      //         // 这里是一定要data[key]
      //         data[key] = newData;
      //         console.log("代理:值改变", data[key]);
      //       },
      //     });
      //   });
      for (const key of Object.keys(data)) {
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
      }
    }
    function initData(vm) {
      // 观察_data上的键值存取操作
      observe(vm._data);
      // 数据代理，可以通过实例直接访问
      _proxy.call(vm, vm._data);
    }
    function initWatch(vm, watch) {
      if (watch) {
        const entries = Object.entries(watch);
        console.log('打印他的enti', entries.length);
        for (const [key, value] of entries) {
          new watcher(vm, key, value);
        }
      }
    }

    // vue 用function，不用class的原因，function可枚举
    function Vue(options) {
      const vm = this;
      vm.$options = options;
      vm._data = typeof options.data === "function" ? options.data() : options.data;
      initData(vm); // 直接调用this指向window,用call改变this
      initWatch(vm, options.watch); // 以传参的方式是不需要改变call的指向
    }

    // 这里 function 不能用箭头函数，箭头函数向上找this 这里的是 window,
    Vue.prototype.$watch = function (exp, cb) {
      new watcher(this, exp, cb);
    };

    return Vue;

}));
//# sourceMappingURL=vue.js.map
