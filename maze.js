'use strict';


let hscale;//Will remove
let vscale;//Will remove

class Maze{
  constructor(width,height,complexity){
    this.playerStart = createVector();//Define playerStart position as a vector
    this.monsterStart = createVector();//Define monsterStart position as a vector
    this.startTick = new Date().getTime()//Save the current tick of when the maze is first created

    this.width = width;//Define the width of maze
    this.height = height;//Define the height of maze
    this.complexity = complexity;//Define the complexity of maze

    this.wallTree = new QuadTree(new Rectangle(0,0,this.width,this.height));//Define a new quadtree for the walls to go in

    this.grid = make2Darray(this.width,this.height);//Defines an empty grid
    for(let y=0;y<this.height;y++){//For all y positions
      for(let x=0;x<this.width;x++){//For all x positions
        this.grid[x][y] = (new cell(x,y,this.width,this.height));//Insert a new cell in every x,y position of the grid
      }
    }
    this.grid = this.generateMaze(this.width,this.height,this.complexity,this.grid)//Generates the maze in a grid of cells
    this.walls = this.generateWalls(this.width,this.height,this.grid);//Generates a list of all the walls of the maze
    this.wallToTree();//Insert all the walls into the quadtree ofwalls
  }
  getTicks(){//Get property for start tick
    return this.startTick;//Returns the start tick of when the maze was made
  }
  getWalls(){//Get property for walls of the maze
    return this.walls;//Returns a list of the maze's walls
  }
  getQuadTree(hitbox){//Get property for the quadtree of walls
    return this.wallTree.retrieve(hitbox);//Returns walls in quadtree relative to the hitbox
  }
  getGrid(){//Get property for the grid of the maze
    return this.grid;//Returns the grid of the maze
  }
  getPlayerPos(){//Get property for the player's start position
    return this.playerStart;//Returns the player's start position
  }
  getMonsterPos(){//Get property for the monster's start position
    return this.monsterStart;//Returns the monster's  start position
  }

  generateMaze(width,height,complexity,ingrid){
    let grid = clone(ingrid);//Makes a copy of the given grid of cells
    for(let y=0;y<complexity;y++){//For all segment ys
      for(let x=0;x<complexity;x++){//For all segment xs
        const ranx = Math.floor(random(x*width/complexity,(x+1)*width/complexity));//random x within segment to start
        const rany = Math.floor(random(y*height/complexity,(y+1)*height/complexity));//random y within segment to start
        this.generate(grid[ranx][rany],x*width/complexity,y*width/complexity,(x+1)*width/complexity,(y+1)*width/complexity,grid);//Generates maze for a segment
        
        for(let i=0;i<Math.ceil(12/complexity);i++){//Loop through needed openings
            if(x!=complexity-1){//loop 1 less the segments for inner walls
              const nx = (x+1)*width/complexity;//Go through each vertical segment walls
              const ny = Math.floor(random(y*height/complexity,(y+1)*height/complexity))//Calc random y within the segment
              grid[nx-1][ny].getWalls()[1] = 0;//Open east wall
              grid[nx][ny].getWalls()[3] = 0;//Open west counter part wall
            }
            if(y!=complexity-1){//loop 1 less the segments for inner walls
              const nx = Math.floor(random(x*width/complexity,(x+1)*width/complexity));//Calc random x within the segment
              const ny = (y+1)*height/complexity;//Go through each horizontal segment walls
              grid[nx][ny].getWalls()[0] = 0;//Open north wall
              grid[nx][ny-1].getWalls()[2] = 0;//Open south counter part wall
            }
          }
      }
    }
    return grid;
  }
  generate(cell,minh,minv,maxh,maxv,grid){
    let dir = shuffle([0,1,2,3]);//shuffle directions north, east, south, west
    for(let i=0;i<dir.length;i++){//For each available directions
        let neighbour = this.checkCell(dir[i],cell,minh,minv,maxh,maxv,grid);//Check if neighbour in this direction is unvisited
        if(neighbour != null){//If neighbour exists and is unvisited
            this.generate(neighbour,minh,minv,maxh,maxv,grid);//Call generate on the chosen neighbour
        }
    } 
  }
  checkCell(direction,cell,minX,minY,maxX,maxY,grid){
    const x = cell.getX();
    const y = cell.getY();
    let neighbour;
    switch(direction){
      case 0://If direction is north of this cell
        neighbour = (y==minY?null:grid[x][y-1]);//Set neighbour to north cell
        break;
      case 1://If direction is east of this cell
        neighbour = (x==maxX-1?null:grid[x+1][y]);//Set neighbour to east cell
        break;
      case 2://If direction is south of this cell
        neighbour = (y==maxY-1?null:grid[x][y+1]);//Set neighbour to south cell
        break;
      case 3://If direction is west of this cell
        neighbour = (x==minX?null:grid[x-1][y]);//Set neighbour to west cell
        break;
    }
    if(neighbour != null && neighbour.getVisited() == false){//If neighbour exists and is unvisited
      cell.getWalls()[direction]=0;//Break wall of current cell in that direction
      neighbour.getWalls()[(direction+2)%4]=0;//Break opposite wall of visiting neighbour cell
      neighbour.setVisited(true);//Set the neighbour cell to visited
      return neighbour;//Return neighbour cell
    }
    return null;//Return null if invalid neighbour
  }
  generateWalls(w,h,grid){
    //Make exit
    let exitNum = Math.floor(random(2*(w+h)));//Make a random exit locations
    let direction = Math.floor(exitNum/(0.5*(w+h)));//Calculate which wall needs breaking
    let exitx;
    let exity;
    switch(direction){//Considering direction
      case 0://North
        exitx = exitNum; 
        exity = 0;
        break;
      case 1://East
        exitx = w-1;
        exity = exitNum - w;
        break;
      case 2://South
        exitx = exitNum - w - h;
        exity = h-1;
        break;
      case 3://West
        exitx = 0;
        exity = exitNum - 2*w - h;
        break;
    }
    grid[exitx][exity].getWalls()[direction] = 0;//Break wall for exit
    this.monsterStart = createVector(exitx+0.49,-2,exity+0.49);//+0.49 so that it is between the walls and floors to x and y
    //Find place for player to spawn
    let pos = createVector(Math.floor(random(w)),Math.floor(random(h)));
    while (p5.Vector.dist(pos, createVector(exitx,exity)) < 0.7*h){//Find random start far enough from exit
      pos = createVector(Math.floor(random(w)),Math.floor(random(h)));
    }
    this.playerStart = createVector(pos.x+0.5,-2,pos.y+0.5);
    //Convert to walls
    let walls = [];
    for(let y=0;y<h;y++){
      for(let x=0;x<w;x++){
        let cell = grid[x][y]
        if(cell.getWalls()[0]==1 && y == 0){//If north wall and top
          walls.push(new wall(x,y,1,0));
        }
        if(cell.getWalls()[1]==1){//If east wall
          walls.push(new wall(x+1,y,1,90));
        }
        if(cell.getWalls()[2]==1){//If south wall
          walls.push(new wall(x,y+1,1,0));
        }
        if(cell.getWalls()[3]==1 && x == 0){//If west wall and left
          walls.push(new wall(x,y,1,90));
        }
      }
    }
    grid[exitx][exity].getWalls()[direction] = 1;//Fill up exit for the monster
    return walls;
  }

