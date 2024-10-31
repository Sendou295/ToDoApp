// PendingTasksList.tsx
import * as React from 'react';
import { DetailsHeader, DetailsList, IColumn, Icon, IDetailsHeaderProps, PrimaryButton, SelectionMode, Spinner, SpinnerSize, Stack, Dialog, DialogType, } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { useEffect, useState } from 'react';
import { deleteTask, getPendingTasks, deleteTaskFromSharePoint, updateCompletedTaskOnSharePoint, getCompletedTasks, formatDate, getSummaryStyle } from '../../redux/taskSlice';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { ToDoTask } from '../../../interface';
import TaskEdit from './TaskEdit';

interface PendingTasksListProps {
  context: WebPartContext;
}

const PendingTasksList: React.FC<PendingTasksListProps> = ({ context }) => {
  const dispatch = useDispatch<AppDispatch>();
  const pendingTasks = useSelector((state: RootState) => state.tasks.pendingTasks);
  const loading = useSelector((state: RootState) => state.tasks.loading);
  const [selectedTask, setSelectedTask] = useState<ToDoTask | null>(null);
  const [openDetails, setOpenDetails] = useState<boolean[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(getPendingTasks(context));
  }, [context, dispatch]);

  useEffect(() => {
    if (pendingTasks.length > 0) {
      const initialState = pendingTasks.map(() => false);
      setOpenDetails(initialState);
    }
  }, [pendingTasks]);

  const toggleDetail = (index: number) => {
    const newOpenDetails = [...openDetails];
    newOpenDetails[index] = !newOpenDetails[index];
    setOpenDetails(newOpenDetails);
  };

  const toggleAll = () => {
    setOpenDetails((prevOpenDetails) => {
      const shouldOpen = prevOpenDetails.every((detail) => !detail);
      return pendingTasks.map(() => shouldOpen);
    });
  };

  const onRenderDetailsHeader = (props: IDetailsHeaderProps | undefined) => {
    if (!props) return null;
    return (
      <DetailsHeader
        {...props}
        onRenderColumnHeaderTooltip={(tooltipHostProps) => {
          if (tooltipHostProps?.column?.key === 'toggleIcon') {
            return (
              <span onClick={toggleAll} style={{ cursor: 'pointer' }}>
                <Icon iconName={openDetails.every((detail) => detail) ? 'ChevronDown' : 'ChevronRight'} />
              </span>
            );
          }
          return <span>{tooltipHostProps?.column?.name ?? ''}</span>;
        }}
      />
    );
  };

  const columns: IColumn[] = [
    {
      key: 'toggleIcon',
      name: 'Toggle',
      minWidth: 20,
      maxWidth: 20,
      onRender: (item: ToDoTask, index: number) => {
        const isOpen = openDetails[index];
        return (
          <span onClick={() => toggleDetail(index)}>
            <Icon iconName={isOpen ? 'ChevronDown' : 'ChevronRight'} />
          </span>
        );
      },
    },
    {
      key: 'task',
      name: 'Summary',
      fieldName: 'Summary',
      minWidth: 100,
      onRender: (item: ToDoTask) => {
        const deadline = item.Deadline ? (item.Deadline instanceof Date ? item.Deadline : new Date(item.Deadline)) : null;
        const summaryStyle = deadline ? getSummaryStyle(deadline) : {};

        return (
          <span style={summaryStyle}>
            {item.Summary}
          </span>
        );
      },
    },
    {
      key: 'pendingDate',
      name: 'Pending Date',
      fieldName: 'PendingDate',
      minWidth: 100,
      onRender: (item: ToDoTask) => (
        <span>{formatDate(item.PendingDate)}</span>
      ),
    },
    {
      key: 'deadline',
      name: 'Deadline',
      fieldName: 'Deadline',
      minWidth: 100,
      onRender: (item: ToDoTask) => (
        <span>{formatDate(item.Deadline)}</span>
      ),
    },
    {
      key: 'actions',
      name: 'Actions',
      minWidth: 260,
      onRender: (item: ToDoTask) => (
        <Stack horizontal tokens={{ childrenGap: 10 }}>
          <PrimaryButton
            text="Complete"
            onClick={async () => {
              await dispatch(updateCompletedTaskOnSharePoint(item));
              dispatch(getCompletedTasks(context));
              dispatch(getPendingTasks(context));
            }}
          />
          <PrimaryButton
            text="Edit"
            onClick={() => {
              setSelectedTask(item);
              setIsDialogOpen(true);
            }}
          />
          <PrimaryButton
            text="Delete"
            onClick={async () => {
              await dispatch(deleteTaskFromSharePoint({ context, taskId: item.Id }));
              dispatch(deleteTask(item.Id));
            }}
          />
        </Stack>
      ),
    },
  ];

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedTask(null);
  };

  const handleTaskSave = (updatedTask: ToDoTask) => {
    dispatch(getPendingTasks(context));
    handleDialogClose();
  };

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
          onRenderDetailsHeader={onRenderDetailsHeader}
          onRenderRow={(props, defaultRender) => (
            <>
              {defaultRender?.(props)}
              {openDetails[props?.itemIndex ?? 0] && (
                <div key={`detail-${props?.item?.Id}`} style={{ padding: '10px', backgroundColor: '#f3f3f3', marginTop: '5px' }}>
                  <p><strong>Summary:</strong> {props?.item?.Summary}</p>
                  <p><strong>Deadline:</strong> {formatDate(props?.item?.Deadline)}</p>
                  <p><strong>Status:</strong> {props?.item?.TaskStatus}</p>
                  <p><strong>Description:</strong> {props?.item?.Description}</p>
                </div>
              )}
            </>
          )}
        />
      )}
      <Dialog
        hidden={!isDialogOpen}
        onDismiss={handleDialogClose}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Edit Task',
        }}
      >
        {selectedTask && (
          <TaskEdit task={selectedTask} onClose={handleDialogClose} onSave={handleTaskSave} />
        )}

      </Dialog>
    </div>
  );
};

export default PendingTasksList;
