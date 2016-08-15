import React, { Component } from 'react';

import Store from '../Store.js';
import BasicLesson from '../lessons/BasicLesson.js';

// TODO - migrate somewhere better.
const LESSONS = [{
  name: 'trial',
  state: new BasicLesson({
    notes: 2,
  }),
}];

class LessonList extends Component {
  render() {
    return (
      <div className="lessonList">
        <div className="listHolder">
          {LESSONS.map((lesson, i) => {
            const handler = () => this.pickLesson(lesson);
            return (
              <div key={i} className="listItem" onClick={handler}>
                {lesson.name}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  pickLesson(lesson) {
    Store.dispatch({
      type: 'SET_ACTIVE_LESSON', lesson,
    });
    lesson.state.start();
  }
}

export default LessonList;
