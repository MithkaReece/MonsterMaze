'use strict';

//The manager class is the first to be created and manages the sequence in which the program will run
//This class contains any objects made throughout the program running
//The manager is responsible for defining all the buttons and labels that are used in each screen
class manager{
  constructor(){
    this.mazeSize = 5;//Defines the size of the maze
    this.buttonsAndLabels = []//Array of all the currently in use buttons and labels
    this.layer = 0;//Sets the main menu layer by default
    this.perspect = new perspective();//Setups the a new 3D viewing plane of what the user can see
    this.setupMainMenu();//Launches the main menu by default
  }
  getMazeSize(){//Get property for mazeSize
    return this.mazeSize;//Returns the current size of the maze
  }
  getPlayer(){//Get property for player
    return this.player;//Returns the current player object of the current game
  }
  //setupMainMenu replaces the current buttons and labels with all the labels and buttons used for the main menu screen
  setupMainMenu(){
    this.buttonsAndLabels = [];//Clear all current buttons and labels
    this.buttonsAndLabels.push(new button(createVector(width/2,height/2),300,100,"PLAY",[0,0,255],() => {//Add a new play button
      this.newGame();//Launches a new game
      this.layer = 1;//Changes to gameplay layer
      canvas.requestPointerLock();//Hides the mouse
    })) 
    this.buttonsAndLabels.push(new button(createVector(width/2,height/4),380,50,"LEADERBOARD",[0,0,255],() => {//Add a new leaderboard button
      this.setupLeaderboard();//Setup the leaderboard menu
      this.layer = 2;//Changes to learderboard layer
    }))
    this.buttonsAndLabels.push(new button(createVector(width/2,3*height/4),300,100,"EXIT",[0,0,255],() =>{//Add a new exit button
      window.close();//Closes the window
    }))
  }
  //newGame is responsible for defining or redefining all the main components of the gameplay
  //These includes a new maze, a new player and a new monster
  //This function also calls setupGame to setup up the onscreen labels for the gameplay
  //This function is called to launch a fresh new game session
  newGame(){
    this.maze = new Maze(this.mazeSize,this.mazeSize,1);//Generates a new maze
    this.player = new character(this.maze.getPlayerPos());//Creates a new player with given position
    this.monster = new monster(this.maze.getMonsterPos());//Create a new monster with given position
    this.setupGame();//Sets up on screen labels
  }
  //setupGame replaces the current labels with all the labels used for the gameplay
  setupGame(){//1
    this.buttonsAndLabels = [];//Clear all current buttons and labels
    this.buttonsAndLabels.push(new label(createVector(10*width/11,height/20),300,50,"TAB = Menu",[255,255,255,60]))//Add a new label showing the control for the pause menu
    this.buttonsAndLabels.push(new label(createVector(width/10,height/20),360,40,"WASD = Movement",[255,255,255,60]))//Add a new label showing movement controls (WASD)
    this.buttonsAndLabels.push(new label(createVector(7*width/20,height/20),480,40,"Mouse/Arrows keys to look",[255,255,255,60]))//Add a new label showing looking controls (Mouse or arrow keys)
  }
  //setupLeaderboard replaces the current buttons and labels with all the labels and buttons used for the leaderboard screen
  //This function is also responsible for retrieves all the pairs of names and scores and sorting them into a list
  setupLeaderboard(){//2
    this.buttonsAndLabels = [];//Clear all current buttons and labels
    this.buttonsAndLabels.push(new label(createVector(width/2,height/15),800,100,"LEADERBOARD",[255,255,255,60]))//Add a new label showing the title "LEADERBOARD"
    this.buttonsAndLabels.push(new button(createVector(width/2,13*height/16),600,100,"Main menu",[0,0,255],() =>{//Add a new main menu button
      this.setupMainMenu();//Launches the main menu
      this.layer=0;//Changes to main menu layer
    }))
    let scores = [];//Creates empty list of scores
    let names = localStorage.getItem("names");//Retrieves list of stored names saved under "names"
    if(names != null){//If more than one name is stored in local storage
      names = names.split(",");//Split the names into a list of names
      for(let i=0;i<names.length;i++){//Loops through list of names
        let currentName = names[i];//Sets currentName to the current name in the loop
        let scoresFromName = localStorage.getItem(currentName).split(",");//Retrieves a list of scores under currentName
        for(let k=0;k<scoresFromName.length;k++){//Loops through list of scores 
          let nextScore = new score(parseInt(scoresFromName[k]));//Create a new score object with the current score
          nextScore.setName(currentName);//Allocate the new object the name of the user who achieved that score
          scores.push(nextScore);//Adds pairs of name and score to scores list
        }
      }
      scores = mergeSort(scores,"desc");//Sorts the scores into descending numerical order
      this.leaderboard = new leaderboard(createVector(width/2,3*height/16),scores);//Creates a new leaderboard and gives it a list of scores it will display
    }else{//If no data is stored
      console.log("no leaderboard data")//TO DO
    } 
  }
  //setupPauseMenu replaces the current buttons with all the buttons used for the pause menu
  setupPauseMenu(){//3
    this.buttonsAndLabels = [];
    this.buttonsAndLabels.push(new button(createVector(width/2,height/2),720,160,"RESUME",[20,255,100],() =>{
      canvas.requestPointerLock();//Hide the mouse
      this.setupGame();//Brings back the screen labels for gameplay
      this.layer=1;//Changes to gameplay layer
  })) 
  this.buttonsAndLabels.push(new button(createVector(width/2,3*height/4),720,120,"MAIN MENU",[60,150,0],() =>{
    this.setupMainMenu();//Launches the main menu
    this.layer = 0;//Changes to main menu layer
  }))
  this.buttonsAndLabels.push(new button(createVector(width/2,height/4),720,100,"FULL SCREEN",[60,150,0],() =>{     
    if(document.fullscreenElement){//If currently in full screen mode
      document.exitFullscreen()//Exit full screen mode
    }else{
      document.body.requestFullscreen()//Go into full screen mode
    }
  }))
  this.buttonsAndLabels.push(new button(createVector(width/2,width/20),720,120,"RESTART",[60,150,0],() =>{
    canvas.requestPointerLock();//Hide mouse
    this.newGame();//Launch a new game
    this.layer=1;//Change to gameplay layer
  }))
  }
  //setupWinScreen replaces the current labels with all the labels used for the win screen and defines its inputbox
  //used to retrieve the user's name for the leaderboard
  setupWinScreen(){//4
    this.inputBox = createInput('');//Defined input box for when player wins
    this.inputBox.hide();//Hides input box until in layer 4
    this.buttonsAndLabels=[];
    this.buttonsAndLabels.push(new label(createVector(width/2,height/20),300,50,"SCORE: " + this.player.getScore(),[255,255,255,60]))//Label for current score
  }
  //setupLoseScreen replaces the current buttons and labels with all the labels and buttons used for the lose screen
  setupLoseScreen(){//5 
    this.buttonsAndLabels=[];
    this.buttonsAndLabels.push(new label(createVector(width/2,4*height/20),700,120,"You Lost",[255,0,0]))
    this.buttonsAndLabels.push(new button(createVector(width/2,8*height/20),720,120,"RESTART",[60,150,0],() =>{
      canvas.requestPointerLock();//Hide mouse
      this.newGame();//Launch a new game
      this.layer=1;//Change to gameplay layer
    }))
    this.buttonsAndLabels.push(new button(createVector(width/2,12*height/20),720,120,"MAIN MENU",[60,150,0],() =>{
      this.setupMainMenu();//Launches the main menu
      this.layer = 0;//Changes to main menu layer
    }))
    this.buttonsAndLabels.push(new button(createVector(width/2,16*height/20),900,120,"LEADERBOARD",[0,0,255],() => {
      this.setupLeaderboard();//Setupts the leaderboard menu
      this.layer = 2;//Changes to learderboard layer
    }))
  }

