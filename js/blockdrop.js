/* 
 * BlockDropGame - A shameless Tetris clone
 * Benjamin Booth
 * bkbooth at gmail dot com
 */

var BlockDropGame = function(targetElement) {
	// gameplay variables
	this.lines = 0;
	this.score = 0;
	this.level = 1;
	this._intervalId = null;
	this.piece = null;
	
	// layout variables
	this.baseSize = 30;			// This is the base font size, can resize the whole board with this
	this.gameWrapper = null;
	this.scoreElement = null
	this.levelElement = null;
	this.linesElement = null;
	
	this.initialSetup(targetElement);
	this.setupEventListeners();
	
	this.init();
};

var PieceFactory = {
	// Define our pieces here
	pieces: [
		{ id: "o", size: 2, blocks: { // O/square piece
			rot0: [{ left: 0, top: 0 }, { left: 1, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }],
			rot90: [{ left: 0, top: 0 }, { left: 1, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }],
			rot180: [{ left: 0, top: 0 }, { left: 1, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }],
			rot270: [{ left: 0, top: 0 }, { left: 1, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }]
		}},
		{ id: "l", size: 3, blocks: { // L piece
			rot0: [{ left: 2, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }, { left: 2, top: 1 }],
			rot90: [{ left: 1, top: 0 }, { left: 1, top: 1 }, { left: 1, top: 2 }, { left: 2, top: 2 }],
			rot180: [{ left: 0, top: 1 }, { left: 1, top: 1 }, { left: 2, top: 1 }, { left: 0, top: 2 }],
			rot270: [{ left: 0, top: 0 }, { left: 1, top: 0 }, { left: 1, top: 1 }, { left: 1, top: 2 }]
		}},
		{ id: "j", size: 3, blocks: { // J piece
			rot0: [{ left: 0, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }, { left: 2, top: 1 }],
			rot90: [{ left: 1, top: 0 }, { left: 2, top: 0 }, { left: 1, top: 1 }, { left: 1, top: 2 }],
			rot180: [{ left: 0, top: 1 }, { left: 1, top: 1 }, { left: 2, top: 1 }, { left: 2, top: 2 }],
			rot270: [{ left: 1, top: 0 }, { left: 1, top: 1 }, { left: 0, top: 2 }, { left: 1, top: 2 }]
		}},
		{ id: "s", size: 3, blocks: { // S piece
			rot0: [{ left: 1, top: 0 }, { left: 2, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }],
			rot90: [{ left: 1, top: 0 }, { left: 1, top: 1 }, { left: 2, top: 1 }, { left: 2, top: 2 }],
			rot180: [{ left: 1, top: 1 }, { left: 2, top: 1 }, { left: 0, top: 2 }, { left: 1, top: 2 }],
			rot270: [{ left: 0, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }, { left: 1, top: 2 }]
		}},
		{ id: "z", size: 3, blocks: { // Z piece
			rot0: [{ left: 0, top: 0 }, { left: 1, top: 0 }, { left: 1, top: 1 }, { left: 2, top: 1 }],
			rot90: [{ left: 2, top: 0 }, { left: 1, top: 1 }, { left: 2, top: 1 }, { left: 1, top: 2 }],
			rot180: [{ left: 0, top: 1 }, { left: 1, top: 1 }, { left: 1, top: 2 }, { left: 2, top: 2 }],
			rot270: [{ left: 1, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }, { left: 0, top: 2 }]
		}},
		{ id: "t", size: 3, blocks: { // T piece
			rot0: [{ left: 1, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 },{ left: 2, top: 1 }],
			rot90: [{ left: 1, top: 0 }, { left: 1, top: 1 }, { left: 2, top: 1 }, { left: 1, top: 2 }],
			rot180: [{ left: 0, top: 1 }, { left: 1, top: 1 }, { left: 2, top: 1 }, { left: 1, top: 2 }],
			rot270: [{ left: 1, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }, { left: 1, top: 2 }]
		}},
		{ id: "i", size: 4, blocks: { // I/straight piece
			rot0: [{ left: 0, top: 1 }, { left: 1, top: 1 }, { left: 2, top: 1 }, { left: 3, top: 1 }],
			rot90: [{ left: 2, top: 0 }, { left: 2, top: 1 }, { left: 2, top: 2 }, { left: 2, top: 3 }],
			rot180: [{ left: 0, top: 2 }, { left: 1, top: 2 }, { left: 2, top: 2 }, { left: 3, top: 2 }],
			rot270: [{ left: 1, top: 0 }, { left: 1, top: 1 }, { left: 1, top: 2 }, { left: 1, top: 3 }]
		}}
	],
	
	create: function() {
		// Randomly choose a piece blueprint to create from
		var pieceBlueprint = this.pieces[Math.floor(Math.random() * this.pieces.length)];
		
		// Create and setup the wrapper div for the piece
		// Place some of 
		var newPiece = document.createElement("div");
		newPiece.className = "piece-wrapper";
		
		// Add these useful properties to the piece,
		newPiece.blocksMap = pieceBlueprint.blocks;
		newPiece.rotate = 0;
		
		// Size & position of the new piece
		newPiece.style.top = -1 + "em";
		newPiece.style.left = (5 - (Math.round(pieceBlueprint.size / 2))) + "em"
		newPiece.style.width = pieceBlueprint.size + "em";
		newPiece.style.height = pieceBlueprint.size + "em";
		
		// Loop through the blocks defined in the piece blueprint
		pieceBlueprint.blocks["rot0"].forEach(function(offsets) {
			// Create and setup the block for the piece
			var block = document.createElement("div");
			block.className = "piece-block piece-" + pieceBlueprint.id;
			block.style.left = offsets.left + "em";
			block.style.top = offsets.top + "em";
			
			// Append the block to the piece wrapper
			newPiece.appendChild(block);
		});
		
		// Return the new piece
		return newPiece;
	}
};

