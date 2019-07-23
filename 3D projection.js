const screenScale = 20; //Scales up projection
const ph = 2;//Player height

let objects = [];//Objects in world

let p;//Player
let per;//Perspective

let f;//testing face


function setup() {
  createCanvas(1200, 800);
  
  p = new player(ph);
  per = new perspective(createVector(0,0,1));
  let size = 1;
  //objects.push(new cuboid(createVector(2*size,-ph,2*size),size,size,size,45));
 // objects.push(new cuboid(createVector(2*size,-ph,-2*size),size,size,size,45));
  //objects.push(new cuboid(createVector(-2*size,-ph,2*size),size,size,size,45));
  //objects.push(new cuboid(createVector(-2*size,-ph,-2*size),size,size,size,45));
  objects.push(new cuboid(createVector(0,0,0),size,size,size,0));
  f = new face([createVector(0,0,0),createVector(2*ph,0,0),createVector(ph,-ph,0),createVector(0,-ph,0)])
  //objects.push(new cuboid(createVector(0,-ph*3,-5),size,size,size,45));
  


 
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


//DOING THIS RN
  //Outer limit
  //walls.push(new wall(depth,0,mazewidth/4,depth,90))//North
  //walls.push(new wall(h*separation,0,depth,height))//East
  //walls.push(new wall(0,w*separation,width,depth))//South
  //walls.push(new wall(-depth*separation/hscale,0,depth,height))//West
  
}
function draw() {
  background(0,191,255);
  push();
  translate(width/2,height/2);
  stroke(255);
  strokeWeight(5);

  per.update();//Update perspective
  
  for(let i=0;i<objects.length;i++){
    //objects[i].show();//Show all objects
  }

  f.show(createVector(0,0,0));

  noLoop(); 
  //walls.forEach(wall=>wall.show3D());
  //walls[0].show3D();
  pop();

  //Draw walls  
  //walls.forEach(wall=>wall.show());
  

  controls();
  strokeWeight(0);
  fill(0);
  ellipseMode(CENTER);
  ellipse(width/2,height/2,7);
}


class face{
  constructor(points){
    this.points = points;
    this.n = this.getN(points);
  }
  getN(points){
    let a;//Direction vector 1
    let b;//Direction vector 2
    let n;//Normal of the face
    for(let i=0;i<points.length-1;i++){
      a = p5.Vector.sub(points[i+1],points[i]);
      for(let k=i+1;k<points.length-1;k++){
        b = p5.Vector.sub(points[k+1],points[k]);
        if(a.angleBetween(b) != 0){//If direction vectors are not parallel
          n = p5.Vector.cross(a,b);//Created normal      
          k=points.length;//Exit k loop
          i=points.length;//Exit i loop
        }
      }
    }
    if(points.length>3){//If more than 3 points
      if(this.isFace(points,n) == false){//If points don't all lie on a plane
        console.log("invalid face")
      }
    }
    return n;//Return a valid n
  }
  isFace(points,n){
    let k = p5.Vector.dot(points[0],n);//k = a.n
    for(let i=1;i<points.length;i++){
      if(Math.floor(p5.Vector.dot(points[i],n)) != Math.floor(k)){//If point doesn't lie of the plane
        return false;//If at least one point is invalid, face is invalid
      }
    }
    return true;//If no invalid points then face is valid
  }

