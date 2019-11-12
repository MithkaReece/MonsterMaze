'use strict';

//The manager class is the first to be created and manages the sequence in which the program will run
//This class contains any objects made throughout the program running
class manager{
    constructor(){
      this.mazeSize = 5;//Defines the size of the maze
      this.buttonsAndLabels = []//Array of all the currently in use buttons and labels
      this.layer = 0;//Sets the main menu layer by default
      this.setupMainMenu();//Launches the main menu by default
    }
    getMazeSize(){//Get property for mazeSize
      return this.mazeSize;
    }
    getPlayer(){//Get property for player
      return this.player;
    }

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
    newGame(){
      this.maze = new Maze(this.mazeSize,this.mazeSize,1);//Generates a new maze
      this.player = new character(this.maze.getPlayerPos());//Creates a new player with given position
      this.monster = new monster(this.maze.getMonsterPos());//Create a new monster with given position
      this.perspect = new perspective();//Setups the a new 3D viewing plane of what the user can see
      this.setupGame();//Sets up on screen labels
    }
    setupGame(){//1
      this.buttonsAndLabels = [];//Clear all current buttons and labels
      this.buttonsAndLabels.push(new label(createVector(10*width/11,height/20),300,50,"TAB = Menu",[255,255,255,60]))//Add a new label showing the control for the pause menu
      this.buttonsAndLabels.push(new label(createVector(width/10,height/20),360,40,"WASD = Movement",[255,255,255,60]))//Add a new label showing movement controls (WASD)
      this.buttonsAndLabels.push(new label(createVector(3*width/10,height/20),355,40,"Mouse/Arrows keys to look",[255,255,255,60]))//Add a new label showing looking controls (Mouse or arrow keys)
    }
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
    setupWinScreen(){//4
      this.inputBox = createInput('');//Defined input box for when player wins
      this.inputBox.hide();//Hides input box until in layer 4
      this.buttonsAndLabels=[];
      this.buttonsAndLabels.push(new label(createVector(width/2,height/20),300,50,"SCORE: " + this.player.getScore(),[255,255,255,60]))//Label for current score
    }
    setupLoseScreen(){//5 to do
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
    mouseMoved(){//When mouse is moved
        if(document.pointerLockElement === canvas){//If mouse is hidden
            this.player.addRX(event.movementX*radians(0.1));//Allow looking horizontally
            this.player.addRY(-event.movementY*radians(0.1))//Allow looking vertically
        }
    }
    mouseWheel(event){//If mouse wheel used
      if(this.layer == 2){//If in leaderboard
        this.leaderboard.addPos(createVector(0,-event.delta));//Move the list of scores in the direction of scrolling
      }
    }
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
    saveNameToStorage(name){
      let retrievedNames = localStorage.getItem("names");//Retrieves list of names as string
      let names = [];//Creates an empty names list
      if(retrievedNames != null){//If any names from
        names = retrievedNames.split(",");//Split the string of names into a list of names
      }
      if(names.includes(name) == false){//If name not stored in names
        names.push(name);//Add name to list of names
      }  
      localStorage.setItem("names",names.join(","));//Convert new names list to string and store it
      let retrievedScores = localStorage.getItem(name);//Retrieve list of scores based on name as string
      let scores = [];//Creates an empty scores list
      if(retrievedScores != null){//If data recorded under name
        scores = retrievedScores.split(",");//Splits the string of scores into a list of scores
      }
      scores.push(this.player.getScore());//Add new score to list of scores
      localStorage.setItem(name,scores.join(","));//Convert new scores list to string and store it
    }

    runAi(){
      if(this.layer == 1){//If in gameplay layer
        this.monster.run(this.maze.getGrid(),this.player.getPos());//Runs the ai of the monster
      }
    }

    updateGameplay(){
      this.perspect.update(this.player);//Update perspective
      this.player.controls(this.perspect.getNormal(),this.maze.getQuadTree(this.player.getHitBox()));//Handles player controls
      //this.checkLoss();
    }
    checkLoss(){
      let distance = p5.Vector.dist(this.player.getPos(),this.monster.getPos());
      if(distance<0.7){
        this.setupLoseScreen();
        this.layer = 5;
        document.exitPointerLock();//Show mouse
      }
    }
    drawGameplay(){
      background(0,0,20);
      push();//Encapsulates any transformations
      translate(width/2,height/2);//Make 0,0 the centre of the screen
      const objects = this.player.rayCast(this.maze.getWalls(),this.monster);//Find all the walls that need showing
      //onst objects = this.maze.getWalls();
      objects.forEach(object=>object.show3D(this.player,this.perspect));//Show the walls
      pop();      
    }

    drawLeaderboard(){
      let storageNames = localStorage.getItem("names");//Get all recored names
      if(storageNames != null){//If more than 1 name recorded
        this.leaderboard.show();//Show the leaderboard
      }else{//If no recorded names
        console.log("empty")
      }
    }

    show(){
        background(255); 
        switch(this.layer){
            case 1://Gameplay
              this.updateGameplay();//Update gameplay mechanics
              this.drawGameplay();//Show gameplay visuals
              break;
            case 2://Leaderboard
              this.drawLeaderboard();//Draw leaderboard
              break;
            case 3://Pause menu
              this.drawGameplay();//Show gameplay visuals
              break;
          }
        //Show all buttons and labels
        for(let i=0;i<this.buttonsAndLabels.length;i++){//For every button and label
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

  addPos(vector){
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