// First time setup, create all the elements
BlockDropGame.prototype.initialSetup = function(targetElement) {
	var wrapperElement, infoWrapper, scoreWrapper, levelWrapper, linesWrapper;
	
	wrapperElement = targetElement || document.getElementsByTagName("body")[0];
	
	// create and append the game board
	this.gameWrapper = document.createElement("div");
	this.gameWrapper.setAttribute("id", "game-board");
	wrapperElement.appendChild(this.gameWrapper);
	
	// create the info bar
	infoWrapper = document.createElement("div");
	infoWrapper.setAttribute("id", "game-info");
	
	// create and append the score display to the info bar
	scoreWrapper = document.createElement("div");
	scoreWrapper.setAttribute("id", "game-score");
	scoreWrapper.innerHTML = "<span class='title'>Score:</span> ";
	this.scoreElement = document.createElement("span");
	this.scoreElement.setAttribute("class", "value");
	this.scoreElement.innerText = 0;
	scoreWrapper.appendChild(this.scoreElement);
	infoWrapper.appendChild(scoreWrapper);
	
	// create and append the level display to the info bar
	levelWrapper = document.createElement("div");
	levelWrapper.setAttribute("id", "game-level");
	levelWrapper.innerHTML = "<span class='title'>Level:</span> ";
	this.levelElement = document.createElement("span");
	this.levelElement.setAttribute("class", "value");
	this.levelElement.innerText = 1;
	levelWrapper.appendChild(this.levelElement);
	infoWrapper.appendChild(levelWrapper);
	
	// create and append the lines display to the info bar
	linesWrapper = document.createElement("div");
	linesWrapper.setAttribute("id", "game-lines");
	linesWrapper.innerHTML = "<span class='title'>Lines:</span> ";
	this.linesElement = document.createElement("span");
	this.linesElement.setAttribute("class", "value");
	this.linesElement.innerText = 0;
	linesWrapper.appendChild(this.linesElement);
	infoWrapper.appendChild(linesWrapper);
	
	// append the info bar
	wrapperElement.appendChild(infoWrapper);
};

