import * as React from 'react';
import { DetailsList, IColumn, PrimaryButton, Stack } from '@fluentui/react';
import { ToDoTask } from '../../../interface';

export interface PendingTasksListProps {
  pendingTasks: ToDoTask[];
  handleCompleteTask: (taskId: number) => Promise<void>;
  handleDeleteTask: (taskId: number) => Promise<void>;
  loading?: boolean; // Optional isLoading prop
}

const PendingTasksList: React.FC<PendingTasksListProps> = ({ pendingTasks, handleCompleteTask, handleDeleteTask, loading }) => {
  const columns: IColumn[] = [
    { key: 'task', name: 'Pending Tasks', fieldName: 'Summary', minWidth: 100, maxWidth: 300 },
    { key: 'pendingDate', name: 'Pending Date', fieldName: 'PendingDate', minWidth: 100, maxWidth: 150 },
    { 
      key: 'complete', 
      name: 'Actions', 
      minWidth: 100, 
      onRender: (item: ToDoTask) => (
        <Stack horizontal tokens={{ childrenGap: 10 }}>
          <PrimaryButton text="Complete" disabled={loading} onClick={() => handleCompleteTask(item.Id)} />
          <PrimaryButton text="Delete" disabled={loading} onClick={() => handleDeleteTask(item.Id)} />
        </Stack>
      )
    }
  ];

  return (
    <div>
      <h3>Pending Tasks</h3>
      <DetailsList
        items={pendingTasks}
        columns={columns}
        setKey="set"
      />
    </div>
  );
};

export default PendingTasksList;
