function Vue(obj) {
    this.el = obj.el.substring(1);
    this.data = obj.data;
    this.init(this);
    this.circlebind(this.data);
}

Vue.prototype.watchList = {};

Vue.prototype.assignRec = function(obj, childNodes) {
    for(var value of childNodes){
        if(value.getElementsByTagName('*').length !== 0){
            //如果还有子元素，递归
            assignRec(value.getElementsByTagName('*'));
        } else {
            //如果没有子元素了，检查html内容
            value.textContent = value.textContent.replace(/{{(.*)}}/g, function(match, p1){
                var keyArr = p1.trim().split('.');
                var result = obj.data;
                for(let i=0; i<keyArr.length; i++) {
                    result = result[keyArr[i]];
                }
                return result;
            });
        }
    }
}

Vue.prototype.init = function(obj) {
    var el = document.getElementById(obj.el);
    var childNodes = el.getElementsByTagName('*');
    if(childNodes.length === 0) {
        return false;
    }
    this.assignRec(obj, childNodes);
}

Vue.prototype.$trigger = function () {
    var types = [].shift.call(arguments);
    var typeArr = types.split('.');
    var fns = [];
    typeArr.forEach(function(value, index) {
        if(Vue.prototype.watchList[value]) {
            fns = fns.concat(Vue.prototype.watchList[value]);
        }
    });
    if(!fns || fns.length === 0) {
        return false;
    }
    for(var fn of fns) {
        fn.apply(this, arguments);
    }
}

Vue.prototype.$watch = function (type, fn) {
    var fns = Vue.prototype.watchList[type];
    if(!fns) {
        Vue.prototype.watchList[type] = [];
    }
    Vue.prototype.watchList[type].push(fn);
}

Vue.prototype.circlebind = function (obj, path) {
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

Vue.prototype.redefine = function (obj, key, value, path) {
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
            Vue.prototype.$trigger.call(this, path || key, value);
            if(typeof newValue === 'object') {
                Vue.prototype.circlebind(value, path);
            }
        }
    });
}

let app = new Vue({
  el: '#app',
  data: {
    user: {
      name: {
          firstname: 'xiaoting',
          lastname: 'an'
      },
      age: 25
    }
  }
});