  project(pos){
    let points = this.points.map(x => x.copy());//Copies all the vectors in the array to new instances
    points = points.map(a => p5.Vector.add(a,pos));//Translates all the points to the objects location
    if(this.visible(points) == null){
      return null
    }
    let onscreen = 0;
    let projected = [];
    for(let i=0;i<points.length;i++){
      let point = this.get2D(points[i]);
      if(Math.abs(point.x) <= width/2 && Math.abs(point.y) <= height/2 && point.z != null){//If point is on screen
        onscreen++;
        projected.push(point);
      }else{//If point not on screen

        //Split point into 2 points on the screen
        let left = this.firstVisiblePoint(points[i],points[(i-1+points.length) % points.length])//Get left 3D point
        let right = this.firstVisiblePoint(points[i],points[(i+1) % points.length])//Get right 3D point

        //Add left connection
        if(left!=null){
          projected.push(this.get2D(left));//Push left 2D point
        }
        //-----------------------------------
        //Needs rethinking (Corner issue)
        /*
        if(left == null ^ right == null){
          if(right != null){
            let a = right;
            let b = this.firstVisiblePoint(points[i-1],points[(i-2+points.length) % points.length])
            let result = this.firstVisiblePoint(a,b)
            if(result != null){
              result = this.get2D(result);
              let x = (result.x*width)/Math.abs(result.x);
              let y = (result.y*height)/Math.abs(result.y);
              projected.push(createVector(x,y));
              console.log(x,y)
            }
          }else if(left != null){
            let a = left;
            let b = this.firstVisiblePoint(points[i+1],points[(i+2) % points.length])
            let result = this.firstVisiblePoint(a,b);
            if(result != null){
              result = this.get2D(result);
              let x = (result.x*width)/Math.abs(result.x);
              let y = (result.y*height)/Math.abs(result.y);
              projected.push(createVector(x,y));
              console.log(x,y)
            }
          }
  
        }
        if(left == null && right == null){//If no connection therefore corner needed
          let x = points[i].x;
          let y = points[i].y;
          x = (x*width/2)/Math.abs(x);
          y = (y*height/2)/Math.abs(y);
          //projected.push(createVector(x,y));
        }else if(left != null && right != null){//If 2 connections and may need corner
          //If between a corner
          let left2 = this.get2D(left);
          let right2 = this.get2D(right);
          if((Math.floor(left2.x) == Math.floor(right2.x) || Math.floor(left2.y) == Math.floor(right2.y)) == false){
            let x = -width/2;
            let y = -width/2;
            if(Math.floor(left2.x/10)*10 == width/2 || Math.floor(right2.x/10)*10 == width/2){
              x = width/2;
            }
            if(Math.floor(left2.y/10)*10 == height/2 || Math.floor(right2.y/10)*10 == height/2){
              y = height/2;
            }
          //projected.push(createVector(x,y));//Add corner point
          }
        }
        */
        //----------------------------------------------------
        //Add right connection
        if(right!=null){
          projected.push(this.get2D(right));//Push right 2D point   
        }
      }
    }
    
    if(onscreen == 0){//If no points on screen
      return null;
    }
    console.log(projected);
    return projected;
  }

  firstVisiblePoint(cpoint,k){
    //Find a more efficient way to find this point
    let dir = p5.Vector.sub(k,cpoint);
    let point = cpoint.copy();
    let counter = 10;
    let test = this.get2D(point);
    while ((Math.abs(test.x) <= width/2 && Math.abs(test.y) <= height/2) == false && counter > 0){
      point.add(p5.Vector.mult(dir,1/10));
      test = this.get2D(point);
      counter--;
    }
    //If connection failed
    if (counter == 0){
      return null;
    }
    point.sub(p5.Vector.mult(dir,1/10))
    return point;//Get point from vector line equation
  }

  visible(points){
    //Checks if face is visible
    let centre = createVector();
    for(let i=0;i<points.length;i++){
      centre.add(p5.Vector.div(points[i],points.length))//Gets the centre of the face by adding quarters of each point
    }
 
    let a = this.n//Face normal
    let b = p5.Vector.sub(centre,p.pos);//Vector from face to camera
    return(Math.acos(p5.Vector.dot(a,b)/(a.mag()*b.mag()))<=PI/2 ? null : points);//Return face if face towards the camera
  }
  get2D(point){
  let dir = p5.Vector.sub(point,p.pos);//Direction of line vector
  //Forming r = a + λb
  let λ = -(per.d + p5.Vector.dot(p.pos,per.n)) / p5.Vector.dot(dir,per.n);//finding λ
  let b = p5.Vector.mult(dir,λ)//finding b 
  let r = p5.Vector.add(p.pos,b);//finding r

  r.sub(p.pos);//Translate to make camera the origin
  r = Matrix.rotateY(r,-p.rotation.x);//Inverse the rotation done to the plane's normal vector
  r = Matrix.rotateZ(r,-p.rotation.y);//Inverse the rotation done to the plane's normal vector  
  r.mult(screenScale);
  if(λ<=0){//If behind camera
    r.z = null;
  }
  return r;//Return on screen position
  }