  //mouseClick is called everytime the mouse is clicked
  //This allows the user to hand and unhide the mouse while in gameplay
  //This also allows you click a button by checking the regions of all the current
  //buttons against the position of the mouse when it was clicked and then
  //activate a button that has been clicked
  mouseClick(){//When mouse is clicked
      if(this.layer == 1){//If in first person gameplay
        //Hides and unhides mouse when clicking
        canvas.requestPointerLock();
        if(document.pointerLockElement === canvas){
          document.exitPointerLock();
        }
      }else{//If in any other layer
        for(let i=0;i<this.buttonsAndLabels.length;i++){//For all buttons and labels
          let current = this.buttonsAndLabels[i];//Set current to the current element in the list
          if(current instanceof button){//If the current element is a button
            if(current.region()){//If the mouse is within the region of the button
              current.click();//Call the click function of the button
              i = this.buttonsAndLabels.length;//Set i to max to stop looping
            }
          }
        }
      }
  }
  //mouseMoved is called everytime the mouse moves controls the looking mechanics
  //If the mouse has been hidden away then movement in the mouse is then added to the
  //player's orientation represented by rotations around the x axis and y axis
  mouseMoved(){//When mouse is moved
      if(document.pointerLockElement === canvas){//If mouse is hidden
          this.player.addRX(event.movementX*radians(0.1));//Allow looking horizontally
          this.player.setRY(constrain(this.player.getRY()-(event.movementY*radians(0.1)),radians(-85),radians(80)))//Allow looking vertically with limitations
      }
  }
  //mouseWheel is called everytime the mouse wheel is used
  //The function moves the leaderboard up and down when in the leaderboard screen
  mouseWheel(event){//If mouse wheel used
    if(this.layer == 2){//If in the leaderboard screen
      this.leaderboard.moveLabels(createVector(0,-event.delta));//Move the list of scores in the direction of scrolling
    }
  }
  //keyDown called everytime a key is pressed, checks whether the tab key or enter key has been pressed
  //If the tab key has been pressed allow it to open and close the pause menu when in gameplay
  //If in the win screen allow enter to be used to submit text in an input box
  keyDown(event){//When key is pressed
      if(event.keyCode === 9 && this.layer == 1){//If key = tab and in gameplay
        event.preventDefault();//Prevents tab's default function
        this.layer = 3;//Change to pause menu layer
        this.setupPauseMenu();//Launch pause menu
        document.exitPointerLock();//Show mouse
      }
      else if(event.keyCode === 9 && this.layer == 3) {//If key = tab and in pause menu
        event.preventDefault();//Prevents tab's default function
        canvas.requestPointerLock();//Hides mouse
        this.layer = 1;//Close pause menu
        this.setupGame();//Bring back the game labels
    }
    this.checkWin();//Check if the player has won
    this.checkNameEntry(event.keyCode);//Validate input box when in win screen
  }
  //Checks whether the player has won by escaping the maze
  //If the player has won this function then calculates the score based on the time it took
  //It then launches the win screen and defines the input box for the user's name to go in
  checkWin(){
    if(this.layer == 1){//If in gameplay layer
      if(this.player.won(this.mazeSize)){//If player has won
        document.exitPointerLock();//Bring the mouse back
        let timeDiff = new Date().getTime() - this.maze.getTicks()//Find how long the player was playing for
        this.player.setScore(Math.floor((1/timeDiff)*Math.pow(10,8)))//Score = 1/ticks of played times 10^8  
        this.layer = 4;//Change to win screen
        this.setupWinScreen();//Setups up win screen
        this.inputBox.position(width/2,height/2);//Set position of inputbox
        this.inputBox.show();//Shows input box for win screen
      }
    }
  }
  //checkNameEntry validates whether the user has clicked enter after typing in the win screen input box
  checkNameEntry(key){
    if(key === 13 && this.layer == 4){//If enter pressed in win game menu
      if(this.inputBox.value().length>0){//If anything entered in input box
        this.saveNameToStorage(this.inputBox.value());//Save the name entered
        this.inputBox.hide();//Hide inputbox
        this.inputBox = createInput('');//Reset inputbox
        this.inputBox.hide();//Hide inputbox
        this.layer = 2;//Change to leaderboard layer
        this.setupLeaderboard();//Setups up leaderbaord
      }
    }
  }
  //saveNameToStorage saves the given input name to storage under the score of the current player
  //The name is saved as a set of names so no repeated names
  //The scores are saved under the name of the user who achieved that score
  saveNameToStorage(name){
    let retrievedNames = localStorage.getItem("names");//Retrieves list of names as a single string
    let names = [];//Creates an empty names list
    if(retrievedNames != null){//If retrieveNames is empty because no names are currently stored
      names = retrievedNames.split(",");//Splits the string of names into a list of names
    }
    if(names.includes(name) == false){//If name is not stored in names
      names.push(name);//Add name to list of names
    }  
    localStorage.setItem("names",names.join(","));//Convert new names list to a single string and store it
    let retrievedScores = localStorage.getItem(name);//Retrieve list of scores based on name as string
    let scores = [];//Creates an empty scores list
    if(retrievedScores != null){//If data recorded under name
      scores = retrievedScores.split(",");//Splits the string of scores into a list of scores
    }
    scores.push(this.player.getScore());//Add new score to list of scores
    localStorage.setItem(name,scores.join(","));//Convert new scores list to a single string and store it
  }
  //runAi is runs the monster's ai independent of the user input
  runAi(){
    if(this.layer == 1){//If in gameplay layer
      this.monster.run(this.maze.getGrid(),this.player.getPos());//Runs the ai of the monster
    }
  }
  //updateGameplay is responsible for updating all the game mechanics every tick
  //It is also responsible for checking win and loss conditions
  updateGameplay(){
    this.perspect.update(this.player);//Updates player's perspective based on player's orientation
    this.player.controls(this.perspect.getNormal(),this.maze.getQuadTree(this.player.getHitBox()));//Handles player controls
    //this.checkLoss();//Checks if the player has been caught
  }
  //checkLoss checks whether the player is close enough to the monster that they have been caught
  //If the player has been caught then it moves the program to the lose screen
  checkLoss(){
    let distance = p5.Vector.dist(this.player.getPos(),this.monster.getPos());//Find the disstance from the player and monster
    if(distance<0.7){//If the distance is within 0.7 units
      this.setupLoseScreen();//Setup the lose screen menu
      this.layer = 5;//Changes the layer to the lose screen
      document.exitPointerLock();//Shows the mouse
    }
  }
  //drawGameplay is responsible for showing all the 3D objects when in gameplay
  //It only draw the necessary objects retrieved from the player's rayCast function
  drawGameplay(){
    background(0,0,20);//Set background colour to rgb value
    push();//Encapsulates any transformations
    translate(width/2,height/2);//Make 0,0 the centre of the screen
    const objects = this.player.rayCast(this.maze.getWalls(),this.monster);//Find all the walls that need showing
    objects.forEach(object=>object.show3D(this.player,this.perspect));//For every found wall tell it to show
    pop();//End of encapsulation
  }
  //drawLeaderboard is responsible for telling the leaderboard to show itself
  //It does this only when there is any recorded data to show
  drawLeaderboard(){
    let storageNames = localStorage.getItem("names");//Retrieve all recorded names from local storage
    if(storageNames != null){//If more than 1 name recorded
      this.leaderboard.show();//Shows the leaderboard
    }else{

    }
  }
  //ShowAndUpdate is a manager function which is called by the main program every tick
  //This function shows and visuals and updates and game mechanics live
  //It also does a few checks so that it only shows and updates the components needed for the
  //current screen the user is in
  showAndUpdate(){
      background(255); 
      switch(this.layer){//Consider the layer which represent which screen the user is in
          case 1://If in Gameplay screen
            this.updateGameplay();//Update gameplay mechanics
            this.drawGameplay();//Show gameplay visuals
            break;
          case 2://If in Leaderboard screen
            this.drawLeaderboard();//Draw leaderboard
            break;
          case 3://If in pause menu
            this.drawGameplay();//Show gameplay visuals in the backgroudn
            break;
        }
      //Show all buttons and labels
      for(let i=0;i<this.buttonsAndLabels.length;i++){//For every button and label currently in use
        this.buttonsAndLabels[i].show();//Show button or label
      }
  }

  
}

