function Events() {
	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;

	this.mouseX = 0;
	this.mouseY = 0;
	this.mouseDragging = false;

	this.curSpeed = 0.02;
	this.oldSpeed = 0;
	this.pTimes = 0;

	this.init = function () {
		//Mouse
		canvas.addEventListener("mousedown", this.onMouseDown, false);
		canvas.addEventListener("mouseup", this.onMouseUp, false);
		canvas.addEventListener("mousemove", this.onMouseMove, false);
		//canvas.addEventListener("wheel", this.onMouseWheel, false);

		//Keyboard
		window.addEventListener("keydown", this.onKeyDown, false);
		window.addEventListener("keyup", this.onKeyUp, false);
	};

	this.onKeyDown = function () {
		//console.log(event.keyCode);

		if (event.keyCode == 87) {// w 87
			this.moveForward = true;
			camera.moveForward(1.0);
		}

		if (event.keyCode == 83) { // s 83
			this.moveBackward = true;
			camera.moveBackward(1.0);
		}

		if (event.keyCode == 65) {// a 65
			this.moveLeft = true;
			camera.moveLeft(1.0);
		}

		if (event.keyCode == 68) {// d 68
			this.moveRight = true;
			camera.moveRight(1.0);
		}

		if (event.keyCode == 187) {// + 187
			this.curSpeed += 0.1;
		}

		if (event.keyCode == 189) {// - 189
			this.curSpeed -= 0.1;
		}

		if (event.keyCode == 80) {// p 80

			if (pTimes == 0) {
				this.oldSpeed = this.curSpeed;
				this.curSpeed = 0;
				this.pTimes = 1;
			} else {
				this.curSpeed = this.oldSpeed;
				this.pTimes = 0;
			}
		}

		if (event.keyCode == 77) {// m 32
			isColorChangePaused = !isColorChangePaused;
		}
	};

	this.onKeyUp = function () {
		if (event.keyCode == 87) // w 87
			this.moveForward = false;

		if (event.keyCode == 83) // s 83
			this.moveBackward = false;

		if (event.keyCode == 65) // a 65
			this.moveLeft = false;

		if (event.keyCode == 68) // d 68
			this.moveRight = false;


	};

	this.onMouseMove = function () {
		if (this.mouseDragging) {
			let deltaX = event.clientX - this.mouseX;
			let deltaY = event.clientY - this.mouseY;

			this.mouseX = event.clientX;
			this.mouseY = event.clientY;

			camera.rotateYawPitch(deltaX/10, deltaY/10);
		}
	};

	this.onMouseDown = function () {
		this.mouseDragging = true;
		this.mouseX = event.clientX;
		this.mouseY = event.clientY;
	};

	this.onMouseUp = function () {
		this.mouseDragging = false;

		console.log(
			"eye: " + camera.cameraPosition +
			" \nAt: " + camera.cameraDirection +
			" \nUp: " + camera.cameraUp +
			" \nYaw: " + camera.cameraYaw +
			" \nPitch: " + camera.cameraPitch);
	};


}