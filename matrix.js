class Matrix{
    constructor(rowsOrData,cols){
      if(cols === undefined){//If parameter is purely data to be inserted into matrix
        this.data = clone(rowsOrData);//Define data as a clone of the given data
        this.rows = this.data.length;//Define rows as the length of the data
        if(!Array.isArray(this.data[0])){//If columns is greater than 1
          for(let i = 0;i<this.rows;i++){//Loop through each element of the array
            let array = []//Create a new array
            array.push(this.data[i]);//Add current element to array
            this.data[i] = array;//Set current element to knew array containing the element
          }
        }
        this.cols = this.data[0].length;//Define columns as the vertical length of the 2D array
      }else{//If parameter is rows and columns
      this.rows = rowsOrData;//Define rows as given rows
      this.cols = cols;//Defines cols as given columns
      this.data = Array(this.rows).fill().map(() => Array(this.cols).fill(0));//Define data as an array full of 0s with dimensions rows by columns
      }   
    }

    getData(){//Get property for the matrix data
      return clone(this.data);//Return a clone of the 2D array of data representing this matrix
    }
    
    insert(array){//Inserts a 2D array into the matrix by replacing its data
      this.data = array;//Set data to a given array
    }
    
    multiply(matrix){
     if(matrix instanceof Matrix){ //Matrix * Matrix
       return Matrix.multiply(this,matrix);
     }else if(matrix instanceof p5.Vector){ //Matrix * Vector
       return matrixToVector(Matrix.multiply(this,new Matrix(vectorToArray(matrix))))//Return the vector result from the multipication
      }
    }
    static elementWiseMult(a,b){
      if(a.cols == b.cols && a.rows == b.rows){
        let aArray = a.getData();
        let bArray = b.getData();
        if(aArray[0].length>1){//If 2D array
          for(let y=0;y<aArray.length;y++){
            for(let x=0;x<aArray[0].length;x++){
              aArray[x][y] = aArray[x][y] * bArray[x][y];
            }
          }
        }else{
          for(let i=0;i<aArray.length;i++){
            aArray[i] = aArray[i] * bArray[i];
          }
        }
        return new Matrix(aArray);
      }
      console.log("can't do element wise mult")
      return null
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
    
    static map(m,fn){//NEEDS WORK
      let newData = clone(m.getData());//Grabs a copy of the data in the matrix
      for(let i=0;i<m.rows;i++){//Loops all rows
        for(let j=0;j<m.cols;j++){//Loops all cols
          newData[i][j] = fn(m.getData()[i][j]);//Sets copied list at row,col with the function applied to element
        }
      }
      return new Matrix(newData);//Return a new matrix with the change data
    }
    
    static multiply(a,b){
        //matrix multiplication
        if(a.cols !== b.rows){
          console.log("Bad matrices");
          return;
        }
        return new Matrix(a.rows, b.cols).map((e, i, j) => {
          let element = 0;
          for (let k = 0; k < a.cols; k++) {
            element += a.getData()[i][k] * b.getData()[k][j];
          }   
          return element;
        });   
        
    }
    add(n){
      if(n instanceof Matrix){
        return this.map((e, i, k) => e + n.getData()[i][k]);//Adding a matrix to current matrix
      }else{
        return this.map(e => e + n);//Adding a constant to every term
      }
    } 
    static transpose(m){
      return new Matrix(m.cols, m.rows).map((_, i, k) => m.data[k][i]);
    }
    static scale(matrix,scalar){
      let data = matrix.getData();
      data.map(x=>x*scalar);
      return new Matrix(data);
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
      return matrix.multiply(vector);
    }
    
    static rotateZ(vector,angle){
      let rotationX = [
        [1,0,0],
        [0,cos(angle), -sin(angle)],
        [0,sin(angle), cos(angle)]
        ]
      let matrix = new Matrix(rotationX);
      return matrix.multiply(vector);
    }
    
    
  }