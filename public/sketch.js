var socket;
var rectSize;
var startingX;
var startingY;
var states = [];
var transitions = [];
var goalState = { x: 3, y: 0 };
var pit = { x: 3, y: 1 };
var obstacle = { x: 1, y: 1 };
var currentState;
var startState = { x: 0, y: 2 };
var desiredDirection = true;
var incrementMode = true;
var rows = 3;
var cols = 4;
var actions = ['West', 'North', 'East', 'South'];
var value = {};  // {x:0, y:0, value: 0}
var qValue = {}; //{x;0, y:0, action: 'East', value: 5}
var rewards = [];
var qStates = [];
var maxReward = 1;
var minReward = -1;
var livingReward = -0.1;
var gameOver = false;
var learningRate = 0.5;
var winState;
var loseState;
//return a state' based on an action from the current state

//I want three types of nodes.  path node, prize node (could be positive or neg), terminal node, obtacle
//prize node will lead only to terminal state and not displayed


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
	if (state === goalState) {
		return winState;
	}
	if (state === pit) {
		return loseState
	}
	var actionIndex = actions.indexOf(action);
	var actualAction = action;
	var nextState;
	nextState = state;
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
	switch (actualAction) {
		case 'North':
			if (checkBounds(state.x, state.y - 1)) {
				nextState = createVector(state.x, state.y - 1);
			}
			break;
		case 'East':
			if (checkBounds(state.x + 1, state.y)) {
				nextState = createVector(state.x + 1, state.y);
			}
			break;
		case 'West':
			if (checkBounds(state.x - 1, state.y)) {
				nextState = createVector(state.x - 1, state.y);
			}
			break;
		case 'South':
			if (checkBounds(state.x, state.y + 1)) {
				nextState = createVector(state.x, state.y + 1);
			}
			break;

		default:
			nextState = state;
			break;
	}
	for (s of states) {
		if (nextState.x == s.x && nextState.y == s.y) {
			nextState = s;
		}
	}
	return nextState;
}

function calculateValue(fromState, currentState, action) {
	// value = value + learningRate * (reward - value)
	var reward = value[currentState];
	value[fromState] = value[fromState] + learningRate * (reward - value[fromState]);

	//the Q has to be max of of rewards given you can play optimally
	var maxQ = 0;
	if (fromState == goalState) {
		maxQ = maxReward;
	} else if (fromState == pit) {
		maxQ = minReward;

	} else {
		for (var act in qValue[currentState]) {
			if (qValue[currentState][act].value > maxQ) {
				maxQ = qValue[currentState][act].value;
			}

		}

	}
	if (currentState == goalState) {
		maxQ = reward;
		qValue[fromState][action].value = qValue[fromState][action].value + learningRate * (maxQ - qValue[fromState][action].value);

	} else if (currentState == pit) {
		maxQ = reward;
		console.log('entered pit and maxQ is reward of ', maxQ);
		qValue[fromState][action].value = qValue[fromState][action].value + learningRate * (maxQ + qValue[fromState][action].value);

	} else {
		qValue[fromState][action].value = qValue[fromState][action].value + learningRate * (maxQ - qValue[fromState][action].value);
	}
	qValue[fromState][action].count++;
}


function keyPressed() {
	var fromState = currentState;
	if (currentState == goalState) {
		gameOver = true;
		currentState = winState;
	} else if (currentState == pit) {
		gameOver = true;
		currentState = loseState;
	} else {
		console.log("keycode", keyCode);
		desiredDirection = 'Illegal Move';
		if (incrementMode) {
			if (keyCode === LEFT_ARROW) {
				console.log('left arrow')
				currentState = transition(currentState, 'West');
				desiredDirection = 'West';
			} else if (keyCode === RIGHT_ARROW) {
				console.log('right arrow')
				currentState = transition(currentState, 'East');
				desiredDirection = 'East';
			} else if (keyCode === UP_ARROW) {
				console.log('up arrow')
				currentState = transition(currentState, 'North')
				desiredDirection = 'North';
			} else if (keyCode === DOWN_ARROW) {
				console.log('down arrow')
				currentState = transition(currentState, 'South')
				desiredDirection = 'South'
			} else {
				console.log("wrong key return")
				return;
			}


		}

	}
	calculateValue(fromState, currentState, desiredDirection);
	console.log("change currentState to start if win or lose");
	if (currentState == winState || currentState == loseState) {
		currentState = startState;
		console.log("inside if currentstate now", currentState);
	}
	loop();

}

