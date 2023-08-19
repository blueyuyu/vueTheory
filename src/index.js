import { observe, defineReactive } from "./observer/index";
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
        // console.log(`代理对象获取${data[key]}`);
        return data[key];
      },
      set(newData) {
        // 这里是一定要data[key]
        data[key] = newData;
        // console.log("代理:值改变", data[key]);
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
      // console.log('打印他的enti',  entries.length);
      for (const [key,value] of entries) {
          new Watcher(vm,key,value)
      }
    }
}

function initComputed(vm,computed){
  // const {computed} = options
  if(computed){
    for (const [name,fn] of Object.entries(computed)) {
    const watcher = new Watcher(vm,fn,undefined,{
      lazy: true
    })
      
      Object.defineProperty(vm,name,{
        configurable: true,
        enumerable: true,
        get(){
          if(watcher.dirty){
            console.log('获取计算属性的值');
            watcher.value = watcher.get() // 不要get 会出现重复收集的情况
            watcher.dirty = false
          }
          return watcher.value
        },
        set(){
          console.log('计算属性不可设值');
        }
      })
    }
  }
}

// vue 用function，不用class的原因，function可枚举
function Vue(options) {
  const vm = this;
  vm.$options = options;
  vm._data = typeof options.data === "function" ? options.data(): options.data;
 
  initData(vm); // 直接调用this指向window,用call改变this
  initComputed(vm,options.computed)
  initWatch(vm,options.watch); // 以传参的方式是不需要改变call的指向
  

}

// 这里 function 不能用箭头函数，箭头函数向上找this 这里的是 window,
Vue.prototype.$watch = function(exp,cb) {
    new Watcher(this,exp,cb)
}

// 这里要做到一件事情，就是改变有响应式的属性的值时候，不能触发
// 但是，新增的话，就需要触发他的watch ,添加响应式
Vue.prototype.$set = function(obj,key,value) {
  const hasKey = Object.keys(obj).includes(key)
  
  // 添加这个属性,并做响应式处理
  defineReactive(obj, key, value)
  // obj变了，通知所有的watcher
  if(!hasKey){
    // 只有当该对象中没有的时候，才会触发通知
    obj.__ob__.dep.notify()
  }
}

export default Vue;
