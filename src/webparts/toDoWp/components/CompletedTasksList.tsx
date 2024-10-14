import * as React from 'react';
import { DetailsList, IColumn, PrimaryButton, Stack } from '@fluentui/react';
import { ToDoTask } from '../../../interface';

interface CompletedTasksListProps {
  completedTasks: ToDoTask[];
  handleReworkTask: (taskId: number) => void;
  loading?: boolean; // Optional isLoading prop
}

const CompletedTasksList: React.FC<CompletedTasksListProps> = ({ completedTasks, handleReworkTask, loading  }) => {
  const columns: IColumn[] = [
    { key: 'task', name: 'Completed Tasks', fieldName: 'Summary', minWidth: 100, maxWidth: 200 },
    { key: 'pendingDate', name: 'Pending Date', fieldName: 'PendingDate', minWidth: 100, maxWidth: 150 },
    { key: 'completeDate', name: 'Completed Date', fieldName: 'CompletedDate', minWidth: 100, maxWidth: 150 },
    { 
      key: 'rework', 
      name: 'Actions', 
      minWidth: 100, 
      onRender: (item: ToDoTask) => (
        <Stack horizontal tokens={{ childrenGap: 10 }}>
          <PrimaryButton text="Rework" disabled={loading} onClick={() => handleReworkTask(item.Id)} />
        </Stack>
      )
    }
  ];

  return (
    <div>
      <h3>Completed Tasks</h3>
      <DetailsList
        items={completedTasks}
        columns={columns}
        setKey="set"
      />
    </div>
  );
};

export default CompletedTasksList;
