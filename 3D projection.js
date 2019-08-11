const screenScale = 20; //Scales up projection
const ph = 2;//Player height

let p;//Player
let per;//Perspective

let f;//testing face


function setup() {
  createCanvas(400, 400);
  background(0)




  
  p = new player(ph);
  per = new perspective(createVector(0,0,1));
 //f = new face([createVector(0,0,0),createVector(2*ph,0,0),createVector(ph,-ph,0),createVector(0,-ph,0)])
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
  
}
function draw() {
  //background(0,191,255);
  push();
  translate(width/2,height/2);
  stroke(255);
  strokeWeight(5);

  per.update();//Update perspective
  


  //f.show(createVector(0,0,0));

  //noLoop(); 
  //walls.forEach(wall=>wall.show3D());
  pop();

  //Draw walls  
  //walls.forEach(wall=>wall.show());

  controls();
  strokeWeight(2);
  fill(0);
  ellipseMode(CENTER);
  //ellipse(width/2,height/2,7);
}


class player{
  constructor(h){
    this.height = h;//Height of player
    this.pos = createVector(0,-this.height,-5);//Player's position
    this.rotation = createVector(radians(0),radians(0));//Orientation of player
  }

  
}

function mouseClicked(){
  canvas.requestPointerLock();
  if(document.pointerLockElement === canvas){
    document.exitPointerLock();
  }
}
function mouseMoved(){
  if(document.pointerLockElement === canvas){
    p.rotation.x += event.movementX*radians(0.1);//Allow looking horizontally
    p.rotation.y -= event.movementY*radians(0.1);//Allow looking vertically
    p.rotation.y = constrain(p.rotation.y,radians(-90),radians(90));//Constraint to looking from down to up
  }
}
function controls(){
  let speed = 0.1;
  let dir = per.n.copy();
  dir.y = 0;
  dir.setMag(speed);
  if(keyIsDown(87)){//w
    p.pos.add(dir);
  }
  if(keyIsDown(65)){//a
    p.pos.sub(Matrix.rotateY(dir,radians(90)));
  }
  if(keyIsDown(83)){//s
    p.pos.sub(dir);
  }
  if(keyIsDown(68)){//d
    p.pos.add(Matrix.rotateY(dir,radians(90)));
  }
  if(keyIsDown(37)){//left
    p.rotation.x-=radians(1);
  }
  if(keyIsDown(39)){//right
    p.rotation.x+=radians(1);
  }
  if(keyIsDown(38)){//up
    p.rotation.y+=radians(1);
  }
  if(keyIsDown(40)){//down
    p.rotation.y-=radians(1);
  }
}




class perspective{
  constructor(n){
    this.near = 0;
    this.far = 20;

    this.n = n;//Normal of plane
    this.d;//d of plane
  }

  update(){
    this.n = Matrix.rotateY(Matrix.rotateZ(createVector(0,0,1),p.rotation.y),p.rotation.x);//RotateXY plane round camera
    this.d = -(this.far * this.n.mag() - Math.abs(this.n.x*p.pos.x+this.n.y*p.pos.y+this.n.z*p.pos.z));//Calc d of the plane equation
  }
  
}



