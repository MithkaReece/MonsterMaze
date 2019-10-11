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
      
        this.layer = 0;
        this.buttons = new Array(6).fill().map(item =>(new Array()));//Makes an array 6 long of arrays for buttons
        this.labels = new Array(6).fill().map(item => (new Array()));//Makes an array 6 long of arrays for labels
        //Setup main menu:0
        this.buttons[0].push(new button(createVector(width/2,height/2),300,100,"PLAY",[0,0,255],true,() => {
          this.maze = new Maze(this.mazeSize,this.mazeSize,2);
          this.player = new character(this.maze.getPlayerPos());        
          this.monster = new monster(this.maze.getMonsterPos());     
          canvas.requestPointerLock();
        },1)) 
        this.buttons[0].push(new button(createVector(width/2,height/4),380,50,"LEADERBOARD",[0,0,255],true,() => {
          this.setupLeaderboard();
        },2))
        this.buttons[0].push(new button(createVector(width/2,3*height/4),300,100,"EXIT",[0,0,255],true,() =>{
            window.close();
        },0))

        //Setup gameplay:1
        this.perspect = new perspective();

        this.maze = new Maze(this.mazeSize,this.mazeSize,1);
        this.player = new character(this.maze.getPlayerPos());  
        this.monster = new monster(this.maze.getMonsterPos());
        
        this.labels[1].push(new label(createVector(10*width/11,height/20),300,50,"TAB = Menu",[255,255,255,60]))
        this.labels[1].push(new label(createVector(width/10,height/20),360,40,"WASD = Movement",[255,255,255,60]))
        this.labels[1].push(new label(createVector(3*width/10,height/20),355,40,"Arrows keys to look",[255,255,255,60]))
        

        //Setup leaderboard:2
        this.buttons[2].push(new button(createVector(width/2,3*height/4),600,100,"Main menu",[0,0,255],true,() =>{
        },0))
        //Setup pause menu:3
        this.buttons[3].push(new button(createVector(width/2,height/2),720,160,"RESUME",[20,255,100],true,() =>{
            canvas.requestPointerLock();
        },1)) 
        this.buttons[3].push(new button(createVector(width/2,3*height/4),720,120,"MAIN MENU",[60,150,0],true,() =>{},0))
        this.buttons[3].push(new button(createVector(width/2,height/4),720,100,"FULL SCREEN",[60,150,0],true,() =>{     
          if(document.fullscreenElement){
            document.exitFullscreen()
            canvas.requestPointerLock();
          }else{
            canvas.requestPointerLock();
            document.body.requestFullscreen()
          }
        },1))
        this.buttons[3].push(new button(createVector(width/2,width/20),720,120,"RESTART",[60,150,0],true,() =>{
          this.maze = new Maze(this.mazeSize,this.mazeSize,2);
          this.player = new character(this.maze.getPlayerPos());   
          this.monster = new monster(this.maze.getMonsterPos());          
          canvas.requestPointerLock();
        },1))

        //Win screen:4
        this.inputBox = createInput('');
        this.inputBox.hide();
        this.labels[4].push(new label(createVector(width/2,height/20),300,50,"SCORE: ",[255,255,255,60]))
        //Lose screen:5
    }

    callback(layer){//This function is passed into buttons for when they click
        this.layer = layer;//Changed the layer of the game
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
          }else{
            for(let i=0;i<this.buttons[this.layer].length;i++){
                let button = this.buttons[this.layer][i];
                if(button.region() && button.getVisible()){
                    button.click();
                    this.callback(button.layerChange);
                    i=this.buttons.length+1;
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
    keyDown(event){
        if(event.keyCode === 9 && this.layer == 1) {//If key = tab and in gameplay
          event.preventDefault();//Show mouse
          this.layer = 3;//Open pause menu
        }
        else if (event.keyCode === 9 && this.layer == 3) {//If key = tab and in menu
          event.preventDefault();
          canvas.requestPointerLock();
          this.layer = 1;//Open pause menu
      }
        if(this.player.won(this.mazeSize) && this.layer == 1){//Check if won
          let timeDiff = new Date().getTime() - this.maze.getTicks()//Find how long the player was playing for
          this.player.setScore(Math.floor((1/timeDiff)*Math.pow(10,8)))//Score = 1/ticks of played times 10^8
          this.labels[4][0].setText(this.labels[4][0].getText() + this.player.getScore());//Update the score of the player to label
          document.exitPointerLock();//Bring the mouse back
          this.layer = 4;//Will be win screen later
          this.inputBox.position(width/2,height/2);
          this.inputBox.show();
        }
        if(event.keyCode === 13 && this.layer == 4){//If enter pressed in win game menu
          //
          if(this.inputBox.value().length>0){//If anything entered in input box
            this.saveNameToStorage(this.inputBox.value());
            this.inputBox = createInput('');
            this.inputBox.hide();

          }
        }
    }
    saveNameToStorage(name){
      let retrievedNames = localStorage.getItem("names");
      let names = [];
      if(retrievedNames != null){
        names = retrievedNames.split(",");
      }
      if(names.includes(name) == false){//If name not stored in names
        names.push(name);//Add name to list of names
      }  
      localStorage.setItem("names",names.join(","));

      let retrievedScores = localStorage.getItem(name);
      let scores = [];
      if(retrievedScores != null){//If data recorded under name
        scores = retrievedScores.split(",");
      }
      scores.push(this.player.getScore());
      localStorage.setItem(name,scores.join(","));
      this.layer = 2;
    }

    setupLeaderboard(){
      //console.log("test");
      let scores = [];
      let names = localStorage.getItem("names").split(",");
      console.log(localStorage.getItem(names[0]).split(",").length)
      
      for(let i=0;i<names.length;i++){
        console.log("i",i)
        let currentName = names[i];
        let scoresFromName = localStorage.getItem(currentName).split(",");
        for(let k=0;k<scoresFromName.length;k++){   
          console.log("k",k)    
          scores.push([currentName,scoresFromName[k]]);
        }
      }
      //console.log("MERGE")
      scores = mergeSort(scores);
      console.log(scores);
    }

    drawMainMenu(){
     
    }
    updateGameplay(){
      this.perspect.update(this.player);//Update perspective
      this.player.controls(this.perspect.getN(),this.maze.getQuadTree(this.player.getHitBox()));
    }
    drawGameplay(){
      background(0,0,20);
      push();
      translate(width/2,height/2);
      stroke(255);
      strokeWeight(5);
      const walls = this.player.rayCast(this.maze.getWalls());
      walls.forEach(wall=>wall.show3D(this.player,this.perspect));
      pop();        
      
      //For testing
      /*this.player.displayRays(); 'Display ray area
      this.maze.getWalls().forEach(wall=>wall.show2D()); 'Display all wall 2D
      push();
      strokeWeight(2);
      fill(0);
      let n = 0.2;
      translate(hscale*this.player.pos.x,vscale*this.player.pos.z);
      rotate(-this.player.rotation.x)
      rect(-0.2*hscale,-0.2*vscale,0.2*hscale,0.2*vscale)
      triangle(-n,0,n,0,0,3*n);
      pop();
      
      */
    }

    drawLeaderboard(){
      let storageNames = localStorage.getItem("names");
      if(storageNames.length!=0){
        //console.log(storageNames)
      }else{
        console.log("empty")
      }
    }

    drawPauseMenu(){
    
    }

    show(){
        background(255); 
        switch(this.layer){
            case 0:
              this.drawMainMenu();
              break;
            case 1:
              this.updateGameplay();
              this.drawGameplay();
              break;
            case 2:
              this.drawLeaderboard();
              break;
            case 3:
              document.exitPointerLock();
              this.drawGameplay();
              this.drawPauseMenu();
              break;
          }

        this.drawButtonsAndLabels();
    }

    drawButtonsAndLabels(){
        for(let i=0;i<this.buttons[this.layer].length;i++){
          let button = this.buttons[this.layer][i];
          if(button.getVisible){
            button.show();
          }
        }
        for(let i=0;i<this.labels[this.layer].length;i++){
          let label = this.labels[this.layer][i];
          label.show();
        }
      }
}