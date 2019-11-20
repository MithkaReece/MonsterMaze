'use strict';
function VtoArray(vector){//Returns an array of the components of a given vector
  let array;//Define new array
  if(vector.z != undefined){//If given vector is 3D
    array = make2Darray(3,1);//Make a 3 long array
  }else{//If given vector is 2D
    array = make2Darray(2,1);//Make a 2 long array
  }
  array[0][0] = vector.x;//Slot in the x component into the array
  array[1][0] = vector.y;//Slot in the y component into the array
  if(vector.z != undefined){//If there was a z component (if from 3D vector)
    array[2][0] = vector.z;//Slot in the z component into the array
  }
  return array;//Returns new array of components from given vector
}
function matrixToArray(matrix){//Returns an 2D array of the elements from a given matrix
  if(matrix.getData()[0].length == 0){//If the matrix is empty
    return null;//Return null as no array can be produced
  }
  return clone(matrix.getData());//Returns a clone of the 2D array representing the given matrix
  let array = [];//Define new array
  for(let i=0;i<matrix.getData().length;i++){//
    array.push(matrix.getData()[i][0]);
  }
  return array
}
//Creates 1D array full of nulls then replaces the nulls with arrays making a 2D array
const make2Darray = (cols,rows) => new Array(cols).fill().map(item =>(new Array(rows))) 
//function make2Darray(cols,rows){ //return new Array(cols).fill().map(item =>(new Array(rows))) 
//}
//Recursively goes through any array inside arrays and returns a deep clone of the array by copying every valued element
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
//The score class is used to stored scores achieved when a user finishes the game
//This stores the score achieved and the name of the user who scored it
//This data is then retrieved to display the leaderboard
class score{
  constructor(value,name){
    this.value = value;//Stored the value of the score when initialised
    this.name = name;//Defines the name for the score
  }
  getName(){//Get property for name
    return this.name;//Returns the name of this score
  }
  getValue(){//Get property for value (representing the value of the score of this object)
    return this.value;//Returns the stored score value
  }
}

//The Rectangle class is a very simple representation of a rectangle which is mainly used 
//for collision boxes by saving the properties of hitboxes using this rectangle class
class Rectangle{
  constructor(x,y,width,height){
    this.x = x;//Defines the x position of the rectangle
    this.y = y;//Defines the y position of the rectangle
    this.width = width;//Defines the width of the rectangle
    this.height = height;//Defines the height of the rectangle
  }
  getX(){//Get property for the x position
    return this.x;//Returns the x position
  }
  getY(){//Get property for the y position
    return this.y;//Returns the y position
  }
  getWidth(){//Get property for the width
    return this.width;//Returns the rectangle's width
  }
  getHeight(){//Get property for the height
    return this.height;//Returns the rectangle's height
  }
}
