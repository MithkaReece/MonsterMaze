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
      super(createVector(0.5,-2,0.5));
      this.size = 0.3;
      this.hitBox = new Rectangle(this.pos.x-this.size/2,this.pos.z-this.size/2,this.size,this.size);//For collision detection
      this.rays = [];
      for(let a=-0;a<360;a+=1){
        this.rays.push(new ray(radians(a)));
      }
    }

    rayCast(walls){
      let newWalls = [];
      for(let ray of this.rays){//For every ray
        let smallestDistance = Infinity;//Set smallest distance to always greater than any wall
        let firstWall = null;
        for(let i=0;i<walls.length;i++){//For every wall
          let wall = walls[i];//Current wall
          //console.log(wall.getHeight());
          let a;
          let b;
          if(wall.getRotation()!=0){//If vertical wall
            a = createVector(wall.getX()+0.05,wall.getY());//Front end of wall
            b = createVector(wall.getX()+0.05,wall.getY()+wall.getLength());//Back end of wall
          }else{
            a = createVector(wall.getX(),wall.getY()+0.05);//Front end of wall
            b = createVector(wall.getX()+wall.getLength(),wall.getY()+0.05);//Back end of wall
          }

          
          let result = ray.cast(createVector(this.pos.x,this.pos.z),a,b);//Cast current ray through line of wall
          if(result!=null){//If a point of intersection was found
            let distance = p5.Vector.dist(this.pos,result);//Calculate distance from entity
            if(distance<smallestDistance){//If wall is closer than previous closest wall
              smallestDistance = distance;//Update smallest distnace
              firstWall = wall;//Update the first wall the ray hits
            }
          }
        }
        if(newWalls.includes(firstWall)==false && firstWall!=null){//If wall is no duplicate and exists
          newWalls.push(firstWall);//Add wall hit from ray into new walls
        }
      }
      return newWalls;//Return all ways that need rendering
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
      let speed = 0.05;
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

    addRX(value){
      this.rotation.x+=value;
      for(ray of this.rays){
        //ray.addAngle(value);
      }
    }
    addRY(value){
      this.rotation.y+=value;
      this.rotation.y = constrain(this.rotation.y,radians(-90),radians(90));//Constraint to looking from down to up
    }
   
  }