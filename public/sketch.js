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
var startState;
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

function keyPressed() {
	var fromState = currentState;
	if (currentState == goalState) {
		gameOver = true;
		currentState = winState;
	} else if (currentState == pit) {
		gameOver = true;
		currentState = loseState;
	} else {
		//console.log("keycode", keyCode);
		desiredDirection = 'Illegal Move';
		if (incrementMode) {
			if (keyCode === LEFT_ARROW) {
				//console.log('left arrow')
				currentState = game.transition(currentState, 'West');
				desiredDirection = 'West';
			} else if (keyCode === RIGHT_ARROW) {
				//console.log('right arrow')
				currentState = game.transition(currentState, 'East');
				desiredDirection = 'East';
			} else if (keyCode === UP_ARROW) {
				//console.log('up arrow')
				currentState = game.transition(currentState, 'North')
				desiredDirection = 'North';
			} else if (keyCode === DOWN_ARROW) {
				//console.log('down arrow')
				currentState = game.transition(currentState, 'South')
				desiredDirection = 'South'
			} else {
				//console.log("wrong key return")
				return;
			}


		}

	}
	console.log('sketch keypressed game.calculateValue being called for from and current state', fromState, currentState);
	game.calculateValue(fromState, currentState, desiredDirection);
	//console.log("change currentState to start if win or lose");
	// if (currentState == winState || currentState == loseState) {
	// 	currentState = startState;
	// 	console.log("inside if currentstate now", currentState);
	// }
	loop();

}

function setup() {
	// put setup code here
	var cnv = createCanvas(1000, 1000);
	var cnvX = (windowWidth - width) / 2;
	var cnvY = (windowHeight - height) / 2;
	cnv.position(cnvX, cnvY);
	background(25);

	rectSize = width / (max(rows, cols) + 2);
	startingX = rectSize;
	startingY = rectSize;

	//Initialize the states, transitions, q-state, rewards
	for (var y = 0; y < rows; y++) {
		for (var x = 0; x < cols; x++) {
			var State = new game.State(x, y);
			states.push(State);
			if(x == 0 && y == 2) {
				currentState = State;
			}
			
		}
	}

	console.table(states);

}

function draw() {

	var offset = rectSize;
	var m = map(value, 0, 100, 0, width);
	var rewardText;
	for (let s of states) {
		//console.log('qvalue[s]', qValue[s]);

		//draw rectangles for states
		var red = 0;
		var green = 0;
		if (value[s] < 0) {
			red = map(s.value, 0, -1, 100, 255);
		} else {
			green = map(s.value, 0, 1, 100, 255);
		}

		//draw grid filled by value
		fill(red, green, 0);
		if (s.type === "obstacle") {
			fill(100);
		}
		rect(offset + s.location.x * rectSize, offset + s.location.y * rectSize, rectSize, rectSize);

		//draw values for the states
		fill(0);
		rewardText = s.value.toFixed(1);
		textSize(20);
		text(rewardText, offset * 1.5 + s.location.x * rectSize, offset * 1.5 + s.location.y * rectSize);
		// console.log('current state', currentState);
		// console.log('s', s);


		//draw q values
		//for each state get the qvalues and iterate
		var xoff = 0;
		var yoff = 0;
		
		//console.log('qValue[s]', qValue[s])
		for (var act in s.qState) {
			red = 0;
			green = 0;
			//var actions = ['West', 'North', 'East', 'South'];
			//offset left 1/4 rectsize, offset up 1/4 recsize, 
			var x1, y1, x2, y2, x3, y3;
			switch (act) {
				case 'West':
					xoff = -1 / 4 * rectSize - 10;
					yoff = 0;
					x1 = s.location.x * rectSize + offset;
					y1 = s.location.y * rectSize + offset;
					x2 = s.location.x * rectSize + offset;
					y2 = s.location.y * rectSize + rectSize + offset;
					x3 = s.location.x * rectSize + 0.5 * rectSize + offset;
					y3 = s.location.y * rectSize + 0.5 * rectSize + offset;
					fill(50)

					break;
				case 'East':
					xoff = 1 / 4 * rectSize;
					yoff = 0;
					x1 = s.location.x * rectSize + rectSize + offset;
					y1 = s.location.y * rectSize + offset;
					x2 = s.location.x * rectSize + rectSize + offset;
					y2 = s.location.y * rectSize + rectSize + offset;
					x3 = s.location.x * rectSize + 0.5 * rectSize + offset;
					y3 = s.location.y * rectSize + 0.5 * rectSize + offset;
					fill(150)
					break;
				case 'North':
					yoff = -1 / 4 * rectSize;
					xoff = 0;
					x1 = s.location.x * rectSize + offset;
					y1 = s.location.y * rectSize + offset;
					x2 = s.location.x * rectSize + rectSize + offset;
					y2 = s.location.y * rectSize + offset;
					x3 = s.location.x * rectSize + 0.5 * rectSize + offset;
					y3 = s.location.y * rectSize + 0.5 * rectSize + offset;
					fill(100);
					break;
				case 'South':
					yoff = 1 / 4 * rectSize;
					xoff = 0; //1/4 * rectSize;
					x1 = s.location.x * rectSize + offset;
					y1 = s.location.y * rectSize + rectSize + offset;
					x2 = s.location.x * rectSize + rectSize + offset;
					y2 = s.location.y * rectSize + rectSize + offset;
					x3 = s.location.x * rectSize + 0.5 * rectSize + offset;
					y3 = s.location.y * rectSize + 0.5 * rectSize + offset;
					fill(200);
					break;
				default:
					break;
			}

			//console.log('For action, ', act, ' qvalue is ', qValue[s][act].value)

			if (s.qState[act].value < 0) {
				red = map(s.qState[act].value, 0, -1, 100, 255);
			} else {
				green = map(s.qState[act].value, 0, 1, 100, 255);
			}

			fill(red, green, 0);
			if (s.type === 'obstacle') {
				fill(100);
			}
			// console.log("draw triangle for state action", s, act)
			// if(act == 'West') {
			// 	console.log('************ WEST *************')
			// }
			// console.log('red and green', red, green);

			
			triangle(x1, y1, x2, y2, x3, y3);
			fill(255);

			//draw qvalues in triagles
			var qText = s.qState[act].value.toFixed(2);
			//console.log("this is the qText", qText);
			text(qText, offset * 1.5 + s.location.x * rectSize + xoff, offset * 1.5 + s.location.y * rectSize + yoff);

		}

		//draw player
		fill(0, 0, 180);
		ellipse(offset * 1.5 + currentState.location.x * rectSize, offset * 1.5 + currentState.location.y * rectSize, 40);


	}

	noLoop();


}
