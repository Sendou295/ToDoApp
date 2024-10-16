import * as React from 'react';
import { DetailsList, IColumn, PrimaryButton, SelectionMode, Spinner, SpinnerSize, Stack } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { useEffect } from 'react';
import { getCompletedTasks, deleteTask, updatePendingTaskOnSharePoint, getPendingTasks, formatDate } from '../../redux/taskSlice';
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ToDoTask } from '../../../interface';

interface CompletedTasksListProps {
  context: WebPartContext;
}


const CompletedTasksList: React.FC<CompletedTasksListProps> = ({ context }) => {
  const dispatch = useDispatch<AppDispatch>();
  const completedTasks = useSelector((state: RootState) => state.tasks.completedTasks);
  const loading = useSelector((state: RootState) => state.tasks.loading);

  useEffect(() => {
    dispatch(getCompletedTasks(context));
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
    { key: 'completedDate', name: 'Completed Date', fieldName: 'CompletedDate', minWidth: 100, maxWidth: 150,
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
            text="Rework"
            onClick={async () => {
              await dispatch(updatePendingTaskOnSharePoint({
                ...item,
                TaskStatus: 'Pending' // Cập nhật trạng thái về Pending
              }));
              dispatch(deleteTask(item.Id)); // Xóa task khỏi Redux
              dispatch(getCompletedTasks(context)); // Tải lại danh sách completed tasks\
              dispatch(getPendingTasks(context)); // Tải lại danh sách pending tasks
              
            }}
          />
        </Stack>
      ),
    }
  ];

  return (
    <div>
      <h2>Completed Tasks</h2>
      {loading ? (
        <Spinner size={SpinnerSize.large} label="Loading tasks..." />
      ) : (
        <DetailsList
          items={completedTasks}
          columns={columns}
          setKey="set"
          selectionMode={SelectionMode.none}
        />
      )}
    </div>
  );
};

export default CompletedTasksList;
