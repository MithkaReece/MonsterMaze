

const scale = 20; //Scales up projection
const ph = 2;//Player height

let objects = [];//Objects in world

let p;//Player
let per;//Perspective

class perspective{
  constructor(n){
    this.near = 0;
    this.far = 20;

    this.n = n;
    this.d;

  }

  update(){
    this.n = Matrix.rotateY(Matrix.rotateZ(createVector(0,0,1),p.rotation.y),p.rotation.x);//RotateXY plane round camera
    this.d = -(this.far * this.n.mag() - Math.abs(this.n.x*p.pos.x+this.n.y*p.pos.y+this.n.z*p.pos.z));//Calc d of the plane equation
  }
  
}

class player{
  constructor(h){
    this.height = h;
    this.pos = createVector(0,-this.height,-5);
    this.rotation = createVector(0,0);
  }
}



function setup() {
  createCanvas(400, 400);
  p = new player(2);
  per = new perspective(createVector(0,0,1));
  let size = 1;
  //objects.push(new cuboid(createVector(2*size,-ph,2*size),size,size,size,45));
  //objects.push(new cuboid(createVector(2*size,-ph,-2*size),size,size,size,45));
 // objects.push(new cuboid(createVector(-2*size,-ph,2*size),size,size,size,45));
  objects.push(new cuboid(createVector(-2*size,-ph,-2*size),size,size,size,45));
  
  //objects.push(new cuboid(createVector(0,-ph*3,-5),size,size,size,45));
  
  cam = createVector(0,-ph,-5);
  //n = createVector(0,0,1);//Setting up starting normal vector
  //Update these to look around
  rx = radians(0);//Rotation of player left/right
  ry = radians(0);//Rotation of player up/down
}

function draw() {
  background(0);
  translate(width/2,height/2);
  stroke(255);
  strokeWeight(5);


  per.update();
  
  for(let i=0;i<objects.length;i++){
    objects[i].show(); 
  }


  
  //noLoop(); 
  controls();
     fill(255,255,255,80);
    textAlign(CENTER);
    textSize(20);
    //text(ry,30,30);
}

function controls(){
  let speed = 0.1;
  let dir = per.n.copy();
  dir.y = 0;
  dir.setMag(speed);
  if(keyIsDown(87)){//w
    cam.add(dir);
    p.pos.add(dir);
  }
  if(keyIsDown(65)){//a
    cam.sub(Matrix.rotateY(dir,radians(90)));
    p.pos.sub(Matrix.rotateY(dir,radians(90)));
  }
  if(keyIsDown(83)){//s
    cam.sub(dir);
    p.pos.sub(dir);
  }
  if(keyIsDown(68)){//d
    cam.add(Matrix.rotateY(dir,radians(90)));
    p.pos.add(Matrix.rotateY(dir,radians(90)));
  }
  if(keyIsDown(37)){//left
    rx-=radians(1);
    p.rotation.x-=radians(1);
  }
  if(keyIsDown(39)){//right
    rx+=radians(1);
    p.rotation.x+=radians(1);
  }
  if(keyIsDown(38)){//up
    ry+=radians(1);
    p.rotation.y+=radians(1);
  }
  if(keyIsDown(40)){//down
    ry-=radians(1);
    p.rotation.y-=radians(1);
  }

}

class cuboid{
  constructor(pos,l,h,w,r){
    this.scale = 20;
    this.rotation = createVector(0,radians(r),0);
    this.pos = pos; 
    this.points3 = this.generatePoints(l,h,w);
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
  project(){
    let points = this.points3.map(x => x.copy());//Copies all the vectors in the array to new instances
    points = points.map(a => p5.Vector.add(a,this.pos));//Translates all the points to the objects location
    points = this.checkQuads(points);//Null any invisible faces
    return points.map(x => this.to2D(x));//Project the visible points to 2D
  }
  checkQuads(points){
    let newPoints = [];
    newPoints.push(this.visible(points,[3,2,1,0]));
    newPoints.push(this.visible(points,[4,5,6,7]));
    for(let i=0;i<4;i++){
      newPoints.push(this.visible(points,[i,(i+1)%4,4+(i+1)%4,i+4])); 
    }
    return newPoints;
  }
  visible(points,k){
    let centre = createVector();
    let face =[];
    for(let i=0;i<4;i++){
      face.push(points[k[i]]);//Adds points of face to a list
      centre.add(p5.Vector.div(points[k[i]],4))//Gets the centre of the face by adding quarters of each point
    }
 
    let a = p5.Vector.sub(centre,this.pos);//Vector from face to objects centre
    let b = p5.Vector.sub(centre,p.pos);//Vector from face to camera
    return(Math.acos(p5.Vector.dot(a,b)/(a.mag()*b.mag()))<=PI/2 ? null : face);//Return face if face towards the camera
  }  
  
  to2D(points){
    if(points == null){    
      return null; 
    }
    const result = points.map(x => this.get2D(x));
    return (result.includes(null) ? null : result);

  }
  get2D(point){
    let dir = p5.Vector.sub(point,p.pos);
    let lambda = -(per.d+per.n.x*point.x+per.n.y*point.y+per.n.z*point.z)/(per.n.x*(dir.x)+per.n.y*(dir.y)+per.n.z*(dir.z));//Formula for lambda
    let foundP = this.findP(point,lambda);
    
    
       
    foundP.mult(scale);
    if(lambda<0){//If behind plane          
      //foundP.mult(-1);//Invert coordinate
      foundP.z = null;//Set z to null so the amount of points can be counted
    }
    return foundP;
  }
  
  findP(point,lambda){
    let foundP = createVector(point.x + lambda*(point.x-p.pos.x),point.y + lambda*(point.y-p.pos.y),point.z + lambda*(point.z-p.pos.z));
    foundP.sub(p.pos);//Translate to make camera the origin
    foundP = Matrix.rotateY(foundP,-p.rotation.x);//Inverse the rotation done to the plane's normal vector
    foundP = Matrix.rotateZ(foundP,-p.rotation.y);//Inverse the rotation done to the plane's normal vector    
    return foundP.add(p.pos);//Translate back to normal position
  }
  
  show(){
    this.points2 = this.project(); 
    for(let i=0;i<this.points2.length;i++){
      if(this.points2[i]!=null){
        let a = this.points2[i];
        
        let behind = 0;
        for(let k=0;k<a.length;k++){
          if(a[k].z == null){
            behind++; 
          }
        }
        if(behind < a.length){//If at least one point in view
          strokeWeight(1);
          fill(110);
          quad(a[0].x,a[0].y,a[1].x,a[1].y,a[2].x,a[2].y,a[3].x,a[3].y);
        }
      }
    }  
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
    rx += event.movementX*radians(0.1);

    ry -= event.movementYp*radians(0.1);
    ry = constrain(ry,radians(-90),radians(90));
  }
  
}



function VtoArray(vector){
  let arr;
  if(vector.z != undefined){
    arr = make2Darray(3,1);
  }else{
    arr = make2Darray(2,1); 
  }
  arr[0][0] = vector.x;
  arr[1][0] = vector.y;
  if(vector.z != undefined){
    arr[2][0] = vector.z; 
  }
  return arr;
}

function toVector(matrix){
  let vector = createVector();
  vector.x = matrix[0];
  vector.y = matrix[1];
  if(matrix.length > 2){
    vector.z = matrix[2]; 
  }
  return vector;
}




function make2Darray(cols,rows){
  let arr = new Array(cols);
  for(let i=0;i<arr.length;i++){
    arr[i] = new Array(rows); 
  }
  return arr;
}





