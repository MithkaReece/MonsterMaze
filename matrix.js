'use strict';


//Matrix class is responsible for storing matrices as well as any matrix operation that this program uses
//This basically contains a mini library of matrix operations used in the program for 3D graphics and neural networks.
class Matrix{//Done
  constructor(rowsOrData,cols){//
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
  }//
  
  insert(array){//Inserts a 2D array into the matrix by replacing its data
    this.data = array;//Set data to a given array
  }//
  
  static elementWiseMult(matrixA,matrixB){//Returns a new matrix after multiplying every corresponding elements of two given matrices
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
    return null//R//eturn null as elementWiseMultiplication is not possible between these two matrices
  }

  map(fn){//apply a function to every element of this matrix
      for(let i=0;i<this.rows;i++){//Loop through all rows of matrix
        for(let j=0;j<this.cols;j++){//Loop through all columns of matrix
          let val = this.data[i][j];//Set val to current element
          this.data[i][j] = fn(val,i,j);//Set current element to result of a function applied to the current element 
        }
      }
    return this;//Return this matrix
  }//  
  static map(matrix,fn){//Maps a function to every element of a given matrix and returns the new matrix
    let newData = clone(matrix.getData());//Grabs a copy of the data in the matrix
    for(let i=0;i<matrix.rows;i++){//For every rows
      for(let j=0;j<matrix.cols;j++){//For every cols
        newData[i][j] = fn(matrix.getData()[i][j]);//newData is copied list at row,col with the function applied to element
      }
    }
    return new Matrix(newData);//Return a new matrix with the changed data
  }//
  multiply(m){//Multiplies this matrix to a given matrix or vector and returns the new result
    if(m instanceof Matrix){//If given m is a matrix
      this.data() = Matrix.multiply(this,m).getData();//Returns the result of the matrix matrix multiplication
    }else if(m instanceof p5.Vector){//If given m is a vector
      return matrixToVector(Matrix.multiply(this,new Matrix(vectorToArray(m))))//Return the vector result from the multipication
      }
    }//
  static multiply(matrixA,matrixB){//Multiplies two given matrices together and returns the new matrix made from the result of the multiplication
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
  }//
  add(n){//Add a given matrix element wise to the this matrix or add a given constant to every element of this matrix
    if(n instanceof Matrix){
      return this.map((e, i, k) => e + n.getData()[i][k]);//Adding a matrix to current matrix by adding each elements
    }else{
      return this.map(e => e + n);//Adding a given value to every element of this matrix
    }
  }// 
  //Returns a new matrix that has been transposed, meaning the columns become the rows and vise versa
  static transpose = (m) => {return new Matrix(m.cols, m.rows).map((_, i, k) => m.data[k][i])}
  //
  //Returns a new matrix after multiplying each element of a given matrix by a given scalar
  static scale = (matrix,scalar) => {return new Matrix(matrix.getData().map(x=>x*scalar))}
  //
  static rotateX(vector,angle){//Returns a new vector after applying a rotation round the x axis using a given angle and vector
    let rotation = [
      [cos(angle), -sin(angle),0],
      [sin(angle), cos(angle),0],
      [0,0,1]
      ]//Defined rotation matrix round the x axis as an array
    let matrix = new Matrix(rotation);//Convert rotation matrix array into an matrix
    return matrix.multiply(vector);//Returns the given vector after multiplied by rotation matrix
  }//
  
  static rotateY(vector,angle){//Returns a new vector after applying a rotation round the y axis using a given angle and vector
    let rotation = [
      [cos(angle),0, sin(angle)],
      [0,1,0],
      [-sin(angle), 0,cos(angle)]
      ]//Defined rotation matrix round the y axis as an array
    let matrix = new Matrix(rotation);//Convert rotation matrix array into an matrix
    return matrix.multiply(vector);//Returns the given vector after multiplied by rotation matrix
  }//
  
  static rotateZ(vector,angle){//Returns a new vector after applying a rotation round the z axis using a given angle and vector
    let rotation = [
      [1,0,0],
      [0,cos(angle), -sin(angle)],
      [0,sin(angle), cos(angle)]
      ]//Defined rotation matrix round the z axis as an array
    let matrix = new Matrix(rotation);//Convert rotation matrix array into an matrix
    return matrix.multiply(vector);//Returns the given vector after multiplied by rotation matrix
  }//
}