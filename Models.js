// Model collection
var Models = {};

Models.TRIANGLE = [[1, -1, 0, 1], [-1, -1, 0, 1], [0, 1, 0, 1]];

Models.PYRAMID = [[1, -.707, -1, 1], [-1, -.707, -1, 1], [0, .707, 0, 1], [-1, -.707, 1, 1], [1, -.707, 1, 1], [0, .707, 0, 1],
				[-1, -.707, -1, 1], [-1, -.707, 1, 1], [0, .707, 0, 1], [1, -.707, 1, 1], [1, -.707, -1, 1], [0, .707, 0, 1], 
				[-1, -.707, -1, 1], [1, -.707, -1, 1], [-1, -.707, 1, 1], [1, -.707, 1, 1], [-1, -.707, 1, 1], [1, -.707, -1, 1]];

Models.SQUARE = [[1, 0, -1, 1], [-1, 0, -1, 1], [1, 0, 1, 1], [-1, 0, -1, 1], [-1, 0, 1, 1], [1, 0, 1, 1]];

// Create an entity from model
Models.createEntity = function(model, x, y, z, xRot, yRot, zRot, scale, color) {
	return {
		worldPos: [x, y, z, 1], 
		model: model, 
		xRotation: xRot, 
		yRotation: yRot,
		zRotation: zRot,
		scale: scale, 
		color: color 
	};
};