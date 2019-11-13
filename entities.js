'use strict';

class entity{
    constructor(pos){
      this.pos = pos;//Position of entity
    }  
    getPos(){//Get property for the position of the entity
      return this.pos;
    }
  }
  
  class character extends entity{
    constructor(pos){
      super(pos);//Call inherited constructor function with pos parameter
      this.rotation = createVector(radians(0),radians(0));//Orientation of entity
      this.score = 0;//Default score of a new player
      this.fov = 120;//Defines the fov of the player
      this.size = 0.3;//Defines how wide the player is
      this.hitBox = new Rectangle(this.pos.x-this.size/2,this.pos.z-this.size/2,this.size,this.size);//Defining the region of the hitbox
      this.rays = [];//Defines an empty list of rays
      for(let a=90-(this.fov/2);a<=(this.fov/2)+90;a+=0.4){//For the region of the fov in intervals of 0.8 degrees
        this.rays.push(new ray(radians(a)));//Add a new ray to the list of rays with current angle
      }
    }
    getScore(){
      return this.score;
    }
    setScore(value){
      this.score = value;
    }

    getRX(){//Get property for the x component of its rotation
      return this.rotation.x;
    }
    addRX(value){
      this.rotation.x+=value;
      for(let ray of this.rays){
        ray.setAngle(ray.getAngle()-value)
      }
    }

    getRY(){//Get property for the y component of its rotation
      return this.rotation.y;
    }
    setRY(value){
      this.rotation.y = value;
    }

    getHitBox(){//Get property for hitbox
      return this.hitBox;
    }

    rayCast(walls,monster){
      let newObjects = [];//Defines an empty list of objects
      for(let ray of this.rays){//For every ray in the stored rays
        let distRecord = Infinity;//Set smallest distance to always greater than any wall
        let closestWall = null;//Initiates the current closest wall of the loop
        let closestPoint = null;//Will remove
        for(let wall of walls){//For every wall in the given list of walls
          let aEnd;//Defines aEnd representing one end of the wall
          let bEnd;//Defines bEnd representing the other end of the wall
          if(wall.getRotation()!=0){//If current wall is a vertical wall
            aEnd = createVector(wall.getX()+0.05,wall.getY());//Point of the front end of wall
            bEnd = createVector(wall.getX()+0.05,wall.getY()+wall.getLength());//Point of the back end of wall
          }else{//If current wall is a horizontal wall
            aEnd = createVector(wall.getX(),wall.getY()+0.05);//Point of the front end of wall
            bEnd = createVector(wall.getX()+wall.getLength(),wall.getY()+0.05);//Point of the back end of wall
          }
    
          let point = ray.cast(createVector(this.pos.x,this.pos.z),aEnd,bEnd);//Cast current ray through a line between both ends of the wall
          if(point!=null){//If a point of intersection was found
            let dist = p5.Vector.dist(createVector(this.pos.x,this.pos.z),point);//Calculate distance from entity
            if(dist<distRecord){//If wall is closer than previous closest wall       
              distRecord = dist;//Update smallest distance
              closestPoint = point.copy();//Will remove
              closestWall = wall;//Update the closest wall the ray hits       
            }
          }
        }
        if(newObjects.includes(closestWall)==false && closestWall!=null){//If a closest wall has been found and not already been hit by a ray
          push();//Will remove
          translate(-width/2,-height/2)//Will remove
          //closestWall.show2D();
          stroke(0,255,0);
          strokeWeight(1)
          //line(hscale*this.pos.x,vscale*this.pos.z,hscale*closestPoint.x,vscale*closestPoint.y);
          pop();
          closestWall.setDist(distRecord);//Record the distance the wall current being added using its setDist property
          newObjects.push(closestWall);//Add currently found wall to be in view to list of newObjects which will be returned
        }
      }
      monster.setDist(p5.Vector.dist(monster.getPos(),this.pos));//Give the monster the distance from itself to the player using its setDist property
      newObjects.push(monster);//<----------- Ray cast the monster before adding it
      newObjects = mergeSort(newObjects,"desc");//Sort the objects in descending order of distances so that the further away objects are drawn first
      return newObjects;//Return all objects that need rendering
    }

    displayRays(){//Will remove
      for(let ray of this.rays){
        ray.show(createVector(this.pos.x*hscale,this.pos.z*vscale));
      }
    }

    //This checks that if the player added on the direction vector called dir whether it would be inside a wall
    //This is done by simply checked using X,Y, width, height of the hitbox of the player and the wall
    collide(wall,dir){
      let result = this.hitBox.getX() + this.hitBox.getWidth() + dir.x > wall.getX() &&
       this.hitBox.getX() + dir.x < wall.getX() + wall.getWidth() &&
        this.hitBox.getY() + this.hitBox.getHeight() + dir.y > wall.getY() &&
         this.hitBox.getY() + dir.y < wall.getY() + wall.getHeight();
      return result;
    }

    controls(normalVector,retrievedWalls){
      const speed = 0.035;//Defines the speed at which the player walks
      let dirVector = createVector(0,0,0);

      if(keyIsDown(87)){//If "w" is being pressed
        dirVector.add(normalVector);
      }
      if(keyIsDown(65)){//If "a" is being pressed
        dirVector.add(Matrix.rotateY(normalVector,radians(270)));
      }
      if(keyIsDown(83)){//If "s" is being pressed
        dirVector.add(Matrix.rotateY(normalVector,radians(180)));
      }
      if(keyIsDown(68)){//If "d" is being pressed
        dirVector.add(Matrix.rotateY(normalVector,radians(90)));
      }
      let sensitivity = radians(1);
      if(keyIsDown(38)){//If up arrow is being pressed
        this.setRY(constrain(this.getRY() + 1.8*sensitivity,radians(-85),radians(80)))
      }
      if(keyIsDown(39)){//If right arrow is being pressed
        this.addRX(2.5*sensitivity)
      }
      if(keyIsDown(40)){//If down arrow is being pressed
        this.setRY(constrain(this.getRY() - 1.8*sensitivity,radians(-85),radians(80)));
      }
      if(keyIsDown(37)){//If left arrow is being pressed
        this.addRX(-2.5*sensitivity)
      }
      dirVector.y = 0;//Remove any change in the y component so the player has gravity
      dirVector.setMag(speed);//Sets the magnitude of the direction vector being added to the magnitude of the speed
      let walls = retrievedWalls;
      for(let i=0;i<walls.length;i++){
        if(this.collide(walls[i],createVector(dirVector.x,dirVector.z))){//Check if player collides with current walls
          if(this.collide(walls[i],createVector(dirVector.x,0))){
            dirVector.x = 0;
          }
          if(this.collide(walls[i],createVector(0,dirVector.z))){
            dirVector.z = 0;
          }
        }      
      }
      this.pos.add(dirVector);//Add the final direction vector to the position of the player to move the player
      this.hitBox = new Rectangle(this.pos.x-this.size/2,this.pos.z-this.size/2,this.size,this.size);//Redefined the hitbox based on the new position
    }

    won(size){
      let x = this.pos.x;
      let z = this.pos.z;
      return x<0 || x>size || z<0 || z>size;
    }
  }

  class ray{
    constructor(angle){
      this.angle = angle;
    }

    getAngle(){
      return this.angle;
    }
    setAngle(value){ 
      this.angle = value;
    }

    cast(pos,aEnd,bEnd){
      let dir = p5.Vector.fromAngle(this.angle);
      const [x1,y1,x2,y2] = [aEnd.x,aEnd.y,bEnd.x,bEnd.y];
      const [x3,y3,x4,y4] = [pos.x,pos.y,pos.x+dir.x,pos.y+dir.y];

      const den = (x1 - x2)*(y3 - y4) - (y1 - y2)*(x3 - x4);
      if(den == 0){
        return null;
      }
      const t = ((x1 - x3)*(y3 - y4) - (y1 - y3)*(x3 - x4))/den;
      const u = -((x1 - x2)*(y1 - y3) - (y1 - y2)*(x1 - x3))/den;
      if(t>0 && t<1 && u>0){//If intersection between the wall segment and ray half line
        return createVector(x1 + t * (x2-x1),y1 + t * (y2-y1));
      }else{
        return null; 
      }
    }
  }