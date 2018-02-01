var rectSize;
var states = [];
var currentState;
var desiredDirection = true;
var incrementMode = true;
var rows = 3;
var cols = 4;
var gameOver = false;
var rewardText;


function keyPressed() {
	 var fromState = currentState;
	// if (currentState == goalState) {
	// 	gameOver = true;
	// 	currentState = winState;
	// } else if (currentState == pit) {
	// 	gameOver = true;
	// 	currentState = loseState;
	// } else {
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
	// }
	game.calculateValue(fromState, currentState, desiredDirection);
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
	for (let s of states) {
		//draw rectangles for states
		var red = 0;
		var green = 0;
		if (s.value < 0) {
			red = map(s.value, 0, -1, 100, 255);
		} else {
			green = map(s.value, 0, 1, 100, 255);
		}

		//draw grid filled by value
		fill(red, green, 0);
		if (s.type === "obstacle") {
			fill(100);
		}
		rect(rectSize + s.location.x * rectSize, rectSize + s.location.y * rectSize, rectSize, rectSize);

		//draw values for the states
		fill(0);
		rewardText = s.value.toFixed(1);
		textSize(20);
		text(rewardText, rectSize * 1.5 + s.location.x * rectSize, rectSize * 1.5 + s.location.y * rectSize);

		//draw q values
		//for each state get the qvalues and iterate
		var xoff = 0;
		var yoff = 0;
		
		for (var act in s.qState) {
			red = 0;
			green = 0;
			var x1, y1, x2, y2, x3, y3;
			switch (act) {
				case 'West':
					xoff = -1 / 4 * rectSize - 10;
					yoff = 0;
					x1 = s.location.x * rectSize + rectSize;
					y1 = s.location.y * rectSize + rectSize;
					x2 = s.location.x * rectSize + rectSize;
					y2 = s.location.y * rectSize + rectSize + rectSize;
					x3 = s.location.x * rectSize + 0.5 * rectSize + rectSize;
					y3 = s.location.y * rectSize + 0.5 * rectSize + rectSize;
					fill(50)
					break;
				case 'East':
					xoff = 1 / 4 * rectSize;
					yoff = 0;
					x1 = s.location.x * rectSize + rectSize + rectSize;
					y1 = s.location.y * rectSize + rectSize;
					x2 = s.location.x * rectSize + rectSize + rectSize;
					y2 = s.location.y * rectSize + rectSize + rectSize;
					x3 = s.location.x * rectSize + 0.5 * rectSize + rectSize;
					y3 = s.location.y * rectSize + 0.5 * rectSize + rectSize;
					fill(150)
					break;
				case 'North':
					yoff = -1 / 4 * rectSize;
					xoff = 0;
					x1 = s.location.x * rectSize + rectSize;
					y1 = s.location.y * rectSize + rectSize;
					x2 = s.location.x * rectSize + rectSize + rectSize;
					y2 = s.location.y * rectSize + rectSize;
					x3 = s.location.x * rectSize + 0.5 * rectSize + rectSize;
					y3 = s.location.y * rectSize + 0.5 * rectSize + rectSize;
					fill(100);
					break;
				case 'South':
					yoff = 1 / 4 * rectSize;
					xoff = 0; //1/4 * rectSize;
					x1 = s.location.x * rectSize + rectSize;
					y1 = s.location.y * rectSize + rectSize + rectSize;
					x2 = s.location.x * rectSize + rectSize + rectSize;
					y2 = s.location.y * rectSize + rectSize + rectSize;
					x3 = s.location.x * rectSize + 0.5 * rectSize + rectSize;
					y3 = s.location.y * rectSize + 0.5 * rectSize + rectSize;
					fill(200);
					break;
				default:
					break;
			}
			if (s.qState[act].value < 0) {
				red = map(s.qState[act].value, 0, -1, 100, 255);
			} else {
				green = map(s.qState[act].value, 0, 1, 100, 255);
			}
			fill(red, green, 0);
			if (s.type === 'obstacle') {
				fill(100);
			}
			triangle(x1, y1, x2, y2, x3, y3);
			fill(255);

			//draw qvalues in triagles
			var qText = s.qState[act].value.toFixed(2);
			text(qText, rectSize * 1.5 + s.location.x * rectSize + xoff, rectSize * 1.5 + s.location.y * rectSize + yoff);
		}

		//draw player
		fill(0, 0, 180);
		ellipse(rectSize * 1.5 + currentState.location.x * rectSize, rectSize * 1.5 + currentState.location.y * rectSize, 40);
	}
	noLoop();
}
