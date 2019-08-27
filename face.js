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
      //Need to take into account if no point is on the screen but the face crosses the corner of the screen
      //This wouldn't happen for a rectangle face though but would need implementing for more general system
  
      //Check if screen first
      let points = this.points.map(x => x.copy());//Copies all the vectors in the array to new instances
      points = points.map(a => p5.Vector.add(a,pos));//Translates all the points to the objects location
      //Checks if face is visible in direction the player is
      if(this.visible(points) == null){
        return null
      }//Checks if all points are behind the player
      let temp = points.map(point => this.get2D(point));//Map all 3D points to 2D
      if(!temp.some(point => (point.z != null))){
        return null;
      }
      
      if(!points.map(point => this.get2D(point)).some(point => (Math.abs(point.x) <= width/2 && Math.abs(point.y) <= height/2) || point.z != null)){
        return null;
      }

      let projected = [];
      for(let i=0;i<points.length;i++){
        let point = this.get2D(points[i]);
        if(Math.abs(point.x) <= width/2 && Math.abs(point.y) <= height/2 && point.z != null){//If point is on screen
     
          projected.push(point);
        }else{//If point not on screen
  
          //Split point into 2 points on the screen
          let left = this.firstVisiblePoint(points[i],points[(i-1+points.length) % points.length])//Get left 3D point
          let right = this.firstVisiblePoint(points[i],points[(i+1) % points.length])//Get right 3D point
          //Add left connection
          if(left!=null){

            left.z = projected.length;
            projected.push(left);//Push left 2D point
          }
          //Add right connection
          if(right!=null){

            right.z = projected.length;
            projected.push(right);//Push right 2D point   
          }
        }
      }

      if(projected.length==0){
        return projected;
      }

      //Forms the 2D polygon
      let points3D = points.map(x => x.copy());
      let newPoints = [];
      for(let i=0;i<points3D.length;i++){
        let point = points3D[i].copy();   
        if(this.get2D(point).z == null){//If point is behind player
          let leftP = points3D[(i-1+points.length) % points.length];
          if(this.get2D(leftP).z != null){
            let newP = this.behindPlayerEstimation(point,leftP);
            newPoints.push(this.get2D(newP));
          }

          let rightP = points3D[(i+1) % points.length];
          if(this.get2D(rightP).z != null){
            let newP = this.behindPlayerEstimation(point,rightP);
            newPoints.push(this.get2D(newP));
          }
        }else{
          newPoints.push(this.get2D(points3D[i]));
        }
      }
      
      let corners = [createVector(width/2,height/2),createVector(width/2,-height/2),createVector(-width/2,-height/2),createVector(-width/2,height/2)];
      for(let i=0;i<4;i++){
        if(this.checkCorner(corners[i],newPoints)==false){
          corners[i] = null;
        }
      }
      corners = corners.filter(x => x != null);

      let start = 0;
      if(projected[0].z!=null){
        for(let i=projected.length-1;i>0;i--){
          if(projected[i].z==null){
            start = i;
            i=-2;
          }
        }
      }
      
      let correctCorners = [];
      let counter = 0;
      for(let i=start+1;i!=start;i=(i+1)%projected.length){
        if(projected[i].z!=null){
          counter++;
        }else if(counter>0){//If passed more than 0 estimated points
          console.log("test")
          for(let k=0;k<counter/2;k++){//For all estimated pairs
            let one = projected[i-k-1].copy();//First of pair
            let two = projected[i-k-2].copy();//Second of pair
            console.log("test")
            while(!(Math.round(one.x)==Math.round(two.x) || Math.round(one.y)==Math.round(two.y))){//If the pair are not on the same line segment
              console.log("test")
              let sameSegment = [];//Corners on the same segment as one (index list)
              for(let g=0;g<corners.length;g++){//Every corner
                let corner = corners[g];//Current corner
                if(one.x == corner.x){//If x's match
                  sameSegment.push(g);//Push the index of corner
                }
                if(one.y == corner.y){//If y's match
                  sameSegment.push(g);//Push the index of corner
                }
              }

              let closest = infinity;//Closest distance
              let closestI = 0;//Index of closest distant corner
              for(let g=0;g<sameSegment.length;g++){//Every corner (max 2)
                let corner = corners[sameSegment[g]];//Current corner
                dist = Math.sqrt(Math.pow(one.x-corner.x,2)+Math.pow(one.y-corner.y,2));//Distance from point to corner
                if(dist<closest){//If current corner is closer
                  closest = dist;//Set closest corner to current corner
                  closestI = sameSegment[g];//Set closest corner index
                }
              }  
              let newCorner = corners[closestI];//New corner being added
              newCorner.z = closestI;//Z set to index for when it is added
              correctCorners.push(newCorner);//Add corner to new corners array
              corners.splice(closestI,1);//Remove the corner used
              one = newCorner;
            } 
          }
          counter = 0;
        }
      }

      if(corners.length!=0){
        console.log("Corner bug :<")
      }

      return projected;
    }

    checkCorner(corner,points){
      let counter = 0;
      for(let i=0;i<points.length;i++){
        if(this.lineIntersect(corner,createVector(1,0),points[i],points[(i+1) % points.length])){
          counter++;
        }
      }
      return counter % 2 == 1;
    }
    lineIntersect(point,dir,p1,p2){
      const x1 = p1.x;
      const y1 = p1.y;
      const x2 = p2.x;
      const y2 = p2.y;

      const x3 = point.x;
      const y3 = point.y;
      const x4 = point.x + dir.x;
      const y4 = point.y + dir.y;

      let den = (x1 - x2)*(y3 - y4) - (y1 - y2)*(x3 - x4);
      if(den == 0){
        return false;
      }

      const t = ((x1 - x3)*(y3 - y4) - (y1 - y3)*(x3 - x4))/den;
      const u = -((x1 - x2)*(y1 - y3) - (y1 - y2)*(x1 - x3))/den;
      if(t > 0 && t < 1 && u > 0){
        return true;
      }
      return false;
    }
  
    firstVisiblePoint(currentPoint,cPoint){
      //Checks when the point to its connecting point intersects a screen edge to estimate its point
      let connectingPoint = this.get2D(cPoint);
      //If the connecting point is within the screen and infront of the camerae
      if(!(Math.abs(connectingPoint.x) <= width/2 && Math.abs(connectingPoint.y) <= height/2 && connectingPoint.z != null)){
        return null;
      }

      //Get 2 points of a 2D lines
      let a = this.get2D(this.behindPlayerEstimation(currentPoint,cPoint));
      let l = this.get2D(cPoint);
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
      
      console.log("BUG");//If something went wrong
      return null;
    }

    behindPlayerEstimation(currentPoint,connectingPoint){
      const accuracy = 100;//Accuaracy of estimate points behind the camera
  
      let dir = p5.Vector.sub(connectingPoint,currentPoint);//Direction vector
      let point = currentPoint.copy();//Copy of the point
  
      while(this.get2D(point).z == null){//While it can't be projected
        point.add(p5.Vector.mult(dir,1/accuracy));//Add a little in 3D
      }
      return point;
    }
  
    diffSign(a,b){//Checks if the signs are difference
      return a/Math.abs(a)!=b/Math.abs(b);
    } 
  
    visible(points){
      //Checks if face is visible
      let centre = createVector();
      for(let i=0;i<points.length;i++){
        centre.add(p5.Vector.div(points[i],points.length))//Gets the centre of the face by adding fractions of each point
      }
   
      let a = this.n//Face normal
      let b = p5.Vector.sub(centre,p.pos);//Vector from face to camera
      return(Math.acos(p5.Vector.dot(a,b)/(a.mag()*b.mag()))<=PI/2 ? null : points);//Return face if face towards the camera
    }
    get2D(point){
    let dir = p5.Vector.sub(point,p.pos);//Direction of line vector
    //Forming r = a + λb using line and plane equation(r.n = -d)
    
    let λ = ((-per.d - p5.Vector.dot(p.pos,per.n)) / (p5.Vector.dot(dir,per.n)));//finding λ    
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
    //Distance not magnitude + d will have a difference sign depending on the side
  }