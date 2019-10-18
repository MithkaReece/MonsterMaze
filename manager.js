'use strict';
/*Layers meanings
0:Main menu
1:Playing the game
2:LeaderBoard
3:Pause menu
4:Win screen
5:Lose screen*/
class manager{
    constructor(){
      this.mazeSize = 10;
      this.bal = []//Array of all the currently in use buttons and labels
      this.layer = 0;
      this.setupMainMenu();
    }
    setupMainMenu(){//0
      this.bal = [];
      this.bal.push(new button(createVector(width/2,height/2),300,100,"PLAY",[0,0,255],() => {
        this.newGame();
        this.layer = 1;
        canvas.requestPointerLock();
      })) 
      this.bal.push(new button(createVector(width/2,height/4),380,50,"LEADERBOARD",[0,0,255],() => {
        this.setupLeaderboard();
        this.layer = 2;
      }))
      this.bal.push(new button(createVector(width/2,3*height/4),300,100,"EXIT",[0,0,255],() =>{
        window.close();
      }))
    }
    newGame(){
      this.maze = new Maze(this.mazeSize,this.mazeSize,1);
      this.player = new character(this.maze.getPlayerPos());  
      this.monster = new monster(this.maze.getMonsterPos());
      this.perspect = new perspective();
      this.setupGame();
    }
    setupGame(){//1
      this.bal = [];
      this.bal.push(new label(createVector(10*width/11,height/20),300,50,"TAB = Menu",[255,255,255,60]))
      this.bal.push(new label(createVector(width/10,height/20),360,40,"WASD = Movement",[255,255,255,60]))
      this.bal.push(new label(createVector(3*width/10,height/20),355,40,"Arrows keys to look",[255,255,255,60]))
    }
    setupLeaderboard(){//2
      this.bal = [];
      this.bal.push(new label(createVector(width/2,height/15),800,100,"LEADERBOARD",[255,255,255,60]))
      this.bal.push(new button(createVector(width/2,13*height/16),600,100,"Main menu",[0,0,255],() =>{
        this.setupMainMenu();
        this.layer=0;
      }))
      let scores = [];//Creates empty list of scores
      let names = localStorage.getItem("names");//Retrieves stored names
      if(names != null){
        names = names.split(",");
        for(let i=0;i<names.length;i++){//Loops through list of names
          let currentName = names[i];//Sets currentName to the current name in the loop
          let scoresFromName = localStorage.getItem(currentName).split(",");//Retrieves a list of scores from currentName
          for(let k=0;k<scoresFromName.length;k++){//Loops through list of scores 
            let nextScore = new score(scoresFromName[k]);
            nextScore.setName(currentName);  
            scores.push(nextScore);//Adds pairs of name and score to scores list
          }
        }
        scores = mergeSort(scores,"desc");//Sorts the scores into numerical order
        this.leaderboard = new leaderboard(createVector(width/2,3*height/16),scores);
      }else{
        console.log("no leaderboard data")
      } 
    }
    setupPauseMenu(){//3
      this.bal = [];
      this.bal.push(new button(createVector(width/2,height/2),720,160,"RESUME",[20,255,100],() =>{
        canvas.requestPointerLock();
        this.setupGame();
        this.layer=1;
    })) 
    this.bal.push(new button(createVector(width/2,3*height/4),720,120,"MAIN MENU",[60,150,0],() =>{
      this.setupMainMenu();
      this.layer = 0;
    }))
    this.bal.push(new button(createVector(width/2,height/4),720,100,"FULL SCREEN",[60,150,0],() =>{     
      if(document.fullscreenElement){
        document.exitFullscreen()
        canvas.requestPointerLock();
      }else{
        canvas.requestPointerLock();
        document.body.requestFullscreen()
      }
    }))
    this.bal.push(new button(createVector(width/2,width/20),720,120,"RESTART",[60,150,0],() =>{
      canvas.requestPointerLock();
      this.newGame();
      this.layer=1;
    }))
    }
    setupWinScreen(){//4
      this.inputBox = createInput('');//Defined input box for when player wins
      this.inputBox.hide();//Hides input box until in layer 4
      this.bal=[];
      this.bal.push(new label(createVector(width/2,height/20),300,50,"SCORE: " + this.player.getScore(),[255,255,255,60]))//Label for current score
    }
    setupLoseScreen(){//5 to do
    
    }

