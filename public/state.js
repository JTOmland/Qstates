var game = (function () {
    var actions = ['West', 'North', 'East', 'South'];
    var gridWorld = [];
    var opt = {
        maxReward: 1,
        minReward: -1,
        livingReward: 0,
        goalState: { x: 3, y: 0 },
        pit: { x: 3, y: 1 },
        obstacle: { x: 1, y: 1 },
        startState: { x: 0, y: 2 }

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
        console.log("checking bounds for", x, y);
        if (x < 0 || x >= cols || y < 0 || y >= rows) {
            console.log('returning false from checkBounds for outside world')
            return false;
        }
        if (x == obstacle.x && y == obstacle.y) {
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
            console.log("checking st", st);
            console.log('nextState', nextState);
            if (st.location.x == nextState.x && st.location.y == nextState.y) {
                returnState = st;
                console.log("setting returnState", returnState)

            }
        }
        console.log('checking if state is goal or pit')
        if (state.type == 'goal' || state.type == 'pit') {
            console.log('checking if state is goal or pit')
            gridWorld.forEach(function (s) {
                console.log("state", s, " : opt.startState", opt.startState.x, opt.startState.y);
                if (s.location.x == opt.startState.x && s.location.y == opt.startState.y) {
                    console.log('checking if state is goal returning state', s);
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
            if (actionIndex - move < 0) {
                actualAction = actions[actions.length - 1]
            } else if (actionIndex - move > actions.length - 1) {
                actualAction = actions[0];
            } else {
                actualAction = actions[actionIndex - move];
            }
            console.log('actual action ', actualAction);
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


        console.log('trnasition state returned is ', returnState);
        return returnState;
    }

    function calculateValue(fromState, currentState, action) {
        if (fromState.type == 'goal' || fromState.type == 'pit') {
            return;
        }
        // value = value + learningRate * (reward - value)
        console.log('fromstate and currentstate', fromState, currentState, action)
        var reward = currentState.value;
        fromState.value = fromState.value + learningRate * (reward - fromState.value);

        //the Q has to be max of of rewards given you can play optimally
        var maxQ = 0;
        if (currentState.type == 'goal' || currentState.type == 'pit') {
            fromState.qState[action].value = fromState.qState[action].value + learningRate * (currentState.value - Math.abs(fromState.qState[action].value))
        } else {
            for (var act in currentState.qState) {
                if (currentState.qState[act].value > maxQ) {
                    maxQ = currentState.qState[act].value;
                }

            }
            fromState.qState[action].value = fromState.qState[action].value + learningRate * (maxQ - Math.abs(fromState.qState[action].value))


        }
        // if (fromState.type == 'goal') {
        //     maxQ = reward;
        //     fromState.qState[action].value = fromState.qState[action].value + learningRate * (maxQ -fromState.qState[action].value);

        // } else if (fromState == 'pit') {
        //     maxQ = reward;
        //     console.log('entered pit and maxQ is reward of ', maxQ);
        //     fromState.qState[action].value = fromState.qState[action].value + learningRate * (maxQ + fromState.qState[action].value);
        // } else {
        //     fromState.qState[action].value = fromState.qState[action].value + learningRate * (maxQ -fromState.qState[action].value);
        // }
        console.log('calculate value end is ', fromState.qState[action].value, action)
        fromState.qState[action].count++;
    }

    State.prototype.init = function (x, y, type) {
        this.type = type || 'node'
        this.location = createVector(x, y);
        this.qState = {};
        this.value = 0;
        for (var act of actions) {
            console.log("Initialize state qstates ", act)
            this.qState[act] = {};
            this.qState[act].value = 0;
            this.qState[act].count = 0;
        }
        if (this.location.x == opt.goalState.x && this.location.y == opt.goalState.y) {
            console.log("stateVector is equal goalState")
            this.value = opt.maxReward;
            this.type = 'goal';

        }
        if (this.location.x == opt.pit.x && this.location.y == opt.pit.y) {
            this.value = opt.minReward;
            this.type = 'pit';

        }
        // if (this.location.x == opt.startstate.location.x && this.location.y == opt.startstate.location.y) {
        //     pit = stateVector;

        //     startState = stateVector;
        //     currentState = startState;
        // }

        if (this.location.x == opt.obstacle.x && this.location.y == opt.obstacle.y) {
            this.type = 'obstacle';
        }

    }

    return {
        State: State,
        init: init,
        transition: transition,
        calculateValue: calculateValue
    }
})();