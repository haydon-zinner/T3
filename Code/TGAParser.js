function stringToArrayBuffer(str) {
	var buf = new ArrayBuffer(str.length);
	var bufView = new Uint8Array(buf);

	for (var i = 0, strLen = str.length; i < strLen; i++) {
		bufView[i] = str.charCodeAt(i);
	}

	return buf;
}

function TgaCallback(objCode) {
	if (!objCode) {
		alert("Could not find shader source: " + fileName);
	}
	var bufView = new Uint8Array(objCode);
	var height = (bufView[15] << 8) + bufView[14];
	var width = (bufView[13] << 8) + bufView[12];
	var pixelDepth = bufView[16];

	//gl.glBindTexture(GL2.GL_TEXTURE_2D,textureId);
	cubeTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
	var byteSkip = pixelDepth / 8;
	var offset = 18;
	var offsetByte = 0;
	for (var i = 0; i < bufView.length - offset; i += 3) {
		bufView[i] = bufView[offsetByte + offset + 2];
		bufView[i + 1] = bufView[offsetByte + offset + 1];
		bufView[i + 2] = bufView[offsetByte + offset];
		offsetByte += byteSkip;
	}

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, bufView);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.bindTexture(gl.TEXTURE_2D, null);

}

function TGAParser(fileName) {
	this.texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, this.texture);

	var oReq;
	if (window.XMLHttpRequest) {
		oReq = new XMLHttpRequest();
	}

	if (oReq != null) {

		// <!-- change localhost to your server name if applicable -->
		var sUrl = fileName;

		//<!-- pass true for the bAsync parameter -->
		oReq.open("GET", sUrl, true);
		oReq.responseType = "arraybuffer";

		oReq.onreadystatechange = function () {
			if (oReq.readyState == 4 && oReq.status == 200) {

				TgaCallback(oReq.response);
			}
		};

		oReq.send();
	} else {
		window.alert("Error creating XmlHttpRequest object.");
	}

} 