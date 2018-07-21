(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.StarLineBg = factory());
}(this, (function () { 'use strict';

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var Star = function () {
    function Star(ctx, options) {
      classCallCheck(this, Star);

      this.starGroup = [];
      this.ctx = ctx;
      this.elWidth = this.ctx.canvas.clientWidth;
      this.elHeight = this.ctx.canvas.clientHeight;
      this.options = options;
    }

    createClass(Star, [{
      key: 'initStars',
      value: function initStars() {
        var _this = this;

        var starGroup = [];
        for (var i = 0; i < this.options.starNumber; i += 1) {
          this.starGroup.push({
            drivenByMouse: i === 0,
            x: Math.random() * this.elWidth,
            y: Math.random() * this.elHeight,
            vx: Math.random() - 0.5,
            vy: Math.random() - 0.5,
            radius: 1 + Math.random() * 2,
            globalAlpha: 0.5 + Math.random() * 0.5
          });
        }
        this.starGroup.forEach(function (e1) {
          _this.starGroup.forEach(function (e2) {
            if (e1 === e2) return;
            var line = {
              from: e1,
              to: e2
            };
            starGroup.push(line);
          });
        });
        return starGroup;
      }
    }, {
      key: 'drive',
      value: function drive() {
        var _this2 = this;

        this.starGroup.forEach(function (e) {
          if (e.drivenByMouse) return;
          e.x += e.vx;
          e.y += e.vy;

          var fix = function fix(max, value) {
            if (value < 0) return 0;
            return value > max ? max : value;
          };

          if (e.x <= 0 || e.x >= _this2.elWidth) {
            e.vx *= -1;
            e.x = fix(_this2.elWidth, e.x);
          }
          if (e.y <= 0 || e.y >= _this2.elHeight) {
            e.vy *= -1;
            e.y = fix(_this2.elHeight, e.y);
          }
        });
      }
    }, {
      key: 'adjustStarDrivenByMouse',
      value: function adjustStarDrivenByMouse(mousePos) {
        this.starGroup[0].x += (mousePos[0] - this.starGroup[0].x) / Star.easingFactor;
        this.starGroup[0].y += (mousePos[1] - this.starGroup[0].y) / Star.easingFactor;
      }
    }, {
      key: 'render',
      value: function render() {
        var _this3 = this;

        this.starGroup.forEach(function (e) {
          if (e.drivenByMouse) return;
          _this3.ctx.globalAlpha = e.globalAlpha;
          _this3.ctx.fillStyle = Star.starColor;
          _this3.ctx.beginPath();
          _this3.ctx.arc(e.x, e.y, e.radius, 0, 2 * Math.PI);
          _this3.ctx.fill();
          _this3.ctx.globalAlpha = 1;
        });
      }
    }]);
    return Star;
  }();

  Star.easingFactor = 5;
  Star.starColor = '#fff';

  var Line = function () {
    function Line(ctx, options) {
      classCallCheck(this, Line);

      this.edges = [];
      this.ctx = ctx;
      this.threshold = options.threshold;
    }

    createClass(Line, [{
      key: 'add',
      value: function add(edge) {
        for (var i = 0; i < this.edges.length; i += 1) {
          if (this.edges[i].from === edge.from && this.edges[i].to === edge.to || this.edges[i].to === edge.from && this.edges[i].from === edge.to) {
            return;
          }
        }
        this.edges.push(edge);
      }
    }, {
      key: 'render',
      value: function render() {
        var _this4 = this;

        this.edges.forEach(function (e) {
          var l = Line.lengthOfLine(e);
          if (l > _this4.threshold) return;
          _this4.ctx.strokeStyle = Line.edgeColor;
          _this4.ctx.lineWidth = (1.0 - l / _this4.threshold) * 2.5;
          _this4.ctx.globalAlpha = 1.0 - l / _this4.threshold;
          _this4.ctx.beginPath();
          _this4.ctx.moveTo(e.from.x, e.from.y);
          _this4.ctx.lineTo(e.to.x, e.to.y);
          _this4.ctx.stroke();
        });
        this.ctx.globalAlpha = 1;
      }
    }]);
    return Line;
  }();

  Line.edgeColor = '#fff';

  Line.lengthOfLine = function (edge) {
    return Math.sqrt(Math.pow(edge.from.x - edge.to.x, 2) + Math.pow(edge.from.y - edge.to.y, 2));
  };

  var StarLine = function () {
    // requestAnimationFrame id

    function StarLine(el, options) {
      classCallCheck(this, StarLine);
      this.mousePos = [0, 0];

      this.el = document.querySelector(el);
      this.options = Object.assign({}, StarLine.defaultOptions, options);
      this.ctx = this.el.getContext('2d');
      this.line = new Line(this.ctx, this.options);
      this.star = new Star(this.ctx, this.options);

      if (this.options.autoRun) {
        this.run();
      }
    } // 鼠标位置


    createClass(StarLine, [{
      key: 'render',
      value: function render() {
        this.ctx.clearRect(0, 0, this.el.clientWidth, this.el.clientHeight);
        this.ctx.fillStyle = this.options.canvasBgColor;
        this.ctx.fillRect(0, 0, this.el.clientHeight, this.el.clientHeight);
        this.line.render();
        this.star.render();
      }
    }, {
      key: 'reRender',
      value: function reRender(options) {
        window.cancelAnimationFrame(this.runnerId);
        this.options = Object.assign({}, StarLine.defaultOptions, options);
        this.line = new Line(this.ctx, this.options);
        this.star = new Star(this.ctx, this.options);
        this.run();
      }
    }, {
      key: 'run',
      value: function run() {
        var _this5 = this;

        this.el.width = this.el.clientWidth;
        this.el.height = this.el.clientHeight;
        if (this.star.starGroup.length === 0) {
          var starGroup = this.star.initStars();
          starGroup.forEach(function (star) {
            _this5.line.add(star);
          });
        }
        this.star.drive();
        this.star.adjustStarDrivenByMouse(this.mousePos);
        this.render();
        this.runnerId = window.requestAnimationFrame(this.run.bind(this));
      }
    }]);
    return StarLine;
  }();

  StarLine.defaultOptions = {
    threshold: 100, // 两点间连线最大距离
    canvasBgColor: 'rgba(255, 255, 255, 0)', // canvas的背景颜色
    starNumber: 30, // star Number
    autoRun: true // auto start
  };

  return StarLine;

})));
