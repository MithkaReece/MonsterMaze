'use strict';

let gameMan;
//setup is a function which is called once at the very start of the program
//This function defines a new manager which manages the whole procedure of the program
function setup(){
  createCanvas(windowWidth, windowHeight);
  background(255)
  gameMan = new manager();
  let mazeSize = gameMan.getMazeSize();//Will remove
  hscale = width/mazeSize;//Will remove
  vscale = height/mazeSize;//Will remove
}
//draw is a function which is called every tick
//This function tells the manager when to show and update the game
function draw() {
  gameMan.showAndUpdate();
}
//mouseClicked is a function called everytime the mouse is clicked
//This function tells the manager that the mouse has been clicked
function mouseClicked(){
  gameMan.mouseClick();
}
//mouseMoved is a function called everytime the mouse is moved
//This function tells the manager that mouse has been moved
function mouseMoved(){
  gameMan.mouseMoved();
}
//mouseWheel is a function called everytime the mouse wheel is moved
//This function tells the manager that the mouse wheel has been moved as
//well as giving the argument event which is used to find the direction
//of movement of the mouse wheel
function mouseWheel(event){
  gameMan.mouseWheel(event);
}
//This is an event listener which listens for a key to be pressed
//When a key is pressed this function then tell the manager that and
//give it the argument event so that the manager knows which key was pressed
window.addEventListener('keydown', (event) => {
  gameMan.keyDown(event);
})
//windowResized is called everytime the window the game is in resizes
//This function then resizes the canvas so that everytime inside will scale
//to the new size of the window
function windowResized() {//Wat does this do?
  resizeCanvas(windowWidth, windowHeight);
}
//runAi is called by a set interval which makes sure the manager knows
//to run the Ai every given interval
function runAi(){
  //gameMan.runAi();
}
//Set interval calls the runAi function every given seconds in milliseconds
setInterval(runAi,50)// This should all the ai to do its move (milliseconds)