  show(pos){
    strokeWeight(1);
    stroke(184,65,203)
    fill(184,65,203);
    let points = this.project(pos);
    if(points!=null){
      beginShape();
      for(let i=0;i<points.length;i++){
        let point = points[i];
        if(point != null){
          vertex(point.x,point.y);
        }
      }
      endShape(CLOSE);
    }
  }
}

class wall3D{
  constructor(pos,l,h,w,r){
    this.pos = pos;
    this.faces = this.generateFaces(l/2,h/2,w/2,r);
  }

  generateFaces(l,h,w,r){
    let faces = [];
    faces.push(this.generateFace([createVector(0,-h,-w),createVector(0,-h,w),createVector(0,h,w),createVector(0,h,-w)],r));//Ends of wall
    faces.push(this.generateFace([createVector(2*l,-h,-w),createVector(2*l,h,-w),createVector(2*l,h,w),createVector(2*l,-h,w)],r));

    faces.push(this.generateFace([createVector(0,-h,-w),createVector(2*l,-h,-w),createVector(2*l,-h,w),createVector(0,-h,w)],r));//Bottom of wall
    faces.push(this.generateFace([createVector(0,h,-w),createVector(0,h,w),createVector(2*l,h,w),createVector(2*l,h,-w)],r));//Top of wall

    faces.push(this.generateFace([createVector(2*l,-h,w),createVector(2*l,h,w),createVector(0,h,w),createVector(0,-h,w)],r));
    faces.push(this.generateFace([createVector(2*l,-h,-w),createVector(0,-h,-w),createVector(0,h,-w),createVector(2*l,h,-w)] ,r));//Sides of wall
  
    return faces;
  }
  generateFace(points,r){
    return new face(points.map(a => Matrix.rotateY(a,radians(-r))));
  }
  show(){
    for(let i=0;i<this.faces.length;i++){
      this.faces[i].show(this.pos);
    }
  }
}

class cuboid{
  constructor(pos,l,h,w,r){
    this.rotation = createVector(0,radians(r),0);
    this.pos = pos; 
    this.points = this.generatePoints(l/2,h/2,w/2);
    this.faces = this.generateFaces(this.points);
  }   
  generatePoints(l,h,w){
    let points = [];
    points.push(createVector(-l,h,-w));
    points.push(createVector(l,h,-w));
    points.push(createVector(l,h,w));
    points.push(createVector(-l,h,w));    
    points.push(createVector(-l,-h,-w));
    points.push(createVector(l,-h,-w));
    points.push(createVector(l,-h,w));
    points.push(createVector(-l,-h,w));
    points = points.map(a => Matrix.rotateX(a,this.rotation.x));//Rotates the point round the x axis
    points = points.map(a => Matrix.rotateY(a,this.rotation.y));//Rotates the point round the y axis
    points = points.map(a => Matrix.rotateZ(a,this.rotation.z));//Rotates the point round the z axis
    return points;
  }    
  generateFaces(points){
    let faces = [];
    faces.push(this.createFace(points,[3,2,1,0]));
    faces.push(this.createFace(points,[4,5,6,7]));
    for(let i=0;i<4;i++){
      faces.push(this.createFace(points,[i,(i+1)%4,4+(i+1)%4,i+4])); 
    }
    return faces;
  }
  createFace(points,k){
    let array = [];
    for(let i=0;i<4;i++){
      array.push(points[k[i]]);
    }
    return new face(array);
  }
  show(){
    for(let i=0;i<this.faces.length;i++){
      this.faces[i].show(this.pos);
    }
  }
      
  
}

class shape{
  constructor(){

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

class player{
  constructor(h){
    this.height = h;//Height of player
    this.pos = createVector(0,-this.height,-1);//Player's position
    this.rotation = createVector(radians(-50),radians(0));//Orientation of player
  }
}


