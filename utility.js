'use strict';
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
  function matrixToArray(matrix){
    if(matrix.getData()[0].length == 0){
      return null;
    }
    let data = [];
    for(let i=0;i<matrix.getData().length;i++){
      data.push(matrix.getData()[i][0]);
    }
    return data
  }
  function make2Darray(cols,rows){
    //Creates 1D array full of nulls then replaces the nulls with arrays making a 2D array
    return new Array(cols).fill().map(item =>(new Array(rows))) 
  }

  let array;

function setup() {
  array = [createVector(99,1),createVector(20,20),createVector(0,0)];
  createCanvas(400, 400);
  let narray = mergeSort(array);
  for(let i=0;i<narray.length;i++){
    console.log(narray[i].mag()); 
  }
}


function mergeSort(a){
  if(a.length == 1){ //If the array only contains one item
    return a; //Return this item
  }
  let first = mergeSort(a.slice(0,a.length/2)); //Sort first half of list
  let second = mergeSort(a.slice(a.length/2,a.length)); //Sort second half of list
  return merge(first,second); //Return the two lists merged together
}

function merge(F,S){
  //Account for when one of the list is completely emptied
  F.push([null,Infinity]);
  S.push([null,Infinity]);
  let n = []; //Sorted array
  let i = 0; //First list index
  let k = 0; //Second list index
  for(let l=0;l<F.length+S.length-2;l++){
    if(F[i][1]<=S[k][1]){ //If current item in first list is greater
      n.push(F[i]); //Adds current item from first list to final list
      i++; //Increment first list index
    }else{ //If current item in second list is greater
      n.push(S[k]); //Add current item from second list to final list
      k++; //Increment second list index
    }   
  }
  return n; //Return sorted array
}

  class ray{
    constructor(angle){
      this.angle = angle;
    }

    cast(pos,wallA,wallB){
      let dir = p5.Vector.fromAngle(this.angle);

      const x1 = wallA.x;
      const y1 = wallA.y;
      const x2 = wallB.x;
      const y2 = wallB.y;

      const x3 = pos.x;
      const y3 = pos.y;
      const x4 = pos.x + dir.x;
      const y4 = pos.y + dir.y;

      const den = (x1 - x2)*(y3 - y4) - (y1 - y2)*(x3 - x4);
      if(den == 0){
        return null;
      }
      const t = ((x1 - x3)*(y3 - y4) - (y1 - y3)*(x3 - x4))/den;
      const u = -((x1 - x2)*(y1 - y3) - (y1 - y2)*(x1 - x3))/den;
      if(t>0 && t<1 && u>0){//If intersection
        const pt = createVector();
        pt.x = x1 + t * (x2-x1);
        pt.y = y1 + t * (y2-y1);
        return pt;
      }else{
        return null; 
      }
    }

    addAngle(angle){
      this.angle+=angle;
    }

    show(point){
      push();
      translate(point.x,point.y)
      strokeWeight(1)
      stroke(0,150,255)
      let dir = p5.Vector.fromAngle(this.angle);
      dir.setMag(0.5)
      line(0,0,hscale*dir.x,vscale*dir.y);
      pop();
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