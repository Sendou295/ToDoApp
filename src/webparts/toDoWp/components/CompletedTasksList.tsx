import { DetailsList, IColumn } from '@fluentui/react';
import * as React from 'react';

interface Task {
  id: number;
  name: string;
}

interface CompletedTasksListProps {
  completedTasks: Task[];
}

const CompletedTasksList: React.FC<CompletedTasksListProps> = ({ completedTasks }) => {
  const columnsCompleted: IColumn[] = [
    { key: 'task', name: 'Completed Tasks', fieldName: 'name', minWidth: 100 }
  ];

  return (
    <DetailsList
      items={completedTasks}
      columns={columnsCompleted}
    />
  );
};

export default CompletedTasksList;
