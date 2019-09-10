const mazeSize = 10;
const screenScale = 20; //Scales up projection
const faceheight = 2;//Used for testing face

let player;//Player
let perspect;//Perspective

let f;//testing face

let gameMan;
function setup() {
  createCanvas(800, 800);
  background(255)
  gameMan = new manager();

  hscale = width/mazeSize;//scale to fit the screen
  vscale = height/mazeSize;//scale to fit the screen
  //console.log(currentMaze.getQuadTree());

  
 
}
function draw() {
  gameMan.show();
}



function mouseClicked(){
  gameMan.mouseClick();
}
function mouseMoved(){
  gameMan.mouseMoved();
}

window.addEventListener('keydown', (event) => {
  gameMan.keyDown(event);
})

class button{
  constructor(pos,w,h,text,colour,state,click,layerChange){
    this.visible = state;
    this.click = click;
    this.layerChange = layerChange;
    this.text = text;
    this.colour = colour;
    this.pos = pos;
    this.w = w;
    this.h = h;
  }
  getVisible(){
    return this.visible;
  }
  region(){
    return mouseX >= this.pos.x-this.w/2 &&
      mouseX <= this.pos.x+this.w/2 &&
      mouseY >= this.pos.y-this.h/2 &&
      mouseY <= this.pos.y+this.h/2;
  }
  hide(){
    this.visible = false;
  }
  show(){
    this.visible = true;
    rectMode(CENTER);
    fill(this.colour);
    rect(this.pos.x,this.pos.y,this.w,this.h);
    fill(0);
    textAlign(CENTER,CENTER)
    textSize(this.h)
    text(this.text,this.pos.x,this.pos.y+this.h/10);

  }
}

class perspective{
  constructor(){
    this.dist = 20;

    this.n;//Normal of plane
    this.d;//d of plane
  }

  getN(){
    return this.n.copy();
  }

  getD(){
    return this.d;
  }

  update(player){
    this.n = Matrix.rotateY(Matrix.rotateZ(createVector(0,0,1),player.getRY()),player.getRX());//RotateXY plane round camera
    //Manual way without formula
    //let n = this.n.copy();
    //n.mult(this.dist/n.mag());
    //n.add(p.pos);
    //let d = p5.Vector.dot(n,this.n);
    //this.d = -d;
    this.d = -(p5.Vector.dot(this.n,player.getPos()) +(this.dist));//Calc d of the plane equation
  }
  
}



