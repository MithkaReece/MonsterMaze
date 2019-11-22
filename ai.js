'use strict';

class monster extends entity{
    constructor(pos){
        super(pos);
        this.nextPos = pos.copy()

        this.relayMemory = [];//QUEUE
        this.relayMemorySize = 6;//Number of samples stored in memory 
        this.sampleFraction = 0.7;//Fraction of samples that is tested as a batch

        this.policyNetwork = new neuralNetwork([6,10,8,4]);//Creates the policy network
        this.targetNetwork = new neuralNetwork([6,10,8,4]);//Create the target network the same size as target network
        this.updateTargetNetwork();//Updates target network to reflect the policy network
        this.TNInterval = 50;//How many iterations it takes to update the target network

        this.exploreThreshold = 0.7;
        this.minExploration = 0.1;
        this.explorationDecay = 0.001;

        this.state; //Monster pos, Player pos

        this.speed = 10;//Calculated based on how far it will move compared to how long it makes decisions (distance/time)

        this.iterations = 0;

        this.policyNetwork.initialiseWeights();

        this.dist;//Distance from player

        this.moveIterations = 0;


        this.tempCube = new cuboid(createVector(Math.floor(pos.x+0.1),Math.floor(pos.y),Math.floor(pos.z+0.1)),0.9,1,0.9,0,[255,20,20]);
    }

    setDist(value){
        this.dist = value;
    }
    getValue(){
        return this.dist;
    }

    move(){//nextPos never changing atm
        let dirVector = p5.Vector.sub(this.nextPos,this.pos);//direction vector from current pos to nextpos
        if(dirVector.mag()>1/this.speed){
            dirVector.setMag(1/this.speed);//Sets the speed of movement  
        }       
        this.pos.add(dirVector);//Adds the direction vector to move the monster
        this.tempCube.setPos(p5.Vector.add(dirVector,this.tempCube.getPos()))
        //this.tempCube.addPos(dirVector);
    }

    run(mazeGrid,playerPos){//Make sure playerPos is in terms of 2D x,z
        //console.log(p5.Vector.dist(playerPos,this.pos))
        if(this.moveIterations == 0){
            //Select action (explore/exploit) 
            let actionIndex = this.selectAction(playerPos,mazeGrid);//Picks an action   
            let reward = this.calcReward(mazeGrid,playerPos,actionIndex);//Calculates the reward for picked action
            
            let currentState = this.getState(playerPos,this.pos,mazeGrid);//Collect current state
            let nextState =this.getState(playerPos,this.nextPos,mazeGrid);//Collect next state
            this.storeReplayMemory(currentState,actionIndex,reward,nextState);//Store old state, action, reward, new state in replay memory
            let sample = this.getSample();//Gets a sample from relay memory
            for(let i=0;i<sample.length;i++){//Loops through the sample
                let data = sample[i];//Set data to current data in sample
                this.policyNetwork.train(data,this.targetNetwork);//Train the policy network using current data and target network
                this.iterations++;//Increment iteration counter
                if(this.iterations % this.TNInterval == 0){//Every TNInterval iterations
                    this.updateTargetNetwork();//Update the target network to match current policy network
                }
            }
            if(this.exploreThreshold > this.minExploration){//If exploration is above minimium
                this.exploreThreshold-=this.explorationDecay;//Decay exploration threshold/rate
            }         
            
            //console.log(this.relayMemory[0][3])
        }   
        this.moveIterations++;
        if(this.moveIterations>=this.speed){
            this.moveIterations = 0;
        }
        this.move()
    }
    getState(playerPos, currentPos, mazeGrid){
        let cell = mazeGrid[Math.floor(currentPos.x)][Math.floor(currentPos.z)];
        let mazeSize = mazeGrid.length;
        let diffX = (playerPos.x-currentPos.x)/(mazeSize-1);
        let diffZ = (playerPos.z-currentPos.z)/(mazeSize-1);
        return [diffX,diffZ].concat(this.swapDigits(clone(cell.getWalls())));//Return vector from current pos to player plus walls of that cell
    }
    swapDigits(list){
        return list.map(x => {
            if(x == 1){
                return 0;
            }else{
                return 1;
            }
        })
    }
    
    selectAction(playerPos,mazeGrid){
        let actionIndex;
        let directions = ["N","E","S","W"]
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
            actionIndex = indexOfMax;//Pick action with highest q-value
            //console.log("C " + directions[actionIndex])
        }else{//Exploring has been picked   
            actionIndex = Math.floor(random(4));//Pick a random action 
            //console.log("R " + directions[actionIndex])    
        }
        //console.log(this.exploreThreshold)
        //console.log(this.pos.x,this.pos.z)
        return actionIndex;
    }
    calcReward(mazeGrid,playerPos,actionIndex){
        let actions = [createVector(0,0,-1),createVector(1,0,0),createVector(0,0,1),createVector(-1,0,0)];//NESW  
        let directions = ["N","E","S","W"]
        let reward = 0;//Set reward to 0 by default
        let currentCell = mazeGrid[Math.floor(this.pos.x)][Math.floor(this.pos.z)];//find current cell monster is in
        if(currentCell.getWalls()[actionIndex]==1){//If you walk into a wall
            let p = -0//Reward for walking into a wall
            reward += p;//Negative reward for walking into a wall
        }else{
            this.nextPos.add(actions[actionIndex]);//Add to desired position    
            let distance = p5.Vector.dist(this.pos,playerPos);//Calculate distance from player
            let k = 20;//reward multiplayer to getting closer to the player 
            reward += k/(distance*distance);//Add reward based on how close to the player the monster is
        }
        
        return reward;
    }
    storeReplayMemory(oldState,actionIndex,reward,newState){
        if(this.relayMemory.length >= this.relayMemorySize){
            this.relayMemory.shift();//Dequeue if queue is full
        }
        this.relayMemory.push([oldState,actionIndex,reward,newState]);//Enqueue new memory
        //Here I can have a queue length N
        //So when data is added the first to be added is removed if full
    }
    getSample(){
        let newSample = [];
        if(this.relayMemory.length>Math.floor(this.sampleFraction*this.relayMemorySize)){//If the sample size is larger than the fraction needed
            let tempCopy = clone(this.relayMemory);//Copy relay memory
            while (newSample.length<Math.floor(this.sampleFraction*this.relayMemorySize)){//While newSample length is too small
                let i = Math.floor(Math.random(0,tempCopy.length))//Randomly pick a memory from temp (relay memory copy)
                newSample.push(tempCopy[i]);//Adds current memory to new sample
                tempCopy.splice(i,1);//Remove current memory from sample
            }
            return newSample;//Return a new random sample
        }else{
            return clone(this.relayMemory);
        }
    }
    updateTargetNetwork(){
        let weights = this.policyNetwork.getWeights();
        let copiedWeights = [];
        for(let i=0;i<weights.length;i++){
            let current = weights[i];
            let data = current.getData();
            copiedWeights.push(new Matrix(data));
        }
        this.targetNetwork.setWeights(copiedWeights);
    }
    show3D(player,perspective){
        this.tempCube.show3D(player,perspective)
    }
}

