/*Layers meanings
0:Main menu
1:Playing the game
2:LeaderBoard
3:Pause menu
4:Win screen
5:Lose screen
*/
const screenScale = 20; //Scales up projection
const ph = 2;//Player height

let p;//Player
let per;//Perspective

let f;//testing face

let layer = 1;
let buttons = new Array(6).fill().map(item =>(new Array()));//Makes an array 6 long of arrays

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
  p = new player(ph);
  per = new perspective();
  f = new face([createVector(-ph,0,0),createVector(ph,0,0),createVector(ph,-ph,0),createVector(-ph,-ph,0)])
  let w = mazegrid[0];//How many horizontal cells
  let h = mazegrid[1];//How many vertcal cells
  hscale = width/w;//scale to fit the screen
  vscale = height/h;//scale to fit the screen
  grid = make2Darray(w,h);//Creates the grid
  for(let y=0;y<h;y++){
    for(let x=0;x<w;x++){
      grid[x][y] = (new cell(x,y,w,h));
    }
  }
  generateMaze(w,h,c)
  generateWalls(w,h);
//Outer walls need adding
  //Outer limit
  //walls.push(new wall(depth,0,mazewidth/4,depth,90))//North
  //walls.push(new wall(h*separation,0,depth,height))//East
  //walls.push(new wall(0,w*separation,width,depth))//South
  //walls.push(new wall(-depth*separation/hscale,0,depth,height))//West
  

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
function drawGameplay(){
  background(0,191,255);
  push();
  translate(width/2,height/2);
  stroke(255);
  strokeWeight(5);
  

  //f.show(createVector(0,0,0));
  walls.forEach(wall=>wall.show3D());
  pop();  
  walls.forEach(wall=>wall.show());
  
  strokeWeight(2);
  fill(0);
  //ellipseMode(CENTER);

  push();
  let n = 5;
  translate(hscale*p.pos.x,vscale*p.pos.z);
  rotate(-p.rotation.x)
  triangle(-n,0,n,0,0,3*n);
  

  pop();


  //ellipse(hscale*p.pos.x,vscale*p.pos.z,7);
}
function updateGameplay(){
  per.update();//Update perspective
  controls();
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

class player{
  constructor(h){
    this.height = h;//Height of player
    this.pos = createVector(0,-3*this.height,0);//Player's position
    this.rotation = createVector(radians(45),radians(0));//Orientation of player
  }
  addRX(value){
    this.rotation.x+=value;
  }
  getRX(){
    return this.rotation.x;
  }
  addRY(value){
    this.rotation.y+=value;
    this.rotation.y = constrain(this.rotation.y,radians(-90),radians(90));//Constraint to looking from down to up
  }
  getRY(){
    return this.rotation.y;
  }
  addPos(value){
    this.pos.add(value);
  }
  getPos(){
    return this.pos;
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
    p.addRX(event.movementX*radians(0.1));//Allow looking horizontally
    p.addRY(-event.movementY*radians(0.1))//Allow looking vertically
  }
}
function controls(){
  let speed = 0.1;
  let dir = per.getN();
  dir.y = 0;
  dir.setMag(speed);
  if(keyIsDown(87)){//w
    p.addPos(dir);
  }
  if(keyIsDown(65)){//a
    p.addPos(Matrix.rotateY(dir,radians(270)));
  }
  if(keyIsDown(83)){//s
    p.addPos(Matrix.rotateY(dir,radians(180)));
  }
  if(keyIsDown(68)){//d
    p.addPos(Matrix.rotateY(dir,radians(90)));
  }

}
window.addEventListener('keydown', (event) => {
  if (event.keyCode === 9 && layer == 1) {
    event.preventDefault();
    layer = 3;
  }
})

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
    this.n = Matrix.rotateY(Matrix.rotateZ(createVector(0,0,1),p.getRY()),p.getRX());//RotateXY plane round camera
    //Manual way without formula
    //let n = this.n.copy();
    //n.mult(this.dist/n.mag());
    //n.add(p.pos);
    //let d = p5.Vector.dot(n,this.n);
    //this.d = -d;
    this.d = -(p5.Vector.dot(this.n,p.getPos()) +(this.dist));//Calc d of the plane equation
  }
  
}