function setup() {
	// put setup code here
	var cnv = createCanvas(1000, 1000);
	var cnvX = (windowWidth - width) / 2;
	var cnvY = (windowHeight - height) / 2;
	cnv.position(cnvX, cnvY);
	background(25);
	// socket = io.connect('http://localhost:3000');
	// socket.on('mouse', newDrawing);

	var gridWorld = [];

	rectSize = width / (max(rows, cols) + 2);
	startingX = rectSize;
	startingY = rectSize;


	//Initialize the states, transitions, q-state, rewards
	for (var y = 0; y < rows; y++) {
		for (var x = 0; x < cols; x++) {
			var stateVector = createVector(x, y);
			states.push(stateVector);
			value[stateVector] = 0;
			console.log('stateVector, startState x and y', stateVector, startState.x, startState.y);
			if (stateVector.x == goalState.x && stateVector.y == goalState.y) {
				console.log("stateVector is equal goalState")
				goalState = stateVector;

			}
			if (stateVector.x == pit.x && stateVector.y == pit.y) {
				pit = stateVector;
			}
			if (stateVector.x == startState.x && stateVector.y == startState.y) {
				startState = stateVector;
				currentState = startState;
			}

			if (stateVector.x == obstacle.x && stateVector.y == obstacle.y) {
				obstacle = stateVector;
			}
			// rewards.push(value);
			qValue[stateVector] = {};

			for (var i = 0; i < actions.length; i++) {
				qValue[stateVector][actions[i]] = {};
				qValue[stateVector][actions[i]].value = 0;
				qValue[stateVector][actions[i]].count = 0;

			}
			// qStates.push(qValue);
		}
	}

	winState = createVector(goalState.x + 1, goalState.y);
	loseState = createVector(pit.x + 1, pit.y);
	value[winState] = maxReward;;
	value[loseState] = minReward;
	qValue[winState] = {};
	qValue[loseState] = {};
	for (var i = 0; i < actions.length; i++) {
		qValue[winState][actions[i]] = {};
		qValue[loseState][actions[i]] = {};
		qValue[winState][actions[i]].value = maxReward;
		qValue[loseState][actions[i]].value = minReward;

	}

	console.table(states);
	console.table(value);
	console.table(qValue);

}

