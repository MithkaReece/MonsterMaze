'use strict';
class shape{
  constructor(pos,rotation,colour){
    this.pos3D = pos;
    this.rotation = rotation;
    this.colour = colour;
  }
  getPos(){
    return this.pos3D;
  }
  setPos(value){
    this.pos3D = value;
  }
}

class cuboid extends shape{
    constructor(pos,l,h,w,rotation,colour){
      super(pos,rotation,colour)
      this.faces = this.generateFaces(l/2,h/2,w/2,this.rotation);
    }
    generateFaces(l,h,w,r){
      let faces = [];
      faces.push(this.generateFace([createVector(0,-h,0),createVector(0,-h,2*w),createVector(0,h,2*w),createVector(0,h,0)],r));//Ends of wall
      faces.push(this.generateFace([createVector(2*l,-h,0),createVector(2*l,h,0),createVector(2*l,h,2*w),createVector(2*l,-h,2*w)],r));
  
      faces.push(this.generateFace([createVector(0,-h,0),createVector(2*l,-h,0),createVector(2*l,-h,2*w),createVector(0,-h,2*w)],r));//Bottom of wall
      faces.push(this.generateFace([createVector(0,h,0),createVector(0,h,2*w),createVector(2*l,h,2*w),createVector(2*l,h,0)],r));//Top of wall
  
      faces.push(this.generateFace([createVector(2*l,-h,2*w),createVector(2*l,h,2*w),createVector(0,h,2*w),createVector(0,-h,2*w)],r));
      faces.push(this.generateFace([createVector(2*l,-h,0),createVector(0,-h,0),createVector(0,h,0),createVector(2*l,h,0)] ,r));//Sides of wall
    
      return faces;
    }
    generateFace(points,r){
      return new face(points.map(a => Matrix.rotateY(a,radians(-r))));
    }

    show3D(player,perspective){
      stroke(this.colour)
      fill(this.colour);
      for(let i=0;i<this.faces.length;i++){
        this.faces[i].show(this.pos3D,player,perspective);
      }
    }
  }

  class wall extends cuboid{
    constructor(x,y,length,rotation,colour = [0,0,100]){
      const thicknessOfWall = 0.1//Defines the thickness of a wall
      let newLength = length;//Sets new length to given length
      if(rotation !=0){//If vertical wall
        newLength += thicknessOfWall;//Add thicknessOfWall to the given length to make a new length
      }
      let pos = createVector(x,-2,y);//Define the position of the wall in 3D
      super(pos,newLength,wallHeight,thicknessOfWall,rotation,colour);
  
      //For displaying 2D version
      this.pos2D = createVector(x,y);
      this.width = newLength;
      this.height = thicknessOfWall;
    }
    setDist(value){
      this.dist = value;
    }
    getValue(){
      return this.dist;
    }
  
    getLength(){//Returns always the longer side
      return this.width;
    }
    getRotation(){
      return this.rotation;
    }
    getX(){
      return this.pos2D.x;
    }
    getY(){
      return this.pos2D.y;
    }
    getWidth(){//Returns the width relative to the x axis
      if(this.rotation != 0){//If vertical wall
        return this.height;
      }//If horizontal wall
      return this.width;
    }
    getHeight(){//Returns the height relative to the y axis
      if(this.rotation != 0){//If vertical wall
        return this.width;
      }else//If horizontal wall
      return this.height;
    }
  
    show2D(){//Will be removed
      strokeWeight(0)
      stroke(this.colour);
      fill(this.colour);
      rectMode(CORNER);
      push();
      let sc = width/mazeSize;
      translate(sc*this.pos2D.x,sc*this.pos2D.y)
      rotate(radians(this.rotation));
      rect(0,0,sc*this.width,sc*this.height);
      pop();
    }
  }

  
  