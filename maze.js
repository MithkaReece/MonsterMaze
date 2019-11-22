'use strict';
let hscale;//Will remove
let vscale;//Will remove

//Maze is the class which is responsible for generating a random maze when it is created
//This stores three version of the maze generated. These consist of a 2D array of cells where
//each cell stored which walls it has, a list of walls which have been generated from the grid of
//cells which contain its position, rotation and length as well as a quad tree which contains all
//the generated walls where the walls are as far down the tree as they can possibily fit within
class Maze{
  constructor(width,height,complexity){
    this.playerStart = createVector();//Define playerStart position as a vector
    this.monsterStart = createVector();//Define monsterStart position as a vector
    this.startTick = new Date().getTime()//Save the current tick of when the maze is first created
    this.grid = make2Darray(width,height);//Defines an empty grid
    for(let y=0;y<height;y++){//For all y positions
      for(let x=0;x<width;x++){//For all x positions
        this.grid[x][y] = new cell(x,y);//Insert a new cell in every x,y position of the grid
      }
    }
    this.grid = this.generateMaze(width,height,complexity,this.grid)//Generates the maze in a grid of cells
    this.walls = this.generateWalls(width,height,this.grid);//Generates a list of all the walls of the maze
    this.wallTree = this.wallToTree(this.walls,width,height);//Insert all the walls into the quadtree of walls
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
    switch(direction){//Consider the given direction
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
    let pos = createVector(Math.floor(random(w)),Math.floor(random(h)));//Find random place for player to spawn
    while (p5.Vector.dist(pos, createVector(exitx,exity)) < 0.7*h){//Find random start far enough from exit
      pos = createVector(Math.floor(random(w)),Math.floor(random(h)));//Create a new random place for the player to spawn
    }
    this.playerStart = createVector(pos.x+0.5,-2,pos.y+0.5);//Convert 2D location on the maze to a 3D position
    //Convert to walls
    let walls = [];
    for(let y=0;y<h;y++){//For every y position
      for(let x=0;x<w;x++){//For every x position
        let cell = grid[x][y]//Retrieve current cell
        if(cell.getWalls()[0]==1 && y == 0){//If north wall and top
          walls.push(new wall(x,y,1,0));//Create a new wall and add to list of walls
        }
        if(cell.getWalls()[1]==1){//If east wall
          walls.push(new wall(x+1,y,1,90));//Create a new wall and add to list of walls
        }
        if(cell.getWalls()[2]==1){//If south wall
          walls.push(new wall(x,y+1,1,0));//Create a new wall and add to list of walls
        }
        if(cell.getWalls()[3]==1 && x == 0){//If west wall and left
          walls.push(new wall(x,y,1,90));//Create a new wall and add to list of walls
        }
      }
    }
    grid[exitx][exity].getWalls()[direction] = 1;//Fill up exit for the monster
    return walls;//Returns the list of walls generated from the maze
  }

  wallToTree(walls,width,height){//Inserts a given list of walls into a quad tree of walls
    let wallTree = new QuadTree(new Rectangle(0,0,width,height));//Define a new quadtree for the walls to go in
    for(let i=0;i<walls.length;i++){//For every wall from given walls
      wallTree.insert(walls[i]);//Insert current wall into quad tree
    }
    return wallTree;//Return new quad tree
  }
  
}
//The cell class is used when generating the maze by creating a grid of cells that start
//with four walls which are then broken through using a recursive algorithm
//The cell is used to store whether is has been visited by this algorithm or not and 
//stores which walls are there and which are not
class cell{
  constructor(x,y){
    this.visited = false;//Defaults boolean visited to false
    this.pos = createVector(x,y);//Defines an xy position 
    this.walls = [1,1,1,1];//Initialising cell to have all four walls in directions
    //North, East, South and West
  }
  getVisited(){//Get property for visited
    return this.visited;//Returns the boolean of if the cell 8has been visited
  }
  setVisited(value){//Set property for visited
    this.visited = value;//Sets the boolean of if the cell has been visited
  }
  getX(){//Get property for x position
    return this.pos.x;//Returns the x value of the position
  }
  getY(){//Get property for y position
    return this.pos.y;//Returns the y value of the position
  }
  getWalls(){//Get property for four walls of the cell
    return this.walls;//Returns a list of 1s and 0s representing the four walls
  }
}
//QuadTree is a class that is responsible for handling an abstract data structure of quad trees within
//quads trees within quads trees etc... This class as well as storing quad tree generated is also responsible
//for inserting objects with 2D dimensions within the quadtree as far down the tree as possible. This is down by
//starting with a single quadtree and subdividing into four quad trees within this quad tree until the object being
//inserted can no longer fit within the smaller bounds. This same technique is used to retrieve walls saved within the
//quad tree that fit within the same quad tree of a given hitbox which is used for collision detection
class QuadTree{
  constructor(bound){
    this.bound = bound;
    this.objects = [];
    this.quads = [];//Stores 4 quads tree in quad tree
    this.divided = false;
  }

