// F1 Reaction Time Simulator using p5.js

let game;
let state = "menu"; // Possible states: menu, countdown, game, end  
let highScore = 0; // highscore is 0 to start off with
// Different states: menu (at the start), countdown (When "Start Game" button is clicked, game (Where actual gameplay occurs, end (after the gameplay has occured and countdown reached 0)
function setup() {
    createCanvas(800, 600);
    game = new F1ReactionGame();
}


function preload() { // Loads an image of an F1 driver as background - this will display Lewis Hamilton winning a Grand Prix
    // Load an image of an F1 driver as background
    bgImage = loadImage("https://media.formula1.com/image/upload/f_auto,c_limit,w_1440,q_auto/f_auto/q_auto/content/dam/fom-website/manual/Misc/Verstappenbacktobacktitles/hamilton%201");
}

function draw() {
    background(bgImage);

    if (state === "menu") {
        drawMenu();
    } else if (state === "countdown") {
        game.drawCountdown();
    } else if (state === "game") {
        game.run();
    } else if (state === "end") {
        drawEndScreen();
    }
}


// different states mentioned, with certain conditions than prompting the simulator to be in different modes, whether it's menu/countdown/game/end
function drawMenu() {
    textAlign(CENTER);
    fill(255);
    textSize(32);
    text("F1 Reaction Time Simulator", width / 2, height / 3); // displays Title of game

    textSize(24);
    text("High Score: " + highScore, width / 2, height / 2 - 20); // displays "high score" underneath with assigned number, starting with 0 from line 5

    fill(100, 200, 100);
    rect(width / 2 - 100, height / 2, 200, 50);

    fill(255);
    textSize(18);
    text("Start Game", width / 2, height / 2 + 30); // displays "Start game" text in green box

    textSize(16);
    text("Difficulty:", width / 2 - 120, height / 2 + 100); // displays "difficulty" text

    fill(255, 0, 0);
    rect(width / 2 - 70, height / 2 + 80, 50, 30); // displays easy box

    fill(255, 165, 0);
    rect(width / 2, height / 2 + 80, 50, 30); // displays intermediate box

    fill(0, 0, 255);
    rect(width / 2 + 70, height / 2 + 80, 50, 30); // displays hard box

    fill(255);
    text("Easy", width / 2 - 45, height / 2 + 100); // displays "easy" text in easy box
    text("Intermediate", width / 2 + 25, height / 2 + 100); // displays "intermediate" text in intermediate box
    text("Hard", width / 2 + 95, height / 2 + 100); // displays "hard" text in hard box
}

function drawEndScreen() { // function to draw "end" mode of game 
    textAlign(CENTER);  // puts text center
    fill(255);
    textSize(32);
    text("Game Over", width / 2, height / 3); // displays "Game over" text at end mode/state
    text("Score: " + game.score, width / 2, height / 2); // displays "Score" text below

    if (game.score > highScore) { // condition/ selection structure to see if current score is higher high score. If so, will set current score as new high score
        highScore = game.score;
        text("New High Score!", width / 2, height / 2 + 40); // displays "New High Score" text
    }

    fill(100, 200, 100);
    rect(width / 2 - 100, height / 2 + 80, 200, 50);

    fill(255);
    textSize(18);
    text("Back to Menu", width / 2, height / 2 + 110); // displays "Back to Menu" text at end state/mode
}

function mousePressed() { // function for certain commands for the mouse when clicked - in "menu" state, if the mouse is pressed inside the are of the "Start Game" box, set state to "countdown" and start game from there. Now if the mouse is pressed either in the coordinates of the easy/intermediate/hard box, then it will set the difficulty of the game to either easy/intermediate/hard, by decreasing the target sizes and by adding more targets onto the screen.
    if (state === "menu") { 
        if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 && mouseY > height / 2 && mouseY < height / 2 + 50) {
            state = "countdown";
            game.startCountdown();
        }

        if (mouseY > height / 2 + 80 && mouseY < height / 2 + 110) {
            if (mouseX > width / 2 - 70 && mouseX < width / 2 - 20) {
                game.setDifficulty("easy");
            } else if (mouseX > width / 2 && mouseX < width / 2 + 50) {
                game.setDifficulty("intermediate");
            } else if (mouseX > width / 2 + 70 && mouseX < width / 2 + 120) {
                game.setDifficulty("hard");
            }
        }
    } else if (state === "end") { // when the mouse presses the coordiantes of the "Back to Menu" box, it will set state of game back to "menu", allowing the game to restart/loop itself (with the high score implemented) 
        if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 && mouseY > height / 2 + 80 && mouseY < height / 2 + 130) {
            state = "menu";
        }
    } else if (state === "game") {
        game.checkHit(mouseX, mouseY);
    }
}

