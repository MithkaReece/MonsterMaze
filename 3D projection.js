'use strict';
const screenScale = 20; //Scales up projection
const faceheight = 2;//Used for testing face

let gameMan;
function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255)
  gameMan = new manager();
  let mazeSize = gameMan.getMazeSize();
  hscale = width/mazeSize;//scale to fit the screen
  vscale = height/mazeSize;//scale to fit the screen
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
function mouseWheel(event){
  gameMan.mouseWheel(event);
}
window.addEventListener('keydown', (event) => {
  gameMan.keyDown(event);
})

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
function sommet(){
  //gameMan.runAi();
}
setInterval(sommet,50)// This should all the ai to do its move (milliseconds)


class button{
  constructor(pos,width,height,text,colour,click){
    this.click = click;
    this.text = text;
    this.colour = colour;
    this.pos = pos;
    this.width = width;
    this.height = height;
  }
  region(){
    return mouseX >= this.pos.x-this.width/2 &&
      mouseX <= this.pos.x+this.width/2 &&
      mouseY >= this.pos.y-this.height/2 &&
      mouseY <= this.pos.y+this.height/2;
  }
  hide(){
    this.visible = false;
  }
  show(){
    this.visible = true;
    rectMode(CENTER);
    fill(this.colour);
    rect(this.pos.x,this.pos.y,this.width,this.height);
    fill(0);
    textAlign(CENTER,CENTER)
    textSize(this.height)
    text(this.text,this.pos.x,this.pos.y+this.height/10);

  }
}

class label{
  constructor(pos,width,height,text,colour){
    this.pos = pos;
    this.width = width;
    this.height = height;
    this.text = text;
    this.colour = colour;
  }
  getText(){
    return this.text;
  }
  setText(text){
    this.text = text;
  }
  getPos(){
    return this.pos;
  }
  addPos(vector){
    this.pos.add(vector);
  }
  show(){
    rectMode(CENTER);
    fill(this.colour);
    rect(this.pos.x,this.pos.y,this.width,this.height);
    fill(0);
    textAlign(CENTER,CENTER)
    textSize(this.height)
    text(this.text,this.pos.x,this.pos.y+this.height/10);
  }
}

class perspective{
  constructor(){
    this.distance = 20;
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
    this.d = -(p5.Vector.dot(this.n,player.getPos()) +(this.distance));//Calc d of the plane equation
  }
}



