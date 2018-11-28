const KEY = {
  UP: 38,
  DOWN: 40,
 };

export default class Controller {
  constructor() {
    this.pressedKeys = { up: 0, down: 0 };
  }

  handleKeys(value, e){
    let keys = this.pressedKeys;

    switch (e.keyCode) {
      case KEY.UP:
        keys.up = value;
        break;
      case KEY.DOWN:
        keys.down= value;
        break;
      default:
        return null
    }

    this.pressedKeys = keys;
  }

  bindKeys() {
    window.addEventListener('keyup',   this.handleKeys.bind(this, false));
    window.addEventListener('keydown', this.handleKeys.bind(this, true));
  }

  unbindKeys() {
      window.removeEventListener('keyup', this.handleKeys);
      window.removeEventListener('keydown', this.handleKeys);
  }
}