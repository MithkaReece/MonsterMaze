

class monster extends entity{
    constructor(pos){
        super(pos);
        this.relayMemory = [];//QUEUE
        this.maxMemory = 6;//How far back the ai can remember
        this.policyNetwork = new neuralNetwork(2,5,3);//Creates the policy network
        this.targetNetwork = new neuralNetwork(2,5,3);//Create the target network the same size as target network
        this.updateTargetNetwork();//Updates target network to reflect the policy network

        this.exploreThreshold = 1;
        this.minExploration = 0.1;
        this.explorationDecay = 0.001;

        this.state; //Monster pos, Player pos

        this.speed;//Calculated based on how far it will move compared to how long it makes decisions (distance/time)
        this.nextPos = pos;//Pos that it is current travelling to

        this.policyNetwork.initialiseWeights();
    }

    move(){
        let accuracy = 10;
        if(Math.floor(accuracy*this.nextPos.x) == Math.floor(accuracy*this.pos.x) && Math.floor(accuracy*this.nextPos.y) == Math.floor(accuracy*this.pos.y)){
            return;//If nextPos is equal to pos
        } 
        let dirVector = p5.Vector.sub(this.nextPos,this.pos);//direction vector from current pos to nextpos
        dirVector.setMag(speed);//Sets the speed of movement
        this.pos.add(dirVector);//Adds the direction vector to move the monster
    }

    run(mazeGrid,playerPos){//Make sure playerPos is in terms of 2D x,z
        //Select action (explore/exploit)
        let actions = [createVector(0,1),createVector(1,0),createVector(0,-1),createVector(-1,0)];//NESW   
        let actionPickedIndex;
        if(Math.random(1)>this.exploreThreshold){//If exploitation is needed
            let outputs = this.policyNetwork.feedForward([this.pos,playerPos]);//Find q-values through neural network
            let max = outputs[0];
            let indexOfMax = 0;
            for(let i=1;i<outputs.length;i++){//Find max q-value
                if(outputs[i] > max){
                    max = outputs[i];
                    indexOfMax = i;
                }
            }
            actionPickedIndex = indexOfMax;//Pick action with highest q-value
        }else{//Exploring has been picked
            //Pick a random action               
            actionPickedIndex = Math.floor(math.random(4));
        }


        //To execute action
        //Validate movement against maze
        //Saved the changed position of the monster
        

        //note new state based on action
        //Save reward and new state
        let reward = 0;
        let currentCell = mazeGrid[Math.floor(this.pos.x)][Math.floor(this.pos.y)];
        if(currentCell.getWalls()[actionPickedIndex]==1){//If you walk into a wall
            let p = 1
            reward -= p;//Negative reward for walking into a wall
        }else{
            this.nextPos = p5.Vector.add(this.pos, actions[actionPickedIndex])//Moves monster based on action
        }
        
        let distance = p5.Vector.dist(this.pos,playerPos);
        let k = 5;
        reward += k/distance;//Add reward based on how close to the player the monster is

        //Store old state, action, reward, new state in replay memory
        this.storeReplayMemory(this.pos,actionPickedIndex,reward,this.nextPos);
        
        //Get sample from memory
        //Loop train for all of sample
        let sample;
        for(let i=0;i<sample.length;i++){
            let data = sample[i];
            this.policyNetwork.train(data,targetNetwork);
        }
        if(this.exploreThreshold > this.minExploration){//If exploration is above minimium
            this.exploreThreshold-=this.explorationDecay;//Decay exploration threshold/rate
        }
    }
    storeReplayMemory(oldState,actionIndex,reward,newState){
        if(this.relayMemory.length >= maxMemory){
            this.relayMemory.shift();//Dequeue if queue is full
        }
        this.relayMemory.push([oldState,actionIndex,reward,newState]);//Enqueue new memory
        //Here I can have a queue length N
        //So when data is added the first to be added is removed if full
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

    show(){

    }

}

class neuralNetwork{
    constructor(layers){
        this.inputCount = layers[0];
        this.weights = [];
        this.setupWeights(layers);
        this.learningRate = 0.1;
        this.discountFactor = 0.7;
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
            for(let cols=0;i<current.cols;i++){
                for(let rows=0;i<current.rows;i++){
                    current.data[rows][cols] =  Math.random(-1,1);
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
        if(inputs.length != this.inputCount){//If the amount of inputs is not correction
            return null;
        }
        let iMatrix = new Matrix(inputs);//Turn inputs into a matrix
        for(let i=0;i<this.weights.length;i++){//Loops through the layers
            let currentWeights = this.weights[i];
            iMatrix = Matrix.multiply(currentWeights,iMatrix);//Times by the weights of connections
        }
        return matrixToArray(iMatrix);//Return the outputs
    }
    train(data,targetNetwork){
        let state = data[0];//Input state
        let actionIndex = data[1];
        let reward = data[2];
        let newState = data[3];

        let inputs = state;//Add normalization
        let outputs = this.feedForward(inputs);//Feed forward inputs
        let Qvalue = outputs[actionIndex]//Using action index to select the q-value we are working with

        let futureOutputs = targetNetwork.feedForward(newState);//Gets outputs from future decision from targetNetwork
        let futureQvalue = futureOutputs[0];//Max future Q value
        for(let i=1;i<futureOutputs.length;i++){//Find max q-value
            if(futureOutputs[i] > futureQvalue){//If q-value is larger than past max
                futureQvalue = futureOutputs[i];//Override max if higher max
            }
        }

        let loss = (reward + this.discountFactor*futureQvalue) - Qvalue;
        //To calculate loss feedforward with new state
        //From feeding forward new state save the highest q-value
        //Use highest q-value in loss equation 

        //Call gradient decent on the network
    }

    gradientDecent(){
        //Updates weights based on loss 
        //Account learning rate

    }

}