import * as React from 'react';
import { IToDoWpProps } from './IToDoWpProps';
import TaskInput from './TaskInput';
import PendingTasksList from './PendingTasksList';
import CompletedTasksList from './CompletedTasksList';

import { SPFI } from '@pnp/sp';
import { getSP } from '../../../pnpjsConfig';
import { ToDoTask } from '../../../interface';

export const ToDoWp = (props: IToDoWpProps) => {
  
  const [task, setTask] = React.useState<string>('');
  const [pendingTasks, setPendingTasks] = React.useState<ToDoTask[]>([]);
  const [completedTasks, setCompletedTasks] = React.useState<ToDoTask[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false); // Add loading state

  // Get the SP context using the getSP function
  const LIST_NAME = 'ToDoApp';
  let _sp: SPFI = getSP(props.context);

  // Fetch tasks from SharePoint when the component loads
  const fetchTasks = async () => {
    try {
      const items: ToDoTask[] = await _sp.web.lists.getByTitle(LIST_NAME).items();
      const pending = items.filter(item => item.TaskStatus === 'Pending');
      const completed = items.filter(item => item.TaskStatus === 'Completed');

      setPendingTasks(pending);
      setCompletedTasks(completed);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Fetch tasks when the component mounts
  React.useEffect(() => {
    fetchTasks();
  }, []);
  const handleAddTask = async () => {
    if (task) {
      const newTask: Partial<ToDoTask> = {
        Summary: task,
        TaskStatus: 'Pending',
        CompletedDate: null,
        PendingDate: new Date()
      };
      setLoading(true); // Set loading to true when the action starts

      try {
        console.log('Adding new task:', newTask);
        await _sp.web.lists.getByTitle(LIST_NAME).items.add(newTask);
        console.log('Task added successfully.');

        await fetchTasks();
        setTask('');
      } catch (error) {
        console.error('Error adding task:', error);
      } finally {
        setLoading(false); // Set loading to false when the action is done
      }
    }
  };
  
  const handleCompleteTask = async (taskId: number) => {
    let taskToComplete: ToDoTask | undefined;
  
    for (let i = 0; i < pendingTasks.length; i++) {
      if (pendingTasks[i].Id === taskId) {
        taskToComplete = pendingTasks[i];
        break;
      }
    }
    
    if (taskToComplete) {
      setLoading(true); // Set loading to true when the action starts
      try {
        await _sp.web.lists.getByTitle(LIST_NAME).items.getById(taskToComplete.Id).update({
          TaskStatus: 'Completed',
          CompletedDate: new Date(), // Ensure the CompletedDate is being set
        });
  
        // Re-fetch the tasks to get the updated list with the correct CompletedDate
        await fetchTasks(); 
      } catch (error) {
        console.error('Error completing task:', error);
      }finally {
        setLoading(false); // Set loading to false when the action is done
      }
    }
  };
  

  const handleDeleteTask = async (taskId: number) => {
    let taskToDelete: ToDoTask | undefined;
  
    // Use a for loop to find the task with the matching id
    for (let i = 0; i < pendingTasks.length; i++) {
      if (pendingTasks[i].Id === taskId) {
        taskToDelete = pendingTasks[i];
        break; // Exit the loop once the task is found
      }
    }
    if (taskToDelete) {
      setLoading(true); // Set loading to true when the action starts
      try {
        // Delete the task from SharePoint
        await _sp.web.lists.getByTitle(LIST_NAME).items.getById(taskToDelete.Id).delete();

        // Remove the task from the pending tasks list
        setPendingTasks(pendingTasks.filter(task => task.Id !== taskId));
      } catch (error) {
        console.error('Error deleting task:', error);
      }finally {
        setLoading(false); // Set loading to false when the action is done
      }
    }
  };

  const handleReworkTask = async (taskId: number) => {
    let taskToRemove: ToDoTask | undefined;
  
    // Use a for loop to find the task with the matching id
    for (let i = 0; i < completedTasks.length; i++) {
      if (completedTasks[i].Id === taskId) {
        taskToRemove = completedTasks[i];
        break; // Exit the loop once the task is found
      }
    }

    if (taskToRemove) {
      setLoading(true); // Set loading to true when the action starts
      try {
        // Update task status back to pending in SharePoint
        await _sp.web.lists.getByTitle(LIST_NAME).items.getById(taskToRemove.Id).update({
          TaskStatus: 'Pending',
          CompletedDate: null,
        });

        // Move the task back to pending from completed
        setPendingTasks([...pendingTasks, { ...taskToRemove, TaskStatus: 'Pending'}]);
        setCompletedTasks(completedTasks.filter(task => task.Id !== taskId));
      } catch (error) {
        console.error('Error moving task back to pending:', error);
      }finally {
        setLoading(false); // Set loading to false when the action is done
      }
    }
  };

  return (
    <div>
      <TaskInput task={task} setTask={setTask} handleAddTask={handleAddTask} loading={loading} />
      <PendingTasksList 
        pendingTasks={pendingTasks} 
        handleCompleteTask={handleCompleteTask} 
        handleDeleteTask={handleDeleteTask}
        loading={loading} 
      />
      <CompletedTasksList 
        completedTasks={completedTasks} 
        handleReworkTask={handleReworkTask}
        loading={loading}
      />
    </div>
  );
};
