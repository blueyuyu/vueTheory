import { observe } from "./observer/index";

// 代理,代理这里是不可以defineReactive()会导致取值复制失效
function _proxy(data) {
  // 箭头函数内的this,是外层的this
  Object.keys(data).forEach((key) => {
    Object.defineProperty(this, key, {
      get() {
        console.log(`代理对象获取${data[key]}`)
        return data[key];
      },
      set(newData) {
        // 这里是一定要data[key]
        data[key] = newData;
        console.log("代理:值改变", data[key]);
      },
    });
  });
}


function initData(){
    // 观察_data上的键值存取操作
    observe(this._data)
    // 数据代理，可以通过实例直接访问
    _proxy.call(this,this._data)
}

function Vue(options) {
  const vm = this;
  vm.$options = options;
  vm._data = typeof options.data === "function" ? options.data() : options.data;
  initData.call(vm) // 直接调用this指向window,用call改变this
}

export default Vue;
