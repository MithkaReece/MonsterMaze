

class monster extends entity{
    constructor(pos){
        super(pos);
        this.nextPos = this.pos.copy();

        this.relayMemory = [];//QUEUE
        this.relayMemorySize = 6;//Number of samples stored in memory 
        this.sampleFraction = 0.7;//Fraction of samples that is tested as a batch

        this.policyNetwork = new neuralNetwork([4,5,3]);//Creates the policy network
        this.targetNetwork = new neuralNetwork([4,5,3]);//Create the target network the same size as target network
        this.updateTargetNetwork();//Updates target network to reflect the policy network
        this.TNInterval = 50;//How many iterations it takes to update the target network

        this.exploreThreshold = 1;
        this.minExploration = 0.1;
        this.explorationDecay = 0.001;

        this.state; //Monster pos, Player pos

        this.speed = 1;//Calculated based on how far it will move compared to how long it makes decisions (distance/time)
        this.nextPos = pos;//Pos that it is current travelling to

        this.iterations = 0;

        this.policyNetwork.initialiseWeights();

        this.dist;//Distance from player
    }

    setDist(value){
        this.dist = value;
    }
    getValue(){
        return this.dist;
    }

    move(){//nextPos never changing atm
        let acc = 1;//
        console.log("-------")
        console.log(this.pos.x,this.pos.z);
        console.log(this.nextPos.x,this.nextPos.z);
        console.log("--------")
        if(Math.floor(acc*this.nextPos.x) == Math.floor(acc*this.pos.x) && Math.floor(acc*this.nextPos.z) == Math.floor(acc*this.pos.z)){    
            return;//If nextPos is equal to pos
        } 
        let dirVector = p5.Vector.sub(this.nextPos,this.pos);//direction vector from current pos to nextpos
        if(dirVector.mag()>this.speed){
            dirVector.setMag(this.speed);//Sets the speed of movement
        }       
        this.pos.add(dirVector);//Adds the direction vector to move the monster
    }

