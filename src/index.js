import { observe } from "./observer/index";
import Watcher from "./observer/watcher";

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
      },
    });
  }
}

function initData(vm) {
  // 观察_data上的键值存取操作
  observe(vm._data);
  // 数据代理，可以通过实例直接访问
  _proxy.call(vm, vm._data);
}

function initWatch(vm,watch){
    if(watch){
      const entries = Object.entries(watch)
      console.log('打印他的enti',  entries.length);
      for (const [key,value] of entries) {
          new Watcher(vm,key,value)
      }
    }
}

// vue 用function，不用class的原因，function可枚举
function Vue(options) {
  const vm = this;
  vm.$options = options;
  vm._data = typeof options.data === "function" ? options.data(): options.data;
 
  initData(vm); // 直接调用this指向window,用call改变this
  initWatch(vm,options.watch); // 以传参的方式是不需要改变call的指向
 
}

// 这里 function 不能用箭头函数，箭头函数向上找this 这里的是 window,
Vue.prototype.$watch = function(exp,cb) {
    new Watcher(this,exp,cb)
}

export default Vue;
