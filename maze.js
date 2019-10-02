'use strict';

const wallHeight = 1;
let hscale;
let vscale;

class Maze{
  constructor(width,height,complexity){
    this.playerStart = createVector();

    this.width = width;//Width of maze
    this.height = height;//Height of maze
    this.complexity = complexity;//Complexity of maze

    this.wallTree = new QuadTree(new Rectangle(0,0,this.width,this.height));//Walls stored as a quad tree

    this.grid = make2Darray(this.width,this.height);//Creates the grid
    for(let y=0;y<this.height;y++){
      for(let x=0;x<this.width;x++){
        this.grid[x][y] = (new cell(x,y,this.width,this.height));
      }
    }
    this.grid = this.generateMaze(this.width,this.height,this.complexity,this.grid)
    this.walls = this.generateWalls(this.width,this.height,this.grid);//List of all the walls
    this.wallToTree();
  }
  getWalls(){
    return this.walls.slice();
  }
  getQuadTree(hitbox){
    return this.wallTree.retrieve(hitbox);
  }

  getPlayerPos(){
    return this.playerStart
  }

  generateMaze(w,h,c,ingrid){
    let grid = ingrid;
    for(let y=0;y<c;y++){//For all ys
      for(let x=0;x<c;x++){//For all xs
        let ranx = Math.floor(random(x*w/c,(x+1)*w/c));//random x within segment
        let rany = Math.floor(random(y*h/c,(y+1)*h/c));//random y within segment
        this.generate(grid[ranx][rany],x*w/c,y*w/c,(x+1)*w/c,(y+1)*w/c,grid);//Generate a segment
        
        let openings = Math.ceil(12/c);//Calcs how many joinings of segments
        for(let i=0;i<openings;i++){
            if(x!=c-1){//loop 1 less the segments for inner walls
              let nx = (x+1)*w/c;//Go through each vertical segment walls
              let ny = Math.floor(random(y*h/c,(y+1)*h/c))//Calc random y within the segment
              grid[nx-1][ny].getWalls()[1] = 0;//Open east wall
              grid[nx][ny].getWalls()[3] = 0;//Open west counter part wall
            }
            if(y!=c-1){//loop 1 less the segments for inner walls
              let nx = Math.floor(random(x*w/c,(x+1)*w/c));//Calc random x within the segment
              let ny = (y+1)*h/c;//Go through each horizontal segment walls
              grid[nx][ny].getWalls()[0] = 0;//Open north wall
              grid[nx][ny-1].getWalls()[2] = 0;//Open south counter part wall
            }
          }
      }
    }
    //Make exit
    let exitNum = Math.floor(random(2*(w+h)));//Exit locations
    //console.log(exitNum)
    let direction = Math.floor(exitNum/(0.5*(w+h)));//Which wall needs breaking
    //console.log(direction);
    let x;
    let y;
    if(direction == 0){//North
      x = exitNum; 
      y = 0;
    }else if(direction == 1){//East
      x = w-1;
      y = exitNum - w;
    }else if(direction == 2){//South
      x = exitNum - w - h;
      y = h-1;
    }else{//West
      x = 0;
      y = exitNum - 2*w - h;
    }
    //console.log(w,h);
    //console.log(x,y);
    grid[x][y].getWalls()[direction] = 0;//Break wall for exit

    let pos = createVector(Math.floor(random(w)),Math.floor(random(h)));
    while (p5.Vector.dist(pos, createVector(x,y)) > 1.1*h){//Find random start far enough from exit
      pos = createVector(Math.floor(random(w)),Math.floor(random(h)));
    }
    this.playerStart = createVector(pos.x+0.5,-2,pos.y+0.5);
    console.log(pos.x,pos.y);
    console.log(x,y)
    return grid;
  }
  generate(cell,minh,minv,maxh,maxv,grid){
      let dir = shuffle([0,1,2,3]);//shuffle directions nesw
      for(let i=0;i<dir.length;i++){//For each directions
          let neighbour = this.checkCell(dir[i],cell,minh,minv,maxh,maxv,grid);//Check random neighbour
          if(neighbour != null){//If neighbour exists
              this.generate(neighbour,minh,minv,maxh,maxv,grid);//Recurse
          }
      } 
  }
  checkCell(dir,cell,minh,minv,maxh,maxv,grid){
      let x = cell.getX();
      let y = cell.getY();
      let neighbour;
      if(dir == 0){
          neighbour = (y==minv?null:grid[x][y-1]);//If North cell on map  
      }else if(dir == 1){
          neighbour = (x==maxh-1?null:grid[x+1][y]);//If East cell on map
      }else if(dir == 2){
          neighbour = (y==maxv-1?null:grid[x][y+1]);//If South cell on map
      }else if(dir == 3){
          neighbour = (x==minh?null:grid[x-1][y]);//If West cell on map
      }
    if(neighbour != null && neighbour.getVisited() == false){//If valid neighbour
      cell.getWalls()[dir]=0;//Break wall of current cell
      neighbour.getWalls()[(dir+2)%4]=0;//Break opposite wall of visiting cell
      neighbour.setVisited(true);//Make visiting cell next cell
      return neighbour;
    }
    return null;//No valid neighbour found
  }
  generateWalls(w,h,grid){
    let walls = [];
    let hwalls = 0;
    let hPos;
  
    let vwalls = 0;
    let vPos;
  
    for(let y=-1;y<h;y++){
      for(let x=0;x<w;x++){
        if(y==-1){
          let currentCell = grid[x][y+1]
          if(currentCell.getWalls()[0]==1){//If there is south wall and is not on the map edge
            if(hwalls==0){//Start new wall
              hPos = createVector(x,y);//First wall in row position
            }
            hwalls++;//Counts walls in a row
            if(x == grid.length-1){//If at edge of maze
              walls.push(new wall(hPos.x,(hPos.y+1),hwalls,0))//Add wall
              hwalls = 0;//End wall
            }
          }else if(hwalls != 0){//If wall have been incremented    
            walls.push(new wall(hPos.x,(hPos.y+1),hwalls,0))//Add wall
            hwalls = 0;//End wall
          }
  
          currentCell = grid[y+1][x] //Vertical walls
          if(currentCell.getWalls()[3]==1){//If there is east wall and is not on the map edge
            if(vwalls==0){//Start new wall
              vPos = createVector(y,x);//First wall in row position
            }
            vwalls++;//Counts walls in a row
            if(x == grid[0].length-1){//If at edge of maze
              walls.push(new wall((vPos.x+1),vPos.y,vwalls,90));//Add wall
              vwalls = 0;//End wall
            }
          }else if(vwalls != 0){//If wall have been incremented
            walls.push(new wall((vPos.x+1),vPos.y,vwalls,90));//Add wall
            vwalls = 0;//End wall
          }
  
  
        }else{
          let currentCell = grid[x][y];//Horizontal walls
          if (currentCell.getWalls()[2]==1){//If there is south wall and is not on the map edge
            if(hwalls==0){//Start new wall
              hPos = createVector(x,y);//First wall in row position
            }
            hwalls++;//Counts walls in a row
            if(x == grid.length-1){//If at edge of maze
              walls.push(new wall(hPos.x,(hPos.y+1),hwalls,0))//Add wall
              hwalls = 0;//End wall
            }
          }else if(hwalls != 0){//If wall have been incremented    
            walls.push(new wall(hPos.x,(hPos.y+1),hwalls,0))//Add wall
            hwalls = 0;//End wall
          }
        
          currentCell = grid[y][x] //Vertical walls
          if(currentCell.getWalls()[1]==1){//If there is east wall and is not on the map edge
            if(vwalls==0){//Start new wall
              vPos = createVector(y,x);//First wall in row position
            }
            vwalls++;//Counts walls in a row
            if(x == grid[0].length-1){//If at edge of maze
              walls.push(new wall((vPos.x+1),vPos.y,vwalls,90));//Add wall
              vwalls = 0;//End wall
            }
          }else if(vwalls != 0){//If wall have been incremented
            walls.push(new wall((vPos.x+1),vPos.y,vwalls,90));//Add wall
            vwalls = 0;//End wall
          }
        }
      }
    } 

    
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
  //Won't be used in game but for showing it works
  showWalls(){
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
class wall extends cuboid{
  constructor(x,y,length,rotation,colour = [255,0,0]){
    const thicknessOfWall = 0.1
    let newL = length;
    if(rotation !=0){
      newL += thicknessOfWall;
    }
    let pos = createVector(x,-2,y);
    super(pos,newL,wallHeight,thicknessOfWall,rotation);

    //For displaying 2D version
    this.pos2D = createVector(x,y);
    this.width = newL;
    this.height = thicknessOfWall;
    this.colour = colour;
    this.r = rotation;//Rotation
  }

  getLength(){//Returns always the longer side
    return this.width;
  }
  getRotation(){
    return this.r;
  }
  getX(){
    return this.pos2D.x;
  }
  getY(){
    return this.pos2D.y;
  }
  getWidth(){//Returns the width relative to the x axis
    if(this.r != 0){//If vertical wall
      return this.height;
    }//If horizontal wall
    return this.width;
  }
  getHeight(){//Returns the height relative to the y axis
    if(this.r != 0){//If vertical wall
      return this.width;
    }//If horizontal wall
    return this.height;
  }

  show2D(){
    strokeWeight(0)
    stroke(this.colour);
    fill(this.colour);
    rectMode(CORNER);
    push();
    let sc = width/mazeSize;
    translate(sc*this.pos2D.x,sc*this.pos2D.y)
    rotate(radians(this.r));
    rect(0,0,sc*this.width,sc*this.height);
    pop();
  }
}
class Rectangle{
  constructor(x,y,width,height){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  getX(){
    return this.x;
  }
  getY(){
    return this.y;
  }
  getWidth(){
    return this.width;
  }
  getHeight(){
    return this.height;
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
    let answer = x >= this.bound.getX() &&
    x < this.bound.getX() + this.bound.getWidth() &&
    y >= this.bound.getY() &&
    y < this.bound.getY() + this.bound.getHeight();
    return answer
  }

  retrieveold(){
    let array = this.objects.slice(0);
    for(let i=0;i<this.quads.length;i++){
      let result = this.quads[i].retrieveold()
      if(result.length>0){
        array = array.concat(result);
      }
    }
    return array;
  }

  retrieve(hitbox){
    let array = this.objects.slice(0);
    for(let i=0;i<this.quads.length;i++){
      let x = hitbox.getX();
      let y = hitbox.getY();
      let w = hitbox.getWidth();
      let h = hitbox.getHeight();
      let current = this.quads[i];
      if(current.withinBounds(x,y,w,h)){
        array = array.concat(current.retrieve(hitbox));
      }
    }

    return array;
  }

  show(){
    
  }

}