class leaderboard{
  constructor(pos,scores){
    this.pos = pos;
    this.labels = [];
    this.labelWidth = 600;
    this.labelHeight = 80;
    this.labelGap = 20;
    this.height = (7*height/15);
    this.createLabels(scores);
  }

  moveLabels(vector){
    vector.setMag(25)//How fast you can scroll
    if(this.labels[0].getPos().y > this.pos.y && vector.y > 0){//If the top label is at the top 
      return;//Don't let them scroll down
    }
    if(this.labels[this.labels.length-1].getPos().y < this.pos.y + this.height && vector.y < 0){//If the bottom label is at the bottom
      return;//Don't let them scroll up
    }
    for(let i=0;i<this.labels.length;i++){//For every label
      this.labels[i].addPos(vector);//Add vector to its position
    }
  }

  createLabels(data){
    this.labels = [];
    for(let i=0;i<data.length;i++){//For every bit of data
      let name = data[i].getName();//Get name
      let score = data[i].getValue();//Get score
      let x = this.pos.x;//Set x to leaderboard's x
      let y = this.pos.y + i*(this.labelHeight+this.labelGap);//Set y to leaderbaord's y + offset times data number
      this.labels.push(new label(createVector(x,y),this.labelWidth,this.labelHeight,name + ": " + score ,[255,255,255,60]))//add the new label to list
    }
  }

  show(){
    for(let i=0;i<this.labels.length;i++){//For every label
      let label = this.labels[i];//Set label to current label
      if(label.getPos().y > this.pos.y + this.height){//If label is below desired area
        i = this.labels.length;//Set i to max to stop loop
      }else{//If label is above bottom of leaderboard area
        if(label.getPos().y >= this.pos.y){//If label is below top of leaderboard area
          label.show();//Show current label
        }
      }
    }
  }
}
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