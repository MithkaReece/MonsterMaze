class entity{
    constructor(pos){
      this.pos = pos;
      this.rotation = createVector(radians(45),radians(0));//Orientation of player
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
      super(createVector(0,-2,0));
    }

    controls(normal){
        let speed = 0.1;
        let dir = normal;
        dir.y = 0;
        dir.setMag(speed);
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
      }

    addRX(value){
      this.rotation.x+=value;
    }
    addRY(value){
      this.rotation.y+=value;
      this.rotation.y = constrain(this.rotation.y,radians(-90),radians(90));//Constraint to looking from down to up
    }
   
  }