  insert(wall){//Inserts a given wall into any of the 4 quads, containing a quadtree each, it completely fits between or in this quad tree
    if(!this.divided){//If current quad tree is not divided
      this.subdivide();//Sub divide current quad tree
    }
    for(let i=0;i<this.quads.length;i++){//For every quad in quads of quadtree
      let current = this.quads[i];//Define current as current quad tree
      if(current.withinBounds(wall.getX(),wall.getY(),wall.getWidth(),wall.getHeight())){//If wall is within the bounds of current quad
        current.insert(wall);//Insert wall into current quad tree found out of on these quads of the current quad tree
        return;//End the function when a quad tree has been found the current wall fits within
      }
    }//If wall does not fit into any future quads
    this.objects.push(wall);//Add wall to current quad tree objects
  }
  //Subdivide creates four new quadtrees which represent the four corners of this quadtree's region
  //and store these quad trees in this.quads as well as making sure it is only subdivided once by setting
  //divided to true
  subdivide(){
    let x = this.bound.getX();//Define x as the x position of the boundary
    let y = this.bound.getY();//Define y as the y position of the boundary
    let w = this.bound.getWidth();//Define w as the width of the boundary
    let h = this.bound.getHeight();//Define h as the height of the boundary
    this.quads.push(new QuadTree(new Rectangle(x, y, w/2, h/2)));//Add new quad tree to quads (top left)
    this.quads.push(new QuadTree(new Rectangle(x + w/2, y , w/2, h/2)));//Add new quad tree to quads (top right)
    this.quads.push(new QuadTree(new Rectangle(x + w/2, y + h/2, w/2, h/2)));//Add new quad tree to quads (bottom right)
    this.quads.push(new QuadTree(new Rectangle(x, y + h/2, w/2, h/2)));//Add new quad tree to quads (bottom left)
    this.divided = true;//Change divided boolean to true
  }
  //withinBounds is a function that checks whether all four corners of a rectangle, given the dimensions and position, are
  //within the bounds of this quad tree's boundary
  withinBounds = (x,y,w,h) => {return this.pBounds(x,y) && this.pBounds(x+w,y) && this.pBounds(x+w,y+h) && this.pBounds(x,y+h)}
  //pBounds is a function that checks whether a given x and y position is within the bounds of this quadtree's boundary
  pBounds = (x,y) => {return x >= this.bound.getX() && x < this.bound.getX() + this.bound.getWidth() &&
    y >= this.bound.getY() && y < this.bound.getY() + this.bound.getHeight()}
  //Retrieve is a function that runs through a similar procedure as the insert function using the given hitbox but instead of
  //inserting the hitbox it copies all the objects that it has come across and therefore returns a list of the only
  //objects that could possibily collide with the given hitbox
  retrieve(hitbox){
    let walls = this.objects.slice(0);//Define walls as a copy of objects in this quad tree
    for(let i=0;i<this.quads.length;i++){//For every quad in quads
      let currentWall = this.quads[i];//Define currentWall to the current quad
      if(currentWall.withinBounds(hitbox.getX(),hitbox.getY(),hitbox.getWidth(),hitbox.getHeight())){//If hitbox is within currentWall's bounds
        walls = walls.concat(currentWall.retrieve(hitbox));//Join the currentWall's hitbox to the walls array
      }
    }
    return walls;//Return walls array
  }
}