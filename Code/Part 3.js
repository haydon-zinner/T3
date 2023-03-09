var gl;
var canvas;
var program;
var worldMatrixLocation;

var camera;
var events;

// Buffer variables
var posBufferId;
var posBufferId2;
var modelPosBufferId;
var modelNormalBufferId;
var modelTextureBufferId;
var textureBufferId;
var blurFrameBuffer;
var blurFrameBuffer2;
var depthOnlyBuffer;
var blurRes = 512;

// Shader variables
var storeDepthShader;
var shadowMapShader;

// Object, texture and scene variables
var caveModel;
var caveTexture;


window.onload = function init() {
	//Setup WebGL
	canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {alert("WebGL isn't available");}
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0, 0, 0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	//Create Objects
	caveModel = new ColladaParser("assets/meshes/dark_cave.dae");
	caveTexture = new TGAParser("assets/textures/cave_texture.tga").texture;

	//Create camera and event handler objects
	camera = new Camera(vec3(-15.9, 12.1, -6.6), vec3(-0.9, 0.03, -0.3), vec3(0, 1, 0), 250,2.1);
	events = new Events();
	events.init();

	//Create Programs
	program = initShaders(gl, "Shaders/blurShader.vs", "Shaders/blurShader.fs");
	storeDepthShader = initShaders(gl, "Shaders/StoreDepth.vs", "Shaders/StoreDepth.fs");
	shadowMapShader = initShaders(gl, "Shaders/shadowMapShader.vs", "Shaders/shadowMapShader.fs");
	gl.useProgram(program); //bind the basic shader

	//Create position Buffers
	modelPosBufferId = bindData(gl, caveModel.vertexPositionDataRead);
	modelTextureBufferId = bindData(gl, caveModel.vertexTextureDataRead);
	modelNormalBufferId = bindData(gl, caveModel.vertexNormalDataRead);

	// instantiate vertex positions and texture coordinates
	let vertexPositions = [[-1, -1, 0], [1, -1, 0], [-1, 1, 0], [1, 1, 0]];
	let vertexPositionsSmall = [[-1, -1, 0], [-0.5, -1, 0], [-1, -0.5, 0], [-0.5, -0.5, 0]];
	let textureCoordinates = [[0, 0], [1, 0], [0, 1], [1, 1]];

	//Create textures buffers
	posBufferId = bindData(gl, vertexPositions);
	posBufferId2 = bindData(gl, vertexPositionsSmall);
	textureBufferId = bindData(gl, textureCoordinates);

	// set buffers for the first render pass
	enableShaderAttribute(gl, posBufferId, "vPosition", 3, program);
	enableShaderAttribute(gl, textureBufferId, "vTextureCoordinate", 2, program);
	enableShaderAttribute(gl, posBufferId, "vPosition", 3, shadowMapShader);
	enableShaderAttribute(gl, modelNormalBufferId, "aNormal", 3, shadowMapShader);

	//Get world matrix location
	worldMatrixLocation = gl.getUniformLocation(storeDepthShader, "mWorldMatrix");

	//Create Blur Buffers
	blurFrameBuffer = generateBlurBuffer(blurRes, blurRes);
	blurFrameBuffer2 = generateBlurBuffer(blurRes, blurRes);
	depthOnlyBuffer = generateBlurBuffer(blurRes, blurRes);

	//Render
	setInterval(render, 16);
};

// function to instantiate and bind the data to the buffer
function bindData(gl, data) {
	var bufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STATIC_DRAW);
	return bufferId; // return the buffer after instantiation and binding
}

// function to load the data into the GPU and associate with shaders and shader program
function enableShaderAttribute(gl, bufferId, shaderAttributeName, numberOfElements, shaderProgram) {
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
	var attributeLocation = gl.getAttribLocation(shaderProgram, shaderAttributeName);
	gl.vertexAttribPointer(attributeLocation, numberOfElements, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(attributeLocation);
}

// function to generate the gaussian blur filters for the shadows
function generateBlurBuffer(bufferWidth, bufferHeight) {
	var renderTargetTexture = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, renderTargetTexture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, bufferWidth, bufferHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	// Create a framebuffer object (FBO)
	var frameBuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

	// Create a renderbuffer object to store depth information
	var renderBuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, bufferWidth, bufferHeight);

	// Attach the texture object to the colour attachment of the framebuffer object
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderTargetTexture, 0);

	// Attach the renderbuffer object to the depth attachment of the framebuffer object
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);

	// Check whether FrameBufferObject is configured correctly, if yes the 3 objects are successfully created, then we switch back to the default buffer
	var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
	if (status !== gl.FRAMEBUFFER_COMPLETE) {
		alert('Framebuffer Not Complete');
	}

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);

	return [renderTargetTexture, frameBuffer, renderBuffer];
}

