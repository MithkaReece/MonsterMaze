class face{
    constructor(points){
      this.points = points;
      this.normal = this.getNormal(points);
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
      //Need to take into account if no point is on the screen but the face crosses the corner of the screen
      //This wouldn't happen for a rectangle face though but would need implementing for more general system
  

      let points = this.points.map(a => p5.Vector.add(a.copy(),pos));//Translates all the points to the objects location from a copy of all the points
      if(this.visible(points,player.getPos()) == null || points.map(point => this.get2D(point,player,perspective)).every(point => (point.z == null))){
        return null //Checks if face is visible in direction the player is and if all points are behind the player
      }
      

      let projected = [];
      for(let i=0;i<points.length;i++){
        let point = this.get2D(points[i],player,perspective);//Projects the current point into 2D
        if(Math.abs(point.x) <= width/2 && Math.abs(point.y) <= height/2 && point.z != null){//If point is on screen
          projected.push(point);
        }else{//If point not on screen
  
          //Split point into 2 points on the screen
          let left = this.firstVisiblePoint(points[i],points[(i-1+points.length) % points.length],player,perspective)//Get left 3D point
          let right = this.firstVisiblePoint(points[i],points[(i+1) % points.length],player,perspective)//Get right 3D point
          //Add left connection
          if(left!=null){
            projected.push(left);//Push left 2D point
          }
          //Add right connection
          if(right!=null){
            projected.push(right);//Push right 2D point   
          }
        }
      }
   
    
/*
      //Forms the 2D polygon
      let points3D = points.map(x => x.copy());
      let newPoints = [];
      for(let i=0;i<points3D.length;i++){
        let point = points3D[i].copy();   
        if(this.get2D(point,player,perspective).z == null){//If point is behind player
          let leftP = points3D[(i-1+points.length) % points.length];
          if(this.get2D(leftP,player,perspective).z != null){
            let newP = this.behindPlayerEstimation(point,leftP,player,perspective);
            newPoints.push(this.get2D(newP,player,perspective));
          }

          let rightP = points3D[(i+1) % points.length];
          if(this.get2D(rightP,player,perspective).z != null){
            let newP = this.behindPlayerEstimation(point,rightP,player,perspective);
            newPoints.push(this.get2D(newP,player,perspective));
          }
        }else{
          newPoints.push(this.get2D(points3D[i],player,perspective));
        }
      }
      
      let corners = [createVector(width/2,height/2),createVector(width/2,-height/2),createVector(-width/2,-height/2),createVector(-width/2,height/2)];
      for(let i=0;i<4;i++){
        if(this.checkCorner(corners[i],newPoints)==false){
          corners[i] = null;
        }
      }
      corners = corners.filter(x => x != null);

      if(projected.length==0){
        if(corners.length==4){
          return corners;
        }
        return projected;
      }

      if(corners.length>0){
      for(let i=0;i<projected.length;i++){
        let point = projected[i];
        if(point.z == Infinity && projected[(i-1+projected.length)%projected.length].z == Infinity){
          projected.splice(i,0,...corners);
          i = Infinity;
        }
      }
    }
    */
    console.log(projected);
    return projected;
    }

    checkCorner(corner,points){
      let counter = 0;
      for(let i=0;i<points.length;i++){
        let result = this.doLinesIntersect(corner,p5.Vector.add(corner,createVector(1,0)),points[i],points[(i+1) % points.length]);
        if(result[0] > 0 && result[0] < 1 && result[1] > 0){
          counter++;
        }
      }
      return counter % 2 == 1;
    }
    doLinesIntersect(pointA1,pointA2,pointB1,pointB2){
      const x1 = pointB1.x;
      const y1 = pointB1.y;
      const x2 = pointB2.x;
      const y2 = pointB2.y;

      const x3 = pointA1.x;
      const y3 = pointA1.y;
      const x4 = pointA2.x;
      const y4 = pointA2.y;

      let den = (x1 - x2)*(y3 - y4) - (y1 - y2)*(x3 - x4);
      if(den == 0){
        return [0,0];
      }
      const t = ((x1 - x3)*(y3 - y4) - (y1 - y3)*(x3 - x4))/den;
      const u = -((x1 - x2)*(y1 - y3) - (y1 - y2)*(x1 - x3))/den;
      return [t,u];
    }

    screenIntersection(pointA1,pointA2){//Gets points of intersection between screen boundaries and two points
      let points = [];
      let screen = [createVector(-width/2,-height/2),createVector(width/2,-height/2),createVector(width/2,height/2),createVector(-width/2,height/2)];
      for(let i=0;i<screen.length;i++){
        let result = this.lineIntersection(pointA1,pointA2,screen[i],screen[(i+1)%4]);
        if(result!=null){
          points.push(result);
        }
      }
      return points;
    }

    lineIntersection(pointA1,pointA2,pointB1,pointB2){//Returns points of intersection between two sets of two points
      let result = this.doLinesIntersect(pointA1,pointA2,pointB1,pointB2);//Return t and u results from any intersection
      if(result[0] > 0 && result[0] < 1 && result[1] > 0 && result[0] < 1){//If the lines intersect
        return createVector(pointB1.x + result[0]*(pointB2.x - pointB1.x) , pointB1.y + result[0]*(pointB2.y - pointB1.y));//Return the point of intersection
      } 
      return null//Return null if no intersection
    }
  
    firstVisiblePoint(currentPoint,cPoint,player,perspective){
   
      //Checks when the point to it's connecting point intersects a screen edge to estimate its point
      let connectingPoint = this.get2D(cPoint,player,perspective);

      if(connectingPoint.z == null){
        return null;
      }
      //Fix this shit
      let points = this.screenIntersection(this.get2D(this.behindPlayerEstimation(currentPoint,cPoint,player,perspective),player,perspective),connectingPoint);//Get list of points of intersection with screen between these two points
      if(points.length > 0){//If points were found
        let newPoint = points[0];//Set new point default to the first point in points
        if(points.length>1){
          if(Math.sqrt(Math.pow(currentPoint.x-points[1].x,2) + Math.pow(currentPoint.y-points[1].y,2)) < Math.sqrt(Math.pow(currentPoint.x-newPoint.x,2) + Math.pow(currentPoint.y-newPoint.y,2))){
            newPoint = points[1];//If the other point is closer set it as new point
          }
        }
        console.log(points.length);
        return newPoint;
      }
      return null;
      //WRONG
   
      

      //Get 2 points of a 2D lines
      let a = this.get2D(this.behindPlayerEstimation(currentPoint,cPoint,player,perspective),player,perspective);
      let l = this.get2D(cPoint,player,perspective);
      let b = p5.Vector.sub(l,a);//From r = a+lambda*b
      //Find when that lines intersects the screen
      let x;//Left/Right
      if(this.diffSign(a.x+width/2,l.x+width/2)){
        x = -width/2;//If intersects left of screen
      }else if(this.diffSign(a.x-width/2,l.x-width/2)){
        x = width/2;//If intersects right of screen
      }
      if(x!=undefined){//If intersects left or right of screen
        //Can be made into function 
        let lambda = (x-a.x)/b.x;
        let potY = a.y + lambda*b.y;//Calc potential y
        if(potY > -width/2 && potY < width/2){//If y on screen
          return createVector(x,potY);//Return new point
        }
      }
  
      let y;//Top/Bottom
      if(this.diffSign(a.y+height/2,l.y+height/2)){
        y = -height/2;//If intersects top of screen
      }else if(this.diffSign(a.y-height/2,l.y-height/2)){
        y = height/2;//If intersects bottom of screen
      }
      if(y!=undefined){//If intersects top or bottom of screen
        //Can be made into function with previous
        let lambda = (y-a.y)/b.y;
        let potX = a.x + lambda*b.x;//Calc potential x
        return createVector(potX,y);//Return new point
      }
      
     //z console.log("BUG");//If something went wrong
      return null;
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
  
    diffSign(a,b){//Checks if the signs are difference
      return a/Math.abs(a)!=b/Math.abs(b);
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
    let λ = ((-perspective.getD() - p5.Vector.dot(player.getPos(),perspective.getN())) / (p5.Vector.dot(dir,perspective.getN())));//finding λ    
    let b = p5.Vector.mult(dir,λ)//finding b  
    let r = p5.Vector.add(player.getPos(),b);//finding r
  
    r.sub(player.getPos());//Translate to make camera the origin
    r = Matrix.rotateY(r,-player.getRX());//Inverse the rotation done to the plane's normal vector
    r = Matrix.rotateZ(r,-player.getRY());//Inverse the rotation done to the plane's normal vector  
    r.mult(screenScale);
    if(λ<=0){//If behind camera
      r.z = null;
    }
    return r;//Return on screen position
    }
  
    show(pos,player,perspective){
      strokeWeight(1);
      stroke(0,150,250)
      fill(0,150,250);
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
    //Distance not magnitude + d will have a difference sign depending on the side
  }