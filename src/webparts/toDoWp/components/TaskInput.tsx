import { PrimaryButton, Stack, TextField } from '@fluentui/react';
import * as React from 'react';

interface TaskInputProps {
  task: string;
  setTask: React.Dispatch<React.SetStateAction<string>>;
  handleAddTask: () => void;
  loading?: boolean; // Optional isLoading prop
}

const TaskInput: React.FC<TaskInputProps> = ({ task, setTask, handleAddTask, loading }) => {
  return (
    <Stack
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent:'center',
        flexDirection: 'row',
        gap: 20
      }
      }
    >
    <TextField
      type="text"
      value={task}
      onChange={(e) => setTask((e.target as HTMLInputElement).value)}
      placeholder="Enter task"
    />
    <PrimaryButton onClick={handleAddTask} disabled={loading}>Add Task</PrimaryButton> {/* Disable button when loading */}
  </Stack>
  );
};

export default TaskInput;