'use strict';
//Shape is the base class for all 3D objects which can have a position, 3D rotation and a colour
//for the faces that it contains that can be projected onto the 2D plane of the screen
class shape{
  constructor(pos,rotation,colour){
    this.pos3D = pos;//Defines the 3D position of the shape
    this.rotation = rotation;//Defines the rotation vector of the shape
    this.colour = colour;//Defines the colour of the shape
  }
  getPos(){//Get property for the 3D position of the shape
    return this.pos3D;//Returns the 3D position of the shape
  }
  setPos(value){//Set property for the 3D position of the shape
    this.pos3D = value;//Set the 3D position of the shape to a given value
  }
}
//Cuboid is a class which inherits the shape class so that it can be a 3D objects but is also defined
//with a length, width and height which are used to defined the six faces of the cuboid which is saved
//within the cuboid. The cuboid is shown by calling show on all the stored faces
class cuboid extends shape{
    constructor(pos,l,h,w,rotation,colour){
      super(pos,rotation,colour)//Calls it's base class constructor (shape's constructor)
      this.faces = this.generateFaces(l/2,h/2,w/2,this.rotation);//Defines the list of faces
    }
    generateFaces(l,h,w,r){//Sets up the six faces of the cuboid using local position
      let faces = [];
      faces.push(this.generateFace([createVector(0,-h,0),createVector(0,-h,2*w),createVector(0,h,2*w),createVector(0,h,0)],r));//Ends of wall
      faces.push(this.generateFace([createVector(2*l,-h,0),createVector(2*l,h,0),createVector(2*l,h,2*w),createVector(2*l,-h,2*w)],r));
  
      faces.push(this.generateFace([createVector(0,-h,0),createVector(2*l,-h,0),createVector(2*l,-h,2*w),createVector(0,-h,2*w)],r));//Bottom of wall
      faces.push(this.generateFace([createVector(0,h,0),createVector(0,h,2*w),createVector(2*l,h,2*w),createVector(2*l,h,0)],r));//Top of wall
  
      faces.push(this.generateFace([createVector(2*l,-h,2*w),createVector(2*l,h,2*w),createVector(0,h,2*w),createVector(0,-h,2*w)],r));
      faces.push(this.generateFace([createVector(2*l,-h,0),createVector(0,-h,0),createVector(0,h,0),createVector(2*l,h,0)] ,r));//Sides of wall
    
      return faces;//Returns new list of all six faces
    }
    //Returns a new face based on the given points and rotation
    generateFace = (points,rotation) => new face(points.map(a => Matrix.rotateY(a,radians(-rotation))))

    show3D(player,perspective){
      stroke(0)
      fill(this.colour);
      for(let i=0;i<this.faces.length;i++){//For every face in faces
        this.faces[i].show(this.pos3D,player,perspective);//Show the current face
      }
    }
  }
//Wall is a class that inherits a cuboid however is define with 2D coordinates and dimensions which are
//then converted into 3D and given to the inherit base class's definition. Walls are also responsible
//for having extra properties than the cuboid so that it can be sorted in distance away from the player
//as well many get properties used when being inserted into a quad tree
class wall extends cuboid{
  constructor(x,y,length,rotation,colour = [0,0,153]){
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
  
  getValue(){//Get property for distance (called value to easily be sorted by merge sort)
    return this.dist;//Returns the distance of wall to player
  }
  setDist(value){//Set property for distance of wall to player
    this.dist = value;//Sets the distance to a given value
  }

  getLength(){//Get property for the length of the wall
    return this.width;//Returns the length of the wall (called width as from 2D dimensions)
  }
  getRotation(){//Get property for the rotation of the wall
    return this.rotation;//Returns the angle of rotation
  }
  getX(){//Get property for the 2D x position
    return this.pos2D.x;//Returns the 2D x position
  }
  getY(){//Get property for the 2D y position
    return this.pos2D.y;//Returns the 2D y position
  }
  getWidth(){//Returns the width relative to the x axis
    if(this.rotation != 0){//If vertical wall
      return this.height;//Return the 2D height
    }//If horizontal wall
    return this.width;//Return the 2D width
  }
  getHeight(){//Returns the height relative to the y axis
    if(this.rotation != 0){//If vertical wall
      return this.width;//Return the 2D width
    }else//If horizontal wall
    return this.height;//Return the 2D height
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


