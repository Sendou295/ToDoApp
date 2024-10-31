//CompletedTasksList.tsx
import * as React from 'react';
import { DetailsList, IColumn, SelectionMode, Spinner, SpinnerSize, Stack, Icon, DetailsHeader, IDetailsHeaderProps, PrimaryButton } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { useEffect } from 'react';
import { getCompletedTasks, deleteTask, updatePendingTaskOnSharePoint, getPendingTasks, formatDate, getSummaryStyle } from '../../redux/taskSlice';
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
  useEffect(() => {
    // Khi completedTasks thay đổi, khởi tạo lại trạng thái openDetails
    const initialState = completedTasks.map(() => false); // Mặc định đóng tất cả chi tiết
    setOpenDetails(initialState);
  }, [completedTasks]);
  const [openDetails, setOpenDetails] = React.useState<boolean[]>(() => {
    const initialState: boolean[] = [];
    for (let i = 0; i < completedTasks.length; i++) {
      initialState.push(false);
    }
    return initialState;
  });

  const toggleDetail = (index: number) => {
    const newOpenDetails = [...openDetails];
    newOpenDetails[index] = !newOpenDetails[index];
    setOpenDetails(newOpenDetails);
  };

  const toggleAll = () => {
    // Nếu openDetails chưa được khởi tạo, khởi tạo nó với các giá trị false
    if (openDetails.length === 0) {
      const initialState = completedTasks.map(() => false); // Giả sử ban đầu tất cả đều đóng
      setOpenDetails(initialState);
    }
  
    setOpenDetails((prevOpenDetails) => {
      const shouldOpen = prevOpenDetails.every((detail) => !detail); // Kiểm tra nếu tất cả đều đang đóng
      return completedTasks.map(() => shouldOpen); // Cập nhật tất cả theo trạng thái chung
    });
  };
  
  // Tùy chỉnh render tiêu đề
  const onRenderDetailsHeader = (props: IDetailsHeaderProps | undefined) => {
    if (!props) return null;
    return (
      <DetailsHeader
        {...props}
        onRenderColumnHeaderTooltip={(tooltipHostProps) => {
          // Kiểm tra nếu tooltipHostProps và tooltipHostProps.column không undefined
          if (tooltipHostProps?.column?.key === 'toggleIcon') {
            return (
              <span onClick={toggleAll} style={{ cursor: 'pointer' }}>
                <Icon iconName={openDetails.every((detail) => detail) ? 'ChevronDown' : 'ChevronRight'} />
              </span>
            );
          }
          // Nếu tooltipHostProps.column không tồn tại, trả về tên cột bình thường
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
      maxWidth: 100,
      onRender: (item: ToDoTask) => {
        const deadline = item.Deadline ? (item.Deadline instanceof Date ? item.Deadline : new Date(item.Deadline)) : null;
        const summaryStyle = deadline ? getSummaryStyle(deadline) : {};
        return <span style={summaryStyle}>{item.Summary}</span>;
      },
    },
    {
      key: 'pendingDate',
      name: 'Pending Date',
      fieldName: 'PendingDate',
      minWidth: 100,
      maxWidth: 100,
      onRender: (item: ToDoTask) => <span>{formatDate(item.PendingDate)}</span>,
    },
    {
      key: 'completedDate',
      name: 'Completed Date',
      fieldName: 'CompletedDate',
      minWidth: 100,
      maxWidth: 100,
      onRender: (item: ToDoTask) => <span>{formatDate(item.CompletedDate)}</span>,
    },
    {
      key: 'deadline',
      name: 'Deadline',
      fieldName: 'Deadline',
      minWidth: 100,
      maxWidth: 100,
      onRender: (item: ToDoTask) => <span>{formatDate(item.Deadline)}</span>,
    },
    {
      key: 'actions',
      name: 'Actions',
      minWidth: 100,
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
              dispatch(getCompletedTasks(context)); // Tải lại danh sách completed tasks
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
          onRenderDetailsHeader={onRenderDetailsHeader} 
          onRenderRow={(props, defaultRender) => (
            <>
              {defaultRender?.(props)}
              {openDetails[props?.itemIndex ?? 0] && (
                <div key={`detail-${props?.item?.Id}`} style={{ padding: '10px', backgroundColor: '#f3f3f3', marginTop: '5px' }}>
                  <p><strong>Summary:</strong> {props?.item?.Summary}</p>
                  <p><strong>Deadline:</strong> {formatDate(props?.item?.Deadline)}</p>
                  <p><strong>Status:</strong> {props?.item?.TaskStatus}</p>
                  <p><strong>CompletedDate:</strong> {formatDate(props?.item?.CompletedDate)}</p>
                  <p><strong>Description:</strong> {formatDate(props?.item?.Description)}</p>
                </div>
              )}
            </>
          )}
        />
      )}
    </div>
  );
};

export default CompletedTasksList;
