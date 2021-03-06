/*
 * BlockDrop - A shameless Tetris clone
 * Setup input handlers and event listeners
 * Ben Booth
 * bkbooth at gmail dot com
 */

BlockDrop.namespace("BlockDrop.Game.Input");

BlockDrop.Game.Input = (function(Input) {
    "use strict";
    console.log("BlockDrop.Game.Input");

    // Dependencies
    var Game = BlockDrop.Game,
        Settings = BlockDrop.Game.Settings,
        UI = BlockDrop.Game.UI,
        CollisionDetection = BlockDrop.Game.CollisionDetection,
        Score = BlockDrop.Game.Score,
        HighScores = BlockDrop.Game.HighScores,
        AudioLibrary = BlockDrop.AudioLibrary,
        Utils = BlockDrop.Utils;

    // Local variables
    var touchStartX,            // X coordinate where the touch event started
        touchStartY,            // Y coordinate where the touch event started
        hardDropped = false,    // Prevent rotating or moving after a hard drop
        touchMoved = false,     // Records whether the piece has been moved during the touch event
        touchBlocked = false;   // Touch temporary blocked to reduce sensitivity / increase control

    /**
     * Left key and left swipe handler
     */
    var moveLeftHandler = function() {
        var piece = UI.getElement("pieces.current");
        if (CollisionDetection.canMoveLeft(piece)) {
            // Stop before playing move sound again
            if (Settings.get("sound")) {
                AudioLibrary.stop("move");
                AudioLibrary.play("move");
            }

            UI.moveLeft(piece);
        }
    };

    /**
     * Right key and right swipe handler
     */
    var moveRightHandler = function() {
        var piece = UI.getElement("pieces.current");
        if (CollisionDetection.canMoveRight(piece)) {
            // Stop before playing move sound again
            if (Settings.get("sound")) {
                AudioLibrary.stop("move");
                AudioLibrary.play("move");
            }

            UI.moveRight(piece);
        }
    };

    /**
     * Down key and swipe down handler
     */
    var moveDownHandler = function() {
        var piece = UI.getElement("pieces.current");

        Game.clearTimer();

        if (CollisionDetection.canMoveDown(piece)) {
            // Stop before playing move sound again
            if (Settings.get("sound")) {
                AudioLibrary.stop("move");
                AudioLibrary.play("move");
            }

            UI.moveDown(piece);
            Score.incrementDrop();
        } else {
            // If we can't move down, start a timer to trigger a game update
            Game.startDropTimer();
            return;
        }

        Game.startTimer();
    };

    /**
     * Hard drop drops the piece all the way to the bottom
     */
    var hardDropHandler = function() {
        // Keep moving down while we can
        while (!Game.isDropping()) {
            moveDownHandler();
        }

        if (Settings.get("sound")) {
            AudioLibrary.play("drop");
        }

        // Force an update straight away after hard drop
        hardDropped = true;
    };

    /**
     * Was the piece hard dropped?
     *
     * @returns {Boolean}
     */
    var isHardDrop = function() {
        return hardDropped;
    };

    /**
     * Rest the hard drop flag
     */
    var resetHardDrop = function() {
        hardDropped = false;
    };

    /**
     * Up key, swipe up handler and single tap handler
     */
    var rotateHandler = function() {
        var piece = UI.getElement("pieces.current");

        if (CollisionDetection.canRotate(piece)) {
            // Stop before playing rotate sound again
            if (Settings.get("sound")) {
                AudioLibrary.stop("rotate");
                AudioLibrary.play("rotate");
            }

            UI.rotate(piece);
        }
    };

    /**
     * Handle mouse clicks
     *
     * @param {MouseEvent} event
     */
    var clickListener = function(event) {
        var buttonStart = UI.getElement("buttons.start"),
            buttonAbout = UI.getElement("buttons.about"),
            buttonScores = UI.getElement("buttons.scores"),
            buttonPause = UI.getElement("buttons.pause"),
            buttonResume = UI.getElement("buttons.resume"),
            buttonQuit = UI.getElement("buttons.quit"),
            buttonSound = UI.getElement("buttons.sound"),
            buttonMusic = UI.getElement("buttons.music"),
            newVal;

        if (event.target === buttonStart) {
            // Start the game
            Game.start();
            event.preventDefault();
        } else if (event.target === buttonAbout) {
            // Hide the start, about and scores buttons, show the info dialog
            UI.show("info");
            event.preventDefault();
        } else if (event.target === buttonScores) {
            // Hide the start, about and scores buttons, show the high scores dialog
            UI.show("scores");
            event.preventDefault();
        } else if (event.target === buttonPause) {
            // Pause the game
            Game.pause();
            event.preventDefault();
        } else if (event.target === buttonResume) {
            // Resume the game
            Game.resume();
            event.preventDefault();
        } else if (event.target === buttonQuit) {
            // Quit the game
            Game.finish({ quit: true });
            event.preventDefault();
        } else if (event.target === buttonSound || event.target.parentElement === buttonSound) {
            // Toggle the sound button
            newVal = Settings.toggle("sound");
            Utils.setIntData(buttonSound, "on", newVal);
            event.preventDefault();
        } else if (event.target === buttonMusic || event.target.parentElement === buttonMusic) {
            // Toggle the music button, start/stop the music
            newVal = Settings.toggle("music");
            Utils.setIntData(buttonMusic, "on", newVal);
            if (newVal) {
                AudioLibrary.play("music");
            } else {
                AudioLibrary.pause("music");
            }
            event.preventDefault();
        } else if (event.target.classList.contains("close-button") ||
            event.target.parentElement.classList.contains("close-button")) {
            // Show the main menu
            UI.show("menu");
            event.preventDefault();
        }
    };

    /**
     * Handle keyboard key down events
     *
     * @param {KeyboardEvent} event
     */
    var keyDownListener = function(event) {
        var gameWrapper = UI.getElement("wrappers.game").parentElement,
            buttonStart = UI.getElement("buttons.start"),
            buttonAbout = UI.getElement("buttons.about"),
            buttonScores = UI.getElement("buttons.scores"),
            buttonResume = UI.getElement("buttons.resume"),
            buttonQuit = UI.getElement("buttons.quit"),
            buttonSound = UI.getElement("buttons.sound"),
            buttonMusic = UI.getElement("buttons.music"),
            dialogInfo = UI.getElement("dialogs.info"),
            dialogFinish = UI.getElement("dialogs.finish"),
            dialogScores = UI.getElement("dialogs.scores"),
            inputName = UI.getElement("inputs.name"),
            key = event.keyCode || event.which,
            buttons;

        if (UI.isVisible(dialogFinish) && event.target === inputName && key) {
            // When the user is inputting their name, only allow escape key to
            // flow through to the rest of the event handler
            if (key === 13) {
                // Enter key pressed, save the score and show/hide the dialogs
                HighScores.save(inputName.value);
                UI.show("scores");
            }
            return;
        }

        if (key === 18) {
            // Alt key pressed, highlight first letter of buttons
            buttons = gameWrapper.querySelectorAll(".button");
            for (var i = 0; i < buttons.length; i++) {
                // Don't touch the sound or music toggles
                if (buttons[i] !== buttonSound && buttons[i] !== buttonMusic) {
                    buttons[i].classList.add("hl-first");
                }
            }
            event.preventDefault();
        }

        // Split the keyboard controls into game and menu controls
        if (Game.isPlaying() && !isHardDrop()) {
            // Game is playing
            switch (key) {
                case 37:	// Left key
                case 72:	// 'h' key
                case 65:	// 'a' key
                    moveLeftHandler();
                    event.preventDefault();
                    break;
                case 39:	// Right key
                case 76:	// 'l' key
                case 68:	// 'd' key
                    moveRightHandler();
                    event.preventDefault();
                    break;
                case 38:	// Up key
                case 75:	// 'k' key
                case 87:	// 'w' key
                    rotateHandler();
                    event.preventDefault();
                    break;
                case 40:	// Down key
                case 74:	// 'j' key
                case 83:	// 's' key
                    moveDownHandler();
                    event.preventDefault();
                    break;
                case 13:	// Enter key
                case 32:	// Space key
                    hardDropHandler();
                    event.preventDefault();
                    break;
                case 27:	// Esc key
                case 80:	// 'p' key
                    Game.pause();
                    event.preventDefault();
                    break;
            }
        } else if (!Game.isPlaying()) {
            // Game is not playing
            switch (key) {
                case 13:	// Enter key
                case 32:	// Space key
                    if (UI.isVisible(buttonStart)) {
                        Game.start();
                    } else if (UI.isVisible(buttonResume)) {
                        Game.resume();
                    }
                    event.preventDefault();
                    break;
                case 83:	// 's' key
                    if (UI.isVisible(buttonStart)) {
                        Game.start();
                    }
                    event.preventDefault();
                    break;
                case 65:	// 'a' key
                    if (UI.isVisible(buttonAbout)) {
                        UI.show("info");
                    } else if (UI.isVisible(dialogInfo)) {
                        UI.show("menu");
                    }
                    event.preventDefault();
                    break;
                case 72:	// 'h' key
                    if (UI.isVisible(buttonScores)) {
                        UI.show("scores");
                    } else if (UI.isVisible(dialogScores)) {
                        UI.show("menu");
                    }
                    event.preventDefault();
                    break;
                case 82:	// 'r' key
                    if (UI.isVisible(buttonResume)) {
                        Game.resume();
                    }
                    event.preventDefault();
                    break;
                case 81:	// 'q' key
                    if (UI.isVisible(buttonQuit)) {
                        Game.finish({ quit: true });
                    }
                    event.preventDefault();
                    break;
                case 27:	// Esc key
                case 88:	// 'x' key
                    if (UI.isVisible(dialogInfo) || UI.isVisible(dialogFinish) || UI.isVisible(dialogScores)) {
                        UI.show("menu");
                    }
                    event.preventDefault();
                    break;
            }
        }
    };

    /**
     * Handle keyboard key up events
     *
     * @param {KeyboardEvent} event
     */
    var keyUpListener = function(event) {
        var gameWrapper = UI.getElement("wrappers.game").parentElement,
            buttonSound = UI.getElement("buttons.sound"),
            buttonMusic = UI.getElement("buttons.music"),
            key = event.keyCode || event.which,
            buttons, i, n;

        if (key === 18) {
            // Alt key released, undo highlight first letter of buttons
            buttons = gameWrapper.querySelectorAll(".button");
            for (i = 0, n = buttons.length; i < n; i++) {
                if (buttons[i] !== buttonSound && buttons[i] !== buttonMusic) {
                    buttons[i].classList.remove("hl-first");
                }
            }
            event.preventDefault();
        }
    };

    /**
     * Handle touch start event
     *
     * @param {TouchEvent|Event} event
     */
    var touchStartListener = function(event) {
        var buttonPause = UI.getElement("buttons.pause"),
            buttonSound = UI.getElement("buttons.sound"),
            buttonMusic = UI.getElement("buttons.music");

        // Don't detect touch unless the game is playing
        if (!Game.isPlaying() || event.target === buttonPause ||
            event.target === buttonSound || event.target.parentElement === buttonSound ||
            event.target === buttonMusic || event.target.parentElement === buttonMusic) {
            return;
        }

        // Set the location for the start of the touch
        touchStartX = event.changedTouches[0].clientX;
        touchStartY = event.changedTouches[0].clientY;
        touchMoved = false;
        touchBlocked = false;
        event.preventDefault();
    };

    /**
     * Handle touch end event
     *
     * @param {TouchEvent|Event} event
     */
    var touchEndListener = function(event) {
        var buttonPause = UI.getElement("buttons.pause"),
            buttonSound = UI.getElement("buttons.sound"),
            buttonMusic = UI.getElement("buttons.music");

        // Don't detect touch unless the game is playing
        if (!Game.isPlaying() || event.target === buttonPause ||
            event.target === buttonSound || event.target.parentElement === buttonSound ||
            event.target === buttonMusic || event.target.parentElement === buttonMusic) {
            return;
        }

        // event.preventDefault on the "touchmove" handler causes the "touchend" event to still fire
        // so we need to detect if we've moved the piece during the touch event cycle
        if (!touchMoved) {
            rotateHandler();
            event.preventDefault();
        }
    };

    /**
     * Handle touch move events
     *
     * @param {TouchEvent|Event} event
     */
    var touchMoveListener = function(event) {
        // Don't detect touch unless the game is playing and touch isn't blocked
        if (!Game.isPlaying()) {
            return;
        }

        // Calculate the move
        var touchMoveX = event.changedTouches[0].clientX,
            touchMoveY = event.changedTouches[0].clientY,
            touchChangeX = touchMoveX - touchStartX,
            touchChangeY = touchMoveY - touchStartY,
            baseSize = UI.getBaseSize();

        // Detect which direction the touch movement was in
        if (Math.abs(touchChangeX) > Math.abs(touchChangeY) &&
            Math.abs(touchChangeX) >= baseSize && touchMoved[0] !== "y") {
            // Horizontal swipe
            touchMoved = "x";
            if (touchChangeX > 0) {
                moveRightHandler();
            } else {
                moveLeftHandler();
            }
            touchStartX = touchMoveX;
        } else if (Math.abs(touchChangeX) <= Math.abs(touchChangeY) &&
            Math.abs(touchChangeY) >= baseSize) {
            // Vertical swipe
            if (touchChangeY >= 3 * baseSize) {
                hardDropHandler();
            } else if (touchChangeY > 0) {
                touchMoved = "y+";
                moveDownHandler();
            } else if (!touchMoved) {
                touchMoved = "y-";
                rotateHandler();
            }
            touchStartY = touchMoveY;
        }

        event.preventDefault();
    };

    /**
     * Setup the event listeners
     */
    var setupEventListeners = function() {
        var gameWrapper = UI.getElement("wrappers.game").parentElement;

        // Mouse listener
        gameWrapper.addEventListener("click", clickListener);

        // Keyboard listeners
        window.addEventListener("keydown", keyDownListener);
        window.addEventListener("keyup", keyUpListener);

        // Touch listeners
        gameWrapper.addEventListener("touchstart", touchStartListener);
        gameWrapper.addEventListener("touchend", touchEndListener);
        gameWrapper.addEventListener("touchmove", touchMoveListener);
    };

    // Public interface
    Input.isHardDrop = isHardDrop;
    Input.resetHardDrop = resetHardDrop;
    Input.setupEventListeners = setupEventListeners;

    return Input;

})(BlockDrop.Game.Input);
