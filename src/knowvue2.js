/*
请实现这样的一个 Observer，要求如下：

传入参数只考虑对象，不考虑数组。
new Observer返回一个对象，其 data 属性要能够访问到传递进去的对象。
通过 data 访问属性和设置属性的时候，均能打印出右侧对应的信息。

新增需求：
1.传入的data中有的属性还是一个对象。
2.设置data的一个属性为一个新的值，这个值是一个对象，新设置的对象的属性能否继续响应getter和setter。
3.实现 $watch 这个 API
*/

function Observer (data) {
  this.data = data;
  this.circlebind(data);
}

Observer.prototype.watchList = {};

Observer.prototype.$trigger = function() {
  var key = Array.prototype.shift.call(arguments);
  var fns = Observer.prototype.watchList[key];
  if(!fns || fns.length === 0) {
    return false;
  }
  for(let fn of fns) {
    fn.apply(this, arguments);
  }
}

Observer.prototype.$watch = function(key, fn) {
  var fns = Observer.prototype.watchList[key];
  if(!fns) {
    Observer.prototype.watchList[key] = [];
  }
  Observer.prototype.watchList[key].push(fn);
}

Observer.prototype.circlebind = function (obj) {
  for(let key in obj) {
    if(obj.hasOwnProperty(key)) {
      if(typeof obj[key] === 'object') {
        new Observer(obj[key]);
      }
      this.redefine(key, obj[key]);
    }
  }
}

Observer.prototype.redefine = function(key, currentVal) {
  Object.defineProperty(this.data, key, {
    enumerable: true,
    configurable: true,
    get () {
      if(typeof currentVal !== 'object') {
        console.log(`你访问了 ${key}`);
      }
      return currentVal;
    },
    set (newVal) {
      if(typeof newVal === 'object') {
        new Observer(newVal)
      }
      Observer.prototype.$trigger.call(this, key, newVal);
      console.log(`你设置了 ${key} , 新的值为`, newVal);
      currentVal = newVal;
    } 
  })
}

let app1 = new Observer({
  name: 'youngwind',
  age: 25,
  a: {
    b: 'bbb',
    c: 'ccc'
  }
});

// 要实现的结果如下：
// 2.设置data的一个属性为一个新的值，这个值是一个对象，新设置的对象的属性能否继续响应getter和setter。
app1.data.name = {
  lastName: 'An',
  firstName: 'Xiaoting'
}
app1.data.name.lastName
app1.data.name.firstName = 'Darcy'

// 3.你需要实现 $watch 这个 API
app1.$watch('age', function(age) {
  console.log(`我的年纪变了，现在已经是：${age}岁了`)
});

app1.data.age = 100;
//输出：我的年纪变了，现在已经是100岁了