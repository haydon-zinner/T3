function Camera(cameraPostion, cameraDirection, cameraUp, cameraYaw, cameraPitch) {

	this.cameraUp = cameraUp;
	this.cameraYaw = cameraYaw;
	this.cameraPitch = cameraPitch;
	this.cameraPosition = cameraPostion;
	this.cameraDirection = cameraDirection;
	this.projectionMatrix = perspective(45, canvas.width / canvas.height, 5, 150);

	this.moveForward = function (amount) {
		this.cameraPosition = add(this.cameraPosition, scale(amount, this.cameraDirection));
		this.calculateViewMatrix();
	};

	this.moveBackward = function (amount) {
		this.cameraPosition = subtract(this.cameraPosition, scale(amount, this.cameraDirection));
		this.calculateViewMatrix();
	};

	this.moveRight = function (amount) {
		this.cameraPosition = add(this.cameraPosition, scale(amount, normalize(cross(this.cameraDirection, this.cameraUp), false)));
		this.calculateViewMatrix();
	};

	this.moveLeft = function (amount) {
		this.cameraPosition = subtract(this.cameraPosition, scale(amount, normalize(cross(this.cameraDirection, this.cameraUp), false)));
		this.calculateViewMatrix();
	};

	this.rotateYawPitch = function (yaw, pitch) {
		this.cameraYaw += yaw;
		this.cameraPitch += pitch;

		if (this.cameraPitch > 89)
			this.cameraPitch = 89;
		if (this.cameraPitch < -89)
			this.cameraPitch = -89;

		var yawInRadians = (this.cameraYaw / 180.0 * 3.141592654);
		var pitchInRadians = (this.cameraPitch / 180.0 * 3.141592654);
		var direction = vec3();

		direction[0] = Math.cos(pitchInRadians) * Math.sin(yawInRadians);
		direction[1] = Math.sin(pitchInRadians);
		direction[2] = Math.cos(pitchInRadians) * Math.cos(yawInRadians);
		this.cameraDirection = normalize(direction, false);
		this.calculateViewMatrix();
	};

	this.calculateViewMatrix = function () {
		this.viewMatrix = lookAt(this.cameraPosition, add(this.cameraPosition, this.cameraDirection), this.cameraUp);
		this.viewProjectionMatrix = mult(this.projectionMatrix, this.viewMatrix);
	};

	this.calculateViewMatrix();
}