function draw() {

	var offset = rectSize;
	var m = map(value, 0, 100, 0, width);
	var rewardText;
	for (let s of states) {
		console.log('qvalue[s]', qValue[s]);

		//draw rectangles for states
		var red = 0;
		var green = 0;
		if (value[s] < 0) {
			red = map(value[s], 0, -1, 100, 255);
		} else {
			green = map(value[s], 0, 1, 100, 255);
		}

		//draw grid filled by value
		fill(red, green, 0);
		if (s === obstacle) {
			fill(100);
		}
		rect(offset + s.x * rectSize, offset + s.y * rectSize, rectSize, rectSize);

		//draw values for the states
		fill(0);
		rewardText = value[s].toFixed(1);
		textSize(20);
		text(rewardText, offset * 1.5 + s.x * rectSize, offset * 1.5 + s.y * rectSize);
		// console.log('current state', currentState);
		// console.log('s', s);


		//draw q values
		//for each state get the qvalues and iterate
		var xoff = 0;
		var yoff = 0;
		
		//console.log('qValue[s]', qValue[s])
		for (var act in qValue[s]) {
			red = 0;
			green = 0;
			//var actions = ['West', 'North', 'East', 'South'];
			//offset left 1/4 rectsize, offset up 1/4 recsize, 
			var x1, y1, x2, y2, x3, y3;
			switch (act) {
				case 'West':
					xoff = -1 / 4 * rectSize - 10;
					yoff = 0;
					x1 = s.x * rectSize + offset;
					y1 = s.y * rectSize + offset;
					x2 = s.x * rectSize + offset;
					y2 = s.y * rectSize + rectSize + offset;
					x3 = s.x * rectSize + 0.5 * rectSize + offset;
					y3 = s.y * rectSize + 0.5 * rectSize + offset;
					fill(50)

					break;
				case 'East':
					xoff = 1 / 4 * rectSize;
					yoff = 0;
					x1 = s.x * rectSize + rectSize + offset;
					y1 = s.y * rectSize + offset;
					x2 = s.x * rectSize + rectSize + offset;
					y2 = s.y * rectSize + rectSize + offset;
					x3 = s.x * rectSize + 0.5 * rectSize + offset;
					y3 = s.y * rectSize + 0.5 * rectSize + offset;
					fill(150)
					break;
				case 'North':
					yoff = -1 / 4 * rectSize;
					xoff = 0;
					x1 = s.x * rectSize + offset;
					y1 = s.y * rectSize + offset;
					x2 = s.x * rectSize + rectSize + offset;
					y2 = s.y * rectSize + offset;
					x3 = s.x * rectSize + 0.5 * rectSize + offset;
					y3 = s.y * rectSize + 0.5 * rectSize + offset;
					fill(100);
					break;
				case 'South':
					yoff = 1 / 4 * rectSize;
					xoff = 0; //1/4 * rectSize;
					x1 = s.x * rectSize + offset;
					y1 = s.y * rectSize + rectSize + offset;
					x2 = s.x * rectSize + rectSize + offset;
					y2 = s.y * rectSize + rectSize + offset;
					x3 = s.x * rectSize + 0.5 * rectSize + offset;
					y3 = s.y * rectSize + 0.5 * rectSize + offset;
					fill(200);
					break;
				default:
					break;
			}

			console.log('For action, ', act, ' qvalue is ', qValue[s][act].value)

			if (qValue[s][act].value < 0) {
				red = map(qValue[s][act].value, 0, -1, 100, 255);
			} else {
				green = map(qValue[s][act].value, 0, 1, 100, 255);
			}

			fill(red, green, 0);
			if (s === obstacle) {
				fill(100);
			}
			console.log("draw triangle for state action", s, act)
			if(act == 'West') {
				console.log('************ WEST *************')
			}
			console.log('red and green', red, green);

			
			triangle(x1, y1, x2, y2, x3, y3);
			fill(255);

			//draw qvalues in triagles
			var qText = qValue[s][act].value.toFixed(2);
			text(qText, offset * 1.5 + s.x * rectSize + xoff, offset * 1.5 + s.y * rectSize + yoff);

		}

		//draw player
		fill(0, 0, 180);
		ellipse(offset * 1.5 + currentState.x * rectSize, offset * 1.5 + currentState.y * rectSize, 40);

		// for (let s of states) {

		// 	for (var action in qValue[s]) {
		// 		console.log('draw qvalue', action);
		// 		if (action == "North") {
		// 			var x1 = s.x * rectSize + offset;
		// 			var y1 = s.y * rectSize + offset;
		// 			var x2 = s.x * rectSize + rectSize + offset;
		// 			var y2 = s.y * rectSize + offset;
		// 			var x3 = s.x * rectSize + 0.5 * rectSize + offset;
		// 			var y3 = s.y * rectSize + 0.5 * rectSize + offset;
		// 			console.log("drawing triangle value of s", x1, y1);

		// 			fill(255);
		// 			triangle(x1, y1, x2, y2, x3, y3);
		// 		}
		// 	}
		// }




	}
	//rect(rectSize, rectSize, rectSize, rectSize);

	noLoop();


}
