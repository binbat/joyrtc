!function(){"use strict";try{if("undefined"!=typeof document){var o=document.createElement("style");o.appendChild(document.createTextNode(":root{font-family:Inter,system-ui,Avenir,Helvetica,Arial,sans-serif;line-height:1.5;font-weight:400;color-scheme:light dark;color:#ffffffde;background-color:#242424;font-synthesis:none;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;-webkit-text-size-adjust:100%}a{font-weight:500;color:#646cff;text-decoration:inherit}a:hover{color:#535bf2}body{margin:0;display:flex;place-items:center;min-width:320px;min-height:100vh}h1{font-size:3.2em;line-height:1.1}button{border-radius:8px;border:1px solid transparent;padding:.6em 1.2em;font-size:1em;font-weight:500;font-family:inherit;background-color:#1a1a1a;cursor:pointer;transition:border-color .25s}button:hover{border-color:#646cff}button:focus,button:focus-visible{outline:4px auto -webkit-focus-ring-color}@media (prefers-color-scheme: light){:root{color:#213547;background-color:#fff}a:hover{color:#747bff}button{background-color:#f9f9f9}}")),document.head.appendChild(o)}}catch(e){console.error("vite-plugin-css-injected-by-js",e)}}();
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const distance = (p1, p2) => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
};
const angle = (p1, p2) => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return degrees(Math.atan2(dy, dx));
};
const findCoord = (p, d, a) => {
  const b = { x: 0, y: 0 };
  a = radians(a);
  b.x = p.x - d * Math.cos(a);
  b.y = p.y - d * Math.sin(a);
  return b;
};
const radians = (a) => {
  return a * (Math.PI / 180);
};
const degrees = (a) => {
  return a * (180 / Math.PI);
};
const isPressed = (evt) => {
  if (isNaN(evt.buttons)) {
    return evt.pressure !== 0;
  }
  return evt.buttons !== 0;
};
const timers = /* @__PURE__ */ new Map();
const throttle = (cb) => {
  if (timers.has(cb)) {
    clearTimeout(timers.get(cb));
  }
  timers.set(cb, setTimeout(cb, 100));
};
const bindEvt = (el, arg, handler) => {
  const types = arg.split(/[ ,]+/g);
  let type;
  for (let i = 0; i < types.length; i += 1) {
    type = types[i];
    if (el.addEventListener) {
      el.addEventListener(type, handler, false);
    } else if (el.attachEvent) {
      el.attachEvent(type, handler);
    }
  }
};
const unbindEvt = (el, arg, handler) => {
  const types = arg.split(/[ ,]+/g);
  let type;
  for (let i = 0; i < types.length; i += 1) {
    type = types[i];
    if (el.removeEventListener) {
      el.removeEventListener(type, handler);
    } else if (el.detachEvent) {
      el.detachEvent(type, handler);
    }
  }
};
const prepareEvent = (evt) => {
  evt.preventDefault();
  return evt.type.match(/^touch/) ? evt.changedTouches : evt;
};
const getScroll = () => {
  const x = window.pageXOffset !== void 0 ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft;
  const y = window.pageYOffset !== void 0 ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
  return {
    x,
    y
  };
};
const applyPosition = (el, pos) => {
  if (pos.top || pos.right || pos.bottom || pos.left) {
    el.style.top = pos.top;
    el.style.right = pos.right;
    el.style.bottom = pos.bottom;
    el.style.left = pos.left;
  } else {
    el.style.left = pos.x + "px";
    el.style.top = pos.y + "px";
  }
};
const getTransitionStyle = (property, values, time) => {
  const obj = configStylePropertyObject(property);
  for (let i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (typeof values === "string") {
        obj[i] = values + " " + time;
      } else {
        let st = "";
        for (let j = 0, max = values.length; j < max; j += 1) {
          st += values[j] + " " + time + ", ";
        }
        obj[i] = st.slice(0, -2);
      }
    }
  }
  return obj;
};
const getVendorStyle = (property, value) => {
  const obj = configStylePropertyObject(property);
  for (let i in obj) {
    if (obj.hasOwnProperty(i)) {
      obj[i] = value;
    }
  }
  return obj;
};
const configStylePropertyObject = (prop) => {
  const obj = {};
  obj[prop] = "";
  const vendors = ["webkit", "Moz", "o"];
  vendors.forEach(function(vendor) {
    obj[vendor + prop.charAt(0).toUpperCase() + prop.slice(1)] = "";
  });
  return obj;
};
const extend = (objA, objB) => {
  for (let i in objB) {
    if (objB.hasOwnProperty(i)) {
      objA[i] = objB[i];
    }
  }
  return objA;
};
const safeExtend = (objA, objB) => {
  const obj = {};
  for (let i in objA) {
    if (objA.hasOwnProperty(i) && objB.hasOwnProperty(i)) {
      obj[i] = objB[i];
    } else if (objA.hasOwnProperty(i)) {
      obj[i] = objA[i];
    }
  }
  return obj;
};
const map = (ar, fn) => {
  if (ar.length) {
    for (let i = 0, max = ar.length; i < max; i += 1) {
      fn(ar[i]);
    }
  } else {
    fn(ar);
  }
};
const clamp = (pos, nipplePos, size) => ({
  //                          left-clamping        right-clamping
  x: Math.min(Math.max(pos.x, nipplePos.x - size), nipplePos.x + size),
  //                          top-clamping         bottom-clamping
  y: Math.min(Math.max(pos.y, nipplePos.y - size), nipplePos.y + size)
});
var isTouch = !!("ontouchstart" in window);
var isPointer = window.PointerEvent ? true : false;
var isMSPointer = window.MSPointerEvent ? true : false;
var events = {
  touch: {
    start: "touchstart",
    move: "touchmove",
    end: "touchend, touchcancel"
  },
  mouse: {
    start: "mousedown",
    move: "mousemove",
    end: "mouseup"
  },
  pointer: {
    start: "pointerdown",
    move: "pointermove",
    end: "pointerup, pointercancel"
  },
  MSPointer: {
    start: "MSPointerDown",
    move: "MSPointerMove",
    end: "MSPointerUp"
  }
};
var toBind;
var secondBind = {};
if (isPointer) {
  toBind = events.pointer;
} else if (isMSPointer) {
  toBind = events.MSPointer;
} else if (isTouch) {
  toBind = events.touch;
  secondBind = events.mouse;
} else {
  toBind = events.mouse;
}
function Super() {
}
Super.prototype.on = function(arg, cb) {
  var self = this;
  var types = arg.split(/[ ,]+/g);
  var type;
  self._handlers_ = self._handlers_ || {};
  for (var i = 0; i < types.length; i += 1) {
    type = types[i];
    self._handlers_[type] = self._handlers_[type] || [];
    self._handlers_[type].push(cb);
  }
  return self;
};
Super.prototype.off = function(type, cb) {
  var self = this;
  self._handlers_ = self._handlers_ || {};
  if (type === void 0) {
    self._handlers_ = {};
  } else if (cb === void 0) {
    self._handlers_[type] = null;
  } else if (self._handlers_[type] && self._handlers_[type].indexOf(cb) >= 0) {
    self._handlers_[type].splice(self._handlers_[type].indexOf(cb), 1);
  }
  return self;
};
Super.prototype.trigger = function(arg, data) {
  var self = this;
  var types = arg.split(/[ ,]+/g);
  var type;
  self._handlers_ = self._handlers_ || {};
  for (var i = 0; i < types.length; i += 1) {
    type = types[i];
    if (self._handlers_[type] && self._handlers_[type].length) {
      self._handlers_[type].forEach(function(handler) {
        handler.call(self, {
          type,
          target: self
        }, data);
      });
    }
  }
};
Super.prototype.config = function(options) {
  var self = this;
  self.options = self.defaults || {};
  if (options) {
    self.options = safeExtend(self.options, options);
  }
};
Super.prototype.bindEvt = function(el, type) {
  var self = this;
  self._domHandlers_ = self._domHandlers_ || {};
  self._domHandlers_[type] = function() {
    if (typeof self["on" + type] === "function") {
      self["on" + type].apply(self, arguments);
    } else {
      console.warn('[WARNING] : Missing "on' + type + '" handler.');
    }
  };
  bindEvt(el, toBind[type], self._domHandlers_[type]);
  if (secondBind[type]) {
    bindEvt(el, secondBind[type], self._domHandlers_[type]);
  }
  return self;
};
Super.prototype.unbindEvt = function(el, type) {
  var self = this;
  self._domHandlers_ = self._domHandlers_ || {};
  unbindEvt(el, toBind[type], self._domHandlers_[type]);
  if (secondBind[type]) {
    unbindEvt(el, secondBind[type], self._domHandlers_[type]);
  }
  delete self._domHandlers_[type];
  return this;
};
function Nipple(collection, options) {
  this.identifier = options.identifier;
  this.position = options.position;
  this.frontPosition = options.frontPosition;
  this.collection = collection;
  this.defaults = {
    size: 100,
    threshold: 0.1,
    color: "white",
    fadeTime: 250,
    dataOnly: false,
    restJoystick: true,
    restOpacity: 0.5,
    mode: "dynamic",
    zone: document.body,
    lockX: false,
    lockY: false,
    shape: "circle"
  };
  this.config(options);
  if (this.options.mode === "dynamic") {
    this.options.restOpacity = 0;
  }
  this.id = Nipple.id;
  Nipple.id += 1;
  this.buildEl().stylize();
  this.instance = {
    el: this.ui.el,
    on: this.on.bind(this),
    off: this.off.bind(this),
    show: this.show.bind(this),
    hide: this.hide.bind(this),
    add: this.addToDom.bind(this),
    remove: this.removeFromDom.bind(this),
    destroy: this.destroy.bind(this),
    setPosition: this.setPosition.bind(this),
    resetDirection: this.resetDirection.bind(this),
    computeDirection: this.computeDirection.bind(this),
    trigger: this.trigger.bind(this),
    position: this.position,
    frontPosition: this.frontPosition,
    ui: this.ui,
    identifier: this.identifier,
    id: this.id,
    options: this.options
  };
  return this.instance;
}
Nipple.prototype = new Super();
Nipple.constructor = Nipple;
Nipple.id = 0;
Nipple.prototype.buildEl = function(options) {
  this.ui = {};
  if (this.options.dataOnly) {
    return this;
  }
  this.ui.el = document.createElement("div");
  this.ui.back = document.createElement("div");
  this.ui.front = document.createElement("div");
  this.ui.el.className = "nipple collection_" + this.collection.id;
  this.ui.back.className = "back";
  this.ui.front.className = "front";
  this.ui.el.setAttribute("id", "nipple_" + this.collection.id + "_" + this.id);
  this.ui.el.appendChild(this.ui.back);
  this.ui.el.appendChild(this.ui.front);
  return this;
};
Nipple.prototype.stylize = function() {
  if (this.options.dataOnly) {
    return this;
  }
  var animTime = this.options.fadeTime + "ms";
  var borderStyle = getVendorStyle("borderRadius", "50%");
  var transitStyle = getTransitionStyle("transition", "opacity", animTime);
  var styles = {};
  styles.el = {
    position: "absolute",
    opacity: this.options.restOpacity,
    display: "block",
    "zIndex": 999
  };
  styles.back = {
    position: "absolute",
    display: "block",
    width: this.options.size + "px",
    height: this.options.size + "px",
    marginLeft: -this.options.size / 2 + "px",
    marginTop: -this.options.size / 2 + "px",
    background: this.options.color,
    "opacity": ".5"
  };
  styles.front = {
    width: this.options.size / 2 + "px",
    height: this.options.size / 2 + "px",
    position: "absolute",
    display: "block",
    marginLeft: -this.options.size / 4 + "px",
    marginTop: -this.options.size / 4 + "px",
    background: this.options.color,
    "opacity": ".5",
    transform: "translate(0px, 0px)"
  };
  extend(styles.el, transitStyle);
  if (this.options.shape === "circle") {
    extend(styles.back, borderStyle);
  }
  extend(styles.front, borderStyle);
  this.applyStyles(styles);
  return this;
};
Nipple.prototype.applyStyles = function(styles) {
  for (var i in this.ui) {
    if (this.ui.hasOwnProperty(i)) {
      for (var j in styles[i]) {
        this.ui[i].style[j] = styles[i][j];
      }
    }
  }
  return this;
};
Nipple.prototype.addToDom = function() {
  if (this.options.dataOnly || document.body.contains(this.ui.el)) {
    return this;
  }
  this.options.zone.appendChild(this.ui.el);
  return this;
};
Nipple.prototype.removeFromDom = function() {
  if (this.options.dataOnly || !document.body.contains(this.ui.el)) {
    return this;
  }
  this.options.zone.removeChild(this.ui.el);
  return this;
};
Nipple.prototype.destroy = function() {
  clearTimeout(this.removeTimeout);
  clearTimeout(this.showTimeout);
  clearTimeout(this.restTimeout);
  this.trigger("destroyed", this.instance);
  this.removeFromDom();
  this.off();
};
Nipple.prototype.show = function(cb) {
  var self = this;
  if (self.options.dataOnly) {
    return self;
  }
  clearTimeout(self.removeTimeout);
  clearTimeout(self.showTimeout);
  clearTimeout(self.restTimeout);
  self.addToDom();
  self.restCallback();
  setTimeout(function() {
    self.ui.el.style.opacity = 1;
  }, 0);
  self.showTimeout = setTimeout(function() {
    self.trigger("shown", self.instance);
    if (typeof cb === "function") {
      cb.call(this);
    }
  }, self.options.fadeTime);
  return self;
};
Nipple.prototype.hide = function(cb) {
  var self = this;
  if (self.options.dataOnly) {
    return self;
  }
  self.ui.el.style.opacity = self.options.restOpacity;
  clearTimeout(self.removeTimeout);
  clearTimeout(self.showTimeout);
  clearTimeout(self.restTimeout);
  self.removeTimeout = setTimeout(
    function() {
      var display = self.options.mode === "dynamic" ? "none" : "block";
      self.ui.el.style.display = display;
      if (typeof cb === "function") {
        cb.call(self);
      }
      self.trigger("hidden", self.instance);
    },
    self.options.fadeTime
  );
  if (self.options.restJoystick) {
    const rest = self.options.restJoystick;
    const newPosition = {};
    newPosition.x = rest === true || rest.x !== false ? 0 : self.instance.frontPosition.x;
    newPosition.y = rest === true || rest.y !== false ? 0 : self.instance.frontPosition.y;
    self.setPosition(cb, newPosition);
  }
  return self;
};
Nipple.prototype.setPosition = function(cb, position) {
  var self = this;
  self.frontPosition = {
    x: position.x,
    y: position.y
  };
  var animTime = self.options.fadeTime + "ms";
  var transitStyle = {};
  transitStyle.front = getTransitionStyle(
    "transition",
    ["transform"],
    animTime
  );
  var styles = { front: {} };
  styles.front = {
    transform: "translate(" + self.frontPosition.x + "px," + self.frontPosition.y + "px)"
  };
  self.applyStyles(transitStyle);
  self.applyStyles(styles);
  self.restTimeout = setTimeout(
    function() {
      if (typeof cb === "function") {
        cb.call(self);
      }
      self.restCallback();
    },
    self.options.fadeTime
  );
};
Nipple.prototype.restCallback = function() {
  var self = this;
  var transitStyle = {};
  transitStyle.front = getTransitionStyle("transition", "none", "");
  self.applyStyles(transitStyle);
  self.trigger("rested", self.instance);
};
Nipple.prototype.resetDirection = function() {
  this.direction = {
    x: false,
    y: false,
    angle: false
  };
};
Nipple.prototype.computeDirection = function(obj) {
  var rAngle = obj.angle.radian;
  var angle45 = Math.PI / 4;
  var angle90 = Math.PI / 2;
  var direction, directionX, directionY;
  if (rAngle > angle45 && rAngle < angle45 * 3 && !obj.lockX) {
    direction = "up";
  } else if (rAngle > -angle45 && rAngle <= angle45 && !obj.lockY) {
    direction = "left";
  } else if (rAngle > -angle45 * 3 && rAngle <= -angle45 && !obj.lockX) {
    direction = "down";
  } else if (!obj.lockY) {
    direction = "right";
  }
  if (!obj.lockY) {
    if (rAngle > -angle90 && rAngle < angle90) {
      directionX = "left";
    } else {
      directionX = "right";
    }
  }
  if (!obj.lockX) {
    if (rAngle > 0) {
      directionY = "up";
    } else {
      directionY = "down";
    }
  }
  if (obj.force > this.options.threshold) {
    var oldDirection = {};
    var i;
    for (i in this.direction) {
      if (this.direction.hasOwnProperty(i)) {
        oldDirection[i] = this.direction[i];
      }
    }
    var same = {};
    this.direction = {
      x: directionX,
      y: directionY,
      angle: direction
    };
    obj.direction = this.direction;
    for (i in oldDirection) {
      if (oldDirection[i] === this.direction[i]) {
        same[i] = true;
      }
    }
    if (same.x && same.y && same.angle) {
      return obj;
    }
    if (!same.x || !same.y) {
      this.trigger("plain", obj);
    }
    if (!same.x) {
      this.trigger("plain:" + directionX, obj);
    }
    if (!same.y) {
      this.trigger("plain:" + directionY, obj);
    }
    if (!same.angle) {
      this.trigger("dir dir:" + direction, obj);
    }
  } else {
    this.resetDirection();
  }
  return obj;
};
function Collection(manager, options) {
  var self = this;
  self.nipples = [];
  self.idles = [];
  self.actives = [];
  self.ids = [];
  self.pressureIntervals = {};
  self.manager = manager;
  self.id = Collection.id;
  Collection.id += 1;
  self.defaults = {
    zone: document.body,
    multitouch: false,
    maxNumberOfNipples: 10,
    mode: "dynamic",
    position: { top: 0, left: 0 },
    catchDistance: 200,
    size: 100,
    threshold: 0.1,
    color: "white",
    fadeTime: 250,
    dataOnly: false,
    restJoystick: true,
    restOpacity: 0.5,
    lockX: false,
    lockY: false,
    shape: "circle",
    dynamicPage: false,
    follow: false
  };
  self.config(options);
  if (self.options.mode === "static" || self.options.mode === "semi") {
    self.options.multitouch = false;
  }
  if (!self.options.multitouch) {
    self.options.maxNumberOfNipples = 1;
  }
  const computedStyle = getComputedStyle(self.options.zone.parentElement);
  if (computedStyle && computedStyle.display === "flex") {
    self.parentIsFlex = true;
  }
  self.updateBox();
  self.prepareNipples();
  self.bindings();
  self.begin();
  return self.nipples;
}
Collection.prototype = new Super();
Collection.constructor = Collection;
Collection.id = 0;
Collection.prototype.prepareNipples = function() {
  var self = this;
  var nips = self.nipples;
  nips.on = self.on.bind(self);
  nips.off = self.off.bind(self);
  nips.options = self.options;
  nips.destroy = self.destroy.bind(self);
  nips.ids = self.ids;
  nips.id = self.id;
  nips.processOnMove = self.processOnMove.bind(self);
  nips.processOnEnd = self.processOnEnd.bind(self);
  nips.get = function(id) {
    if (id === void 0) {
      return nips[0];
    }
    for (var i = 0, max = nips.length; i < max; i += 1) {
      if (nips[i].identifier === id) {
        return nips[i];
      }
    }
    return false;
  };
};
Collection.prototype.bindings = function() {
  var self = this;
  self.bindEvt(self.options.zone, "start");
  self.options.zone.style.touchAction = "none";
  self.options.zone.style.msTouchAction = "none";
};
Collection.prototype.begin = function() {
  var self = this;
  var opts = self.options;
  if (opts.mode === "static") {
    var nipple = self.createNipple(
      opts.position,
      self.manager.getIdentifier()
    );
    nipple.add();
    self.idles.push(nipple);
  }
};
Collection.prototype.createNipple = function(position, identifier) {
  var self = this;
  var scroll = self.manager.scroll;
  var toPutOn = {};
  var opts = self.options;
  var offset = {
    x: self.parentIsFlex ? scroll.x : scroll.x + self.box.left,
    y: self.parentIsFlex ? scroll.y : scroll.y + self.box.top
  };
  if (position.x && position.y) {
    toPutOn = {
      x: position.x - offset.x,
      y: position.y - offset.y
    };
  } else if (position.top || position.right || position.bottom || position.left) {
    var dumb = document.createElement("DIV");
    dumb.style.display = "hidden";
    dumb.style.top = position.top;
    dumb.style.right = position.right;
    dumb.style.bottom = position.bottom;
    dumb.style.left = position.left;
    dumb.style.position = "absolute";
    opts.zone.appendChild(dumb);
    var dumbBox = dumb.getBoundingClientRect();
    opts.zone.removeChild(dumb);
    toPutOn = position;
    position = {
      x: dumbBox.left + scroll.x,
      y: dumbBox.top + scroll.y
    };
  }
  var nipple = new Nipple(self, {
    color: opts.color,
    size: opts.size,
    threshold: opts.threshold,
    fadeTime: opts.fadeTime,
    dataOnly: opts.dataOnly,
    restJoystick: opts.restJoystick,
    restOpacity: opts.restOpacity,
    mode: opts.mode,
    identifier,
    position,
    zone: opts.zone,
    frontPosition: {
      x: 0,
      y: 0
    },
    shape: opts.shape
  });
  if (!opts.dataOnly) {
    applyPosition(nipple.ui.el, toPutOn);
    applyPosition(nipple.ui.front, nipple.frontPosition);
  }
  self.nipples.push(nipple);
  self.trigger("added " + nipple.identifier + ":added", nipple);
  self.manager.trigger("added " + nipple.identifier + ":added", nipple);
  self.bindNipple(nipple);
  return nipple;
};
Collection.prototype.updateBox = function() {
  var self = this;
  self.box = self.options.zone.getBoundingClientRect();
};
Collection.prototype.bindNipple = function(nipple) {
  var self = this;
  var type;
  var handler = function(evt, data) {
    type = evt.type + " " + data.id + ":" + evt.type;
    self.trigger(type, data);
  };
  nipple.on("destroyed", self.onDestroyed.bind(self));
  nipple.on("shown hidden rested dir plain", handler);
  nipple.on("dir:up dir:right dir:down dir:left", handler);
  nipple.on("plain:up plain:right plain:down plain:left", handler);
};
Collection.prototype.pressureFn = function(touch, nipple, identifier) {
  var self = this;
  var previousPressure = 0;
  clearInterval(self.pressureIntervals[identifier]);
  self.pressureIntervals[identifier] = setInterval((function() {
    var pressure = touch.force || touch.pressure || touch.webkitForce || 0;
    if (pressure !== previousPressure) {
      nipple.trigger("pressure", pressure);
      self.trigger("pressure " + nipple.identifier + ":pressure", pressure);
      previousPressure = pressure;
    }
  }).bind(self), 100);
};
Collection.prototype.onstart = function(evt) {
  var self = this;
  var opts = self.options;
  var origEvt = evt;
  evt = prepareEvent(evt);
  self.updateBox();
  var process = function(touch) {
    if (self.actives.length < opts.maxNumberOfNipples) {
      self.processOnStart(touch);
    } else if (origEvt.type.match(/^touch/)) {
      Object.keys(self.manager.ids).forEach(function(k) {
        if (Object.values(origEvt.touches).findIndex(function(t) {
          return t.identifier === k;
        }) < 0) {
          var e = [evt[0]];
          e.identifier = k;
          self.processOnEnd(e);
        }
      });
      if (self.actives.length < opts.maxNumberOfNipples) {
        self.processOnStart(touch);
      }
    }
  };
  map(evt, process);
  self.manager.bindDocument();
  return false;
};
Collection.prototype.processOnStart = function(evt) {
  var self = this;
  var opts = self.options;
  var indexInIdles;
  var identifier = self.manager.getIdentifier(evt);
  var pressure = evt.force || evt.pressure || evt.webkitForce || 0;
  var position = {
    x: evt.pageX,
    y: evt.pageY
  };
  var nipple = self.getOrCreate(identifier, position);
  if (nipple.identifier !== identifier) {
    self.manager.removeIdentifier(nipple.identifier);
  }
  nipple.identifier = identifier;
  var process = function(nip) {
    nip.trigger("start", nip);
    self.trigger("start " + nip.id + ":start", nip);
    nip.show();
    if (pressure > 0) {
      self.pressureFn(evt, nip, nip.identifier);
    }
    self.processOnMove(evt);
  };
  if ((indexInIdles = self.idles.indexOf(nipple)) >= 0) {
    self.idles.splice(indexInIdles, 1);
  }
  self.actives.push(nipple);
  self.ids.push(nipple.identifier);
  if (opts.mode !== "semi") {
    process(nipple);
  } else {
    var distance$1 = distance(position, nipple.position);
    if (distance$1 <= opts.catchDistance) {
      process(nipple);
    } else {
      nipple.destroy();
      self.processOnStart(evt);
      return;
    }
  }
  return nipple;
};
Collection.prototype.getOrCreate = function(identifier, position) {
  var self = this;
  var opts = self.options;
  var nipple;
  if (/(semi|static)/.test(opts.mode)) {
    nipple = self.idles[0];
    if (nipple) {
      self.idles.splice(0, 1);
      return nipple;
    }
    if (opts.mode === "semi") {
      return self.createNipple(position, identifier);
    }
    console.warn("Coudln't find the needed nipple.");
    return false;
  }
  nipple = self.createNipple(position, identifier);
  return nipple;
};
Collection.prototype.processOnMove = function(evt) {
  var self = this;
  var opts = self.options;
  var identifier = self.manager.getIdentifier(evt);
  var nipple = self.nipples.get(identifier);
  var scroll = self.manager.scroll;
  if (!isPressed(evt)) {
    this.processOnEnd(evt);
    return;
  }
  if (!nipple) {
    console.error("Found zombie joystick with ID " + identifier);
    self.manager.removeIdentifier(identifier);
    return;
  }
  if (opts.dynamicPage) {
    var elBox = nipple.el.getBoundingClientRect();
    nipple.position = {
      x: scroll.x + elBox.left,
      y: scroll.y + elBox.top
    };
  }
  nipple.identifier = identifier;
  var size = nipple.options.size / 2;
  var pos = {
    x: evt.pageX,
    y: evt.pageY
  };
  if (opts.lockX) {
    pos.y = nipple.position.y;
  }
  if (opts.lockY) {
    pos.x = nipple.position.x;
  }
  var dist = distance(pos, nipple.position);
  var angle$1 = angle(pos, nipple.position);
  var rAngle = radians(angle$1);
  var force = dist / size;
  var raw = {
    distance: dist,
    position: pos
  };
  var clamped_dist;
  var clamped_pos;
  if (nipple.options.shape === "circle") {
    clamped_dist = Math.min(dist, size);
    clamped_pos = findCoord(nipple.position, clamped_dist, angle$1);
  } else {
    clamped_pos = clamp(pos, nipple.position, size);
    clamped_dist = distance(clamped_pos, nipple.position);
  }
  if (opts.follow) {
    if (dist > size) {
      let delta_x = pos.x - clamped_pos.x;
      let delta_y = pos.y - clamped_pos.y;
      nipple.position.x += delta_x;
      nipple.position.y += delta_y;
      nipple.el.style.top = nipple.position.y - (self.box.top + scroll.y) + "px";
      nipple.el.style.left = nipple.position.x - (self.box.left + scroll.x) + "px";
      dist = distance(pos, nipple.position);
    }
  } else {
    pos = clamped_pos;
    dist = clamped_dist;
  }
  var xPosition = pos.x - nipple.position.x;
  var yPosition = pos.y - nipple.position.y;
  nipple.frontPosition = {
    x: xPosition,
    y: yPosition
  };
  if (!opts.dataOnly) {
    nipple.ui.front.style.transform = "translate(" + xPosition + "px," + yPosition + "px)";
  }
  var toSend = {
    identifier: nipple.identifier,
    position: pos,
    force,
    pressure: evt.force || evt.pressure || evt.webkitForce || 0,
    distance: dist,
    angle: {
      radian: rAngle,
      degree: angle$1
    },
    vector: {
      x: xPosition / size,
      y: -yPosition / size
    },
    raw,
    instance: nipple,
    lockX: opts.lockX,
    lockY: opts.lockY
  };
  toSend = nipple.computeDirection(toSend);
  toSend.angle = {
    radian: radians(180 - angle$1),
    degree: 180 - angle$1
  };
  nipple.trigger("move", toSend);
  self.trigger("move " + nipple.id + ":move", toSend);
};
Collection.prototype.processOnEnd = function(evt) {
  var self = this;
  var opts = self.options;
  var identifier = self.manager.getIdentifier(evt);
  var nipple = self.nipples.get(identifier);
  var removedIdentifier = self.manager.removeIdentifier(nipple.identifier);
  if (!nipple) {
    return;
  }
  if (!opts.dataOnly) {
    nipple.hide(function() {
      if (opts.mode === "dynamic") {
        nipple.trigger("removed", nipple);
        self.trigger("removed " + nipple.id + ":removed", nipple);
        self.manager.trigger("removed " + nipple.id + ":removed", nipple);
        nipple.destroy();
      }
    });
  }
  clearInterval(self.pressureIntervals[nipple.identifier]);
  nipple.resetDirection();
  nipple.trigger("end", nipple);
  self.trigger("end " + nipple.id + ":end", nipple);
  if (self.ids.indexOf(nipple.identifier) >= 0) {
    self.ids.splice(self.ids.indexOf(nipple.identifier), 1);
  }
  if (self.actives.indexOf(nipple) >= 0) {
    self.actives.splice(self.actives.indexOf(nipple), 1);
  }
  if (/(semi|static)/.test(opts.mode)) {
    self.idles.push(nipple);
  } else if (self.nipples.indexOf(nipple) >= 0) {
    self.nipples.splice(self.nipples.indexOf(nipple), 1);
  }
  self.manager.unbindDocument();
  if (/(semi|static)/.test(opts.mode)) {
    self.manager.ids[removedIdentifier.id] = removedIdentifier.identifier;
  }
};
Collection.prototype.onDestroyed = function(evt, nipple) {
  var self = this;
  if (self.nipples.indexOf(nipple) >= 0) {
    self.nipples.splice(self.nipples.indexOf(nipple), 1);
  }
  if (self.actives.indexOf(nipple) >= 0) {
    self.actives.splice(self.actives.indexOf(nipple), 1);
  }
  if (self.idles.indexOf(nipple) >= 0) {
    self.idles.splice(self.idles.indexOf(nipple), 1);
  }
  if (self.ids.indexOf(nipple.identifier) >= 0) {
    self.ids.splice(self.ids.indexOf(nipple.identifier), 1);
  }
  self.manager.removeIdentifier(nipple.identifier);
  self.manager.unbindDocument();
};
Collection.prototype.destroy = function() {
  var self = this;
  self.unbindEvt(self.options.zone, "start");
  self.nipples.forEach(function(nipple) {
    nipple.destroy();
  });
  for (var i in self.pressureIntervals) {
    if (self.pressureIntervals.hasOwnProperty(i)) {
      clearInterval(self.pressureIntervals[i]);
    }
  }
  self.trigger("destroyed", self.nipples);
  self.manager.unbindDocument();
  self.off();
};
function Manager(options) {
  var self = this;
  self.ids = {};
  self.index = 0;
  self.collections = [];
  self.scroll = getScroll();
  self.config(options);
  self.prepareCollections();
  var resizeHandler = function() {
    var pos;
    self.collections.forEach(function(collection) {
      collection.forEach(function(nipple) {
        pos = nipple.el.getBoundingClientRect();
        nipple.position = {
          x: self.scroll.x + pos.left,
          y: self.scroll.y + pos.top
        };
      });
    });
  };
  bindEvt(window, "resize", function() {
    throttle(resizeHandler);
  });
  var scrollHandler = function() {
    self.scroll = getScroll();
  };
  bindEvt(window, "scroll", function() {
    throttle(scrollHandler);
  });
  return self.collections;
}
Manager.prototype = new Super();
Manager.constructor = Manager;
Manager.prototype.prepareCollections = function() {
  var self = this;
  self.collections.create = self.create.bind(self);
  self.collections.on = self.on.bind(self);
  self.collections.off = self.off.bind(self);
  self.collections.destroy = self.destroy.bind(self);
  self.collections.get = function(id) {
    var nipple;
    self.collections.every(function(collection) {
      nipple = collection.get(id);
      return nipple ? false : true;
    });
    return nipple;
  };
};
Manager.prototype.create = function(options) {
  return this.createCollection(options);
};
Manager.prototype.createCollection = function(options) {
  var self = this;
  var collection = new Collection(self, options);
  self.bindCollection(collection);
  self.collections.push(collection);
  return collection;
};
Manager.prototype.bindCollection = function(collection) {
  var self = this;
  var type;
  var handler = function(evt, data) {
    type = evt.type + " " + data.id + ":" + evt.type;
    self.trigger(type, data);
  };
  collection.on("destroyed", self.onDestroyed.bind(self));
  collection.on("shown hidden rested dir plain", handler);
  collection.on("dir:up dir:right dir:down dir:left", handler);
  collection.on("plain:up plain:right plain:down plain:left", handler);
};
Manager.prototype.bindDocument = function() {
  var self = this;
  if (!self.binded) {
    self.bindEvt(document, "move").bindEvt(document, "end");
    self.binded = true;
  }
};
Manager.prototype.unbindDocument = function(force) {
  var self = this;
  if (!Object.keys(self.ids).length || force === true) {
    self.unbindEvt(document, "move").unbindEvt(document, "end");
    self.binded = false;
  }
};
Manager.prototype.getIdentifier = function(evt) {
  var id;
  if (!evt) {
    id = this.index;
  } else {
    id = evt.identifier === void 0 ? evt.pointerId : evt.identifier;
    if (id === void 0) {
      id = this.latest || 0;
    }
  }
  if (this.ids[id] === void 0) {
    this.ids[id] = this.index;
    this.index += 1;
  }
  this.latest = id;
  return this.ids[id];
};
Manager.prototype.removeIdentifier = function(identifier) {
  var removed = {};
  for (var id in this.ids) {
    if (this.ids[id] === identifier) {
      removed.id = id;
      removed.identifier = this.ids[id];
      delete this.ids[id];
      break;
    }
  }
  return removed;
};
Manager.prototype.onmove = function(evt) {
  var self = this;
  self.onAny("move", evt);
  return false;
};
Manager.prototype.onend = function(evt) {
  var self = this;
  self.onAny("end", evt);
  return false;
};
Manager.prototype.oncancel = function(evt) {
  var self = this;
  self.onAny("end", evt);
  return false;
};
Manager.prototype.onAny = function(which, evt) {
  var self = this;
  var id;
  var processFn = "processOn" + which.charAt(0).toUpperCase() + which.slice(1);
  evt = prepareEvent(evt);
  var processColl = function(e, id2, coll) {
    if (coll.ids.indexOf(id2) >= 0) {
      coll[processFn](e);
      e._found_ = true;
    }
  };
  var processEvt = function(e) {
    id = self.getIdentifier(e);
    map(self.collections, processColl.bind(null, e, id));
    if (!e._found_) {
      self.removeIdentifier(id);
    }
  };
  map(evt, processEvt);
  return false;
};
Manager.prototype.destroy = function() {
  var self = this;
  self.unbindDocument(true);
  self.ids = {};
  self.index = 0;
  self.collections.forEach(function(collection) {
    collection.destroy();
  });
  self.off();
};
Manager.prototype.onDestroyed = function(evt, coll) {
  var self = this;
  if (self.collections.indexOf(coll) < 0) {
    return false;
  }
  self.collections.splice(self.collections.indexOf(coll), 1);
};
const factory = new Manager();
const nipplejs = {
  create: function(options) {
    return factory.create(options);
  },
  factory
};
class JoyRtcComponent extends HTMLElement {
  constructor() {
    super();
    __publicField(this, "ws", null);
    __publicField(this, "pc", null);
    __publicField(this, "dc", null);
    __publicField(this, "bar");
    __publicField(this, "root");
    __publicField(this, "domWsState");
    __publicField(this, "domPcState");
    __publicField(this, "domDcState");
    __publicField(this, "domGamepadState");
    // 添加了domGamepadState变量
    __publicField(this, "gamepadIndex", null);
    __publicField(this, "gamepadAxesListener", null);
    __publicField(this, "checkGamepadAxes", () => {
      if (this.gamepadIndex !== null && this.gamepadAxesListener) {
        const gamepad = navigator.getGamepads()[this.gamepadIndex];
        if (gamepad) {
          this.gamepadAxesListener(new GamepadEvent("gamepaddisconnected", { gamepad }));
        }
      }
      window.requestAnimationFrame(this.checkGamepadAxes);
    });
    const template = document.createElement("template");
    this.root = this.attachShadow({ mode: "closed" });
    this.bar = document.createElement("div");
    this.bar.style.display = "flex";
    this.bar.style.justifyContent = "space-evenly";
    this.root.appendChild(this.bar);
    this.domWsState = document.createElement("p");
    this.bar.appendChild(this.domWsState);
    this.domPcState = document.createElement("p");
    this.bar.appendChild(this.domPcState);
    this.domDcState = document.createElement("p");
    this.bar.appendChild(this.domDcState);
    this.domGamepadState = document.createElement("p");
    this.bar.appendChild(this.domGamepadState);
    this.websocketState = "uninit";
    this.webrtcState = "uninit";
    this.dataChannelState = "uninit";
    const buttonStart = document.createElement("button");
    buttonStart.onclick = () => {
      this.startWebsocket();
    };
    buttonStart.innerText = "start";
    this.bar.appendChild(buttonStart);
    const buttonClick = document.createElement("button");
    buttonClick.innerText = "切换相机模式";
    buttonClick.addEventListener("click", () => {
      this.handleClick();
    });
    this.root.appendChild(buttonClick);
    const pad1 = document.createElement("div");
    pad1.innerText = "摇杆1";
    const pad2 = document.createElement("div");
    pad2.innerText = "摇杆2";
    const ipad1 = document.createElement("div");
    const ipad2 = document.createElement("div");
    pad1.appendChild(ipad1);
    pad2.appendChild(ipad2);
    this.root.appendChild(pad1);
    this.root.appendChild(pad2);
    const instance1 = nipplejs.create({
      zone: ipad1,
      mode: "static",
      position: {
        top: "50%",
        left: "25%"
      },
      dynamicPage: true,
      restOpacity: 0.6,
      fadeTime: 200
    });
    instance1.on("move", (_, data) => {
      var _a;
      const message = { joystick1: { x: data.vector.x, y: data.vector.y } };
      (_a = this.dc) == null ? void 0 : _a.send(JSON.stringify(message));
    });
    const instance2 = nipplejs.create({
      zone: ipad2,
      mode: "static",
      position: {
        top: "50%",
        left: "75%"
      },
      dynamicPage: true,
      restOpacity: 0.6,
      fadeTime: 200
    });
    instance2.on("move", (_, data) => {
      var _a;
      const message = { joystick2: { x: data.vector.x, y: data.vector.y } };
      (_a = this.dc) == null ? void 0 : _a.send(JSON.stringify(message));
    });
    const content = template.content.cloneNode(true);
    this.root.appendChild(content);
  }
  set websocketState(state) {
    this.domWsState.innerText = `websocket: ${state}`;
  }
  set webrtcState(state) {
    this.domPcState.innerText = `webrtc: ${state}`;
  }
  set dataChannelState(state) {
    this.domDcState.innerText = `dataChannel: ${state}`;
  }
  get debug() {
    return !!this.getAttribute("debug");
  }
  get autoplay() {
    return !!this.getAttribute("autoplay");
  }
  get address() {
    return this.getAttribute("address") || "";
  }
  set address(value) {
    this.setAttribute("address", value);
  }
  startWebsocket() {
    console.log("websocket start");
    this.ws = new WebSocket(this.address);
    this.ws.onopen = (ev) => {
      console.log("onopen", ev);
      this.websocketState = ev.type;
      this.startWebRTC();
    };
    this.ws.onclose = (ev) => this.websocketState = ev.type;
    this.ws.onerror = (ev) => this.websocketState = ev.type;
    this.ws.onmessage = (ev) => {
      var _a;
      console.log("onmessage", ev.data);
      const sdp = JSON.parse(ev.data);
      console.log(sdp);
      if (sdp.type === "answer") {
        if (!this.pc)
          return;
        this.pc.setRemoteDescription(sdp);
      } else if (sdp.type === "ice") {
        (_a = this.pc) == null ? void 0 : _a.addIceCandidate(new RTCIceCandidate({
          //sdpMLineIndex: sdp.id,
          sdpMid: sdp.label,
          candidate: sdp.candidate
        }));
      }
    };
    this.startGamepadListening();
  }
  async startWebRTC() {
    console.log(this.ws);
    if (!this.ws)
      return;
    this.webrtcState = "init";
    const ws = this.ws;
    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: ["stun:stun.22333.fun"]
        },
        {
          urls: "turn:turn.22333.fun",
          username: "filegogo",
          credential: "filegogo"
        }
      ]
    });
    this.pc = pc;
    this.dc = pc.createDataChannel("data", {
      negotiated: true,
      id: 0
    });
    this.dc.onopen = (ev) => this.dataChannelState = ev.type;
    this.dc.onclose = (ev) => this.dataChannelState = ev.type;
    this.dc.onerror = (ev) => this.dataChannelState = ev.type;
    this.dc.onmessage = (ev) => console.log(ev.data);
    pc.onicecandidate = (ev) => ev.candidate ? console.log(ev) : ws.send(JSON.stringify(pc.localDescription));
    pc.oniceconnectionstatechange = (_) => this.webrtcState = pc.iceConnectionState;
    pc.addTransceiver("video", { direction: "recvonly" });
    pc.ontrack = (event) => {
      if (event.track.kind === "audio") {
        const audioElement = document.createElement("audio");
        audioElement.srcObject = event.streams[0];
        audioElement.autoplay = true;
        audioElement.controls = true;
        audioElement.muted = false;
        document.body.appendChild(audioElement);
      } else if (event.track.kind === "video") {
        const videoElement = document.createElement("video");
        videoElement.srcObject = event.streams[0];
        videoElement.autoplay = true;
        videoElement.controls = true;
        videoElement.muted = false;
        document.body.appendChild(videoElement);
      }
    };
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.startGamepadListening();
  }
  startGamepadListening() {
    if (!this.gamepadIndex) {
      window.ongamepaddisconnected = (event) => {
        const gamepad = event.gamepad;
        this.gamepadIndex = gamepad.index;
        this.domGamepadState.innerHTML = `gamepad: connected`;
        this.gamepadAxesListener = () => {
          var _a;
          if (this.gamepadIndex) {
            const gamepad2 = navigator.getGamepads()[this.gamepadIndex];
            if (gamepad2) {
              const axes = gamepad2.axes;
              if (axes.length >= 4) {
                const joystick1 = { x: axes[0] || 0, y: -(axes[1] || 0) };
                const joystick2 = { x: axes[2] || 0, y: -(axes[3] || 0) };
                const message = { joystick1, joystick2 };
                (_a = this.dc) == null ? void 0 : _a.send(JSON.stringify(message));
              }
            }
          }
        };
        window.addEventListener("gamepaddisconnected", this.gamepadAxesListener);
        window.requestAnimationFrame(this.checkGamepadAxes);
      };
      window.addEventListener("gamepaddisconnected", () => {
        this.gamepadIndex = null;
        this.domGamepadState.innerHTML = `gamepad: disconnected`;
        window.removeEventListener("gamepaddisconnected", this.gamepadAxesListener);
        this.gamepadAxesListener = null;
      });
    }
    window.requestAnimationFrame(this.checkGamepadAxes);
  }
  handleClick() {
    var _a;
    const message = { type: "camera_mode_toggle" };
    (_a = this.dc) == null ? void 0 : _a.send(JSON.stringify(message));
  }
  // WebComponents hook
  // https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#using_the_lifecycle_callbacks
  connectedCallback() {
    console.log("autoplay: ", this.autoplay);
    console.log(navigator.getGamepads());
    if (this.autoplay) {
      console.log("autoplay");
      this.startWebsocket();
    }
  }
}
customElements.define("joy-rtc", JoyRtcComponent);
//# sourceMappingURL=index.mjs.map