    getMazeSize(){
      return this.mazeSize;
    }
    getPlayer(){
      return this.player;
    }
    mouseClick(){
        if(this.layer == 1){//If in first person gameplay
            canvas.requestPointerLock();
            if(document.pointerLockElement === canvas){
              document.exitPointerLock();
            }
          }else {
            for(let i=0;i<this.bal.length;i++){
              let current = this.bal[i];
              if(current instanceof button){
                if(current.region()){
                  current.click();
                  i = this.bal.length;
                }
              }
            }
          }
        
    }
    mouseMoved(){
        if(document.pointerLockElement === canvas){
            this.player.addRX(event.movementX*radians(0.1));//Allow looking horizontally
            this.player.addRY(-event.movementY*radians(0.1))//Allow looking vertically
        }
    }
    mouseWheel(event){
      if(this.layer == 2){//If in leaderboard
        this.leaderboard.addPos(createVector(0,-event.delta));
      }
    }
    keyDown(event){
        if(event.keyCode === 9 && this.layer == 1) {//If key = tab and in gameplay
          event.preventDefault();//Show mouse
          this.layer = 3;//Open pause menu
          this.setupPauseMenu();
        }
        else if (event.keyCode === 9 && this.layer == 3) {//If key = tab and in menu
          event.preventDefault();
          canvas.requestPointerLock();
          this.layer = 1;//Close pause menu
          this.setupGame();//Bring back the game labels
      }
        this.checkWin();
        this.checkNameEntry(event.keyCode);
    }
    checkWin(){
      if(this.layer == 1){//Check if won
        if(this.player.won(this.mazeSize)){
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
          this.inputBox.hide();
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
      if(this.layer == 1){
        this.monster.run(this.maze.getGrid(),this.player.getPos());
      }
    }

    updateGameplay(){
      this.perspect.update(this.player);//Update perspective
      this.player.controls(this.perspect.getN(),this.maze.getQuadTree(this.player.getHitBox()));
    }
    drawGameplay(){
      background(0,0,20);
      push();//Encapsulates any transformations
      translate(width/2,height/2);//Make 0,0 the centre of the screen
      const walls = this.player.rayCast(this.maze.getWalls(),this.monster);//Find all the walls that need showing
      //console.log(walls)
      walls.forEach(wall=>wall.show3D(this.player,this.perspect));//Show the walls
      pop();        
    }

    drawLeaderboard(){
      let storageNames = localStorage.getItem("names");
      if(storageNames != null){
        this.leaderboard.show();
      }else{
        console.log("empty")
      }
    }

    show(){
        background(255); 
        switch(this.layer){
            case 0://Main menu
              break;
            case 1://Gameplay
              this.updateGameplay();
              this.drawGameplay();
              break;
            case 2://Leaderboard
              this.drawLeaderboard();
              break;
            case 3://Pause menu
              document.exitPointerLock();
              this.drawGameplay();
              break;
          }
        //Show all buttons and labels
        for(let i=0;i<this.bal.length;i++){
          let current = this.bal[i];
          current.show();
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
    vector.setMag(10)
    if(this.labels[0].getPos().y > this.pos.y && vector.y > 0){//If the top label is at the top 
      return;//Don't let them scroll down
    }
    if(this.labels[this.labels.length-1].getPos().y < this.pos.y + this.height && vector.y < 0){//If the bottom label is at the bottom
      return;//Don't let them scroll up
    }
    for(let i=0;i<this.labels.length;i++){
      let label = this.labels[i];
      label.addPos(vector);
    }
  }

  createLabels(data){
    this.labels = [];
    for(let i=0;i<data.length;i++){
      let name = data[i].getName();
      let score = data[i].getValue();
      let x = this.pos.x;
      let y = this.pos.y + i*(this.labelHeight+this.labelGap);
      this.labels.push(new label(createVector(x,y),this.labelWidth,this.labelHeight,name + ": " + score ,[255,255,255,60]))
    }
  }

  show(){
    for(let i=0;i<this.labels.length;i++){
      let label = this.labels[i];
      if(label.getPos().y > this.pos.y + this.height){
        i = this.labels.length;
      }else{
        if(label.getPos().y >= this.pos.y){
          label.show();
        }
      }
    }
  }


}