// Simple bounding box check, used for both crude and precision checks
BlockDropGame.prototype.isBoxIntersecting = function(sourceObject, targetObject, sourceOffsets) {
	//console.log("bounding box detecting");
	//console.log("direction: " + direction);
	if (sourceObject.offsetTop + sourceObject.offsetHeight + sourceOffsets.top > targetObject.offsetTop &&		// source.bottom >= target.top
		sourceObject.offsetTop + sourceOffsets.top < targetObject.offsetTop + targetObject.offsetHeight &&		// source.top <= target.bottom
		sourceObject.offsetLeft + sourceObject.offsetWidth + sourceOffsets.left > targetObject.offsetLeft &&	// source.right >= target.left
		sourceObject.offsetLeft + sourceOffsets.left < targetObject.offsetLeft + targetObject.offsetWidth) {	// source.left <= target.right
		return true;
	} else {
		return false;
	}
};

// Compare the blocks of the current piece to all other blocks on the game board
BlockDropGame.prototype.checkAllBlocks = function(object, offsets) {
	//console.log("precision detecting "+nearbyPieces.length);
	
	// Initialise some variables
	var i, j, allBlocks = this.gameWrapper.getElementsByClassName("piece-block"),
		objectBlocks = object.getElementsByClassName("piece-block");
	
	// Loop through all blocks on the game board
	for (i = 0; i < allBlocks.length; i++) {
		// Ignore blocks from the current piece
		if (allBlocks[i].parentNode !== object) {
			// Loop through all blocks of the current piece
			for (j = 0; j < objectBlocks.length; j++) {
				//console.log("inner most loop "+objectBlocks[k].offsetLeft+" "+allNPBlocks[j].offsetLeft);
				// Do a simple box collision check
				if (this.isBoxIntersecting({
					// need to create a new source object accounting for parent offsets
					// maybe there's a better way?
					offsetLeft: object.offsetLeft + objectBlocks[j].offsetLeft,
					offsetTop: object.offsetTop + objectBlocks[j].offsetTop,
					offsetWidth: objectBlocks[j].offsetWidth,
					offsetHeight: objectBlocks[j].offsetHeight
				}, allBlocks[i], offsets)) {
					// console.log("collision found. src.left: "+objectBlocks[k].offsetLeft+", src.top: "+objectBlocks[k].offsetTop+
					//	", trgt.left: "+allNPBlocks[j].offsetLeft+", trgt.top"+allNPBlocks[j].offsetTop);
					return true;
				}
			}
		}
	}

	return false;
};

// Is the current piece intersecting with any walls or other pieces?
BlockDropGame.prototype.isIntersecting = function(object, target, offsets) {
	
	// Get the blocks of the current piece
	var objectBlocks = object.getElementsByClassName("piece-block");
	
	switch (target) {
		case 'leftWall':
			// Check if any of the piece blocks will be outside the left wall
			for (var i = 0; i < objectBlocks.length; i++) {
				//console.log(objectBlocks[i].offsetLeft + object.leftVal);
				if (object.offsetLeft + objectBlocks[i].offsetLeft + offsets.left < 0) {
					//console.log("left wall collision");
					return true;
				}
			}
			break;
		case 'rightWall':
			// Check if any of the piece blocks will be outside the right wall
			for (var i = 0; i < objectBlocks.length; i++) {
				//console.log(objectBlocks[i].offsetLeft + object.leftVal);
				if (object.offsetLeft + objectBlocks[i].offsetLeft + objectBlocks[i].offsetWidth + offsets.left > this.baseSize * 10) {
					//console.log("right wall collision");
					return true;
				}
			}
			break;
		case 'bottomWall':
			// Check if any of the piece blocks will be outside the bottom wall
			for (var i = 0; i < objectBlocks.length; i++) {
				if (object.offsetTop + objectBlocks[i].offsetTop + objectBlocks[i].offsetHeight + offsets.top > this.baseSize * 20) {
					//console.log("bottom wall collision");
					return true;
				}
			}
			break;
		default:
			// no default case
	}
	
	// Originally had this as another case, but we always want to compare to other blocks
	if (this.checkAllBlocks(object, offsets)) {
		//console.log("other piece collision");
		return true;
	}
	
	return false;
};

