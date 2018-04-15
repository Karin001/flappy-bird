
var canvas = new fabric.Canvas('c', {
  //backgroundColor:'red'
});
var cacheCanvas = new fabric.Canvas('d', {

});
interface EleCoords {
  x: number; y: number; width: number; height: number
}


class gameEle extends fabric.Image {

  models: any = {};
  modelNames = [];
  modelIndex;
  constructor(private element: HTMLImageElement, options: fabric.IObjectOptions, souceModels: any, public canvas: fabric.Canvas) {
    super(element, options);
    this.creatModels(souceModels);
    this.modelIndex = this.modelNames[0];
    

  }
  creatModels(souceModels) {
    let souces = souceModels as object;
    for (var key in souces) {
      if (souces.hasOwnProperty(key)) {
        var souceModel = souces[key];
        let tmp = this.createTmpCanvas(souceModel.width, souceModel.height);
        console.log(tmp);
        let tmpCtx = tmp.getContext('2d');
        tmpCtx.clearRect(0, 0, souceModel.width, souceModel.height);
        tmpCtx.drawImage(
          this.element, souceModel.x,
          souceModel.y,
          souceModel.width,
          souceModel.height,
          0,
          0,
          souceModel.width,
          souceModel.height
        );
        var dataURL = tmp.toDataURL('image/png');
        var tmpImg = fabric.util.createImage();
        tmpImg.src = dataURL;
        console.log(dataURL);
        this.modelNames.push(key);
        this.models[key] = { ...souceModel, img: tmpImg }
      }
    }

  }

  createTmpCanvas(width, height) {
    let tmpCanvasEl = fabric.util.createCanvasElement();
    tmpCanvasEl.width = width;
    tmpCanvasEl.height = height;
    return tmpCanvasEl;

  }
  _render(ctx) {
    ctx.drawImage(this.models[this.modelIndex].img, -this.models[this.modelIndex].width / 2, -this.models[this.modelIndex].height / 2);
    //console.log(ctx);
  }

}

class Bird extends gameEle {
  animInterval: any;
  jumpping;
  falling;
  impactting = false;
  impact(){

  }
  fly() {
    let cnt = 0;
    this.animInterval = setInterval(() => {
      this.modelIndex = this.modelNames[(cnt++) % 3];
      //console.log(this.modelIndex);
    }, 50)
  }
  stopFly() {
    clearInterval(this.animInterval);
  }
  lock(){
    
    canvas.__eventListeners["mouse:down"] = [];
    this.canvas.on('mouse:down',null ) }
  readyToJump() {
    this.canvas.on('mouse:down', (e) => {
      console.log(123);
      this.jumpping = true
      this.angle = -15;
      var jumpTo = this.top - this.height / 2 - 30 <= 0 ? this.height / 2 : this.top - 30 - this.height / 2;
      this.animate({ top: jumpTo, angle:-15}, {
        onChange: this.canvas.renderAll.bind(this.canvas),
        duration: 400,
        easing: fabric.util.ease.easeOutBack,
        abort:()=>{return this.impactting},
        onComplete: () => { 
         
        this.jumpping = false; this.fall() },
      })
    })
  }
  fall() {
    let factor = this.impactting? 3:1.3
    this.animate({ top: 500, angle:90 }, {
      onChange: canvas.renderAll.bind(canvas),
      duration: (500 - this.top) * factor,
      easing: fabric.util.ease.easeInSine,
      abort: () => {
        return this.jumpping;
      }

    })

  }
  crash() {
    this.stopFly();
  }
}
enum DIR {
  gameTitle = 0,
  gameStart,
  gameOver

}
class BG extends gameEle {
  juli = -this.models[this.modelIndex].width;
  lastLeft;
  stopMoving:boolean = false;
  stop(){
    this.left = this.lastLeft;
    canvas.renderAll();
  }
  move(){
    this.left = this.stopMoving?this.lastLeft:0;
    this.animate({left:this.juli},{
      onChange:()=>{this.lastLeft = this.left},
      duration: 5000,
      easing: function(t, b, c, d) { return c*t/d + b; },
      onComplete: this.move.bind(this),
      abort: ()=>{return this.stopMoving },
    })
  }
  _render(ctx){
    ctx.drawImage(this.models[this.modelIndex].img, -this.models[this.modelIndex].width / 2, -this.models[this.modelIndex].height / 2);
    ctx.drawImage(this.models[this.modelIndex].img, this.models[this.modelIndex].width / 2, -this.models[this.modelIndex].height / 2);
    
  }
  
  
}
class Barrier extends gameEle{
  juli = -this.width;

