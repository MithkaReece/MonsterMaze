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
      //this.mazeSize = 10

        this.layer = 1;
        this.buttons = new Array(6).fill().map(item =>(new Array()));//Makes an array 6 long of arrays
    
        //Setup main menu:0
        this.buttons[0].push(new button(createVector(width/2,height/2),300,100,"PLAY",[0,0,255],true,() => {
          this.maze = new Maze(mazeSize,mazeSize,2);
          this.player = new character(this.maze.getPlayerPos());             
          canvas.requestPointerLock();
          console.log(this.player.getPos())
        },1)) 
        this.buttons[0].push(new button(createVector(width/2,height/4),380,50,"LEADERBOARD",[0,0,255],true,() => {
     
        },2))
        this.buttons[0].push(new button(createVector(width/2,3*height/4),300,100,"EXIT",[0,0,255],true,() =>{
            window.close();
        },0))

        //Setup gameplay:1
        this.perspect = new perspective();

        this.maze = new Maze(mazeSize,mazeSize,2);
        this.player = new character(this.maze.getPlayerPos());    
        
        //Setup leaderboard:2


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
        //this.maze.getQuadTree(this.player.getHitBox());
    }

    callback(layer){//This function is passed into buttons for when they click
        this.layer = layer;//Changed the layer of the game
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
        if (event.keyCode === 9 && this.layer == 1) {//If key = tab and in gameplay
            event.preventDefault();//Show mouse
            this.layer = 3;//Open pause menu
        }
          
        
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

        this.drawButtons();
    }

    drawButtons(){
        for(let i=0;i<this.buttons[this.layer].length;i++){
          let button = this.buttons[this.layer][i];
          if(button.getVisible){
            button.show();
          }
        }
      }
}