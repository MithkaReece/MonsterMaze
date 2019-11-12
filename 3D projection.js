'use strict';
const screenScale = 20; //Scales up projection
const faceheight = 2;//Used for testing face

let gameMan;
function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255)
  gameMan = new manager();
  let mazeSize = gameMan.getMazeSize();
  hscale = width/mazeSize;//scale to fit the screen
  vscale = height/mazeSize;//scale to fit the screen
}
function draw() {
  gameMan.show();
}
function mouseClicked(){
  gameMan.mouseClick();
}
function mouseMoved(){
  gameMan.mouseMoved();
}
function mouseWheel(event){
  gameMan.mouseWheel(event);
}
window.addEventListener('keydown', (event) => {
  gameMan.keyDown(event);
})

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
function sommet(){
  //gameMan.runAi();
}
setInterval(sommet,50)// This should all the ai to do its move (milliseconds)


class button{
  constructor(pos,width,height,text,colour,click){
    this.click = click;//Stores the function that will be executed when the button is clicked
    this.text = text;//Stores the text that is displayed on the button
    this.colour = colour;//Stores the colour of the button
    this.pos = pos;//Stores the position of the button on the screen
    this.width = width;//Stores the width of the button
    this.height = height;//Stores the height of the button
  }
  region(){//Checks whether the mouse coordinates are within the region of the button
    return mouseX >= this.pos.x-this.width/2 &&
      mouseX <= this.pos.x+this.width/2 &&
      mouseY >= this.pos.y-this.height/2 &&
      mouseY <= this.pos.y+this.height/2;
  }
  show(){
    rectMode(CENTER);//Drawing the rectangle of the button with the position being the center of the rectangle
    fill(this.colour);//Setting the colour of the rectangle to the colour stored
    rect(this.pos.x,this.pos.y,this.width,this.height);//Drawing a rectangle using the properties of the button stored
    fill(0);//Setting the colour of the text to black
    textAlign(CENTER,CENTER)//Alligning the text to the centre of the button
    textSize(this.height)//Setting the size of the text to the size of the button
    text(this.text,this.pos.x,this.pos.y+this.height/10);//Drawing the text onto the button's rectangle
  }
}

class label{
  constructor(pos,width,height,text,colour){
    this.pos = pos;//Stores the position of the label
    this.width = width;//Stores the width of the label
    this.height = height;//Stores the height of the label
    this.text = text;//Stores the text that is displayed on the label
    this.colour = colour;//Stores the colour of the button
  }
  getText(){//Get property for the label's text
    return this.text;
  }
  setText(text){//Set property for the label's text
    this.text = text;
  }
  getPos(){//Get property for the label's position
    return this.pos;
  }
  addPos(vector){//Adds a vector to the label's position
    this.pos.add(vector);
  }
  show(){
    rectMode(CENTER);//Drawing the rectangle of the label with the position being the center of the rectangle
    fill(this.colour);//Setting the colour of the rectangle to the colour stored
    rect(this.pos.x,this.pos.y,this.width,this.height);//Drawing a rectangle using the properties of the label stored
    fill(0);//Setting the colour of the text to black
    textAlign(CENTER,CENTER)//Alligning the text to the centre of the label
    textSize(this.height)//Setting the size of the text to the size of the label
    text(this.text,this.pos.x,this.pos.y+this.height/10);//Drawing the text onto the label's rectangle
  }
}

class perspective{
  constructor(){
    this.distance = 20;//Distance of the plane of the screen is to the camera of the player
    this.normal;//Normal of plane
    this.d;//d from the plane equation r.n = d
  }
  getNormal(){//Get property for the normal of the plane of the screen
    return this.normal.copy();//Returns a copy of the vector
  }
  getD(){//Get propery for the d from the plane equation r.n = d
    return this.d;
  }
  update(player){
    this.normal = Matrix.rotateY(Matrix.rotateZ(createVector(0,0,1),player.getRY()),player.getRX());//RotateXY screen plane round camera
    this.d = -(p5.Vector.dot(this.normal,player.getPos()) +(this.distance));//Calculate d of the plane equation from the plane equation and the given distance
  }
}



