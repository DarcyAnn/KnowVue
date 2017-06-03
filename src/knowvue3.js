/*
请实现这样的一个 Observer，要求如下：

传入参数只考虑对象，不考虑数组。
new Observer返回一个对象，其 data 属性要能够访问到传递进去的对象。
通过 data 访问属性和设置属性的时候，均能打印出右侧对应的信息。

深层次数据变化如何逐层往上传播?
firstName 和 lastName 作为 name 的属性，其中任意一个发生变化，都会得出以下结论：
"name 发生了变化。"
这种机制符合”事件传播“机制，方向是从底层往上逐层传播到顶层。
任务：实现事件传播机制
*/

function Observer(data) {
    this.data = data;
    this.circlebind(data);
}

Observer.prototype.watchList = {};

Observer.prototype.$trigger = function() {
    var types = Array.prototype.shift.call(arguments);
    var typeArr = types.split('.');
    var fns = [];
    typeArr.forEach(function(value, index){
        if(Observer.prototype.watchList[value]) {
            fns = fns.concat(Observer.prototype.watchList[value]);
        }
    });
    if(!fns || fns.length === 0) {
        return false;
    }
    for(let fn of fns) {
        fn.apply(this, arguments);
    }
}

Observer.prototype.$watch = function (eventType, fn) {
    var fns = Observer.prototype.watchList[eventType];
    if(!fns) {
        Observer.prototype.watchList[eventType] = [];
    }
    Observer.prototype.watchList[eventType].push(fn);
}

Observer.prototype.circlebind = function (obj, path) {
    for(let key in obj) {
        if(obj.hasOwnProperty(key)) {
            if(!path) {
                path = key;
            } else {
                path = path + '.' + key;
            }
            if(typeof obj[key] === 'object') {
                this.circlebind(obj[key], path);
            }
            this.redefine(obj, key, obj[key], path);
        }
    }
}

Observer.prototype.redefine = function (obj, key, value, path) {
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get () {
            if(typeof value !== 'object') {
                console.log(`你访问了 ${key}`);
            }
            return value;
        },
        set (newValue) {
            console.log("您设置了", key, "新的值为", newValue);
            value = newValue;
            Observer.prototype.$trigger.call(this, path || key, newValue);
            if(typeof newValue === 'object') {
                Observer.prototype.circlebind(value, path);
            }
        }
    })
}

let app2 = new Observer({
    name: {
        firstName: 'xiaoting',
        lastName: 'an'
    },
    age: 25
});

app2.$watch('name', function (newName) {
    console.log('我的姓名发生了变化，可能是姓氏变了，也可能是名字变了。')
});

app2.data.name.firstName = 'hahaha';
// 输出：我的姓名发生了变化，可能是姓氏变了，也可能是名字变了。
app2.data.name.lastName = 'blablabla';
// 输出：我的姓名发生了变化，可能是姓氏变了，也可能是名字变了。
app2.data.name = 1;