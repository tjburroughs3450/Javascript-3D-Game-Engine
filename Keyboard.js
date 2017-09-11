function Keyboard() {
  var pressed = {};

  window.addEventListener('keyup', function(event) { delete pressed[event.key]; }, false);
  window.addEventListener('keydown', function(event) { pressed[event.key] = true; }, false);

  this.isDown = function(key) {
    return pressed[key];
  }
}