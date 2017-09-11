// Geometry helper methods
var Geometry = {};

Geometry.matrixMultiply = function(m1, m2) {
	if (typeof(m1[0]) == "number") {
		m1 = [m1];
	}
	if (typeof(m2[0]) == "number") {
		m2 = [m2];
	}

	if (m1.length != m2[0].length) {
		throw "Illegal dimensions!";
	}

	var product = [];

	for (var i = 0; i < m2.length; i++) {
		product[i] = [];
	}

	for (var i = 0; i < product.length; i++) {
		for (var j = 0; j < m1[0].length; j++) {
			var sum = 0;

			for (var l = 0; l < m1.length; l++) {
				sum += m1[l][j] * m2[i][l];
			}

			product[i][j] = sum;
		}
	}

	if (m2.length == 1) {
		return product[0];
	}
	else {
		return product;
	}
};

Geometry.vectorAdd = function(v1, v2) {
	for (var i = 0; i < v1.length; i++)
		v1[i] += v2[i];
};

Geometry.vectorScalarMultiply = function(v, s) {
	for (var i = 0; i < v.length; i++)
		v[i] *= s;
};

Geometry.vectorCrossProduct = function(v1, v2) {
	return [v1[1] * v2[2] - v1[2] * v2[1], v1[2] * v2[0] - v1[0] * v2[2], v1[0] * v2[1] - v1[1] * v2[0]];
};

Geometry.vectorDotProduct = function(v1, v2) {

	var product = 0;

	for (var i = 0; i < v1.length; i++) {
		product += v1[i] * v2[i];
	}

	return product;
};

Geometry.vectorMagnitude = function(v) {
	return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
};

Geometry.normalizeVector = function(v) {
	var magnitude = Geometry.vectorMagnitude(v);
	
	for (var i = 0; i < v.length; i++)
		v[i] /= magnitude;
};

Geometry.getYRotationMatrix = function(y, s, tx, ty, tz) {
	return [[s * Math.cos(y), 0, -1 * s * Math.sin(y), 0],
	[0, s, 0, 0],
	[s * Math.sin(y), 0, s * Math.cos(y), 0],
	[tx, ty, tz, 1]];
};

Geometry.getXRotationMatrix = function(x, s, tx, ty, tz) {
	return [[s, 0, 0, 0],
	[0, s * Math.cos(x), s * Math.sin(x), 0],
	[0, -1 * s * Math.sin(x), s * Math.cos(x), 0],
	[tx, ty, tz, 1]];
};

Geometry.getZRotationMatrix = function(z, s, tx, ty, tz) {
	return [[s * Math.cos(z), s * Math.sin(z), 0, 0],
	[-1 * s * Math.sin(z), s * Math.cos(z), 0, 0],
	[0, 0, s, 0],
	[tx, ty, tz, 1]];
};

Geometry.getRotationMatrix = function(x, y, z, s, tx, ty, tz) {
	return Geometry.matrixMultiply(Geometry.getXRotationMatrix(x, s, tx, ty, tz), 
		Geometry.matrixMultiply(Geometry.getZRotationMatrix(z, 1, 0, 0, 0), Geometry.getYRotationMatrix(y, 1, 0, 0, 0)));
};