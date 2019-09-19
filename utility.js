function VtoArray(vector){
    let arr;
    if(vector.z != undefined){
      arr = make2Darray(3,1);
    }else{
      arr = make2Darray(2,1); 
    }
    arr[0][0] = vector.x;
    arr[1][0] = vector.y;
    if(vector.z != undefined){
      arr[2][0] = vector.z; 
    }
    return arr;
  }
  function toVector(matrix){
    let vector = createVector();
    vector.x = matrix[0];
    vector.y = matrix[1];
    if(matrix.length > 2){
      vector.z = matrix[2]; 
    }
    return vector;
  }
  function make2Darray(cols,rows){
    //Creates 1D array full of nulls then replaces the nulls with arrays making a 2D array
    return new Array(cols).fill().map(item =>(new Array(rows))) 
  }

  class ray{
    constructor(pos,angle){
      this.pos = pos;
      this.dir = p5.Vector.fromAngle(angle);
    }

    cast(pos,pointB1,pointB2){
      let result = this.doLinesIntersect(pos,p5.Vector.add(pos,this.dir),pointB1,pointB2);//Do intersection
      //console.log(pointB1.x + result[0]*(pointB2.x-pointB1.x), pointB1.y + result[0]*(pointB2.y-pointB1.y))
      if(result[0] > 0 && result[0] < 1 && result[1] > 0){//If ray intersects wall
        return createVector(pointB1.x + result[0]*(pointB2.x-pointB1.x), pointB1.y + result[0]*(pointB2.y-pointB1.y));//Returns point of intersection
      }
      return null;//If no intersection return null
    }

    doLinesIntersect(pointA1,pointA2,pointB1,pointB2){
      const x1 = pointB1.x;
      const y1 = pointB1.y;
      const x2 = pointB2.x;
      const y2 = pointB2.y;

      const x3 = pointA1.x;
      const y3 = pointA1.y;
      const x4 = pointA2.x;
      const y4 = pointA2.y;

      let den = (x1 - x2)*(y3 - y4) - (y1 - y2)*(x3 - x4);
      if(den == 0){
        return [0,0];
      }
      const t = ((x1 - x3)*(y3 - y4) - (y1 - y3)*(x3 - x4))/den;
      const u = -((x1 - x2)*(y1 - y3) - (y1 - y2)*(x1 - x3))/den;
      return [t,u];
    }
  }

  class Particle{
    constructor(){
      this.pos = createVector(width/2,height/2);
      this.rays = [];
      for(let a=0;a<360;a+=10){
        this.rays.push(new ray(pos.copy(),radians(a)));
      }
    }

  }