import React, { Component } from 'react';
import './App.css';

import ActiveLesson from './elements/ActiveLesson';
import LessonList from './elements/LessonList';

class App extends Component {
  render() {
    return (
      <div className="app">
        <div className="header">
          <h2>Perfect pitch training</h2>
        </div>
        <div className="content">
          <LessonList />
          <ActiveLesson />
        </div>
      </div>
    );
  }
}

export default App;
