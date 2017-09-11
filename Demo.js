// Very crude demo of the 3D rendering tools

var core, keyboard;
var playerPos = [0, 0, -1000];
var gravity = -1;
var velocity = 0;
var yRotation = 0;
var moveSpeed = 10;
var rotationSpeed = .1;
var models = [];

models.push(Models.createEntity(Models.PYRAMID, 0, -30, 0, 0, 0, 0, 60, "#07f2ea"));
models.push(Models.createEntity(Models.PYRAMID, 150, -30, 0, 0, 0.785398, 0, 40, "#f4425c"));
models.push(Models.createEntity(Models.PYRAMID, 0, -30, 150, 0, 0, 0, 50, "#0066ff"));

function render(ctx) {
	ctx.font = '48px serif';
	ctx.fillStyle = "white";
	ctx.fillText("Rendering Demo", 50, 100);
}

function update() {
	if (keyboard.isDown("s")) {
		Geometry.vectorAdd(playerPos, [moveSpeed * Math.sin(yRotation), 0, -1 * moveSpeed * Math.cos(yRotation)]);
	}

	if (keyboard.isDown("w")) {
		Geometry.vectorAdd(playerPos, [-1 * moveSpeed * Math.sin(yRotation), 0, moveSpeed * Math.cos(yRotation)]);
	}

	if (keyboard.isDown("a")) {
		Geometry.vectorAdd(playerPos, [moveSpeed * Math.sin(yRotation + Math.PI / 2), 0, -1 * moveSpeed * Math.cos(yRotation + Math.PI / 2)]);
	}

	if (keyboard.isDown("d")) {
		Geometry.vectorAdd(playerPos, [moveSpeed * Math.sin(yRotation - Math.PI / 2), 0, -1 * moveSpeed * Math.cos(yRotation - Math.PI / 2)]);
	}

	if (keyboard.isDown(" ") && playerPos[1] == 0) {
		velocity = 20;
	}

	if (keyboard.isDown("ArrowLeft")) {
		yRotation -= rotationSpeed;
	}

	if (keyboard.isDown("ArrowRight")) {
		yRotation += rotationSpeed;
	}

	velocity += gravity;
	playerPos[1] += velocity;

	if (playerPos[1] <= 0) {
		playerPos[1] = 0;
		velocity = 0;
	}

	core.setCameraPos(playerPos[0], playerPos[1], playerPos[2]);
	core.setYRotation(yRotation);
}

window.onload = function() {
	core = new GameCore(60, 60, 1200, 750, 1.39);
	core.setUpdateMethod(update);
	core.setRenderMethod(render);

	core.setLightPos(1000, 100, -1000);
	core.setModels(models);

	keyboard = new Keyboard();

	core.startLoop();
};