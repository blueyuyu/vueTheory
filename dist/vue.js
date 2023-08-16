(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
   typeof define === 'function' && define.amd ? define(factory) :
   (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

   function Vue(options) {
     const vm = this;
     vm.$options = options;
     vm._data = typeof options.data === 'function' ? options.data() : options.data;
     _proxy.call(vm, vm._data);
     observe(vm._data);
   }

   // 代理,代理这里是不可以defineReactive()会导致取值复制失效
   function _proxy(data) {
     // 箭头函数内的this,是外层的this
     Object.keys(data).forEach(key => {
       const _this = this;
       console.log('外层的this', this);
       Object.defineProperty(this, key, {
         get() {
           console.log('内层的this', this);
           console.log(this === _this);
           return data[key];
         },
         set(newData) {
           // 这里是一定要data[key]
           data[key] = newData;
           console.log('代理里面也改变了？', data[key]);
         }
       });
     });
   }
   function observe(data, cb) {
     //  对每一个键值操作
     for (const [key, value] of Object.entries(data)) {
       defineReactive(data, key, value, cb);
     }
   }
   function defineReactive(obj, key, val, cb) {
     // obj中的每一个key 都有 闭包val
     Object.defineProperty(obj, key, {
       get() {
         console.log(`在获取${obj}的值${key}`);
         return val;
       },
       set(newValue) {
         console.log(`在这里改变了${val}`);
         val = newValue;
         cb && cb();
       }
     });
   }

   return Vue;

}));
//# sourceMappingURL=vue.js.map
