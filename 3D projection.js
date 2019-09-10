/*Layers meanings
0:Main menu
1:Playing the game
2:LeaderBoard
3:Pause menu
4:Win screen
5:Lose screen
*/
let layer = 1;
const mazeSize = 10;
const screenScale = 20; //Scales up projection
const faceheight = 2;//Used for testing face

let player;//Player
let perspect;//Perspective

let f;//testing face

let buttons = new Array(6).fill().map(item =>(new Array()));//Makes an array 6 long of arrays

let currentMaze;

function setup() {
  createCanvas(800, 800);
  background(255)


  //Setup main menu:0
  buttons[0].push(new button(createVector(width/2,height/2),300,100,"PLAY",[0,0,255],true,function(){
    canvas.requestPointerLock();
    layer = 1;//Game
  })) 
  buttons[0].push(new button(createVector(width/2,height/4),380,50,"LEADERBOARD",[0,0,255],true,function(){
    layer = 2;//Leaderboard
  }))
  buttons[0].push(new button(createVector(width/2,3*height/4),300,100,"EXIT",[0,0,255],true,function(){
    console.log("exit")
  }))



  //Setup gameplay:1
  player = new character(faceheight);
  perspect = new perspective();
  f = new face([createVector(-faceheight,0,0),createVector(faceheight,0,0),createVector(faceheight,-faceheight,0),createVector(-faceheight,-faceheight,0)])

  currentMaze = new Maze(mazeSize,mazeSize,1);
  hscale = width/mazeSize;//scale to fit the screen
  vscale = height/mazeSize;//scale to fit the screen
  //console.log(currentMaze.getQuadTree());

  //Setup leaderboard:2

  //Setup pause menu:3
  buttons[3].push(new button(createVector(width/2,height/2),300,70,"RESUME",[0,255,255],true,function(){
    layer = 1;//Game
  })) 
  buttons[3].push(new button(createVector(width/2,3*height/4),300,100,"EXIT",[0,0,255],true,function(){
    layer = 0;//Main menu
  }))
}
function draw() {
  switch(layer){
    case 0:
      drawMainMenu();
      break;
    case 1:
      updateGameplay();
      drawGameplay();
      break;
    case 2:
      drawLeaderboard();
      break;
    case 3:
      drawGameplay();
      drawPauseMenu();
      break;
  }
  
}

function drawMainMenu(){
  background(255);
  drawButtons();
}
function updateGameplay(){
  perspect.update();//Update perspective
  controls();
}
function drawGameplay(){
  background(0,191,255);
  push();
  translate(width/2,height/2);
  stroke(255);
  strokeWeight(5);
  

  //f.show(createVector(0,0,0));
  currentMaze.getWalls().forEach(wall=>wall.show3D());
  pop();  
  //walls.forEach(wall=>wall.show());
  
  strokeWeight(2);
  fill(0);
  //ellipseMode(CENTER);

  push();
  let n = 5;
  translate(hscale*player.pos.x,vscale*player.pos.z);
  rotate(-player.rotation.x)
  triangle(-n,0,n,0,0,3*n);
  

  pop();


  //ellipse(hscale*p.pos.x,vscale*p.pos.z,7);
}
function drawLeaderboard(){
  
}
function drawPauseMenu(){
  document.exitPointerLock();
  drawButtons();
}

function drawButtons(){
  for(let i=0;i<buttons[layer].length;i++){
    let button = buttons[layer][i];
    if(button.getVisible){
      button.show();
    }
  }
}





function mouseClicked(){
  if(layer == 1){//If in first person gameplay
    canvas.requestPointerLock();
    if(document.pointerLockElement === canvas){
      document.exitPointerLock();
    }
  }else{
    for(let i=0;i<buttons[layer].length;i++){
      let button = buttons[layer][i];
      if(button.region() && button.getVisible){
        button.click();
        i=buttons.length+1;
      }
    }
  }
}
function mouseMoved(){
  if(document.pointerLockElement === canvas){
    player.addRX(event.movementX*radians(0.1));//Allow looking horizontally
    player.addRY(-event.movementY*radians(0.1))//Allow looking vertically
  }
}
function controls(){
  let speed = 0.1;
  let dir = perspect.getN();
  dir.y = 0;
  dir.setMag(speed);
  if(keyIsDown(87)){//w
    player.addPos(dir);
  }
  if(keyIsDown(65)){//a
    player.addPos(Matrix.rotateY(dir,radians(270)));
  }
  if(keyIsDown(83)){//s
    player.addPos(Matrix.rotateY(dir,radians(180)));
  }
  if(keyIsDown(68)){//d
    player.addPos(Matrix.rotateY(dir,radians(90)));
  }

}
window.addEventListener('keydown', (event) => {
  if (event.keyCode === 9 && layer == 1) {
    event.preventDefault();
    layer = 3;
  }
})

class button{
  constructor(pos,w,h,text,colour,state,click){
    this.visible = state;
    this.click = click;
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

  update(){
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



