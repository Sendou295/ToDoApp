import { PrimaryButton, TextField } from '@fluentui/react';
import * as React from 'react';

interface TaskInputProps {
  task: string;
  setTask: React.Dispatch<React.SetStateAction<string>>;
  handleAddTask: () => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ task, setTask, handleAddTask }) => {
  return (
    <div>
      <TextField
        label="New Task"
        value={task}
        onChange={(e, newValue) => setTask(newValue || '')}
      />
      <PrimaryButton text="Add Task" onClick={handleAddTask} />
    </div>
  );
};

export default TaskInput;