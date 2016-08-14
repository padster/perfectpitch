import React, { Component } from 'react';

import Store from '../Store.js';

class ActiveLesson extends Component {
  storeListener: null;

  // HACK - should observe store values instead :(
  componentDidMount() {
    this.storeListener = Store.subscribe(() => this.forceUpdate());
  }
  componentWillUnmount() {
    if (this.storeListener) {
      this.storeListener();
    }
  }

  render() {
    const lesson = Store.getState().activeLesson;
    return (
      <div className="activeLesson">
        {lesson == null ? this.renderNoLesson() : this.renderLesson(lesson)}
      </div>
    );
  }

  renderNoLesson() {
    return "Pick a lesson...";
  }

  renderLesson(lesson) {
    return (
      <div>
        Lesson: {lesson.name}
      </div>
    );
  }
}

export default ActiveLesson;
