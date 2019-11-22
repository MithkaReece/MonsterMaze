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
    
    static elementWiseMult(matrixA,matrixB){
      if(!(matrixA instanceof Matrix && matrixB instanceof Matrix)){//If not both parameters are matrics
        return null;//Return null as invalid parameters
      }
      if(matrixA.cols == matrixB.cols && matrixA.rows == matrixB.rows){//If both given matrices have equal dimensions
        let arrA = matrixA.getData();//Set arrA to the array representing matrixA
        let arrB = matrixB.getData();//Set arrB to the array representing matrixB
        if(arrA[0].length>1){//If arrA is a 2D array
          for(let y=0;y<arrA.length;y++){//For every y index in arrA
            for(let x=0;x<arrA[0].length;x++){//For every x index in arrA
              arrA[x][y] = arrA[x][y] * arrB[x][y];//Set current arrA element to itself multiplied by current arrB element
            }
          }
        }else{//If arrA is a 1D array
          for(let i=0;i<arrA.length;i++){//For every element of arrA
            arrA[i] = arrA[i] * arrB[i];//Set current arrA element to itself multiplied by current arrB element
          }
        }
        return new Matrix(arrA);//Return a new matrix using new array data after multiplication
      }//If given matrices don't have equal dimensions
      console.log("can't do element wise mult")
      return null//Return null as elementWiseMultiplication is not possible between these two matrices
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
    static map(matrix,fn){//Maps a function to every element of a given matrix and returns the new matrix
      let newData = clone(matrix.getData());//Grabs a copy of the data in the matrix
      for(let i=0;i<matrix.rows;i++){//For every rows
        for(let j=0;j<matrix.cols;j++){//For every cols
          newData[i][j] = fn(matrix.getData()[i][j]);//newData is copied list at row,col with the function applied to element
        }
      }
      return new Matrix(newData);//Return a new matrix with the changed data
    }
    multiply(m){
      if(m instanceof Matrix){//If given m is a matrix
        this.data() = Matrix.multiply(this,m).getData();//Returns the result of the matrix matrix multiplication
      }else if(m instanceof p5.Vector){//If given m is a vector
        return matrixToVector(Matrix.multiply(this,new Matrix(vectorToArray(m))))//Return the vector result from the multipication
       }
     }
    static multiply(matrixA,matrixB){
        //matrix multiplication
        if(matrixA.cols !== matrixB.rows){//If matrixA columns is not equal to matrixB rows
          console.log("Bad matrices");//Not commutable matrices therefore cannot multiply
          return null;//Return null as no matrix can be produced
        }
        return new Matrix(matrixA.rows, matrixB.cols).map((e, i, j) => {
          let element = 0;//Define the current element as starting at 0
          for (let k = 0; k < matrixA.cols; k++) {
            element += matrixA.getData()[i][k] * matrixB.getData()[k][j];//Add the multiplication result to the current element
          }   
          return element;//Return the final element from the sum of the multiplications done
        });//Returns a new matrix produced from the multiplication of the given two matrices
        
    }
    add(n){
      if(n instanceof Matrix){
        return this.map((e, i, k) => e + n.getData()[i][k]);//Adding a matrix to current matrix by adding each elements
      }else{
        return this.map(e => e + n);//Adding a given value to every element of this matrix
      }
    } 
    //Returns a new matrix that has been transposed, meaning the columns become the rows and vise versa
    static transpose = (m) => {return new Matrix(m.cols, m.rows).map((_, i, k) => m.data[k][i])}
    static scale = (matrix,scalar) => {return new Matrix(matrix.getData().map(x=>x*scalar))}
    
    static rotateX(vector,angle){
      let rotation = [
        [cos(angle), -sin(angle),0],
        [sin(angle), cos(angle),0],
        [0,0,1]
        ]//Defined rotation matrix round the x axis as an array
      let matrix = new Matrix(rotation);//Convert rotation matrix array into an matrix
      return matrix.multiply(vector);//Returns the given vector after multiplied by rotation matrix
    }
    
    static rotateY(vector,angle){
      let rotation = [
        [cos(angle),0, sin(angle)],
        [0,1,0],
        [-sin(angle), 0,cos(angle)]
        ]//Defined rotation matrix round the y axis as an array
      let matrix = new Matrix(rotation);//Convert rotation matrix array into an matrix
      return matrix.multiply(vector);//Returns the given vector after multiplied by rotation matrix
    }
    
    static rotateZ(vector,angle){
      let rotation = [
        [1,0,0],
        [0,cos(angle), -sin(angle)],
        [0,sin(angle), cos(angle)]
        ]//Defined rotation matrix round the z axis as an array
      let matrix = new Matrix(rotation);//Convert rotation matrix array into an matrix
      return matrix.multiply(vector);//Returns the given vector after multiplied by rotation matrix
    }
    
    
  }