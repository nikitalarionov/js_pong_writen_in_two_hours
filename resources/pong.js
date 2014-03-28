	// RequestAnimFrame: a browser API for getting smooth animations
	window.requestAnimFrame = (function() {
		return window.requestAnimationFrame    || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     ||  
			function( callback ) {
				return window.setTimeout(callback, 1000 / 1000);
			};
	})();
	window.cancelRequestAnimFrame = (function() {
		return window.cancelAnimationFrame          	||
			window.webkitCancelRequestAnimationFrame    ||
			window.mozCancelRequestAnimationFrame       ||
			window.oCancelRequestAnimationFrame     	||
			window.msCancelRequestAnimationFrame        ||
			clearTimeout
	} )();	

	var canvas = document.getElementById('pong'),
	ctx = canvas.getContext('2d'),
	ball = {}, flag, padles = [], 
	particlePos = {}, particles = [], 
	score = 0, score2 = 0, round = 0,
	multiplier, W, H, init, over = 0, hit = 0, hit2 = 0;
	startBtn = {}, 
	players = [{y: 0}, {y: 0}],
	run = true,
	mouse = {}, particlesCount = 20;

	// Add Global Event to handle keyboards buttons
	window.addEventListener('keydown', function(e) {
		if (e.keyCode === 87) {
			players[0].moveUp = true;
		} else
		if (e.keyCode === 83) {
			players[0].moveDown = true;
		}
	}, false);

	window.addEventListener('keyup', function(e) {
		if (e.keyCode === 87) {
			players[0].moveUp = false;
		} else
		if (e.keyCode === 83) {
			players[0].moveDown = false;
		}
	}, false);

	// Set Canvas Width and Height

	W = window.innerWidth - 25;
	H = window.innerHeight - 100;

	canvas.width = W;
	canvas.height = H;

	// Paint Canvas

	function paintCanvas() {
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, W, H);
	}

	// Initialise the collision sound
	collision = document.getElementById("collide");
	// Initialise round end sound
	round_end = document.getElementById("round_end");

	// Padles Constructor 
	function Padle(w, h, options) {
		// Heigth, width
		this.h = h;
		this.w = w;
		// Position
		this.x = (options.first) ? 10 : W - 30; 
		this.y = H / 2 - this.h / 2;
		// Color
		this.c = options.color || 'black';
	};

	// Create Padles and save it to array

	padles.push(new Padle(20, 150, {
		first: true,
		color: 'white'
	}));

	padles.push(new Padle(20, 150, {
		first: false,
		color: 'white'
	}));

	// store position
	mouse.y = padles[1].y;

	// Add mousemove and mousedown events to the canvas
	canvas.addEventListener("mousemove", trackPosition, true);
	canvas.addEventListener("mousedown", btnClick, true);

	// Track the position of mouse cursor
	function trackPosition(e) {
		mouse.y = e.pageY;
	}


	// Ball object

	ball = {
		x: canvas.width / 2 - 10,
		y: canvas.height / 2 ,
		r: 12,
		c: 'white',
		vx: 8,
		vy: 8,

		// function for drawing ball on canvas
		draw: function() {
			ctx.beginPath();
			ctx.fillStyle = this.c;
			ctx.arc(this.x, this.y, this.r, 0, Math.PI*2, false);
			ctx.fill();
		}
	}

	// Start Button
	startBtn = {
		w: 100,
		h: 50,
		x: W/2 - 50,
		y: H/2 - 50,

		draw: function() {
			ctx.strokeStyle = "white";
			ctx.lineWidth = 2;
			ctx.strokeRect(this.x, this.y, this.w, this.h);
			ctx.font = "18px Arial, sanf-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStyle = "white";
			ctx.fillText("Start", this.x + this.w / 2, this.y + this.h / 2);
			if (round > 0 ) {
				ctx.fillText("Round: " +round, W/2, H/2 + 25 );
				ctx.fillText(" " + score+  " : " + score2, W/2, H/2 + 50 );				
			}
		}
	}

	// Function for creating particles object
	function createParticles(x, y, m) {
		this.x = x || 0;
		this.y = y || 0;
		this.radius = 1.2;
		this.vx = -1.5 + Math.random()*3;
		this.vy = m * Math.random()*1.5;
	}	

	// Function that draw all on canvas
	function Draw() {
		paintCanvas();
		// Draw padles
		for(var i = 0; i < padles.length; i++) {
			p = padles[i];
			ctx.fillStyle = p.c;
			ctx.fillRect(p.x, p.y, p.w, p.h);
		}
		// Draw Ball
		ball.draw();
		update();
	}

	// Function to increase speed after every 5 points
	function increaseSpd() {
		if(hit % 4 == 0 || hit2 % 4 == 0) {
			if(Math.abs(ball.vx) < 15 && ball.vx <= 30 && ball.vy <= 30) {
				ball.vx += (ball.vx < 0) ? -1 : 1;
				ball.vy += (ball.vy < 0) ? -2 : 2;
			}
		}
	}

	// Function for updating score
	function updateScore() {
		ctx.font = "16px Arial, sans-serif";
		ctx.fillStyle = 'white';
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.fillText("Player 1: " + score, 20, 20 );
		ctx.fillText("Player 2: " + score2, W - 100, 20);
		ctx.fillText(hit, 40, 40);
		ctx.fillText(hit2, W - 100, 40);
	}

	// Function that updates everything, score, positions, main game logic
	function update(){
		// Update score
		updateScore();
		// Move the padles
		for(var i = 0; i <= padles.length; i++) {
			var p = padles[i];
			if (i === 0 && players[0].moveUp) {
				if (p.y <= 0) {
					p.y = 0;
				}
				else {
					p.y -=25;	
				}
			}
			if (i === 0 && players[0].moveDown) {
				if (p.y + p.h >= H) {
					p.y = H - p.h;
				}
				else {
					p.y += 25;
				}
			}
			if (mouse.y && i === 1) {
				if (p.y + p.h >= H && mouse.y > p.y) {
					p.y = H - p.h;
				}
				else {
					p.y = (mouse.y -50) - p.w / 10;	
				}
			}
		}

		// Move the ball
		ball.x += ball.vx;
		ball.y += ball.vy;

		// Collision with paddles
		p1 = padles[0];
		p2 = padles[1];

		if(collides(ball, p1)) {
			collideAction(ball, p1);
		}
		else if(collides(ball, p2)) {
			collideAction(ball, p2);
		}

		else {

			if(ball.y + ball.r > H) {
				ball.vy = -ball.vy;
			} 
		
			else if(ball.y < 0) {
				ball.vy = -ball.vy;
			}
			if(ball.x + ball.r > W) {
				ball.vx = 0;
				score++;
				newRound({
					playerWin: 1
				});
			}
			else if(ball.x -ball.r < 0) {
				ball.vx = 0;
				score2++;
				newRound({
					playerWin: 2
				});
			}		
		}

		// If flag is set, push the particles
		if(flag == 1) { 
			for(var k = 0; k < particlesCount; k++) {
				particles.push(new createParticles(particlePos.x, particlePos.y, multiplier));
			}
		}	

		// Emit particles/sparks
		emitParticles();

		// reset flag
		flag = 0;

	}

	//Function to check collision between ball and one of
	//the paddles
	function collides(b, p) {

		if(b.x + ball.r >= p.x + p.w && b.x - ball.r <= p.x + p.w) {

			// Y шарика + радиус больше Y Балки И Y шарика + радиус меньше Y балки + ее высота 
			if (b.y + b.r >= p.y && b.y + b.r <= p.y + p.h && b.x - b.r <= p.x) {
				paddleHit = 1;
				if(b.x < W/ 2) {
					hit++;
				} else if (b.x > W / 2) {
					hit2++;
				}
				return true;
			}
			else if(b.y - b.r <= p.y && b.y - b.r >= p.y - p.h && b.x + b.r >= p.x) {
				paddleHit = 2;
				if(b.x < W/ 2) {
					hit++;
				} else if (b.x > W / 2) {
					hit2++;
				}				
				return true;
			}
			else return false;

		}
	}

	//Do this when collides == true
	function collideAction(ball, p) {
		ball.vx = -ball.vx;
		increaseSpd();
		
		if(collision) {
			if(hit > 0 || hit2 > 0) 
				collision.pause();
			
			collision.currentTime = 0;
			collision.play();
		}
		
		particlePos.x = ball.x;
		flag = 1;
	}

	// Function for emitting particles
	function emitParticles() { 
		for(var j = 0; j < particles.length; j++) {
			par = particles[j];
			ctx.beginPath(); 
			ctx.fillStyle = "black";
			if (par.radius > 0) {
				ctx.arc(par.x, par.y, par.radius, 0, Math.PI*2, false);
			}
			ctx.fill();	 
			
			par.x += par.vx; 
			par.y += par.vy; 
			
			// Reduce radius so that the particles die after a few seconds
			par.radius = Math.max(par.radius - 0.05, 0.0); 
			
		} 
	}

	// Function for running the whole animation
	function animloop() {
		init = requestAnimFrame(animloop);
		Draw();
	}

	// On button click (Restart and start)
	function btnClick(e) {
		if(run){
			animloop();
			run = false;
		}
	}

	// Function to run new round
	function newRound(options) {
		round_end.play();
		ball.vx = 0;
		ball.vy = 0;
		round++;
		ball.x = W / 2 - ball.r / 2;
		ball.y = H / 2 - ball.r;
		for(var i = 0; i<= padles.length; i++) {
			var padle = padles[i];
			switch(i) {
				case 0:
					padle.x = 10; 
					padle.y = H / 2 - padle.h / 2;
					break;
				case 1:
					padle.x = W - 30;
					padle.y = H / 2 - padle.h / 2;
					break;
			}
		}
		run = true;
		startBtn.draw();
		cancelRequestAnimFrame(init);
		if(options.playerWin === 1) {
			ball.vx = 4;
			ball.vy = 8;
		}
		else {
			ball.vx = -4;
			ball.vy = -8;
		}
	}

	// Function to execute at startup
	function startScreen() {
		Draw();
		startBtn.draw();
	}

	// Show the start screen
	startScreen();