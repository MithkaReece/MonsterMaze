class cuboid{
    constructor(pos,l,h,w,r){
      this.pos3D = pos;
      this.faces = this.generateFaces(l/2,h/2,w/2,r);
      //Should have colour array for faces I guess
    }
    //Setup
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
      for(let i=0;i<this.faces.length;i++){
        this.faces[i].show(this.pos3D,player,perspective);
      }
    }
  }
  
  