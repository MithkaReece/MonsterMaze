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
    constructor(h){
      super(createVector(0,-h,0));
      this.height = h;//Height of player
    }
    addRX(value){
      this.rotation.x+=value;
    }
    addRY(value){
      this.rotation.y+=value;
      this.rotation.y = constrain(this.rotation.y,radians(-90),radians(90));//Constraint to looking from down to up
    }
    addPos(value){
      this.pos.add(value);
    }
   
  }