import * as React from 'react';
import { IToDoWpProps } from './IToDoWpProps';
import TaskInput from './TaskInput';
import PendingTasksList from './PendingTasksList';
import CompletedTasksList from './CompletedTasksList';

interface Task {
  id: number;
  name: string;
}

export const ToDoWp = (props: IToDoWpProps) => {
  const [task, setTask] = React.useState<string>('');
  const [pendingTasks, setPendingTasks] = React.useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = React.useState<Task[]>([]);

  const handleAddTask = () => {
    if (task) {
      const newTask = { id: pendingTasks.length, name: task };
      setPendingTasks([...pendingTasks, newTask]);
      setTask(''); // Clear the TextField after adding the task
    }
  };

  const handleCompleteTask = (taskId: number) => {
    let taskToComplete: Task | undefined;
    
    // Thay thế find bằng vòng lặp for
    for (let i = 0; i < pendingTasks.length; i++) {
      if (pendingTasks[i].id === taskId) {
        taskToComplete = pendingTasks[i];
        break;
      }
    }
  
    if (taskToComplete) {
      setCompletedTasks([...completedTasks, taskToComplete]);
      setPendingTasks(pendingTasks.filter(task => task.id !== taskId));
    }
  };

  return (
    <div>
      <TaskInput task={task} setTask={setTask} handleAddTask={handleAddTask} />
      <PendingTasksList pendingTasks={pendingTasks} handleCompleteTask={handleCompleteTask} />
      <CompletedTasksList completedTasks={completedTasks} />
    </div>
  );
};