  wallToTree(){
    for(let i=0;i<this.walls.length;i++){
      let current = this.walls[i];
      this.wallTree.insert(current);
    }
  }
}


class cell{
  constructor(x,y,w,h){
    this.visited = false;
    this.pos = createVector(x,y); 
    this.l = w;
    this.w = h;
    this.walls = [1,1,1,1];//NESW
  }
  getVisited(){
    return this.visited;
  }
  setVisited(value){
    this.visited = value;
  }
  getX(){
    return this.pos.x;
  }
  getY(){
    return this.pos.y;
  }
  getWalls(){
    return this.walls;
  }
  
  showWalls(){//Will remove
    strokeWeight(10)
    stroke(0,255,255,100);
    let scale = 0.1/hscale*vscale;
    if(this.pos.x==0 && this.walls[3]==1){//West
      rect(this.pos.x*hscale,this.pos.y*vscale,scale,height/this.w);  
    }
    if(this.pos.y==0 && this.walls[0]==1){//North
      rect(this.pos.x*hscale,this.pos.y*vscale,width/this.l,scale); 
    }
    if(this.walls[1]==1){//East
      rect((this.pos.x+1)*hscale-scale/2,this.pos.y*vscale,scale,height/this.w);  
    }
    if(this.walls[2]==1){//South
      rect(this.pos.x*hscale,(this.pos.y+1)*vscale-scale/2,width/this.l,scale);  
    }
    
  }
}
class QuadTree{
  constructor(bound){
    this.bound = bound;
    this.objects = [];
    this.quads = [];//Stores 4 quads tree in quad tree
    this.divided = false;
  }

  insert(wall){
    if(!this.divided){
      this.subdivide();
    }
    for(let i=0;i<this.quads.length;i++){
      let current = this.quads[i];
      if(current.withinBounds(wall.getX(),wall.getY(),wall.getWidth(),wall.getHeight())){
        current.insert(wall);
        return;
      }
    }
    this.objects.push(wall);
  }

  subdivide(){
    let x = this.bound.getX();
    let y = this.bound.getY();
    let w = this.bound.getWidth();
    let h = this.bound.getHeight();
    this.quads.push(new QuadTree(new Rectangle(x, y, w/2, h/2)));
    this.quads.push(new QuadTree(new Rectangle(x + w/2, y , w/2, h/2)));
    this.quads.push(new QuadTree(new Rectangle(x + w/2, y + h/2, w/2, h/2)));
    this.quads.push(new QuadTree(new Rectangle(x, y + h/2, w/2, h/2)));
    this.divided = true;
  }
  
  withinBounds(x,y,w,h){
    return this.pBounds(x,y) &&
     this.pBounds(x+w,y) &&
     this.pBounds(x+w,y+h) &&
     this.pBounds(x,y+h);
  }
  pBounds(x,y){
    return x >= this.bound.getX() &&
    x < this.bound.getX() + this.bound.getWidth() &&
    y >= this.bound.getY() &&
    y < this.bound.getY() + this.bound.getHeight();
  }

  retrieve(hitbox){
    let walls = this.objects.slice(0);
    for(let i=0;i<this.quads.length;i++){
      let currentWall = this.quads[i];
      if(currentWall.withinBounds(hitbox.getX(),hitbox.getY(),hitbox.getWidth(),hitbox.getHeight())){
        walls = walls.concat(currentWall.retrieve(hitbox));
      }
    }
    return walls;
  }
}