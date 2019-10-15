'use strict';

class entity{
    constructor(pos){
      this.pos = pos;//Position of entity
      this.rotation = createVector(radians(0),radians(0));//Orientation of entity
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
    constructor(pos){
      super(pos);
      this.score = 0;
      this.fov = 140/2;
      this.size = 0.3;
      this.hitBox = new Rectangle(this.pos.x-this.size/2,this.pos.z-this.size/2,this.size,this.size);//For collision detection
      this.rays = [];
      for(let a=90-this.fov;a<=this.fov+90;a+=0.8){
        this.rays.push(new ray(radians(a)));
      }
    }

    rayCast(walls,monster){
      let newObjects = [];
      for(let ray of this.rays){//For every ray
        let distRecord = Infinity;//Set smallest distance to always greater than any wall
        let closestWall = null;
        let closestPoint = null;
        for(let wall of walls){//For every wall
          let a;
          let b;
          if(wall.getRotation()!=0){//If vertical wall
            a = createVector(wall.getX()+0.05,wall.getY());//Front end of wall
            b = createVector(wall.getX()+0.05,wall.getY()+wall.getLength());//Back end of wall
          }else{
            a = createVector(wall.getX(),wall.getY()+0.05);//Front end of wall
            b = createVector(wall.getX()+wall.getLength(),wall.getY()+0.05);//Back end of wall
          }
    
          let point = ray.cast(createVector(this.pos.x,this.pos.z),a,b);//Cast current ray through line of wall
          if(point!=null){//If a point of intersection was found
            let dist = p5.Vector.dist(createVector(this.pos.x,this.pos.z),point);//Calculate distance from entity
            if(dist<distRecord){//If wall is closer than previous closest wall       
              distRecord = dist;//Update smallest distance
              closestPoint = point.copy();
              closestWall = wall;//Update the closest wall the ray hits       
            }
          }
        }
        if(newObjects.includes(closestWall)==false && closestWall!=null){//If wall is no duplicate and exists
          push();
          translate(-width/2,-height/2)
          //closestWall.show2D();
          stroke(0,255,0);
          strokeWeight(1)
          //line(hscale*this.pos.x,vscale*this.pos.z,hscale*closestPoint.x,vscale*closestPoint.y);
          pop();
          //console.log(distRecord,this.pos.x,this.pos.y,closestPoint.x,closestPoint.y);
          closestWall.setDist(distRecord);
          newObjects.push(closestWall);//Add wall hit from ray into new walls
        }
      }
      monster.setDist(p5.Vector.dist(monster.getPos(),this.pos));
      newObjects.push(monster);
      newObjects = mergeSort(newObjects,"asc");
      return newObjects;//Return all ways that need rendering
    }

    displayRays(){
      for(let ray of this.rays){
        ray.show(createVector(this.pos.x*hscale,this.pos.z*vscale));
      }
    }

    getHitBox(){
      return this.hitBox;
    }

    collide(wall,dir){
      let result = this.hitBox.getX() + this.hitBox.getWidth() + dir.x > wall.getX() && this.hitBox.getX() + dir.x < wall.getX() + wall.getWidth() && this.hitBox.getY() + this.hitBox.getHeight() + dir.y > wall.getY() && this.hitBox.getY() + dir.y < wall.getY() + wall.getHeight();
      return result;
    }
    withinBounds(x,y,length,width,pos){
      if(pos.x > x &&
      pos.x < x + length &&
      pos.y > y &&
      pos.y < y + width){
        return pos;//If point intersects return it
      }
      return null;//If no intersection return null
    }
    controls(normalVector,retrievedWalls){
      let speed = 0.035;
      let dir = createVector(0,0,0);

        if(keyIsDown(87)){//w
          dir.add(normalVector);
        }
        if(keyIsDown(65)){//a
          dir.add(Matrix.rotateY(normalVector,radians(270)));
        }
        if(keyIsDown(83)){//s
          dir.add(Matrix.rotateY(normalVector,radians(180)));
        }
        if(keyIsDown(68)){//d
          dir.add(Matrix.rotateY(normalVector,radians(90)));
        }
        let sens = radians(1);
        if(keyIsDown(38)){//up arrow
          this.addRY(1.8*sens)
        }
        if(keyIsDown(39)){//right arrow
          this.addRX(2.5*sens)
        }
        if(keyIsDown(40)){//down arrow
          this.addRY(-1.8*sens)
        }
        if(keyIsDown(37)){//left arrow
          this.addRX(-2.5*sens)
        }
        dir.y = 0;
        dir.setMag(speed);
      let walls = retrievedWalls;
      for(let i=0;i<walls.length;i++){
        let result = this.collide(walls[i],createVector(dir.x,dir.z));//Check if player collides with current walls
        if(result){//if result is true
          if(this.collide(walls[i],createVector(dir.x,0))){
            dir.x = 0;
          }
          if(this.collide(walls[i],createVector(0,dir.z))){
            dir.z = 0;
          }
        }      
      }
      this.pos.add(dir);
      this.hitBox = new Rectangle(this.pos.x-this.size/2,this.pos.z-this.size/2,this.size,this.size);//For collision detection
    }

    won(size){
      let x = this.pos.x;
      let z = this.pos.z;
      return x<0 || x>size || z<0 || z>size;
    }

    addRX(value){
      this.rotation.x+=value;
      for(let ray of this.rays){
        ray.addAngle(-value);
      }
    }
    addRY(value){
      this.rotation.y+=value;
      this.rotation.y = constrain(this.rotation.y,radians(-90),radians(90));//Constraint to looking from down to up
    }

    getScore(){
      return this.score;
    }
    setScore(value){
      this.score = value;
    }
  }