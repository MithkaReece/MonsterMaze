function VtoArray(vector){
    let arr;
    if(vector.z != undefined){
      arr = make2Darray(3,1);
    }else{
      arr = make2Darray(2,1); 
    }
    arr[0][0] = vector.x;
    arr[1][0] = vector.y;
    if(vector.z != undefined){
      arr[2][0] = vector.z; 
    }
    return arr;
  }
  function toVector(matrix){
    let vector = createVector();
    vector.x = matrix[0];
    vector.y = matrix[1];
    if(matrix.length > 2){
      vector.z = matrix[2]; 
    }
    return vector;
  }
  function make2Darray(cols,rows){
    //Creates 1D array full of nulls then replaces the nulls with arrays making a 2D array
    return new Array(cols).fill().map(item =>(new Array(rows))) 
  }