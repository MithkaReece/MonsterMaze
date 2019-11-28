'use strict';
//Fully commented

//Face is used to stored a 3D face that can project itself onto a 2D plane of a screen depending
//on the properties of the camera such as position and orientation
//This class also validates whether a given list of points can be made into a single face as well
//as handling the actual projection onto 2D using matrix and vector mathematics
//Points can also be created in the projection process to represent edges connecting to points
//that are behind the camera/player
class face{//Done
  constructor(points){
    this.points = points;//Defines the lists of points representing this face
    this.normal = this.calculateNormal(points);//Defines the normal by calculating a normal vector using the given points
    this.screenScale = 35;//Scales up projection (zooms in)
  }
  //calculateNormal is responsible for calculating the normal of the face based on the given points and returning found normal.
  calculateNormal(points){
    let dirA;//Direction vector A
    let dirB;//Direction vector B
    let normal;//Normal of the face
    for(let i=0;i<points.length-1;i++){//For every point but the last point
      dirA = p5.Vector.sub(points[i+1],points[i]);//Set direction vector A to be the vector from current point i to next point
      for(let k=i+1;k<points.length-1;k++){//For every point but the first and last point
        dirB = p5.Vector.sub(points[k+1],points[k]);//Set direction vector B to the vector from current point k to next point
        if(dirA.angleBetween(dirB) != 0){//If direction vectors are not parallel
          normal = p5.Vector.cross(dirA,dirB);//Create a potential normal by doing the cross product of the two direction vectors    
          k=points.length;//Exit k loop
          i=points.length;//Exit i loop
        }
      }
    }
    if(points.length>3){//If more than 3 points forming this plane
      if(this.isFace(points,normal) == false){//If points don't all lie on a single plane then invalid face
        console.log("invalid face")
      }
    }
    return normal;//Returns a valid normal
  }
  //isFace is responsible for returning the boolean result of if all the gien points can lie on a unique plane and therefore be a single face.
  isFace(points,n){
    let k = p5.Vector.dot(points[0],n);//k = a.n
    for(let i=1;i<points.length;i++){//For every point apart from the first point
      if(Math.floor(p5.Vector.dot(points[i],n)) != Math.floor(k)){//If point doesn't lie of the plane
        return false;//If at least one point is invalid, face is invalid therefore return false
      }
    }
    return true;//If no invalid points then face is valid therefore return true
  }
  //project is responsible for returning a list of 2D projected points that represent this 3D face which is then used
  //in show by drawing the list of projected points as a 2D polygon. This is done by validating through all the points
  //and projecting all possible points and estimating any invalid points that could be valid.
  project(pos,player,perspective){//Projects the face's points onto a 2D plane of the screen
    let points = this.points.map(a => p5.Vector.add(a.copy(),pos));//Translates all the points to the objects location from a copy of all the points
    if(this.visible(points,player.getPos()) == null || points.map(point => this.get2D(point,player,perspective)).every(point => (point.z == null))){
      return null //Checks if face is visible in direction the player is and if all points are behind the player
    }
    let projected = [];//Define projected as an empty array
    for(let i=0;i<points.length;i++){//For every point in points
      let point = this.get2D(points[i],player,perspective);//Projects the current point into 2D
      if(Math.abs(point.x) <= width/2 && Math.abs(point.y) <= height/2 && point.z != null){//If point is on screen
        projected.push(point);//Add valid 2D point to projected points
      }else{// If point not on screen
        //Split point into 2 points on the screen
        if(this.get2D(points[(i-1+points.length) % points.length],player,perspective).z!=null){//If left neighbour point is infront of camera
          projected.push(this.get2D(this.behindPlayerEstimation(points[i],points[(i-1+points.length) % points.length],player,perspective),player,perspective));//Push left 2D point
        }
        if(this.get2D(points[(i+1) % points.length],player,perspective).z!=null){//If right neighbour point is infront of camera
          projected.push(this.get2D(this.behindPlayerEstimation(points[i],points[(i+1) % points.length],player,perspective),player,perspective));//Push right 2D point   
        }
      }
    }
  if(projected.length==0){//If no valid points have been projected onto 2D
    return null;//Return null as nothing to draw
  }
  return projected;//Return the valid projected 2D points
  }
  //behindPlayerEstimation is responsible for estimating a point behind the player to the most accurate point
  //infront of the player by following the line between the point and the neighbouring point if the neighbouring
  //point is infront of the player.
  behindPlayerEstimation(currentPoint,connectingPoint,player,perspective){
    const accuracy = 100;//Accuracy of estimate points behind the camera
    let directionVector = p5.Vector.sub(connectingPoint,currentPoint);//Direction vector
    let newPoint = currentPoint.copy();//Copy of the point
    while(this.get2D(newPoint,player,perspective).z == null){//While it can't be projected
      newPoint.add(p5.Vector.mult(directionVector,1/accuracy));//Add a little direction vector in 3D
    }
    return newPoint;//Return a new estimate point found
  }
  //visible is responsible for checking whether a given face is actually facing towards the player as
  //other wise the face does not need to be drawn. This is down by making a vector from the centre of the face to
  //the player and finding the angle with this vector and the normal of the face and only return the points if
  //the angle is above half of Pi otherwise returning null.
  visible(points,playerPos){//Checks if face is visible
    let centre = createVector();//Define centre as a new vector
    for(let i=0;i<points.length;i++){//For every point of face
      centre.add(p5.Vector.div(points[i],points.length))//Gets the centre of the face by adding fractions of each point
    }
    let faceNormal = p5.Vector.sub(centre,playerPos);//Defines faceNormal as the Vector from the face to the camera
    return(Math.acos(p5.Vector.dot(this.normal,faceNormal)/(this.normal.mag()*faceNormal.mag()))<=PI/2 ? null : points);//Return face if face towards the camera
  }
  //get2D is responsible for returning a 2D point based on a given 3D point by using the information on the player
  //which is this case is the camera and the plane of the screen the point is projected on.
  get2D(point,player,perspective){//Calculates the 2D point based on a given 3D point
  let dir = p5.Vector.sub(point,player.getPos());//Direction of line vector
  //Forming r = a + λb using line and plane equation(r.n = -d)
  let lambda = ((-perspective.getD() - p5.Vector.dot(player.getPos(),perspective.getNormal())) / (p5.Vector.dot(dir,perspective.getNormal())));//finding λ    
  let b = p5.Vector.mult(dir,lambda)//finding b  
  let r = p5.Vector.add(player.getPos(),b);//finding r

  r.sub(player.getPos());//Translate to make camera the origin
  r = Matrix.rotateZ(Matrix.rotateY(r,-player.getRX()),-player.getRY());//Inverse the rotation done to the plane's normal vector
  r.mult(this.screenScale);
  if(lambda<=0){//If behind camera
    r.z = null;//Sets z to null to identify it is behind the camera therefore needs estimating
  }
  return r;//Return on screen position
  }
  //show is responsible for showing the face by using all the projected points and estimated points
  //to draw a polygon on the screen by defining all its vertices from the list of points.
  show(pos,player,perspective){
    let points = this.project(pos,player,perspective);//Retrieve all the points in 2D 
    if(points!=null){//If there exists points to be drawn
      beginShape();//Begin drawing the shape will the following vertices
      for(let i=0;i<points.length;i++){//For every points in points
        let point = points[i];//Let point be the current point
        if(point != null){//If point exists (point is not null)
          vertex(point.x,point.y);//Draw vertix with current x and y position
        }
      }
      endShape(CLOSE);//End shape and join the first and last vertices
    }
  }
}
//perspective class is responsible for storing information about the screen plane which is a set distance
//from the player and is normal to the direction the player is looking.
class perspective{//Done
  constructor(){
    this.distance = 20;//Distance of the plane of the screen is to the camera of the player
    this.normal;//Normal of plane
    this.d;//d from the plane equation r.n = d
  }
  getNormal(){//Get property for the normal of the plane of the screen
    return this.normal.copy();//Returns a copy of the vector
  }
  getD(){//Get property for the d from the plane equation r.n = d
    return this.d;//Returns the stored value of d
  }
  //Update is responsible for updating the plane equation based on the player's orientation.
  update(player){
    this.normal = Matrix.rotateY(Matrix.rotateZ(createVector(0,0,1),player.getRY()),player.getRX());//RotateXY screen plane round camera
    this.d = -(p5.Vector.dot(this.normal,player.getPos())+(this.distance));//Calculate d of the plane equation from the plane equation and the given distance
  }
}