import { DetailsList, IColumn, PrimaryButton } from '@fluentui/react';
import * as React from 'react';

interface Task {
  id: number;
  name: string;
}

interface PendingTasksListProps {
  pendingTasks: Task[];
  handleCompleteTask: (taskId: number) => void;
}

const PendingTasksList: React.FC<PendingTasksListProps> = ({ pendingTasks, handleCompleteTask }) => {
  const columnsPending: IColumn[] = [
    { key: 'task', name: 'Pending Tasks', fieldName: 'name', minWidth: 100 },
    { key: 'action', name: 'Actions', minWidth: 100, onRender: (item: Task) => (
      <PrimaryButton text="Complete" onClick={() => handleCompleteTask(item.id)} />
    )}
  ];

  return (
    <DetailsList
      items={pendingTasks}
      columns={columnsPending}
    />
  );
};

export default PendingTasksList;