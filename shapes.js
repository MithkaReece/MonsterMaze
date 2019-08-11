class wall3D{
    constructor(pos,l,h,w,r){
      this.pos = pos;
      this.faces = this.generateFaces(l/2,h/2,w/2,r);
    }
    //Setup
    generateFaces(l,h,w,r){
      let faces = [];
      faces.push(this.generateFace([createVector(0,-h,-w),createVector(0,-h,w),createVector(0,h,w),createVector(0,h,-w)],r));//Ends of wall
      faces.push(this.generateFace([createVector(2*l,-h,-w),createVector(2*l,h,-w),createVector(2*l,h,w),createVector(2*l,-h,w)],r));
  
      faces.push(this.generateFace([createVector(0,-h,-w),createVector(2*l,-h,-w),createVector(2*l,-h,w),createVector(0,-h,w)],r));//Bottom of wall
      faces.push(this.generateFace([createVector(0,h,-w),createVector(0,h,w),createVector(2*l,h,w),createVector(2*l,h,-w)],r));//Top of wall
  
      faces.push(this.generateFace([createVector(2*l,-h,w),createVector(2*l,h,w),createVector(0,h,w),createVector(0,-h,w)],r));
      faces.push(this.generateFace([createVector(2*l,-h,-w),createVector(0,-h,-w),createVector(0,h,-w),createVector(2*l,h,-w)] ,r));//Sides of wall
    
      return faces;
    }
    generateFace(points,r){
      return new face(points.map(a => Matrix.rotateY(a,radians(-r))));
    }
  
  
    show(){
      for(let i=0;i<this.faces.length;i++){
        this.faces[i].show(this.pos);
      }
    }
  }
  
  
  class cuboid{
    constructor(pos,l,h,w,r){
      this.rotation = createVector(0,radians(r),0);
      this.pos = pos; 
      this.points = this.generatePoints(l/2,h/2,w/2);
      this.faces = this.generateFaces(this.points);
    }   
    generatePoints(l,h,w){
      let points = [];
      points.push(createVector(-l,h,-w));
      points.push(createVector(l,h,-w));
      points.push(createVector(l,h,w));
      points.push(createVector(-l,h,w));    
      points.push(createVector(-l,-h,-w));
      points.push(createVector(l,-h,-w));
      points.push(createVector(l,-h,w));
      points.push(createVector(-l,-h,w));
      points = points.map(a => Matrix.rotateX(a,this.rotation.x));//Rotates the point round the x axis
      points = points.map(a => Matrix.rotateY(a,this.rotation.y));//Rotates the point round the y axis
      points = points.map(a => Matrix.rotateZ(a,this.rotation.z));//Rotates the point round the z axis
      return points;
    }    
    generateFaces(points){
      let faces = [];
      faces.push(this.createFace(points,[3,2,1,0]));
      faces.push(this.createFace(points,[4,5,6,7]));
      for(let i=0;i<4;i++){
        faces.push(this.createFace(points,[i,(i+1)%4,4+(i+1)%4,i+4])); 
      }
      return faces;
    }
    createFace(points,k){
      let array = [];
      for(let i=0;i<4;i++){
        array.push(points[k[i]]);
      }
      return new face(array);
    }
    show(){
      for(let i=0;i<this.faces.length;i++){
        this.faces[i].show(this.pos);
      }
    }
        
    
  }//Probably outdated
  