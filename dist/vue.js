(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    class Dep {
      subs = []; // 存放当前的依赖 watcher 实例
      static target = null; // 用于存放当前属性
      constructor() {}
      // 添加依赖
      addSub() {}

      // 收集依赖
      depend() {
        if (Dep.target && !this.subs.includes(Dep.target)) {
          this.subs.push(Dep.target);
        }
      }
      // 通知依赖
      notify() {
        for (const watcher of this.subs) {
          watcher.update();
        }
      }
    }

    function isObject(value) {
      // 此处 value !== null ?? 多此一举吧
      return typeof value === 'object' && value !== null;
    }

    // 创建一个自己的数组原型

    const myArrayPrototype = Object.create(Array.prototype);
    const reactMethods = ['push', 'pop', 'shift', 'unshift', 'splice',
    // (开始下标，删除个数，添加数据)
    'sort', 'reverse'];
    //  添加变异方法

    // 新增数据也要做响应式处理

    for (const method of reactMethods) {
      Object.defineProperty(myArrayPrototype, method, {
        configurable: true,
        // 
        enumerable: false,
        writable: true,
        value: function reactMethods(...args) {
          // 先保留原有的功能
          const OriginReturnValue = Array.prototype[method].call(this, ...args);
          console.log(`监听调用的数组的${method}方法`);
          let inserted = [];
          switch (method) {
            case 'push':
            case 'unshift':
              {
                inserted = args.slice(2);
                break;
              }
          }

          // 给添加的元素做响应式处理
          this.__ob__.observeArray(inserted);

          // 通知数组响应式
          this.__ob__.dep.notify(this, this);
          // 方法的返回值要保留
          return OriginReturnValue;
        }
      });
    }

    function defineReactive(obj, key, val, cb) {
      const dep = new Dep();
      // window.deps.push(dep)
      // obj中的每一个key 都有 闭包val
      // observe(val)

      const childOb = observe(val);
      Object.defineProperty(obj, key, {
        // 公共描述符
        configurable: true,
        enumerable: true,
        // 触发的b1的setter ，就会触发b1的dep的notify
        // 由于此时也需要通知b的watcher
        // 需要
        get() {
          console.log(`观察：在获取${key}的值${val}`);
          dep.depend();
          // console.log('definePro观察者',dep.subs)

          // 重点理解，这里一定要收集
          if (childOb) {
            // 将当前的watcher 收集到当前对象的__obj__中，
            // 
            childOb.dep.depend();
          }
          // 此处 obj[key]栈溢出？？？
          return val;
        },
        set(newValue) {
          // console.log(`观察：在这里改变了${val}`);
          // 新值旧值一样不触发
          if (newValue === val) return;
          // 这个赋值的东西也可能是{}
          observe(newValue);
          const oldValue = val;
          val = newValue;
          cb && cb(newValue, oldValue);

          // 当数据发生变化的时候，通知收集好的所有依赖，将最新的值传过来
          dep.notify();

          // obj.__ob__.dep.notify(newValue,oldValue)
        }
      });
    }

    class Observer {
      dep;
      constructor(data) {
        this.dep = new Dep();

        // 通过数据 找到Observer对象
        Object.defineProperty(data, '__ob__', {
          value: this
        });

        // 处理数组
        if (Array.isArray(data)) {
          // 要去修改原型，成自己的数组原型
          Object.setPrototypeOf(data, myArrayPrototype);
          this.observeArray(data);
        } else {
          this.walk(data);
        }
      }
      // 方法
      walk(data) {
        for (const [key, value] of Object.entries(data)) {
          defineReactive(data, key, value);
        }
      }
      observeArray(data) {
        for (const value of data) {
          observe(value);
        }
      }
    }
    function observe(data) {
      // 类型判断，这里没考虑数组
      // if(typeof data  !== 'object' || data === null) return ;
      if (!isObject(data)) return;
      if (typeof data.__ob__ === 'undefined') {
        return new Observer(data);
      }
      return data.__ob__;
    }

    function parsePath(path) {
      const keys = path.split('.'); // ['a','b','c']
      return function (obj) {
        for (const key of keys) {
          obj = obj[key];
        }
        return obj;
      };
    }
    class watcher {
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
        console.log('watch exp', typeof exp);
        if (typeof exp === 'function') {
          this.getter = exp;
        } else {
          this.getter = parsePath(this.exp);
        }
        this.getter = parsePath(this.exp); // 支持watch 的点语法

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
        let value = this.getter.call(this.vm, this.vm._data);

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
          this.run();
        }
      }
      run() {
        // 存储旧值
        const oldValue = this.value;
        // 新的值，获取并且覆盖
        this.value = this.get();
        if (this.value !== oldValue) {
          this.cb && this.cb.call(this.vm, this.value, oldValue);
        }
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
            // console.log(`代理对象获取${data[key]}`);
            return data[key];
          },
          set(newData) {
            // 这里是一定要data[key]
            data[key] = newData;
            // console.log("代理:值改变", data[key]);
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
        // console.log('打印他的enti',  entries.length);
        for (const [key, value] of entries) {
          new watcher(vm, key, value);
        }
      }
    }
    function initComputed(vm, computed) {
      // const {computed} = options
      if (computed) {
        for (const [name, fn] of Object.entries(computed)) {
          const watcher$1 = new watcher(vm, fn, undefined, {
            lazy: true
          });
          Object.defineProperty(vm, name, {
            configurable: true,
            enumerable: true,
            get() {
              if (watcher$1.dirty) {
                console.log('获取计算属性的值');
                watcher$1.value = watcher$1.get(); // 不要get 会出现重复收集的情况
                watcher$1.dirty = false;
              }
              return watcher$1.value;
            },
            set() {
              console.log('计算属性不可设值');
            }
          });
        }
      }
    }

    // vue 用function，不用class的原因，function可枚举
    function Vue(options) {
      const vm = this;
      vm.$options = options;
      vm._data = typeof options.data === "function" ? options.data() : options.data;
      initData(vm); // 直接调用this指向window,用call改变this
      initComputed(vm, options.computed);
      initWatch(vm, options.watch); // 以传参的方式是不需要改变call的指向
    }

    // 这里 function 不能用箭头函数，箭头函数向上找this 这里的是 window,
    Vue.prototype.$watch = function (exp, cb) {
      new watcher(this, exp, cb);
    };

    // 这里要做到一件事情，就是改变有响应式的属性的值时候，不能触发
    // 但是，新增的话，就需要触发他的watch ,添加响应式
    Vue.prototype.$set = function (obj, key, value) {
      const hasKey = Object.keys(obj).includes(key);

      // 添加这个属性,并做响应式处理
      defineReactive(obj, key, value);
      // obj变了，通知所有的watcher
      if (!hasKey) {
        // 只有当该对象中没有的时候，才会触发通知
        obj.__ob__.dep.notify();
      }
    };

    return Vue;

}));
//# sourceMappingURL=vue.js.map
