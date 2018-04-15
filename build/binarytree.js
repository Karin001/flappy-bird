var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var canvas = new fabric.Canvas('c', {});
var cacheCanvas = new fabric.Canvas('d', {});
var gameEle = (function (_super) {
    __extends(gameEle, _super);
    function gameEle(element, options, souceModels, canvas) {
        var _this = _super.call(this, element, options) || this;
        _this.element = element;
        _this.canvas = canvas;
        _this.models = {};
        _this.modelNames = [];
        _this.creatModels(souceModels);
        _this.modelIndex = _this.modelNames[0];
        return _this;
    }
    gameEle.prototype.creatModels = function (souceModels) {
        var souces = souceModels;
        for (var key in souces) {
            if (souces.hasOwnProperty(key)) {
                var souceModel = souces[key];
                var tmp = this.createTmpCanvas(souceModel.width, souceModel.height);
                console.log(tmp);
                var tmpCtx = tmp.getContext('2d');
                tmpCtx.clearRect(0, 0, souceModel.width, souceModel.height);
                tmpCtx.drawImage(this.element, souceModel.x, souceModel.y, souceModel.width, souceModel.height, 0, 0, souceModel.width, souceModel.height);
                var dataURL = tmp.toDataURL('image/png');
                var tmpImg = fabric.util.createImage();
                tmpImg.src = dataURL;
                console.log(dataURL);
                this.modelNames.push(key);
                this.models[key] = __assign({}, souceModel, { img: tmpImg });
            }
        }
    };
    gameEle.prototype.createTmpCanvas = function (width, height) {
        var tmpCanvasEl = fabric.util.createCanvasElement();
        tmpCanvasEl.width = width;
        tmpCanvasEl.height = height;
        return tmpCanvasEl;
    };
    gameEle.prototype._render = function (ctx) {
        ctx.drawImage(this.models[this.modelIndex].img, -this.models[this.modelIndex].width / 2, -this.models[this.modelIndex].height / 2);
    };
    return gameEle;
}(fabric.Image));
var Bird = (function (_super) {
    __extends(Bird, _super);
    function Bird() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.impactting = false;
        return _this;
    }
    Bird.prototype.impact = function () {
    };
    Bird.prototype.fly = function () {
        var _this = this;
        var cnt = 0;
        this.animInterval = setInterval(function () {
            _this.modelIndex = _this.modelNames[(cnt++) % 3];
        }, 50);
    };
    Bird.prototype.stopFly = function () {
        clearInterval(this.animInterval);
    };
    Bird.prototype.lock = function () {
        canvas.__eventListeners["mouse:down"] = [];
        this.canvas.on('mouse:down', null);
    };
    Bird.prototype.readyToJump = function () {
        var _this = this;
        this.canvas.on('mouse:down', function (e) {
            console.log(123);
            _this.jumpping = true;
            _this.angle = -15;
            var jumpTo = _this.top - _this.height / 2 - 30 <= 0 ? _this.height / 2 : _this.top - 30 - _this.height / 2;
            _this.animate({ top: jumpTo, angle: -15 }, {
                onChange: _this.canvas.renderAll.bind(_this.canvas),
                duration: 400,
                easing: fabric.util.ease.easeOutBack,
                abort: function () { return _this.impactting; },
                onComplete: function () {
                    _this.jumpping = false;
                    _this.fall();
                },
            });
        });
    };
    Bird.prototype.fall = function () {
        var _this = this;
        var factor = this.impactting ? 3 : 1.3;
        this.animate({ top: 500, angle: 90 }, {
            onChange: canvas.renderAll.bind(canvas),
            duration: (500 - this.top) * factor,
            easing: fabric.util.ease.easeInSine,
            abort: function () {
                return _this.jumpping;
            }
        });
    };
    Bird.prototype.crash = function () {
        this.stopFly();
    };
    return Bird;
}(gameEle));
var DIR;
(function (DIR) {
    DIR[DIR["gameTitle"] = 0] = "gameTitle";
    DIR[DIR["gameStart"] = 1] = "gameStart";
    DIR[DIR["gameOver"] = 2] = "gameOver";
})(DIR || (DIR = {}));
var BG = (function (_super) {
    __extends(BG, _super);
    function BG() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.juli = -_this.models[_this.modelIndex].width;
        _this.stopMoving = false;
        return _this;
    }
    BG.prototype.stop = function () {
        this.left = this.lastLeft;
        canvas.renderAll();
    };
    BG.prototype.move = function () {
        var _this = this;
        this.left = this.stopMoving ? this.lastLeft : 0;
        this.animate({ left: this.juli }, {
            onChange: function () { _this.lastLeft = _this.left; },
            duration: 5000,
            easing: function (t, b, c, d) { return c * t / d + b; },
            onComplete: this.move.bind(this),
            abort: function () { return _this.stopMoving; },
        });
    };
    BG.prototype._render = function (ctx) {
        ctx.drawImage(this.models[this.modelIndex].img, -this.models[this.modelIndex].width / 2, -this.models[this.modelIndex].height / 2);
        ctx.drawImage(this.models[this.modelIndex].img, this.models[this.modelIndex].width / 2, -this.models[this.modelIndex].height / 2);
    };
    return BG;
}(gameEle));
var Barrier = (function (_super) {
    __extends(Barrier, _super);
    function Barrier() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.juli = -_this.width;
        _this.stopMoving = false;
        return _this;
    }
    Barrier.prototype.stop = function () {
        this.left = this.lastLeft;
        canvas.renderAll();
    };
    Barrier.prototype.move = function () {
        var _this = this;
        this.left = this.stopMoving ? this.lastLeft : 288;
        this.animate({ left: this.juli }, {
            onChange: function () {
                _this.setCoords();
                _this.lastLeft = _this.left;
            },
            duration: 1500,
            easing: function (t, b, c, d) { return c * t / d + b; },
            abort: function () { return _this.stopMoving; },
            onComplete: function () {
                _this.height = _this.stopMoving ? _this.height : 200;
                _this.move();
            }
        });
    };
    Barrier.prototype._render = function (ctx) {
        for (var nums = 0; nums <= this.height - this.models['mouth'].height; nums++) {
            ctx.drawImage(this.models['pipe'].img, -this.width / 2 - 2, this.height / 2 - nums);
        }
        ctx.drawImage(this.models['mouth'].img, -this.width / 2 - 4, -this.height / 2);
    };
    return Barrier;
}(gameEle));
var Hint = (function (_super) {
    __extends(Hint, _super);
    function Hint() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Hint.prototype.inital = function () {
        var _this = this;
        this.on('mousedown', function () {
            _this.modelIndex = DIR.gameStart;
        });
        this.on('mouseover', function () {
            _this.animate({
                scaleX: 1.1,
                scaleY: 1.1
            }, {
                onChange: canvas.renderAll.bind(canvas),
                duration: 200,
            });
        });
        this.on('mouseout', function () {
            _this.animate({
                scaleX: 1.0,
                scaleY: 1.0
            }, {
                onChange: canvas.renderAll.bind(canvas),
                duration: 200,
                easing: fabric.util.ease.easeInElastic
            });
        });
        this.selectable = false;
        this.hoverCursor = 'pointer';
    };
    return Hint;
}(gameEle));
var barrierSets = [[50, 200], [60, 230], [300, 60]];
function randomPipeFac() {
    var setNumber = Math.floor(Math.random() * barrierSets.length);
    return barrierSets[setNumber === 3 ? 2 : setNumber];
}
fabric.util.loadImage('./imgs/atlas.png', function (img) {
    var bird = new Bird(img, { left: 50, top: 300, width: 34, height: 24, originX: 'center', originY: 'center', shadow: 'rgba(0,0,0,0.4) -5px 0px 17px' }, {
        wing_up: { x: 230, y: 762, width: 34, height: 24 },
        wing_nomal: { x: 230, y: 814, width: 34, height: 24 },
        wing_down: { x: 230, y: 866, width: 34, height: 24 },
    }, canvas);
    var hint = new Hint(img, { left: 200, top: 100, width: 184, height: 50, originX: 'left', originY: 'top' }, [
        { x: 702, y: 182, width: 178, height: 48 },
        { x: 590, y: 118, width: 184, height: 50 },
        { x: 790, y: 118, width: 192, height: 42 },
    ], canvas);
    var bg = new BG(img, { left: 0, top: 0, width: 288, height: 512, originX: 'left', originY: 'top', selectable: false, hoverCursor: 'cursor' }, {
        day: { x: 0, y: 0, width: 288, height: 512 },
        night: { x: 292, y: 0, width: 288, height: 512 }
    }, canvas);
    var barrier = new Barrier(img, { left: 200, top: 512, width: 44, height: 180, originX: 'left', originY: 'bottom', selectable: false, hoverCursor: 'cursor' }, {
        mouth: { x: 0, y: 646, width: 52, height: 27 },
        pipe: { x: 2, y: 688, width: 48, height: 1 }
    }, canvas);
    var barrier2 = new Barrier(img, { left: 200, top: 0, width: 44, height: 80, flipY: true, originX: 'left', originY: 'top', selectable: false, hoverCursor: 'cursor' }, {
        mouth: { x: 0, y: 646, width: 52, height: 27 },
        pipe: { x: 2, y: 688, width: 48, height: 1 }
    }, canvas);
    function onChange(options) {
        options.setCoords();
        console.log(32432423424);
        if (options.target !== bird && options.target !== bg) {
            bird.intersectsWithObject(options.target);
            options.target.stopMoving = true;
            bird.crash();
            options.target.stop();
        }
    }
    console.log(bird);
    canvas.add(bg);
    canvas.add(barrier, barrier2, bird);
    barrier2.move();
    hint.inital();
    bird.fly();
    bird.readyToJump();
    bg.modelIndex = 'night';
    bg.move();
    barrier.move();
    canvas.on({
        'object:moving': function () { console.log(234234234234); }
    });
    var coin = 0;
    var on = true;
    function renderAni() {
        ;
        bird.setCoords();
        barrier.setCoords();
        barrier2.setCoords();
        if (bird.intersectsWithObject(barrier) || bird.intersectsWithObject(barrier2) || bird.top >= 499.9999) {
            bird.impactting = true;
            barrier.stopMoving = true;
            barrier2.stopMoving = true;
            bg.stopMoving = true;
            bird.lock();
            bird.crash();
            barrier.stop();
            barrier2.stop();
            bg.stop();
        }
        if (barrier.left < 6 && on) {
            console.log(++coin);
            on = false;
        }
        if (barrier.left > 6 && !on) {
            on = true;
        }
        canvas.renderAll();
        fabric.util.requestAnimFrame(renderAni);
    }
    renderAni();
});