// Base Class for Game Objects
class GameObject { // creates classes for objects, with attributes for location (x/y coordinates) and size
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
    }

    display() {
        // Default display method (to be overridden by child classes)
        fill(255);
        ellipse(this.x, this.y, this.size);
    }

    isHit(mx, my) {
        return dist(mx, my, this.x, this.y) < this.size / 2;
    }
}

// Target Class extending GameObject
class Target extends GameObject { //the inheritance OOP creates a subclass for the target which is to be pressed on, with attributes for size and colour
    constructor(x, y, size, color) {
        super(x, y, size);
        this.color = color;
    }

    display() {
        fill(this.color);
        noStroke();
        ellipse(this.x, this.y, this.size);
    }

    relocate(w, h) {
        this.x = random(w);
        this.y = random(h);
    }
}

// F1ReactionGame Class
class F1ReactionGame { // creates a class for the gameplay, with the attributes for the score: 0, targets: randomly-assigned locations, timer: 30, difficulties: easy/intermediate/hard, target colours: red/green/blue, time for the countdown: 3
    constructor() {
        this.score = 0;
        this.targets = [];
        this.timer = 30; // Game duration in seconds
        this.difficulty = "easy";
        this.targetColors = [color(255, 0, 0), color(0, 255, 0), color(0, 0, 255)];
        this.countdownValue = 3;
    }

    setDifficulty(level) {
        this.difficulty = level;
    }

    startCountdown() { // when countdown state ends, game menu starts with score starting at 0, timer starting at 30, and targets on random coordinates
        this.score = 0;
        this.timer = 30;
        this.targets = [];

        for (let i = 0; i < this.getTargetCount(); i++) {
            this.targets.push(new Target(random(width), random(height), this.getTargetSize(), random(this.targetColors))); // when targets are pressed, targets are relocated to random coordinates (assigned as width and height in the canvas) to then be presssed again
        }
    }

    drawCountdown() { // function to display countdown in 'countdown' state
        background(bgImage);
        textAlign(CENTER); // put countdown in center of screen
        fill(255);
        textSize(48); // text size of countdown

        if (this.countdownValue > 0) {
            text(this.countdownValue, width / 2, height / 2);

            if (frameCount % 60 === 0) {
                this.countdownValue--; // countdownValue = countdownValue - 1: countdown value decreases by 1
            }
        } else {
            state = "game";
        }
    }

    run() {
        background(bgImage);
        this.updateTimer();

        textAlign(LEFT);
        fill(255);
        textSize(20);
        text("Score: " + this.score, 20, 40); // 'score' text is displayed on the top-left side of the screen
        text("Time: " + nf(this.timer, 2, 0), 20, 70); // 'time' heading is displayed on the top-left side of the screen, below the 'score' text

        for (let target of this.targets) {
            target.display();
        }

        if (this.timer <= 0) { // once timer reaches 0, the game 'state' is ended and the function to draw the end screen is permitted, before returning back to the menu 'state'
            state = "end";
        }
    }

    updateTimer() {
        if (frameCount % 60 === 0 && this.timer > 0) {
            this.timer--;
        }
    }

    checkHit(x, y) {
        for (let target of this.targets) {
            if (target.isHit(x, y)) { // condition to check if target is hit in required coordinates
                this.score++; // score = score + 1: score goes up by 1
                target.relocate(width, height); // will reloacte to a random height and width in the canvas
                break;
            }
        }
    }

    getTargetCount() {
        if (this.difficulty === "easy") return 3; // if difficutly selected is 'easy' then amount of targets in game is set to 3
        if (this.difficulty === "intermediate") return 5; // else if difficulty selected is 'intermediate' then amount of targets in game is set to 5
        return 8; // else if diffculty isn't selected on 'easy' or 'intermediate' (therefore they've selected 'hard' difficulty) the amount of targets is set to 8
    }

    getTargetSize() {
        if (this.difficulty === "easy") return 50; // if difficulty selected is 'easy' then size of the targets is set to 50 pixels
        if (this.difficulty === "intermediate") return 30; // else if difficulty selected is 'intermediate' then size of the targets is set to 30 pixels, making it smaller and therefore harder to press
        return 20; // else if diffculty isn't selected on 'easy' or 'intermediate' (therefore they've selected 'hard' difficulty) the size of targets is set to 20 pixels, making them even smaller
    }
}
