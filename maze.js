let grid;
let hscale;
let vscale;
let walls = [];//Walls of the scene

let c = 1;//Complexity of the maze - lower the more complex


let mazelength = 10;
let mazewidth = 10;
let mazegrid = [4,4]

class square{
  constructor(x,y,w,h){
    this.x;
    this.y;
    this.w;
    this.h;
  }
}

class QuadTree{
  constructor(boundary, capacity){
    this.boundary = boundary;
    this.capacity = capacity;
    this.objects = [];
    this.quads = [];
    this.divided = false;
  }

  insert(){
    if(!this.divided){
      this.subdivide();
      this.divided = true;
    }
  }

  subdivide(){
    let x = this.boundary.x;
    let y = this.boundary.y;
    let w = this.boundary.w;
    let h = this.boundary.h;
    this.quads.push(new QuadTree(new Rectangle(x + w/2, y - h/2, w/2, h/2)));
    this.quads.push(new QuadTree(new Rectangle(x - w/2, y - h/2, w/2, h/2)));
    this.quads.push(new QuadTree(new Rectangle(x + w/2, y + h/2, w/2, h/2)));
    this.quads.push(new QuadTree(new Rectangle(x - w/2, y + h/2, w/2, h/2)));
  }
  

}

function generateWalls(w,h){
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
}
function generateMaze(w,h,c){
  for(let y=0;y<c;y++){//For all ys
    for(let x=0;x<c;x++){//For all xs
      let ranx = Math.floor(random(x*w/c,(x+1)*w/c));//random x within segment
      let rany = Math.floor(random(y*h/c,(y+1)*h/c));//random y within segment
      generate(grid[ranx][rany],x*w/c,y*w/c,(x+1)*w/c,(y+1)*w/c);//Generate a segment
      
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
}
function generate(cell,minh,minv,maxh,maxv){
    let dir = shuffle([0,1,2,3]);//shuffle directions nesw
    for(let i=0;i<dir.length;i++){//For each directions
        let neighbour = checkCell(dir[i],cell,minh,minv,maxh,maxv);//Check random neighbour
        if(neighbour != null){//If neighbour exists
            generate(neighbour,minh,minv,maxh,maxv);//Recurse
        }
    } 
}
function checkCell(dir,cell,minh,minv,maxh,maxv){
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
let wallh = 1;
class wall{
  constructor(x,y,l,r,colour = [255,0,0]){
    this.pos = createVector(x,y);
    this.l = l;
    this.w = 0.05;
    this.colour = colour;
    this.r = r;//Rotation
    if(this.r != 0){
      this.l+=this.w;
    }
    let pos = this.pos.copy();
    pos.z = pos.y;
    pos.y = -2;
    //pos.mult(mazewidth/mazegrid[0]);
    this.obj = new wall3D(pos,this.l,wallh,this.w,this.r);
  }

  show3D(){
    strokeWeight(0)
    stroke(this.colour);
    this.colour.push();
    fill(this.colour);
    this.obj.show();
  }

  show(){
    let sc = width/mazegrid[0];
    let w = width/mazegrid[0];
    let h = height/mazegrid[1]
    strokeWeight(0)
    stroke(this.colour);
    this.colour.push();
    fill(this.colour);
    rectMode(CORNER);
    push();
    translate(sc*this.pos.x,sc*this.pos.y)
    rotate(radians(this.r));
    rect(0,0,sc*this.l,sc*this.w);
    pop();
  }
}