// Check if moving left will cause a collision with the left wall or other blocks
BlockDropGame.prototype.canMoveLeft = function() {
	// Offset 1 space to the left
	var offsets = {
		top: 0,
		left: -this.baseSize // this needs to be px
	};
	if (this.isIntersecting(this.piece, 'leftWall', offsets)) {
		return false;
	}
	return true;
};

// Check if moving right will cause a collision with the right wall or other blocks
BlockDropGame.prototype.canMoveRight = function() {
	// Offset 1 space to the right
	var offsets = {
		top: 0,
		left: this.baseSize // this needs to be px
	};
	if (this.isIntersecting(this.piece, 'rightWall', offsets)) {
		return false;
	}
	return true;
};


// Check if moving down will cause a collision with the bottom wall or other blocks
BlockDropGame.prototype.canMoveDown = function() {
	// Offset 1 space down
	var offsets = {
		top: this.baseSize, // this needs to be px
		left: 0
	};
	if (this.isIntersecting(this.piece, 'bottomWall', offsets)) {
		return false;
	}
	return true;
};

// Check if rotating will cause a collision with other pieces
// We always want to allow rotation against a wall, will simply adjust position after rotate
BlockDropGame.prototype.canRotate = function() {
	
	// Set the next rotation step
	var tempPiece, tempRotate = this.piece.rotate + 90;
	if (tempRotate >= 360) {
		tempRotate = 0;
	}
	
	// Create a temporary piece with the next rotation step
	tempPiece = document.createElement("div");
	tempPiece.className = "piece-wrapper";
	tempPiece.style.left = (this.piece.offsetLeft / this.baseSize) + "em";
	tempPiece.style.top = (this.piece.offsetTop / this.baseSize) + "em";
	
	// Add the blocks for the next rotation step
	this.piece.blocksMap["rot"+tempRotate].forEach(function(offsets) {
		var tempBlock = document.createElement("div");
		tempBlock.className = "piece-block";
		tempBlock.style.left = offsets.left + "em";
		tempBlock.style.top = offsets.left + "em";
		tempPiece.appendChild(tempBlock);
	});
	
	// Intersection test with no offsets
	if (this.isIntersecting(tempPiece, 'leftWall', {left: 0, top: 0})) {
		return false;
	}
	
	return true;
};

// Create and return a list of rows which are full of blocks
BlockDropGame.prototype.findCompleteRows = function() {
	// Initialise variables, get all of the blocks in the game
	var i, j, k, completeRows = [];
	var allBlocks = this.gameWrapper.getElementsByClassName("piece-block");
	
	// Check 20 rows from the bottom up
	for (i = 19; i >= 0; i--) {
		// Check 10 columns from left to right
		for (j = 0; j < 10; j++) {
			// Check all blocks in the game board
			for (k = 0; k < allBlocks.length; k++) {
				// If we find a block at this row and column we can exit early
				if (allBlocks[k].offsetTop === i * this.baseSize &&
					allBlocks[k].offsetLeft === j * this.baseSize) {
					break;
				}
			}
			// If we didn't exit blocks loop early, a matching block wasn't found
			// We can end this column loop
			if (k === allBlocks.length) {
				break;
			}
		}
		// If we didn't exit the column loop early, this row is full
		if (j === 10) {
			completeRows.push(i);
		}
	}
	
	//console.log("complete rows: "+completeRows.length);
	return completeRows;
};

// Clear a single complete row and drop all blocks above it a single line
BlockDropGame.prototype.clearCompleteRow = function(completeRow) {
	
	// Initialise some variables
	var i, allBlocks = this.gameWrapper.getElementsByClassName("piece-block");
	var blocksToRemove = [];
	
	//console.log("clearing row: "+completeRow);
	
	// Loop through all blocks on the game board
	for (i = 0; i < allBlocks.length; i++) {
		if (allBlocks[i].offsetTop === completeRow * this.baseSize) {
			// If the block is in this row, push it to be removed
			// directly removing here breaks the loop
			blocksToRemove.push(allBlocks[i]);
			//allBlocks[i].parentNode.removeChild(allBlocks[i]);
		} else if (allBlocks[i].offsetTop < completeRow * this.baseSize) {
			// If the block is above the row being removed, drop it 1 space
			allBlocks[i].style.top = (allBlocks[i].offsetTop / this.baseSize) + 1 + "em";
		}
	}
	
	// Now lets go through and remove all the blocks in the row
	for (i = 0; i < blocksToRemove.length; i++) {
		blocksToRemove[i].parentNode.removeChild(blocksToRemove[i]);
	}
};