    run(mazeGrid,playerPos){//Make sure playerPos is in terms of 2D x,z
        //Select action (explore/exploit) 
        let actionIndex = this.selectAction(playerPos);//Picks an action   
        let reward = this.calcReward(mazeGrid,playerPos,actionIndex);//Calculates the reward for picked action
        //Store old state, action, reward, new state in replay memory
        this.storeReplayMemory([this.pos.x,this.pos.z,playerPos.x,playerPos.z],actionIndex,reward,[this.nextPos.x,this.nextPos.z,playerPos.x,playerPos.z]);
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
        this.move()
    }
    selectAction(playerPos){
        let actionIndex;
        if(Math.random(1)>this.exploreThreshold){//If exploitation is needed
            let outputs = matrixToArray(this.policyNetwork.feedForward([this.pos.x,this.pos.z,playerPos.x,playerPos.z])[0]);//Find q-values through neural network
            let max = outputs[0];//Defaults first q value as max
            let indexOfMax = 0;//Defaults index of max as first index
            for(let i=1;i<outputs.length;i++){//Loop through all q values
                if(outputs[i] > max){//If current q value is larger than max
                    max = outputs[i];//Set current q value to max
                    indexOfMax = i;//Set index of max to current index
                }
            }
            actionIndex = indexOfMax;//Pick action with highest q-value
        }else{//Exploring has been picked         
            actionIndex = Math.floor(Math.random(4));//Pick a random action 
        }
        return actionIndex;
    }
    calcReward(mazeGrid,playerPos,actionIndex){
        let actions = [createVector(0,0,1),createVector(1,0,0),createVector(0,0,-1),createVector(-1,0,0)];//NESW  
        let reward = 0;//Set reward to 0 by default
        //console.log(Math.floor(this.pos.x),Math.floor(this.pos.z))
        let currentCell = mazeGrid[Math.floor(this.pos.x)][Math.floor(this.pos.z)];//find current cell monster is in
        if(currentCell.getWalls()[actionIndex]==1){//If you walk into a wall
            let p = -1//Reward for walking into a wall
            reward += p;//Negative reward for walking into a wall
        }else{
            console.log("Adds")
            console.log(this.nextPos.x,this.nextPos.y)
            this.nextPos.add(actions[actionIndex]);
            console.log(this.pos.x,this.pos.y)
            console.log(this.nextPos.x,this.nextPos.y)
            ///this.nextPos = p5.Vector.add(this.pos,actions[actionIndex])//Moves monster based on action   
        }
        console.log("Anything")
        //console.log(this.nextPos.x,this.nextPos.y);
        let distance = p5.Vector.dist(this.pos,playerPos);//Calculate distance from player
        let k = 5;//reward multiplayer to getting closer to the player
        return reward += k/distance;//Add reward based on how close to the player the monster is
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
            let temp = this.relayMemory.slice();//Copy relay memory
            while (newSample.length<Math.floor(this.sampleFraction*this.relayMemorySize)){//While newSample length is too small
                let i =Math.floor(Math.random(0,temp.length))//Randomly pick a memory from temp (relay memory copy)
                newSample.push(temp[i]);//Adds current memory to new sample
                temp.splice(i,1);//Remove current memory from sample
            }
            return newSample;//Return a new random sample
        }else{
            return this.relayMemory;
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

    show3D(){

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

    feedForward(inputs){
        let outputs = [];
        if(inputs.length != this.inputCount){//If the amount of inputs is not correction
            return null;
        }
        let iMatrix = new Matrix(inputs);//Turn inputs into a matrix
        outputs.push(new Matrix(iMatrix.getData()));
        for(let i=0;i<this.weights.length;i++){//Loops through the layers
            let currentWeights = this.weights[i];
            iMatrix = Matrix.multiply(currentWeights,iMatrix);//Times by the weights of
            iMatrix = Matrix.map(iMatrix,this.activationFunction) //<= need to fix so activation function acc works
            outputs.push(new Matrix(iMatrix.getData()));
        }
        //console.log(outputs)
        return outputs.reverse();//Workss
    }
    train(data,targetNetwork){
        let state = data[0];//Input state
        let actionIndex = data[1];
        let reward = data[2];
        let newState = data[3];
        //console.log(state)
        let inputs = state;//Add normalization
        //console.log(data)
        let outputs = this.feedForward(inputs);//Feed forward inputs
        //console.log(outputs)
        let finalOutput = matrixToArray(outputs[0])
        //console.log(finalOutput)
        let Qvalue = finalOutput[actionIndex]//Using action index to select the q-value we are working with
        let futureOutputs = matrixToArray(targetNetwork.feedForward(newState)[0]);//Gets outputs from future decision from targetNetwork
        
        let futureQvalue = futureOutputs[0];//Max future Q value
        for(let i=1;i<futureOutputs.length;i++){//Find max q-value
            if(futureOutputs[i] > futureQvalue){//If q-value is larger than past max
                futureQvalue = futureOutputs[i];//Override max if higher max
            }
        }

        let loss = (reward + this.discountFactor*futureQvalue) - Qvalue;//Calc loss
        //console.log(loss)
        let arrayError = new Array(outputs.length);//Make an array to place loss in
        arrayError = arrayError.fill(0);//Fill array with 0s
        arrayError[actionIndex] = loss;//Add in loss
        let matrixError = new Matrix(arrayError);//Convert to matrix
        //console.log(matrixError)
        this.gradientDecent(matrixError,outputs);//Use gradient descent to update weights to reduce
        //To calculate loss feedforward with new state
        //From feeding forward new state save the highest q-value
        //Use highest q-value in loss equation 

        //Call gradient decent on the network
    }

    gradientDecent(matrixError,outputs){
        //Updates weights based on loss 
        //Account learning rate
        //this.printNetwork()
        let currentErrors = matrixError;//Define the intital output error (q error)
        for(let i=0;i<this.layers.length-1;i++){//Loop through and update all weights
            let currentOutputs = outputs[i]
            let currentInputs = outputs[i+1]
            
            let currentTranspose = Matrix.transpose(this.weights[this.layers.length-i-2]);//Transpose the weights between layers
            let nextError = Matrix.multiply(currentTranspose,currentErrors);//Calculate the next layers errors
            //New weights = learningRate * currentErrors * (derivative(outputs of layer)) * Transpose(inputs of layer)
            let lrCurrentErrors = Matrix.scale(currentErrors,this.learningRate);
            let outputDerivative = Matrix.map(currentOutputs,this.derivActivationFunction);//Map isn't treating it as static
            let inputTranspose = Matrix.transpose(currentInputs);
            let deltaWeights = Matrix.multiply(Matrix.elementWiseMult(lrCurrentErrors,outputDerivative),inputTranspose);
            //console.log(this.weights[i])
            //console.log(deltaWeights)
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