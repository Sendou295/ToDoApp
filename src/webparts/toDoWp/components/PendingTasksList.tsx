import * as React from 'react';
import { DetailsList, IColumn, PrimaryButton, SelectionMode, Spinner, SpinnerSize, Stack } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { useEffect } from 'react';
import { deleteTask, getPendingTasks, deleteTaskFromSharePoint, updateCompletedTaskOnSharePoint, getCompletedTasks, formatDate } from '../../redux/taskSlice';
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ToDoTask } from '../../../interface';

interface PendingTasksListProps {
  context: WebPartContext;
}

const PendingTasksList: React.FC<PendingTasksListProps> = ({ context }) => {
  const dispatch = useDispatch<AppDispatch>();
  const pendingTasks = useSelector((state: RootState) => state.tasks.pendingTasks);
  const loading = useSelector((state: RootState) => state.tasks.loading);

  useEffect(() => {
    dispatch(getPendingTasks(context));
  }, [context, dispatch]);


  const columns: IColumn[] = [
    { key: 'task', name: 'Summary', fieldName: 'Summary', minWidth: 100, maxWidth: 200 },
    {
      key: 'pendingDate', name: 'Pending Date', fieldName: 'PendingDate', minWidth: 100, maxWidth: 150, onRender: (item: ToDoTask) => {
        const pendingDate = item.PendingDate;
        return (
          <span>
            {formatDate(pendingDate)}
          </span>
        );
      },
    },
    {
      key: 'completedDate', name: 'Completed Date', fieldName: 'CompletedDate', minWidth: 100, maxWidth: 150,
      onRender: (item: ToDoTask) => {
        const completedDate = item.CompletedDate;
        return (
          <span>
            {formatDate(completedDate)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      name: 'Actions',
      minWidth: 150,
      onRender: (item: ToDoTask) => (
        <Stack horizontal tokens={{ childrenGap: 10 }}>
          <PrimaryButton
            text="Complete"
            onClick={async () => {
              await dispatch(updateCompletedTaskOnSharePoint(item)); // Hoàn thành task
              dispatch(getCompletedTasks(context));
              dispatch(getPendingTasks(context)); // Tải lại danh sách pending tasks
            }}
          />
          <PrimaryButton
            text="Delete"
            onClick={async () => {
              await dispatch(deleteTaskFromSharePoint({ context, taskId: item.Id })); // Xóa trên SharePoint
              dispatch(deleteTask(item.Id)); // Xóa khỏi Redux
            }}
          />
        </Stack>
      ),
    }
  ];

  return (
    <div>
      <h2>Pending Tasks</h2>
      {loading ? (
        <Spinner size={SpinnerSize.large} label="Loading tasks..." />
      ) : (
        <DetailsList
          items={pendingTasks}
          columns={columns}
          setKey="set"
          selectionMode={SelectionMode.none}
        />
      )}
    </div>
  );
};

export default PendingTasksList;