function render() {

	gl.activeTexture(gl.TEXTURE0); //bind the depth map first
	gl.bindTexture(gl.TEXTURE_2D, depthOnlyBuffer[0]);

	//Render scene from the light source perspective using the depth buffer shader
	gl.bindFramebuffer(gl.FRAMEBUFFER, depthOnlyBuffer[1]);
	gl.bindRenderbuffer(gl.RENDERBUFFER, depthOnlyBuffer[2]);
	gl.viewport(0, 0, blurRes, blurRes);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(storeDepthShader);
	gl.uniformMatrix4fv(gl.getUniformLocation(storeDepthShader, "mWorldMatrix"), false, flatten(camera.viewProjectionMatrix));
	enableShaderAttribute(gl, modelPosBufferId, "vPosition", 3, storeDepthShader);
	gl.drawArrays(gl.TRIANGLES, 0, caveModel.vertexPositionDataRead.length / 3);

	//Render to texture blurX
	gl.useProgram(program);
	gl.uniform1i(gl.getUniformLocation(program, "textureSource"), 0);
	enableShaderAttribute(gl, posBufferId, "vPosition", 3, program);
	enableShaderAttribute(gl, textureBufferId, "vTextureCoordinate", 2, program);
	gl.bindTexture(gl.TEXTURE_2D, depthOnlyBuffer[0]);
	gl.uniform2f(gl.getUniformLocation(program, "ScaleU"), 1.0 / (blurRes), 0.0);
	gl.bindFramebuffer(gl.FRAMEBUFFER, blurFrameBuffer2[1]);
	gl.bindRenderbuffer(gl.RENDERBUFFER, blurFrameBuffer2[2]);
	gl.viewport(0, 0, blurRes, blurRes);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	enableShaderAttribute(gl, textureBufferId, "vTextureCoordinate", 2, program);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	//Render to texture blurY (y axis)
	gl.bindTexture(gl.TEXTURE_2D, blurFrameBuffer2[0]);
	gl.uniform2f(gl.getUniformLocation(program, "ScaleU"), 0.0, 1.0 / (blurRes));
	gl.bindFramebuffer(gl.FRAMEBUFFER, blurFrameBuffer[1]);
	gl.bindRenderbuffer(gl.RENDERBUFFER, blurFrameBuffer[2]);
	gl.viewport(0, 0, blurRes, blurRes);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	//Draw the main scene from the camera with shadows
	gl.useProgram(shadowMapShader);
	gl.activeTexture(gl.TEXTURE0 + 1); //both textures active to blend

	let trInvWorldMatrix = inverse(transpose(camera.viewProjectionMatrix)); //inverse of how the world is seen so

	//Pass matrix projections in for lighting and world warping
	gl.uniformMatrix4fv(gl.getUniformLocation(shadowMapShader, "mWorldMatrix"), false, flatten(camera.viewProjectionMatrix));
	gl.uniformMatrix4fv(gl.getUniformLocation(shadowMapShader, "uViewMatrix"), false, flatten(camera.viewMatrix));
	gl.uniformMatrix4fv(gl.getUniformLocation(shadowMapShader, "uProjMatrix"), false, flatten(camera.projectionMatrix));
	gl.uniformMatrix4fv(gl.getUniformLocation(shadowMapShader, "mLightWorldMatrix"), false, flatten(camera.viewProjectionMatrix));
	gl.uniformMatrix4fv(gl.getUniformLocation(shadowMapShader, "uTransposeInverseWorldMatrix"), false, flatten(trInvWorldMatrix));
	gl.uniform3fv(gl.getUniformLocation(shadowMapShader, "lightPos"), flatten(camera.cameraPosition));

	//black void here not white
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.bindTexture(gl.TEXTURE_2D, blurFrameBuffer[0]);
	gl.uniform1i(gl.getUniformLocation(shadowMapShader, "ShadowMap"), 0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//associate buffers with shader variables
	enableShaderAttribute(gl, modelPosBufferId, "vPosition", 3, shadowMapShader);
	enableShaderAttribute(gl, modelTextureBufferId, "aTextureCoordinate", 2, shadowMapShader)
	enableShaderAttribute(gl, modelNormalBufferId, "aNormal", 3, shadowMapShader);
	gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
	gl.uniform1i(gl.getUniformLocation(shadowMapShader, "myTexture"), 1);
	gl.drawArrays(gl.TRIANGLES, 0, caveModel.vertexPositionDataRead.length / 3);
}


