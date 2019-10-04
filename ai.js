

class monster extends entity{
    constructor(pos){
        super(pos);
        this.relayMemory = [];//QUEUE
        this.net = new neuralNetwork(3,5,3);
        this.exploreThreshold = 1;
        this.explorationDecay = 0.001;

        this.state; //Monster pos, Player pos

        this.net.initialiseWeights();
    }

    run(maze,playerPos){
        //Select action (explore/exploit)
        //note new state based on action
        //Save reward and new state
        //Store old state, action, reward, new state in replay memory
        this.storeReplayMemory();
        
        //Get sample from memory
        //Loop train for all of sample
        net.train();

    }
    storeReplayMemory(oldState,action,reward,newState){
        //Here I can have a queue length N
        //So when data is added the first to be added is removed if full
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
    }
    setupWeights(layers){
        for(let i=0;i<layers.length-1;i++){//Loop through all connections between layers
            let a = layers[i+1];
            let b = layers[i];
            this.weights.push(new Matrix(a,b));//Form a matrix representing weights between two layers
        }
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

    train(){
        //normalize state (input)
        //Feed forward inputs
        //Save outputs

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