import * as React from 'react';
import { store } from '../../redux/store';
import { Provider } from 'react-redux';
import TaskInput from './TaskInput';
import PendingTasksList from './PendingTasksList';
import CompletedTasksList from './CompletedTasksList';
import { IToDoWpProps } from './IToDoWpProps';

const ToDoWp: React.FC<IToDoWpProps> = ({ context }) => {
  
  return (
    <Provider store={store}>
      <TaskInput context={context} />
      <PendingTasksList context={context}/>
      <CompletedTasksList context={context} />
    </Provider>
  );
};

export default ToDoWp;