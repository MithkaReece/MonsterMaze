class entity{
    constructor(pos){
      this.pos = pos;//Position of entity
      this.rotation = createVector(radians(45),radians(0));//Orientation of entity
    }
    getRX(){
      return this.rotation.x;
    }
    getRY(){
      return this.rotation.y;
    }
    getPos(){
      return this.pos;
    }
  
  }
  
  class character extends entity{
    constructor(){
      super(createVector(0.1,-2,0.1));
      this.points = [];//Four points of the hit box
      this.size = 0.2;
      this.hitBox = new Rectangle(this.pos.x-this.size/2,this.pos.z-this.size/2,this.size,this.size);//For collision detection
    }
    getHitBox(){
      return this.hitBox;
    }

    collide(wall){
      let x = wall.getX();
      let y = wall.getY();
      let length = wall.getLength();
      let width = wall.getWidth();
      let points = [];//Points intersecting
      for(let i=0;i<this.points.length;i++){//Loop through every point
        let result = this.withinBounds(x,y,length,width,this.points[i])//Check if point is within wall
        if(result != null){//If result outputs a point because it has intersected
          //console.log("yes")
          points.push(result);//Push point to points list
        }
      }
      if(points.length == 0){//If no points have been pushed then no interesection
        return null;
      }
      if(points.length == 2){//If two points are intersecting
        let average = createVector(0.5*(points[0].x+points[1].x),0.5*(points[0].y,points[1].y));
        return p5.Vector.sub(average,this.pos);//Direction vector
      }
      console.log("Collision bug")
      return;
    }
    withinBounds(x,y,length,width,pos){
      if(pos.x > x &&
      pos.x < x + length &&
      pos.y > y &&
      pos .y < y + width){
        return pos;//If point intersects return it
      }
      return null;//If no intersection return null
    }
    controls(normalVector,retrievedWalls){
      let speed = 0.01;
      let dir = normalVector;
      dir.y = 0;
      dir.setMag(speed);


      let walls = retrievedWalls;
      //Change this Do some paper theory on it 
      for(let i=0;i<walls.length;i++){
        let result = this.collide(walls[i]);//Check if player collides with current walls
        //console.log(result)
        if(result != null){
          if(result.x != 0){
            if((dir.x > 0 && result.x > 0) || (dir.x < 0 && result.x < 0 )){
              dir.x = 0;
              console.log("Collision")
              //console.log("x")
            }
          }
          if(result.y != 0){
            if((dir.z > 0 && result.y > 0) || (dir.z < 0 && result.y < 0 )){
              dir.z = 0;
              console.log("Collision")
              //console.log("y")
            }
          }
          
        }
      }
      //console.log(Math.floor(this.pos.x),Math.floor(this.pos.z));
      console.log(
      dir.x)

      //console.log(Math.floor(this.pos.x),Math.floor(this.pos.z))
        
        if(keyIsDown(87)){//w
          this.pos.add(dir);
        }
        if(keyIsDown(65)){//a
          this.pos.add(Matrix.rotateY(dir,radians(270)));
        }
        if(keyIsDown(83)){//s
          this.pos.add(Matrix.rotateY(dir,radians(180)));
        }
        if(keyIsDown(68)){//d
          this.pos.add(Matrix.rotateY(dir,radians(90)));
        }

        this.updateHitbox(this.pos,this.size);
        
      }


      updateHitbox(pos,size){
        this.points = [createVector(pos.x-size/2,pos.z-size/2),
          createVector(pos.x+size/2,pos.z-size/2),
          createVector(pos.x+size/2,pos.z+size/2),
          createVector(pos.x-size/2,pos.z+size/2)];//Four points of the hit box
          this.hitbox = new Rectangle(pos.x-size/2,pos.z-size/2,size,size);//For collision detection
      }
    addRX(value){
      this.rotation.x+=value;
    }
    addRY(value){
      this.rotation.y+=value;
      this.rotation.y = constrain(this.rotation.y,radians(-90),radians(90));//Constraint to looking from down to up
    }
   
  }