var game = (function () {
    var actions = ['West', 'North', 'East', 'South'];
    var gridWorld = [];
    var totalCount = 0;
    var opt = {
        maxReward: 1,
        minReward: -1,
        livingReward: -0.1,
        goalState: { x: 3, y: 0 },
        pit: { x: 3, y: 1 },
        obstacle: { x: 1, y: 1 },
        startState: { x: 0, y: 2 },
        learningRate: 0.5
    }
    function init(options) {
        if (options) {
            for (var i in options) {
                if (opt.hasOwnProperty(i)) {
                    opt[i] = options[i]
                }
            }
        }
    }

    function State(x, y, type) {
        this.init(x, y, type);
        gridWorld.push(this);
    }

    function checkBounds(x, y) {
        if (x < 0 || x >= cols || y < 0 || y >= rows) {
            return false;
        }
        if (x == opt.obstacle.x && y == opt.obstacle.y) {
            //hit an obstacle
            return false;
        }
        return true;
    };

    function transition(state, action) {
        console.log('transition function for ', state, action);
        var actionIndex = actions.indexOf(action);
        var actualAction = action;
        var nextState = {};
        var returnState = state;
        nextState.x = state.location.x;
        nextState.y = state.location.y;

        function matchStates(st) {
            if (st.location.x == nextState.x && st.location.y == nextState.y) {
                returnState = st;
            }
        }
        if (state.type == 'goal' || state.type == 'pit') {
            gridWorld.forEach(function (s) {
                if (s.location.x == opt.startState.x && s.location.y == opt.startState.y) {
                    returnState = s;
                }
            });
        } else {
            rnd = random();
            var move;
            if (rnd <= .1) {
                move = -1;
            } else if (rnd <= .2) {
                move = 1;
            } else {
                move = 0;
            }
            //todo: this is temp override so no random movement.
            //move = 0;
            if (actionIndex - move < 0) {
                actualAction = actions[actions.length - 1]
            } else if (actionIndex - move > actions.length - 1) {
                actualAction = actions[0];
            } else {
                actualAction = actions[actionIndex - move];
            }
            switch (actualAction) {
                case 'North':
                    if (checkBounds(state.location.x, state.location.y - 1)) {
                        nextState.y--;
                        gridWorld.forEach(matchStates);
                    }
                    break;
                case 'East':
                    if (checkBounds(state.location.x + 1, state.location.y)) {
                        nextState.x++;
                        gridWorld.forEach(matchStates);
                    }
                    break;
                case 'West':
                    if (checkBounds(state.location.x - 1, state.location.y)) {
                        nextState.x--;
                        gridWorld.forEach(matchStates);
                    }
                    break;
                case 'South':
                    if (checkBounds(state.location.x, state.location.y + 1)) {
                        nextState.y++;
                        gridWorld.forEach(matchStates);
                    }
                    break;
                default:
                    returnState = state;
                    break;
            }
        }
        return returnState;
    }

    

    function calculateValue(fromState, currentState, action) {
        if (fromState.type == 'goal' || fromState.type == 'pit') {
            return;
        }
        // value = value + learningRate * (reward - value)
        var reward = currentState.value;
        fromState.value = fromState.value + opt.learningRate * (reward - fromState.value);

        //the Q has to be max of of rewards given you can play optimally
        var maxQ = 0;
        if (currentState.type == 'goal' || currentState.type == 'pit') {
            fromState.qState[action].value = fromState.qState[action].value + opt.learningRate * (currentState.value - fromState.qState[action].value);
        } else {
            for (var act in currentState.qState) {
                if (currentState.qState[act].value > maxQ) {
                    maxQ = currentState.qState[act].value;
                }
            }
            fromState.qState[action].value = fromState.qState[action].value + opt.learningRate * (maxQ - fromState.qState[action].value);
        }
        fromState.qState[action].count++;
        totalCount++;
    }

    State.prototype.init = function (x, y, type) {
        this.type = type || 'node'
        this.location = createVector(x, y);
        this.qState = {};
        this.value = 0;
        for (var act of actions) {
            this.qState[act] = {};
            this.qState[act].value = 0;
            this.qState[act].count = 0;
        }
        if (this.location.x == opt.goalState.x && this.location.y == opt.goalState.y) {
            this.value = opt.maxReward;
            this.type = 'goal';
        }
        if (this.location.x == opt.pit.x && this.location.y == opt.pit.y) {
            this.value = opt.minReward;
            this.type = 'pit';
        }

        if (this.location.x == opt.obstacle.x && this.location.y == opt.obstacle.y) {
            this.type = 'obstacle';
        }

    }

    State.prototype.getBestAction = function() {
       // console.log('State.getBestAction', this);
            var maxQ = 0;
            var bestAction = random(actions);
            console.log("this.qState", this.qState);
            for (var act in this.qState) {
                console.log("in loop", act)
                if (this.qState[act].value + Math.sqrt(2*Math.log2(totalCount/this.qState[act].count)) > maxQ) {
                    maxQ = this.qState[act].value + Math.sqrt(2*Math.log2(totalCount/this.qState[act].count));
                    console.log("maxQ for ", act, " is ", maxQ);
                    bestAction = act;
                }
            }
            return bestAction;
    }

    return {
        State: State,
        init: init,
        transition: transition,
        calculateValue: calculateValue
    }
})();