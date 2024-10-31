//ToDoWp.tsx
import * as React from 'react';
import { store } from '../../redux/store';
import { Provider } from 'react-redux';
import TaskInput from './TaskInput';
import PendingTasksList from './PendingTasksList';
import CompletedTasksList from './CompletedTasksList';
import { IToDoWpProps } from './IToDoWpProps';
// import { Stack } from '@fluentui/react';

const ToDoWp: React.FC<IToDoWpProps> = ({ context }) => {
  
  return (
    <Provider store={store}>
      <TaskInput context={context} />
     {/* <Stack style={{
      display: 'flex',
      flexDirection: 'row'
     }}> */}
     <PendingTasksList context={context}/>
     <CompletedTasksList context={context} />
     {/* </Stack> */}
    </Provider>
  );
};

export default ToDoWp;