class neuralNetwork{
    constructor(layers){
        this.inputCount = layers[0];
        this.layers = layers;
        this.weights = [];
        this.setupWeights(layers);
        this.learningRate = 0.1;
        this.discountFactor = 0.7;
        this.activationFunction = this.sigmoid;
        this.derivActivationFunction = ((x) =>{return this.sigmoid(x)*(1-this.sigmoid(x))});
    }
    setupWeights(layers){
        for(let i=0;i<layers.length-1;i++){//Loop through all connections between layers
            let a = layers[i+1];
            let b = layers[i];
            this.weights.push(new Matrix(a,b));//Form a matrix representing weights between two layers
        }
    }
    initialiseWeights(){
        for(let i=0;i<this.weights.length;i++){
            let current = this.weights[i];//Current connection between two layers
            for(let cols=0;cols<current.cols;cols++){
                for(let rows=0;rows<current.rows;rows++){
                    current.data[rows][cols] = Math.random(-1,1);
                }
            }
        }
    }
    getWeights(){
        return this.weights;
    }
    setWeights(weights){
        this.weights = weights;
    }

  
    train(data,targetNetwork){
        let state = clone(data[0]);//Input state
        let actionIndex = data[1];
        let reward = data[2];
        let newState = clone(data[3]);

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

        let loss = (reward + this.discountFactor*futureQvalue) - Qvalue;//Calc loss
        //console.log(Math.round(loss*100));
        let arrayError = new Array(finalOutput.length).fill(0);//Make an array to place loss in
        arrayError[actionIndex] = loss;//Add in loss
        let matrixError = new Matrix(arrayError);//Convert to matrix

        this.gradientDecent(matrixError,outputs);//Use gradient descent to update weights to reduce
        //onsole.log(this.weights[0].getData()[0]);

        //To calculate loss feedforward with new state
        //From feeding forward new state save the highest q-value
        //Use highest q-value in loss equation 

        //Call gradient decent on the network
    }
    feedForward(inputs){
        let outputs = [];
        if(inputs.length != this.inputCount){//If the amount of inputs is not correction
            return null;
        }
        let iMatrix = new Matrix(clone(inputs));//Turn inputs into a matrix
        outputs.push(new Matrix(clone(iMatrix.getData())));
        for(let i=0;i<this.weights.length;i++){//Loops through the layers
            let currentWeights = this.weights[i];
            iMatrix = Matrix.multiply(currentWeights,iMatrix);//Times by the weights of
            iMatrix = Matrix.map(iMatrix,this.activationFunction) //<= need to fix so activation function acc works
            outputs.push(new Matrix(clone(iMatrix.getData())));
        }
        //console.log(outputs)
        return outputs.reverse();//Workss
    }

    gradientDecent(matrixError,outputs){
        //Updates weights based on loss 
        //Account learning rate
        //this.printNetwork()
        let currentErrors = matrixError;//Define the intital output error (q error)
        for(let i=0;i<this.layers.length-1;i++){//Loop through and update all weights
            let currentOutputs = outputs[i]//Sets current outputs
            let currentInputs = outputs[i+1]//Set current inputs
            
            let currentTranspose = Matrix.transpose(this.weights[this.layers.length-i-2]);//Transpose the weights between current layers
            let nextError = Matrix.multiply(currentTranspose,currentErrors);//Calculate the next layers errors
            //New weights = learningRate * currentErrors * (derivative(outputs of layer)) * Transpose(inputs of layer)
            let lrCurrentErrors = Matrix.scale(currentErrors,this.learningRate);
            let outputDerivative = Matrix.map(currentOutputs,this.derivActivationFunction);//Map isn't treating it as static
            let inputTranspose = Matrix.transpose(currentInputs);
            let deltaWeights = Matrix.multiply(Matrix.elementWiseMult(lrCurrentErrors,outputDerivative),inputTranspose);
            //console.log(this.weights[i])
            //console.log(deltaWeights.getData())
            this.weights[this.layers.length-i-2].add(deltaWeights);//Update weights
            currentErrors = nextError;//Use the next errors as current for next iteration
        }
    }


    printNetwork(){
        let list = [];     
        for(let i=0;i<this.weights.length;i++){
            list = list.concat(this.weights[i].getData())
        }
        console.log(list)
    }

    sigmoid(x){
        return 1/(1 + Math.pow(Math.E,-x));
    }


}