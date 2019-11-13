'use strict';
class face{
  constructor(points){
    this.points = points;
    this.normal = this.getNormal(points);
    this.screenScale = 35; //Scales up projection
  }
  getNormal(points){//Gets the face's normal(plane)
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
  isFace(points,n){//Checks if all points lies on the same plane to form a face
    let k = p5.Vector.dot(points[0],n);//k = a.n
    for(let i=1;i<points.length;i++){
      if(Math.floor(p5.Vector.dot(points[i],n)) != Math.floor(k)){//If point doesn't lie of the plane
        return false;//If at least one point is invalid, face is invalid
      }
    }
    return true;//If no invalid points then face is valid
  }

  project(pos,player,perspective){
    let points = this.points.map(a => p5.Vector.add(a.copy(),pos));//Translates all the points to the objects location from a copy of all the points
    if(this.visible(points,player.getPos()) == null || points.map(point => this.get2D(point,player,perspective)).every(point => (point.z == null))){
      return null //Checks if face is visible in direction the player is and if all points are behind the player
    }
    
    let projected = [];
    for(let i=0;i<points.length;i++){
      let point = this.get2D(points[i],player,perspective);//Projects the current point into 2D
      if(Math.abs(point.x) <= width/2 && Math.abs(point.y) <= height/2 && point.z != null){//If point is on screen
        projected.push(point);
      }else{// If point not on screen
        let left;
        let right;
        //Split point into 2 points on the screen
        if(this.get2D(points[(i-1+points.length) % points.length],player,perspective).z!=null){
          left = this.get2D(this.behindPlayerEstimation(points[i],points[(i-1+points.length) % points.length],player,perspective),player,perspective)//Get left 3D point
        }
        if(this.get2D(points[(i+1) % points.length],player,perspective).z!=null){
          right = this.get2D(this.behindPlayerEstimation(points[i],points[(i+1) % points.length],player,perspective),player,perspective)//Get right 3D point
        }
        //Add left connection
        if(left!=null){
          left.z = Infinity;//Used to identify point has been estimated
          projected.push(left);//Push left 2D point
        }
        //Add right connection
        if(right!=null){
          right.z = Infinity;//Used to identify point has been estimated
          projected.push(right);//Push right 2D point   
        }
      }
    }
  if(projected.length==0){
    return null;
  }
  return projected;
  }

  behindPlayerEstimation(currentPoint,connectingPoint,player,perspective){
    const accuracy = 100;//Accuaracy of estimate points behind the camera

    let dir = p5.Vector.sub(connectingPoint,currentPoint);//Direction vector
    let point = currentPoint.copy();//Copy of the point
    while(this.get2D(point,player,perspective).z == null){//While it can't be projected
      point.add(p5.Vector.mult(dir,1/accuracy));//Add a little in 3D
    }
    return point;
  }

  visible(points,playerPos){//Checks if face is visible
    let centre = createVector();
    for(let i=0;i<points.length;i++){
      centre.add(p5.Vector.div(points[i],points.length))//Gets the centre of the face by adding fractions of each point
    }
    let faceNormal = p5.Vector.sub(centre,playerPos);//Vector from face to camera
    return(Math.acos(p5.Vector.dot(this.normal,faceNormal)/(this.normal.mag()*faceNormal.mag()))<=PI/2 ? null : points);//Return face if face towards the camera
  }
  
  get2D(point,player,perspective){
  let dir = p5.Vector.sub(point,player.getPos());//Direction of line vector
  //Forming r = a + λb using line and plane equation(r.n = -d)
  let lambda = ((-perspective.getD() - p5.Vector.dot(player.getPos(),perspective.getNormal())) / (p5.Vector.dot(dir,perspective.getNormal())));//finding λ    
  let b = p5.Vector.mult(dir,lambda)//finding b  
  let r = p5.Vector.add(player.getPos(),b);//finding r

  r.sub(player.getPos());//Translate to make camera the origin
  r = Matrix.rotateY(r,-player.getRX());//Inverse the rotation done to the plane's normal vector
  r = Matrix.rotateZ(r,-player.getRY());//Inverse the rotation done to the plane's normal vector  
  r.mult(this.screenScale);
  if(lambda<=0){//If behind camera
    r.z = null;
  }
  return r;//Return on screen position
  }

  show(pos,player,perspective){
    let points = this.project(pos,player,perspective);
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
class perspective{
  constructor(){
    this.distance = 20;//Distance of the plane of the screen is to the camera of the player
    this.normal;//Normal of plane
    this.d;//d from the plane equation r.n = d
  }
  getNormal(){//Get property for the normal of the plane of the screen
    return this.normal.copy();//Returns a copy of the vector
  }
  getD(){//Get propery for the d from the plane equation r.n = d
    return this.d;
  }
  update(player){
    this.normal = Matrix.rotateY(Matrix.rotateZ(createVector(0,0,1),player.getRY()),player.getRX());//RotateXY screen plane round camera
    this.d = -(p5.Vector.dot(this.normal,player.getPos()) +(this.distance));//Calculate d of the plane equation from the plane equation and the given distance
  }
}