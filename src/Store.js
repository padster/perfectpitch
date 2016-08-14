import { combineReducers, createStore } from 'redux'

function activeLesson(state = null, action) {
  switch (action.type) {
    case 'SET_ACTIVE_LESSON':
      return action.lesson;
    default:
      // ignore.
  }
  return state;
}

let Store = createStore(combineReducers({activeLesson}));
Store.subscribe(() => {
  console.log('State is %s', JSON.stringify(Store.getState()));
});

export default Store;
