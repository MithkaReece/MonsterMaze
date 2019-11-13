'use strict';
function VtoArray(vector){
  let array;
  if(vector.z != undefined){
    array = make2Darray(3,1);
  }else{
    array = make2Darray(2,1); 
  }
  array[0][0] = vector.x;
  array[1][0] = vector.y;
  if(vector.z != undefined){
    array[2][0] = vector.z; 
  }
  return array;
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
const clone = (items) => items.map(item => Array.isArray(item) ? clone(item) : item);

function mergeSort(a,type){
  if(a.length == 1){ //If the array only contains one item
    return a; //Return this item
  }
  let firstList = mergeSort(a.slice(0,a.length/2),type); //Sort first half of list
  let secondList = mergeSort(a.slice(a.length/2,a.length),type); //Sort second half of list
  return merge(firstList,secondList,type); //Return the two lists merged together
}

function merge(firstList,secondList,type){
  //Account for when one of the list is completely emptied
  if(type == "desc"){//If in descending order
    firstList.push(new score(-Infinity));//Add a lowest score for comparison but will not be in final result
    secondList.push(new score(-Infinity));//Add a lowest score for comparison but will not be in final result
  }else if(type == "asc"){//If in ascending order
    firstList.push(new score(Infinity));//Add a highest score for comparison but will not be in final result
    secondList.push(new score(Infinity));//Add a highest score for comparison but will not be in final result
  }
  let sorted = []; //Sorted array
  let i = 0; //First list index
  let k = 0; //Second list index
  for(let l=0;l<firstList.length+secondList.length-2;l++){
    if(firstList[i].getValue()>=secondList[k].getValue() && type == "desc"){ //Change this for a general get function
      sorted.push(firstList[i]); //Adds current item from first list to final list
      i++; //Increment first list index
    }
    else if(firstList[i].getValue()<=secondList[k].getValue() && type == "asc"){
      sorted.push(firstList[i]); //Adds current item from first list to final list
      i++; //Increment first list index
    }else{ //If current item in second list is greater
      sorted.push(secondList[k]); //Add current item from second list to final list
      k++; //Increment second list index
    }   
  }
  return sorted; //Return sorted array
}

class score{
  constructor(value){
    this.value = value;//Stored the value of the score when initialised
    this.name;
  }
  
  getName(){//Get property for name
    return this.name;
  }
  setName(value){//Set property for name
    this.name = value;
  }

  getValue(){//Get property for value (representing the value of the score of this object)
    return this.value;
  }
}


class Rectangle{
  constructor(x,y,width,height){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  getX(){
    return this.x;
  }
  getY(){
    return this.y;
  }
  getWidth(){
    return this.width;
  }
  getHeight(){
    return this.height;
  }
}
