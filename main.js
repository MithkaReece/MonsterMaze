'use strict';

let gameMan;
function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255)
  gameMan = new manager();
  let mazeSize = gameMan.getMazeSize();//Will remove
  hscale = width/mazeSize;//Will remove
  vscale = height/mazeSize;//Will remove
}
function draw() {
  gameMan.showAndUpdate();
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








