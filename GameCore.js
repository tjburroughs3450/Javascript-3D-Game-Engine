// Manages the game loop, and rendering of 3D models
function GameCore(framesPerSecond, updatesPerSecond, width, height, fieldOfView) {
	// Number of rendered frames per second
	var fps = framesPerSecond;
	// Number of updates per second
	var ups = updatesPerSecond;
	// Horizontal field of view
	var fovH = fieldOfView;
	// Backface culling optimization toggle
	var backFaceCulling = true;
	// Painter algorithm toggle
	var painterAlgorithm = true;
	// Function handle for external update method
	var updateMethod = null;
	// Function handle for external render method
	var renderMethod = null;
	// Model buffer
	var models = [];
	// Wireframe
	var wireFrame = false;
	// Wireframe color
	var wireFrameColor = "white";

	// Compute verticle field of view
	var fovV = 2 * Math.atan(height * Math.tan(fovH / 2) / width);

	if (fovV < 0) {
		fovV += Math.PI;
	}

	// Camera position
	var cameraPos = [0, 0, 0, 1];
	// Light source
	var lightSource = [0, 0, 0, 1];
	// X-axis rotation
	var xRotation = 0;
	// Y-axis rotation
	var yRotation = 0;
	// Z-axis rotation
	var zRotation = 0;

	// Create the canvas
	var canvas = document.createElement("canvas");
	canvas.setAttribute("style", "background-color:#424242; padding-left: 0; padding-right: 0; margin-left: auto; margin-right: auto; display: block;")
	var ctx = canvas.getContext("2d");
	canvas.width = width;
	canvas.height = height;
	document.body.appendChild(canvas);


	// Game loop management variables
	var running = false;
	var counter = 0;

	// Game loop
	var gameLoop = function() {
		if (running) {
			var start = Date.now();

			if (updateMethod != null && counter % (fps / ups) == 0) {
				updateMethod();
			}

			// Rendering
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			if (renderMethod != null) {
				renderMethod(ctx);
			}
			
			endRender();

			counter += 1;

			finish = Date.now();

			if (finish - start > 1000 / fps)
				console.log("Running slow");

			secondsToNext = 1000 / fps - (finish - start);

			setTimeout(gameLoop, secondsToNext);
		}
	};

	// Color helper method
	var ColorLuminance = function(hex, lum) {
		// validate hex string
		hex = String(hex).replace(/[^0-9a-f]/gi, '');
		if (hex.length < 6) {
			hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
		}
		lum = lum || 0;

		// convert to decimal and change luminosity
		var rgb = "#", c, i;
		for (i = 0; i < 3; i++) {
			c = parseInt(hex.substr(i*2,2), 16);
			c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
			rgb += ("00"+c).substr(c.length);
		}

		return rgb;
	};

	// Projection helper method
	var getProjection = function(point) {
		return [point[0] * canvas.width / (point[2] * 2 * Math.tan(fovH / 2)), point[1] * canvas.height / (point[2] * 2 * Math.tan(fovV / 2)), point[2]];
	};

	var endRender = function() {
		// Buffer for transformed models
		var transformedModels = [];

		// Rotation matrix for camera
		var cameraRotationMatrix = Geometry.getRotationMatrix(xRotation, yRotation, zRotation, 1, 0 ,0, 0);

		// Adjust light source position
		var lightSourceAdjusted = [lightSource[0] - cameraPos[0], lightSource[1] - cameraPos[1], lightSource[2] - cameraPos[2], lightSource[3]];
		lightSourceAdjusted = Geometry.matrixMultiply(cameraRotationMatrix, lightSource);

		// Transform models
		for (var key in models) {
			// Model properties (easier to read this way)
			var worldPos = models[key].worldPos; // position of model
			var model = models[key].model; // vertices
			var scale = models[key].scale; // scaling factor for model
			var xRot = models[key].xRotation; // rotation of model about x
			var yRot = models[key].yRotation; // rotation of model about y
			var zRot = models[key].zRotation; // rotation of model about z
			var color = models[key].color; // model color

			// Transform prototype model into world with appropriate scale/rotation/position (adjusted for camera pos)
			model = Geometry.matrixMultiply(Geometry.getRotationMatrix(xRot, yRot, zRot, scale, worldPos[0] - cameraPos[0], 
				worldPos[1] - cameraPos[1], worldPos[2] - cameraPos[2]), model);

			// Rotate model according to camera orientation
			model = Geometry.matrixMultiply(cameraRotationMatrix, model);

			var adjustedPosition = Geometry.matrixMultiply(cameraRotationMatrix, [worldPos[0] - cameraPos[0], 
				worldPos[1] - cameraPos[1], worldPos[2] - cameraPos[2], 0]);

			transformedModels.push({
				model: model,
				distance: Geometry.vectorMagnitude(adjustedPosition),
				color: color
			});
		}

		// Painters
		if (painterAlgorithm) {
			transformedModels.sort(function(a, b) {
				return b.distance - a.distance;
			});
		}

		// Draw faces
		for (var i = 0; i < transformedModels.length; i++) {
			var model = transformedModels[i].model;

			for (var j = 0; j < model.length; j += 3) {
				// Crude don't draw condition
				if (model[j][2] < 0 || model[j + 1][2] < 0 || model[j + 2][2] < 0)
					continue;

				// Compute surface normal
				var v1 = [model[j + 1][0] - model[j][0], model[j + 1][1] - model[j][1], model[j + 1][2] - model[j][2]];
				var v2 = [model[j + 2][0] - model[j][0], model[j + 2][1] - model[j][1], model[j + 2][2] - model[j][2]];

				var normal = Geometry.vectorCrossProduct(v1, v2);

				if (backFaceCulling && Geometry.vectorDotProduct(normal, model[j]) > 0) {
					continue;
				}

				var center = [(model[j][0] + model[j + 1][0] + model[j + 2][0]) / 3, (model[j][1] + model[j + 1][1] + model[j + 2][1]) / 3,
				(model[j][2] + model[j + 1][2] + model[j + 2][2]) / 3];

				// Flat shading
				var lightToSurface = [center[0] - lightSourceAdjusted[0], center[1] - lightSourceAdjusted[1], 
				center[2] - lightSourceAdjusted[2]];
				
				Geometry.normalizeVector(lightToSurface);
				Geometry.normalizeVector(normal);

				var triangle = [getProjection(model[j]), getProjection(model[j + 1]), getProjection(model[j + 2])];

				ctx.beginPath();
				ctx.moveTo(canvas.width / 2 - triangle[0][0], canvas.height / 2 - triangle[0][1]);
				ctx.lineTo(canvas.width / 2 - triangle[1][0], canvas.height / 2 - triangle[1][1]);
				ctx.lineTo(canvas.width / 2 - triangle[2][0], canvas.height / 2 - triangle[2][1]);
				ctx.closePath();

				var faceColor = ColorLuminance(transformedModels[i].color, -1 * Geometry.vectorDotProduct(normal, lightToSurface));
				
				if (wireFrame) {
					ctx.strokeStyle = wireFrameColor;
				}

				else {
					ctx.strokeStyle = faceColor;
				}

				ctx.fillStyle = faceColor;

				ctx.stroke();
				ctx.fill();
			}
		}
	};
	
	// Start game loop
	this.startLoop = function() {
		if (!running) {
			running = true;
			gameLoop();
		}
	};

	// Stop game loop
	this.stopLoop = function() {
		running = false;
	};

	// Getters/setters
	this.setCameraPos = function(x, y, z) {
		
		cameraPos[0] = x;
		cameraPos[1] = y;
		cameraPos[2] = z;
	};

	this.setXRotation = function(p) {
		xRotation = p;
	};

	this.setYRotation = function(p) {
		yRotation = p;
	};

	this.setZRotation = function(p) {
		zRotation = p;
	};

	this.setLightPos = function(x, y, z) {
		lightSource[0] = x;
		lightSource[1] = y;
		lightSource[2] = z;
	};

	this.setFPS = function(f) {
		fps = f;
	};

	this.setUPS = function(u) {
		ups = u;
	};

	this.setWidth = function(p) {
		canvas.width = p;

		// Compute verticle field of view
		var fovV = 2 * Math.atan(height * Math.tan(fovH / 2) / width);

		if (fovV < 0) {
			fovV += Math.PI;
		}
	};

	this.setHeight = function(p) {
		canvas.height = p;

		// Compute verticle field of view
		var fovV = 2 * Math.atan(height * Math.tan(fovH / 2) / width);

		if (fovV < 0) {
			fovV += Math.PI;
		}
	};

	this.setFOV = function(f) {
		fovH = f;

		fovV = 2 * Math.atan(canvas.height * Math.tan(fovH / 2) / canvas.width);

		if (fovV < 0) {
			fovV += Math.PI;
		}
	};

	this.setBackFaceCulling = function(p) {
		backFaceCulling = p;
	};

	this.setPainterAlgorithm = function(p) {
		painterAlgorithm = p;
	};

	this.setUpdateMethod = function(p) {
		updateMethod = p;
	};

	this.setRenderMethod = function(p) {
		renderMethod = p;
	};

	this.setModels = function(p) {
		models = p;
	};

	this.setWireFrame = function(p) {
		wireFrame = p;
	};

	this.setWireFrameColor = function(p) {
		wireFrameColor = p;
	};
}