// Is the newly created piece already overlapping an existing piece?
// Only called when new pieces are created
BlockDropGame.prototype.isGameOver = function() {
	// No offset, we only care about where the piece is exactly
	var offsets = {
		top: 0,
		left: 0
	};
	if (this.isIntersecting(this.piece, 'bottomWall', offsets)) {
		return true;
	}
	return false;
};

// Before starting a new game, clear the current game board
BlockDropGame.prototype.clearGameBoard = function() {
	var allBlocks = this.gameWrapper.getElementsByClassName("piece-block");
	var allBlocksLength = allBlocks.length;// the length changes as we remove blocks
	
	for (var i = 0; i < allBlocksLength; i++) {
		// Always remove the first one
		if (allBlocks[0].parentNode !== this.piece) {
			this.gameWrapper.removeChild(allBlocks[0]);
		}
	}
	
	this.gameWrapper.removeChild(this.piece);
};

// Remove the piece wrapper and leave just the blocks behind
// This makes it much easier to detect and remove completed rows
BlockDropGame.prototype.addCurrentPieceToBoard = function() {
	
	// Initialise some variables
	var i, newLeft, newTop, newBlock;
	var pieceBlocks = this.piece.getElementsByClassName("piece-block");
	var pieceBlocksLength = pieceBlocks.length; // the length changes as we remove blocks
	
	// Loop through each of the blocks in the piece
	for (var i = 0; i < pieceBlocksLength; i++) {
		// Get new left and top relative to the game board
		newLeft = this.piece.offsetLeft + pieceBlocks[0].offsetLeft;
		newTop = this.piece.offsetTop + pieceBlocks[0].offsetTop;
		
		// Remove the block from the piece and update it's position
		newBlock = this.piece.removeChild(pieceBlocks[0]);
		newBlock.style.left = (newLeft / this.baseSize) + "em";
		newBlock.style.top = (newTop / this.baseSize) + "em";
		
		// Add the block back in as a child of the game board
		this.gameWrapper.appendChild(newBlock);
	}
	
	// Remove the now empty piece from the board
	this.gameWrapper.removeChild(this.piece);
};

// Initialise a game, create an initial piece and start the timer
BlockDropGame.prototype.init = function() {
	if (confirm("Ready to go, are you?")) {
		// Set the base size
		document.getElementsByTagName("body")[0].style.fontSize = this.baseSize + "px";
		
		// Create the initial piece and start the timer
		this.piece = this.gameWrapper.appendChild(PieceFactory.create());
		this.score = 0;
		this.lines = 0;
		this.level = 1;
		this._intervalId = setInterval(this.update.bind(this), 1000 / this.level);
	} else {
		// Give them another chance
		//setTimeout(BlockDropGame.init, 2000);
	}
};

