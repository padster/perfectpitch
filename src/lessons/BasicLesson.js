import React from 'react';

import Store from '../Store.js';

const ACTIONS = [{
  text: 'Starting in 3 seconds...',
  delay: 3000,
}, {
  text: 'Playing sound...',
  delay: 3000,
}, {
  text: 'HACK',
}];

class BasicLesson {
  actionAt: number;

  message: string;

  constructor({notes}) {
    this.notes = notes;
    this.actionAt = -1;
  }

  start() {
    this.actionAt = -1;
    this._applyStep();
  }

  getStep(): number {
    return this.actionAt;
  }

  render() {
    return (
      <div>
        {this.message}
      </div>
    )
  }

  _applyStep() {
    this.actionAt++;
    if (this.actionAt >= ACTIONS.length) {
      return;
    }
    console.log("running step: %d", this.actionAt);
    const action = ACTIONS[this.actionAt];
    if (action.text !== undefined) {
      this.message = action.text;
    }
    const delay = ACTIONS[this.actionAt].delay;
    window.setTimeout(this._applyStep.bind(this), delay);
    Store.dispatch({type: 'PROGRESS_LESSON', step: this.actionAt});
  }
}

export default BasicLesson;
