'use strict';
//Monster class inherits entity so that it can be a moveable object within the program.
//It is defined by is position and generates its own decision making process.
//This is done by inititating two neural networks and having a complex training
//process run everytime the monster is updated to experiment and learn to find
//the user moving around the maze with the objective of catching the user.
class monster extends entity{//Done
    constructor(pos){//
        super(pos);
        this.nextPos = pos.copy()//Defines nextPos as a copy of the given position
        this.distAway;//Distance from player
        this.relayMemory = new Queue(6);//Defines the relayMemory as a queue of memories size 6
        
        this.Cuboid = new cuboid(createVector(Math.floor(pos.x)+0.25,Math.floor(pos.y),Math.floor(pos.z)+0.25),0.5,1,0.5,0,[255,20,20]);
        this.policyNetwork = new neuralNetwork([6,10,8,4]);//Creates the policy network
        this.targetNetwork = new neuralNetwork([6,10,8,4]);//Create the target network the same size as target network
        this.updateTargetNetwork();//Updates target network to reflect the policy network
        this.TNInterval = 50;//How many iterations it takes to update the target network
        this.exploreThreshold = 0.7;//Define exploreThreshold as the starting probability of the ai choosing to explore randomly
        this.minExploration = 0.1;//Define minExploration as the minimum probability of the ai choosing to explore randomly
        this.explorationDecay = 0.005;//Define explorationDecay as the amount the exploreThreshold decreasing each run through

        this.sampleFraction = 0.7;//Fraction of samples that is tested as a batch
        this.moveIterations = 0;//Define the number of iterations since the ai has made a decision while the ai is moving
        this.targetNIterations = 0;//Define the number of iterations since copying the policy network to the target network
        this.speed = 10;//Calculated based on how far it will move compared to how long it makes decisions (distance/time)
    }
    print(){
        console.table(this.relayMemory.getData());
    }
    getValue(){//Get property for the distance of the monster to the player used for sorting
        return this.distAway;//Returns the distance from the monster to the player
    }//
    setDist(value){//Set property for the distance of the monster to the player
        this.distAway = value;//Sets distAway to the given value
    }//
    //run is responsible for running the monster by moving the monster as well as the monster making a decision
    //of where it wants to move every certain interval which the monster will then move towards.
    run(mazeGrid,playerPos){//
        if(this.moveIterations == 0){//If ai has finished moving make next decision (if moveIterations is 0)
            let actionIndex = this.selectAction(playerPos,mazeGrid);//Picks an action either from exploring or exploiting from information it has learnt 
            let reward = this.calcReward(mazeGrid,playerPos,actionIndex);//Calculates the reward for picked action
            
            let currentState = this.getState(playerPos,this.pos,mazeGrid);//Collect current state
            let nextState =this.getState(playerPos,this.nextPos,mazeGrid);//Collect next state
            this.relayMemory.enqueue([currentState,actionIndex,reward,nextState])//Store old state, action, reward, new state in replay memory
            
            let sample = this.getSample();//Gets a sample from relay memory
            for(let i=0;i<sample.length;i++){//Loops through the sample
                let data = sample[i];//Set data to current data in sample
                this.policyNetwork.train(data,this.targetNetwork);//Train the policy network using current data and target network
                this.targetNIterations++;//Increment iteration counter
                if(this.targetNIterations % this.TNInterval == 0){//Every TNInterval iterations
                    this.updateTargetNetwork();//Update the target network to match current policy network
                }
            }
            if(this.exploreThreshold > this.minExploration){//If exploration is above minimium
                this.exploreThreshold-=this.explorationDecay;//Decay exploration threshold/rate
            }         
        }   
        this.moveIterations++;//Increment up moveIterations
        if(this.moveIterations>=this.speed){//If moveIterations is equal to or greater than monster's speed
            this.moveIterations = 0;//Rest moveIterations to 0 to trigger next decision
        }
        this.move()//Move the monster towards the decided next position
    }
    //move is responsible for actually changing the position of the monster close to the decided position it wants to go to.
    move(){//
        let dirVector = p5.Vector.sub(this.nextPos,this.pos);//direction vector from current pos to nextpos
        if(dirVector.mag()>1/this.speed){//If the direction vector is too large and will overstep
            dirVector.setMag(1/this.speed);//Sets the magnitude of the direction vector based on the stored speed
        }       
        this.pos.add(dirVector);//Adds the direction vector to move the monster
        this.Cuboid.setPos(p5.Vector.add(dirVector,this.Cuboid.getPos()))//Add direction vector to monster's current position
    }
    //getState is responsible for converting given player and monster position as well as the maze data into an array that
    //represented the current state of the game that can be used an input to the monster's neural network.
    getState(playerPos, currentPos, mazeGrid){//
        let cell = mazeGrid[Math.floor(currentPos.x)][Math.floor(currentPos.z)];//Set cell to the cell the monster is currently within
        let diffX = (playerPos.x-currentPos.x)/(mazeGrid.length-1);//Calculate the difference in the monster and player's x position
        let diffZ = (playerPos.z-currentPos.z)/(mazeGrid.length-1);//Calculate the difference in the monster and player's y position
        return [diffX,diffZ].concat(this.swapDigits(clone(cell.getWalls())));//Return vector from monster's current pos to player plus walls of that cell
    }
    //swapDigits is responsible for returning a new list of binary after flipping all the 1s and 0s of a given list of binary
    swapDigits = (list) => {return list.map(x => (x == 1 ? 0 : 1))}
    //
    //selectAction is responsible for deciding which action the monster is going to pick. This can either be chosen to be a random
    //move or a move generated from the monster's neural network. The probabilty for either on to be chosen is variable so gradually changes.
    //When picked by the neural network the output is q-values for each possible move and the monster attempts the action with the biggest q-value
    selectAction(playerPos,mazeGrid){//
        let actionIndex;//Defines actionIndex
        let directions = ["North","East","South","West"]//Purely for testing
        if(random(1)>this.exploreThreshold){//If exploitation is needed
            let outputs = matrixToArray(this.policyNetwork.feedForward(this.getState(playerPos, this.pos, mazeGrid))[0]);//Find q-values through neural network
            let max = outputs[0];//Defaults first q value as max
            let indexOfMax = 0;//Defaults index of max as first index
            for(let i=1;i<outputs.length;i++){//Loop through all q values
                if(outputs[i] > max){//If current q value is larger than max
                    max = outputs[i];//Set current q value to max
                    indexOfMax = i;//Set index of max to current index
                }
            }
            //console.log(outputs[0],outputs[1],outputs[2],outputs[3]);
            actionIndex = indexOfMax;//Pick action with highest q-value
            //console.log("Calculated move = " + directions[actionIndex])
        }else{//Exploring has been picked   
            let actions = shuffle([0,1,2,3])//Shuffle a list of directions
            let cell = mazeGrid[Math.floor(this.pos.x)][Math.floor(this.pos.z)]//Set cell to the cell the monster currently is
            while (cell.getWalls()[actions[0]] == 1){//While random action walks into a wall
                actions.shift();//Remove that direction
            }
            actionIndex = Math.floor(actions[0]);//Use action at the start of actions 
            //console.log("Random move =  " + directions[actionIndex])    
        }
        //console.log(this.exploreThreshold)
        //console.log(this.pos.x,this.pos.z)
        return actionIndex;
    }
    //calcReward is responsible for calculating a reward using the current state of the game and the given chosen action.
    //If the action which is a movement is valid then it will change the nextPos which is where the monster will move towards.
    //It is only valid if the move is not blocked by a wall of the maze.
    //Finally the final reward result is return from this function.
    calcReward(mazeGrid,playerPos,actionIndex){//
        let actions = [createVector(0,0,-1),createVector(1,0,0),createVector(0,0,1),createVector(-1,0,0)];//NESW  
        let reward = 0;//Set reward to 0 by default
        let currentCell = mazeGrid[Math.floor(this.pos.x)][Math.floor(this.pos.z)];//find current cell monster is in
        if(currentCell.getWalls()[actionIndex]==1){//If you walk into a wall
            let p = -1//Reward for walking into a wall
            reward += p;//Negative reward for walking into a wall
        }else{
            this.nextPos.add(actions[actionIndex]);//Add to desired position    
            let distance = p5.Vector.dist(this.pos,playerPos);//Calculate distance from player
            let k = 50;//reward multiplayer to getting closer to the player 
            reward += k/(distance*distance);//Add reward based on how close to the player the monster is
        }
        return reward;
    }
    //getSample is responsible for returning a set number of memories from relayMemory which contain a move from one state two another
    //and the reward which was gained from doing that action. Obviously if the relayMemory is smaller than the desire sample if can only
    //return what memory is there.
    getSample(){//
        if(this.relayMemory.getCurrentLength()>Math.floor(this.sampleFraction*this.relayMemory.getLength())){//If the sample size is larger than the fraction needed
            let newSample = [];//Define new sample as an empty array
            let memoryData = this.relayMemory.getData();//Copy the relay memory data
            while (newSample.length<Math.floor(this.sampleFraction*this.relayMemory.getLength())){//While newSample length is too small
                let i = Math.floor(Math.random(0,memoryData.length))//Randomly pick a memory from temp (relay memory copy)
                newSample.push(memoryData[i]);//Adds current memory to new sample
                memoryData.splice(i,1);//Remove current memory from sample
            }
            return newSample;//Return a new random sample
        }else{
            return this.relayMemory.getData();//Returns all the relay memory data as a sample
        }
    }
    //updateTargetNetwork is responsible for basically setting the targetNetwork to a copy of the current policy network.
    //This is done so that the network is not constantly "chasing its own tail" by adjust its network towards the future policy network
    //whilst move the policy network away in the same direction which is why there is a target network in the first place.
    updateTargetNetwork(){//
        let weights = this.policyNetwork.getWeights();
        let copiedWeights = [];//Defines an empty list for the weights to be copied in
        for(let i=0;i<weights.length;i++){//Loop through each layer of weights
            let current = weights[i];//Set current to the weights between the current layer and the next
            let data = current.getData();//Set data to the matrix data of the current weights
            copiedWeights.push(new Matrix(data));//Add a copy of the matrix to copiedWeights list
        }
        this.targetNetwork.setWeights(copiedWeights);//Sete the weights of the targetNetwork to the copied weights from policy network
    }
    //show3D is responsible for showing the monster is 3D.
    show3D(player,perspective){//
        this.Cuboid.show3D(player,perspective)//Call show3D on the monster's cuboid
    }
}
//neuralNetwork is a class responsible for storing all the layers of a neural network as a list of matrices
//where all the elements represent the weights of the connection between the layers
//This is also responsible for running inputs through the neural network to find the resulting outputs after
//applying all the weights of each layer as well as adjusting the weights of the network using calculated 
//errors of the outputs by back propagating through the layers and tweaking weights using gradient descent
class neuralNetwork{//Done
    constructor(layers){//
        this.inputCount = layers[0];//Define the number of inputs for the network
        this.layers = layers;//Define layers as a list of number of nodes in each layer
        this.weights = this.setupWeights(layers);//Define weights as a list of matrices with the corresponding sizes to the layers
        this.initialiseWeights();//Initialise all the weights with random values
        this.learningRate = 0.1;//Define the learning rate as 0.1
        this.discountFactor = 0.7;//Define the discountFactor of future rewards as 0.7
        this.activationFunction = this.tanh;//Define the activationFunction as the sigmoid function
        this.derivActivationFunction = this.tanhD;//Define the derivative of the activation function as the derivative of the sigmoid function
    }
    tanh(x){//Hyperbolic tan by definition of sinh divided by cosh
        return (Math.pow(Math.E,2*x) -1)/
        (Math.pow(Math.E, 2*x) +1);
    }
    tanhD(x){//Derivate of tanh is 1-tanh^2
        return 1 - Math.pow(this.tanh(x),2);
    }
    //
    //setupWeights is responsible for create an array of matrices which are the correct size for the weights between layers.
    setupWeights(layers){//
        let weights = [];//Set weights to empty array for weights to go in
        for(let i=0;i<layers.length-1;i++){//Loop through all connections between layers
            let a = layers[i+1];//Set a to the next layer
            let b = layers[i];//Set b to the current layer
            weights.push(new Matrix(a,b));//Form a matrix representing weights between two layers
        }
        return weights;//Return new weights array
    }
    //initialiseWeights is responsible for filling the weights of random initial values.
    initialiseWeights(){//
        for(let i=0;i<this.weights.length;i++){//For every layer of the network
            let current = this.weights[i];//Set current to current weights connecting between the two current layers
            for(let cols=0;cols<current.cols;cols++){//For every column of current weights
                for(let rows=0;rows<current.rows;rows++){//For every row of current weights
                    current.data[rows][cols] = 2*Math.random()-1;//Set element to a random number between -1 and 1
                }
            }
        }
    }
    getWeights(){//Get property for the weights of the neural network
        return this.weights;//Returns the weights of the neural network
    }//
    setWeights(weights){//Set property for the weights of the neural network
        this.weights = weights;//Sets the weights of the neural network to given weights
    }//
    //train is responsible for running through the procedure of calculating the error of the neural network and
    //therefore which way to adjust the network and then using gradient descent to adjust towards reducing the error;
    train(data,targetNetwork){//
        let state = clone(data[0]);//start state from given data
        let actionIndex = data[1];//actionIndex from given data
        let reward = data[2];//reward from given data
        let newState = clone(data[3]);//new start from given data

        let outputs = this.feedForward(state);//Gets list of outputs throughout the neural network
        let finalOutput = matrixToArray(outputs[0])//Gets the last outputs of the neural network (q values)
        let Qvalue = finalOutput[actionIndex]//Using action index to select the q-value we are working with

        let futureOutputs = matrixToArray(targetNetwork.feedForward(newState)[0]);//Gets outputs from future decision from targetNetwork
        
        let futureQvalue = futureOutputs[0];//Max future Q value
        for(let i=1;i<futureOutputs.length;i++){//Find max q-value
            if(futureOutputs[i] > futureQvalue){//If q-value is larger than past max
                futureQvalue = futureOutputs[i];//Override max if higher max
            }
        }
        let loss = (reward + this.discountFactor*futureQvalue) - Qvalue;//Calculate loss of Qvalue from network and the optimum Qvalue
        let arrayError = new Array(finalOutput.length).fill(0);//Make an array to place loss in
        arrayError[actionIndex] = loss;//Add in loss to arrayError
        let matrixError = new Matrix(arrayError);//Convert arrayError to matrix
        this.gradientDecent(matrixError,outputs);//Use gradient descent to update weights to reduce
    }
    //feedForward is responsible for running given inputs through the neural network by multiplying
    //all the weight matrices in order to the given inputs to produce the outputs of the neural network.
    feedForward(inputs){//
        let outputs = [];//Set up empty array for list of outputs through the network
        if(inputs.length != this.inputCount){//If the amount of inputs is not correction
            return null;//Return null
        }
        let iMatrix = new Matrix(clone(inputs));//Turn inputs into a matrix
        outputs.push(new Matrix(clone(iMatrix.getData())));//Push a copy of the first inputs matrix to list of outputs
        for(let i=0;i<this.weights.length;i++){//Loops through the layers
            let currentWeights = this.weights[i];//Set currentWeight to the weights at the current layer
            iMatrix = Matrix.multiply(currentWeights,iMatrix);//Times the current inputs matrix by the current weights
            iMatrix = Matrix.map(iMatrix,this.activationFunction)//Maps the result matrix by the activation function
            outputs.push(new Matrix(clone(iMatrix.getData())));//Push a copy of the current outputs matrix to list of outputs
        }
        return outputs.reverse();//Return the reverse of the outputs list so that the final outputs are the first element
    }
    //gradientDescent is responsible for backpropogating through the network calculating the errors for each individual
    //nodes of every layer of the neural network and then adjust each weight towards reduces that individual error by
    //gradient descent using the derivative of the activation function.
    gradientDecent(matrixError,outputs){//
        let currentErrors = matrixError;//Define the intital output error (q error)
        for(let i=0;i<this.layers.length-1;i++){//Loop through and update all weights
            let currentOutputs = outputs[i]//Sets current outputs
            let currentInputs = outputs[i+1]//Set current inputs
            
            let currentTranspose = Matrix.transpose(this.weights[this.layers.length-i-2]);//Transpose the weights between current layers
            let nextError = Matrix.multiply(currentTranspose,currentErrors);//Calculate the next layers errors
            //New weights = learningRate * currentErrors * (derivative(outputs of layer)) * Transpose(inputs of layer)
            let lrCurrentErrors = Matrix.scale(currentErrors,this.learningRate);//Calculate the current errors scaled by the learning rate
            let outputDerivative = Matrix.map(currentOutputs,this.derivActivationFunction);//Calculate the result of applying the derivate of the activation function on to the current outputs
            let inputTranspose = Matrix.transpose(currentInputs);//Calculate the transpose the current input matrix
            let deltaWeights = Matrix.multiply(Matrix.elementWiseMult(lrCurrentErrors,outputDerivative),inputTranspose);//Calculates the change in the current layer's weights
            this.weights[this.layers.length-i-2].add(deltaWeights);//Update current layer's weights
            currentErrors = nextError;//Use the next errors as current for next iteration
        }
    }


    printNetwork(){//Will remove for testing

        for(let i=0;i<this.weights.length;i++){
            console.table(this.weights[i].getData());
        }
    }

    


}