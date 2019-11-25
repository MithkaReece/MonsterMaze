'use strict';
//vectorToArray function is responsible for return an array of components of a given vector.
function vectorToArray(vector){
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
//matrixToVector function is responsible for returning a vector from data of a given matrix.
function matrixToVector(matrix){
  return arrayToVector(matrix.getData().map(x => x[0]));
}
//arrayToVector function is responsible for returning a vector made from a given array.
function arrayToVector(array){
  if(!Array.isArray(array)){//If given array is not an array
    console.log("array to vector not given an array")
    return null//Return null as no array to convert to vector
  }
  if(array.length == 2){//If array is 2 long
    return createVector(array[0],array[1]);//Return a 2D vector from array data
  }else if(array.length == 3){//If array is 3 long
    return createVector(array[0],array[1],array[2]);//Returns a 3D vector from array data
  }//If array is not 2 or 3 long then it can't be converted to a vector
  console.log("array can't be made into vector")
  return null//Return null as no vector to be produced
}
//matrixToArray function is responsible for return an array from data of a given matrix.
function matrixToArray(matrix){//Returns an 2D array of the elements from a given matrix
  if(matrix.getData()[0].length == 0){//If the matrix is empty
    return null;//Return null as no array can be produced
  }
  return clone(matrix.getData());//Returns a clone of the 2D array representing the given matrix
}
//Creates 1D array full of nulls then replaces the nulls with arrays making a 2D array.
const make2Darray = (cols,rows) => new Array(cols).fill().map(item =>(new Array(rows))) 
//Recursively goes through any array inside arrays and returns a deep clone of the array by copying every valued element.
const clone = (items) => items.map(item => Array.isArray(item) ? clone(item) : item);
//mergeSort function is responsible for sorting a given array in a given order (ascending or descending) by splitting
//the given away recursively by calling itself twice until only one item is left. Then return the merge of the two
//splits cells recursively all the way back up to the original array size but returns the sorted version.
function mergeSort(a,type){
  if(a.length == 1){ //If the array only contains one item 
    return a; //Return this item
  }
  let firstList = mergeSort(a.slice(0,a.length/2),type); //Sort first half of list
  let secondList = mergeSort(a.slice(a.length/2,a.length),type); //Sort second half of list
  return merge(firstList,secondList,type); //Return the two lists merged together
}
//merge function is responsible for merging together two given sorted lists into a given order (ascending or descending) by
//comparing on by one elements and slowly adding them to a new sorted array which is returned at the end.
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
  return sorted;//Returns sorted array
}
//The score class is used to stored scores achieved when a user finishes the game.
//This also stores the score achieved and the name of the user who scored it.
//This data is then retrieved to display the leaderboard.
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
//for collision boxes by saving the properties of hitboxes using this rectangle class.
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
//Queue class is responsible for holding a queue data structure with a few basic queue operations
//such an enqueue and dequeue for a preset sized queue.
class Queue{
  constructor(length){
    this.length = length;//Define the size of the queue from given initialised length
    this.data = []//Define the data of the queue as empty by default
  }
  //enqueue function is responsible for enqueueing a given value onto this queue
  //making sure that if the queue is full it will dequeue the element at the front.
  enqueue(value){
    this.data.push(value);//Pushing the given value onto the data of the queue
    if(this.data.length>length){//If the data's size is greater than the set size of the queue
      this.dequeue();//Call dequeue to dequeue the front of the queue
    }
  }
  //dequeue function is responsible for dequeuing the front of the queue by removing the
  //front element and returning it.
  dequeue(){
    return this.data.shift();//Return the front element of the data
  }
  getCurrentLength(){//Get property for the current length of the contents of the queue
    return this.data.length;//Returns the current size of the data of the queue
  }
  getLength(){//Get property for the set length of the queue
    return this.length;//Returns the length of the queue
  }
  getData(){//Get property for the data of the queue
    return clone(this.data);//Returns a copy of the data, used to convert a queue into an list
  }
}