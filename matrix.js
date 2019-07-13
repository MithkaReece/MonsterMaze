class Matrix{
    constructor(rowsOrData,cols){
      if(cols === undefined){
        this.data = rowsOrData;
        this.rows = this.data.length;
        this.cols = this.data[0].length;
      }else{
      this.rows = rowsOrData;
      this.cols = cols;
      this.data = Array(this.rows).fill().map(() => Array(this.cols).fill(0)); 
      }   
    }
    
    insert(array){
      this.data = array;
    }
    
    mult(vector){
      let v = VtoArray(vector); //Turn vector into array
      if(this.cols != v.length){ //Test if comformable
        console.log("not comformable"); 
        return undefined
      }
      
      let newV = []; 
      for(let i=0;i<this.rows;i++){ //Loop through rows
        let sum = 0;
        for(let k=0;k<v.length;k++){ //Loop through cols
          sum += this.data[i][k] * v[k]; //Times elements
        }
        newV.push(sum); //Push new element sums
      }
      
      v = createVector(); //Create the new vector
      v.x = newV[0];
      v.y = newV[1];    
      if(this.rows>2){ //3D vector
       v.z = newV[2];  
      }
      return v;
    }
    
    multiply(n){
     if(n instanceof Matrix){ //Matrix * Matrix
       
       
     }else if(n instanceof p5.Vector){ //Matrix * Vector
       //Fix for 1d arrays
       
       let v = VtoArray(n); //Turn vector into array
       let m = new Matrix(v); //Turn array into matrix  
       v = Matrix.multiply(this,m); //Multiply this with vector
       let newV = createVector();
       newV.x = v.data[0][0];
       newV.y = v.data[1][0];
       if(this.rows>2){ //If 3D vector
         newV.z = v.data[2][0]; 
       }
       return newV; //Return new vector
     }
    }
    static multiply(a,b){
      if(a.cols !== b.rows){
        console.log("Not comforable");
        return;
      }
      
      return new Matrix(a.rows, b.cols).map((e, i, j) => {
          // Dot product
          let element = 0;
          for (let k = 0; k < a.cols; k++) {
            element += a.data[i][k] * b.data[k][j];
          }
          return element;
        });         
    }  
    map(fn){   
        //apply a function to every element
        for(let i=0;i<this.rows;i++){
          for(let j=0;j<this.cols;j++){
            let val = this.data[i][j];
            this.data[i][j] = fn(val,i,j); 
          }
        }
      return this;
    }  
    
    static multiply(a,b){
        //matrix multiplication
        if(a.cols !== b.rows){
          console.log("Bad matrices");
          return;
        }
          
        return new Matrix(a.rows, b.cols).map((e, i, j) => {
          // Dot product
          let element = 0;
          for (let k = 0; k < a.cols; k++) {
            element += a.data[i][k] * b.data[k][j];
          }
          return element;
        });      
    }
    
    static rotateX(vector,angle){
      let rotationX = [
        [cos(angle), -sin(angle),0],
        [sin(angle), cos(angle),0],
        [0,0,1]
        ]
      let matrix = new Matrix(rotationX);
      return matrix.multiply(vector);
    }
    
    static rotateY(vector,angle){
      let rotationX = [
        [cos(angle),0, sin(angle)],
        [0,1,0],
        [-sin(angle), 0,cos(angle)]
        ]
      let matrix = new Matrix(rotationX);
      return matrix.mult(vector);
    }
    
    static rotateZ(vector,angle){
      let rotationX = [
        [1,0,0],
        [0,cos(angle), -sin(angle)],
        [0,sin(angle), cos(angle)]
        ]
      let matrix = new Matrix(rotationX);
      return matrix.mult(vector);
    }
    
    
  }