// Automatically drop the current piece if possible
// otherwise check for completed rows and then generate a new piece
BlockDropGame.prototype.update = function() {
	//console.log(this);
	if (this.canMoveDown()) {
		//BlockDropGame.piece.topVal += gridSize;
		this.piece.style.top = (this.piece.offsetTop / this.baseSize) + 1 + "em";
	} else {
		clearInterval(this._intervalId);
		
		this.addCurrentPieceToBoard();
		
		var completeRows = this.findCompleteRows();
		
		// increment score before clearing rows
		//console.log(completeRows.length);
		switch (completeRows.length) {
			case 4:
				this.score += (1200 * this.level);
				break;
			case 3:
				this.score += (300 * this.level);
				break;
			case 2:
				this.score += (100 * this.level);
				break;
			case 1:
				this.score += (40 * this.level);
				break;
			default:
				break;
		}
		this.scoreElement.innerHTML = this.score;
		
		for (var i = completeRows.length; i > 0; i--) {
			// Starting from the end of the array (highest complete row)
			// because when you clear the lower rows first the value
			// of the higher rows to clear would need to drop too
			this.clearCompleteRow(completeRows[i - 1]);
			this.lines++;
			this.linesElement.innerHTML = this.lines;
			
			// Increase the level if we just hit a multiple of 10 lines 
			if (this.lines % 10 === 0) {
				//console.log("speeding up!");
				this.level++;
				this.levelElement.innerHTML = this.level;
			}
		}

		// Create a new piece and restart the timer
		this.piece = this.gameWrapper.appendChild(PieceFactory.create());
		
		if (this.isGameOver()) {
		//if (!BlockDropGame.canMoveDown()) {
			// If can't move straight after creating piece, game over!
			alert("Game over! Your score was: " + this.score);
			this.clearGameBoard();
			this.init();
			/*if (confirm("Game over! Your score was: " + BlockDropGame.score + ". Do you want to play again?")) {
				
			} else {
				// do nothing?
			} */
		} else {
			this._intervalId = setInterval(this.update.bind(this), 1000 / this.level);
		}
	}
};

// Ideally all style-related changes to the blocks should happen here.
/* BlockDropGame.draw = function() {
	BlockDropGame.piece.style.left = BlockDropGame.piece.leftVal + "px";
	BlockDropGame.piece.style.top = BlockDropGame.piece.topVal + "px";
	
	//console.log("left: "+BlockDropGame.piece.offsetLeft+", top: "+BlockDropGame.piece.offsetTop+", width: "+BlockDropGame.piece.offsetWidth+", height: "+BlockDropGame.piece.offsetHeight);
}; */

// The loop function, update the board, draw any changes
/* BlockDropGame.run = function() {
	//console.log("running!");
	BlockDropGame.update();
	//BlockDropGame.draw();
} */

BlockDropGame.prototype.setupEventListeners = function() {
	var that = this;
	
	window.addEventListener("keydown", function(event) {
		//console.log(that);
		//e.preventDefault();
		var keyPressed = event.KeyCode || event.which;
		//console.log(keyPressed);
		
		if (keyPressed == '37' || keyPressed == '65') {
			// left key or 'a'
			//console.log("left");
			if (that.canMoveLeft()) {
				//BlockDropGame.piece.leftVal -= gridSize;
				that.piece.style.left = (that.piece.offsetLeft / that.baseSize) - 1 + "em";
			}
			event.preventDefault();
		} else if (keyPressed == '39' || keyPressed == '68') {
			// right key or 'd'
			//console.log("right");
			if (that.canMoveRight()) {
				//BlockDropGame.piece.leftVal += gridSize;
				that.piece.style.left = (that.piece.offsetLeft / that.baseSize) + 1 + "em";
			}
			event.preventDefault();
		} else if (keyPressed == '38' || keyPressed == '87') {
			// up key or 'w'
			//console.log("up");
			if (that.canRotate()) {
				that.piece.rotate += 90;
				if (that.piece.rotate >= 360) {
					that.piece.rotate = 0;
				}
			}
	
			// Loop through the blocks in the current piece
			var blocks = that.piece.getElementsByClassName("piece-block");
			for (var i = 0; i < blocks.length; i++) {
				// Update their positions to the next rotation step
				blocks[i].style.left = that.piece.blocksMap["rot"+that.piece.rotate][i].left + "em";
				blocks[i].style.top = that.piece.blocksMap["rot"+that.piece.rotate][i].top + "em";
			}
			
			event.preventDefault();
		} else if (keyPressed == '40' || keyPressed == '83') {
			// down key or 's'
			//console.log("down");
			if (that.canMoveDown()) {
				//BlockDropGame.piece.topVal += gridSize;
				that.piece.style.top = (that.piece.offsetTop / that.baseSize) + 1 + "em";
			}
			event.preventDefault();
		} 
	
		//BlockDropGame.draw();
	});
};