  lastLeft;
  stopMoving:boolean = false;

  stop(){
    this.left = this.lastLeft;
    canvas.renderAll();
  }
  move(){
    
    this.left = this.stopMoving?this.lastLeft:288;

    this.animate({left:this.juli},{
      onChange:  ()=>{
        this.setCoords();
        //canvas.renderAll();
        this.lastLeft = this.left;
      },
      duration: 1500,
      easing: function(t, b, c, d) { return c*t/d + b; },
      abort: ()=>{return this.stopMoving },
      onComplete: ()=>{
        
        this.height=this.stopMoving?this.height:200;
        this.move()
      }
     
    })
  }
  _render(ctx){
    for(let nums = 0 ; nums<= this.height-this.models['mouth'].height; nums++){
      ctx.drawImage(this.models['pipe'].img, -this.width/2-2, this.height/2-nums);
    }
      
      ctx.drawImage(this.models['mouth'].img, -this.width/2-4, -this.height/2);
  }
}
class Hint extends gameEle {
  inital() {
    this.on('mousedown', () => {
      this.modelIndex = DIR.gameStart;
    })
    this.on('mouseover', () => {
      this.animate({
        scaleX: 1.1,
        scaleY: 1.1
      }, {
          onChange: canvas.renderAll.bind(canvas),
          duration: 200,
        })

    })
    this.on('mouseout', () => {
      this.animate({
        scaleX: 1.0,
        scaleY: 1.0
      }, {
          onChange: canvas.renderAll.bind(canvas),
          duration: 200,
          easing: fabric.util.ease.easeInElastic
        })

    })
    this.selectable = false;
    this.hoverCursor = 'pointer';
  }


}
var barrierSets = [[50,200],[60,230],[300,60]];
function randomPipeFac(){
  let setNumber = Math.floor(Math.random()*barrierSets.length);
  return barrierSets[setNumber===3?2:setNumber];
  
}
fabric.util.loadImage('./imgs/atlas.png', (img) => {
  var bird = new Bird(img, { left: 50, top: 300, width: 34, height: 24, originX: 'center', originY: 'center',shadow: 'rgba(0,0,0,0.4) -5px 0px 17px' }, {
    wing_up: { x: 230, y: 762, width: 34, height: 24 },
    wing_nomal: { x: 230, y: 814, width: 34, height: 24 },
    wing_down: { x: 230, y: 866, width: 34, height: 24 },
  }, canvas);
  var hint = new Hint(img, { left: 200, top: 100, width: 184, height: 50, originX: 'left', originY: 'top' }, [
    { x: 702, y: 182, width: 178, height: 48 },
    { x: 590, y: 118, width: 184, height: 50 },
    { x: 790, y: 118, width: 192, height: 42 },
  ], canvas);
  var bg = new BG(img, {left:0, top:0, width:288,height:512,originX:'left',originY:'top', selectable:false,hoverCursor:'cursor'},{
    day: {x: 0, y:0, width:288, height:512},
    night: {x: 292, y:0, width:288, height:512}
  },canvas);
  var barrier = new Barrier(img, {left:200,top:512,width:44, height:180,originX:'left',originY:'bottom',selectable:false,hoverCursor:'cursor'},{
    mouth: {x:0, y:646,width:52,height:27 },
    pipe: {x:2, y:688,width:48,height:1 }
  },canvas);
  var barrier2 = new Barrier(img, {left:200,top:0,width:44, height:80,flipY:true,originX:'left',originY:'top',selectable:false,hoverCursor:'cursor'},{
    mouth: {x:0, y:646,width:52,height:27 },
    pipe: {x:2, y:688,width:48,height:1 }
  },canvas)
 
 function onChange(options){
  options.setCoords();
  console.log(32432423424);
  if(options.target !== bird && options.target !== bg ){
    bird.intersectsWithObject(options.target);
    options.target.stopMoving = true;
    bird.crash();
    options.target.stop();
  }
 
 }
  console.log(bird);

  canvas.add(bg);

  canvas.add(barrier,barrier2,bird);
  barrier2.move();
  hint.inital();
 // canvas.add(hint);
  bird.fly();
  bird.readyToJump();
  bg.modelIndex = 'night';
  bg.move();
  barrier.move();
  canvas.on(
    {
      'object:moving': ()=>{console.log(234234234234)}
     }
   )

   var coin = 0;
   var on = true;
  function renderAni() {
    ;
    bird.setCoords();
    barrier.setCoords();
    barrier2.setCoords();
    if(bird.intersectsWithObject(barrier) || bird.intersectsWithObject(barrier2) || bird.top >= 499.9999){
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
    if(barrier.left<6 && on){

      console.log(++coin)
      on = false;
    }
    if(barrier.left> 6 && !on){
      on = true;
    }
    

    // if(barrier2.over === true){
    //   console.log(barrier2.over);
    //   barrier2.left= barrier2.lastLeft;

    // }
    canvas.renderAll();
    fabric.util.requestAnimFrame(renderAni);
  }
  renderAni();




})


// var gameElefactory = fabric.util.createClass(fabric.Image, {

//     type: 'gameEle',
//     eleWidth: 50,
//     eleHeight: 72,
//     eleIndex: 0,

//     initialize: function(element, options) {
//       options || (options = { });

//       options.width = this.eleWidth;
//       options.height = this.eleHeight;

//       this.callSuper('initialize', element, options);

//       this.createTmpCanvas();
//       this.createSpriteImages();
//     },

//     createTmpCanvas: function() {
//       this.tmpCanvasEl = fabric.util.createCanvasElement();
//       this.tmpCanvasEl.width = this.eleWidth || this.width;
//       this.tmpCanvasEl.height = this.eleHeight || this.height;
//     },


//     createSpriteImage: function(i) {
//       var tmpCtx = this.tmpCanvasEl.getContext('2d');
//       tmpCtx.clearRect(0, 0, this.tmpCanvasEl.width, this.tmpCanvasEl.height);
//       tmpCtx.drawImage(this._element, -i * this.spriteWidth, 0);

//       var dataURL = this.tmpCanvasEl.toDataURL('image/png');
//       var tmpImg = fabric.util.createImage();

//       tmpImg.src = dataURL;

//       this.spriteImages.push(tmpImg);
//     },

//     _render: function(ctx) {
//       ctx.drawImage(
//         this.spriteImages[this.spriteIndex],
//         -this.width / 2,
//         -this.height / 2
//       );
//     },

//     play: function() {
//       var _this = this;
//       this.animInterval = setInterval(function() {

//         _this.onPlay && _this.onPlay();

//         _this.spriteIndex++;
//         if (_this.spriteIndex === _this.spriteImages.length) {
//           _this.spriteIndex = 0;
//         }
//       }, 100);
//     },

//     stop: function() {
//       clearInterval(this.animInterval);
//     }
//   });
// class Bird{
//   imgUrl:string;
//   location:{x:number;y:number};
//   activeArea:{topBoundary:{x:number;y:number};bottomBoundary:{x:number;y:number}};
//   viewInstance: fabric.Canvas
//   constructor(){

//   }
//   fly(){}
//   fall(){
//     if(this.location.y === this.activeArea.bottomBoundary.y){
//       this.crash();
//     }
//   }
//   crash(){}

// }
// class Barrier {
//   imgUrl:string;
//   location:{up:{x:number;y:number}; down:{x:number;y:number}}
//   viwerHeight:number;
//   upsideHeight:number;
//   downsideHeight:number;
//   changeHeight(){
//     this.upsideHeight = 50 + Math.floor(Math.random()*(this.viwerHeight - 100 - 30));
//     this.downsideHeight = 50 +  Math.floor((this.viwerHeight - this.upsideHeight - 30 - 50) * Math.random() )
//   }
//   animate(){}

// }
// class FlyBird {
//   bird:Bird;
//   bgImg:string;
//   entrance(){}
//   gameStart(){}


// }


