// taskSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ToDoTask } from '../../interface';
import { getSP } from './pnpjsConfig';
import { WebPartContext } from '@microsoft/sp-webpart-base';

const LIST_NAME = 'ToDoApp';

// Fetch tasks from SharePoint using Fetch API
export const fetchTasks = createAsyncThunk<ToDoTask[], WebPartContext>(
    'tasks/fetchTasks',
    async (context: WebPartContext) => {
        const response = await fetch(`${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${LIST_NAME}')/items`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json; odata=verbose',
                'Content-Type': 'application/json; charset=utf-8',
                'odata-version': ''
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.d.results as ToDoTask[];
    }
);

// Thunks to get pending tasks from SharePoint
export const getPendingTasks = createAsyncThunk<ToDoTask[], WebPartContext>(
    'tasks/getPendingTasks',
    async (context: WebPartContext) => {
        const sp = getSP(context);
        const items: ToDoTask[] = await sp.web.lists.getByTitle(LIST_NAME).items();
        return items.filter(task => task.TaskStatus === 'Pending');
    }
);

// Thunks to get completed tasks from SharePoint
export const getCompletedTasks = createAsyncThunk<ToDoTask[], WebPartContext>(
    'tasks/getCompletedTasks',
    async (context: WebPartContext) => {
        const sp = getSP(context);
        const items: ToDoTask[] = await sp.web.lists.getByTitle(LIST_NAME).items();
        return items.filter(task => task.TaskStatus === 'Completed');
    }
);

// Thunk cho cập nhật task pending
export const updatePendingTaskOnSharePoint = createAsyncThunk(
    'tasks/updatePendingTaskOnSharePoint',
    async (task: ToDoTask) => {
        const sp = getSP();
        await sp.web.lists.getByTitle(LIST_NAME).items.getById(task.Id).update({
            TaskStatus: 'Pending',
            PendingDate: new Date(),
            CompletedDate: null,
        });
        return { ...task, TaskStatus: 'Pending' as 'Pending', PendingDate: new Date(), CompletedDate: null }; // Trả về task đã cập nhật
    }
);

// Thunk cho cập nhật task completed
export const updateCompletedTaskOnSharePoint = createAsyncThunk(
    'tasks/updateCompletedTaskOnSharePoint',
    async (task: ToDoTask) => {
        const sp = getSP();
        await sp.web.lists.getByTitle(LIST_NAME).items.getById(task.Id).update({
            TaskStatus: 'Completed',
            CompletedDate: new Date(),
        });
        return { ...task, TaskStatus: 'Completed' as 'Completed', CompletedDate: new Date() }; // Trả về task đã cập nhật
    }
);

// Delete task from SharePoint
export const deleteTaskFromSharePoint = createAsyncThunk<void, { context: WebPartContext, taskId: number }>(
    'tasks/deleteTaskFromSharePoint',
    async ({ context, taskId }) => {
        const sp = getSP(context);
        await sp.web.lists.getByTitle(LIST_NAME).items.getById(taskId).delete();
    }
);

export const pad = (num: number) => (num < 10 ? `0${num}` : `${num}`);

export const formatDate = (date: string | Date | null): string => {
  if (!date) return ''; // Handle null case

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if dateObj is valid
  if (isNaN(dateObj.getTime())) return 'Invalid Date';

  const day = pad(dateObj.getDate());
  const month = pad(dateObj.getMonth() + 1);
  const year = dateObj.getFullYear();
  const hours = pad(dateObj.getHours());
  const minutes = pad(dateObj.getMinutes());

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export function getSummaryStyle(deadline: Date | null): React.CSSProperties {
    if (!deadline || !(deadline instanceof Date)) return {}; // Trả về kiểu mặc định nếu deadline là null hoặc không phải Date
  
    const now = new Date(); // Ngày hiện tại
    const nextDay = new Date(now.getTime());
    nextDay.setDate(now.getDate() + 1);
    nextDay.setHours(23, 59, 59, 999); // Đặt thời gian thành 23:59:59.999
  
    if (deadline.getTime() > now.getTime() && deadline.getTime() < nextDay.getTime()) {
      return { color: 'blue' }; // Màu tím nếu deadline nằm trong ngày tới
    } else if (deadline.getTime() < now.getTime()) {
      return { color: 'red' }; // Màu đỏ nếu deadline đã qua
    }
  
    return {}; // Kiểu mặc định
}

export const updateTaskInSharePoint = createAsyncThunk(
    'tasks/updateTaskInSharePoint',
    async (task: ToDoTask) => {
        const sp = getSP();
        await sp.web.lists.getByTitle(LIST_NAME).items.getById(task.Id).update({
            Summary: task.Summary,
            Description: task.Description,
            Deadline: task.Deadline,
            TaskStatus: task.TaskStatus,
        });
        return task; // Trả về task đã cập nhật
    }
);

const taskSlice = createSlice({
    name: 'tasks',
    initialState: {
        pendingTasks: [] as ToDoTask[],
        completedTasks: [] as ToDoTask[],
        loading: false,
    },
    reducers: {
        addTask: (state, action) => {
            state.pendingTasks.push(action.payload);
            state.loading = true;
        },
        deleteTask: (state, action) => {
            const taskId = action.payload;
            state.pendingTasks = state.pendingTasks.filter(task => task.Id !== taskId);
            state.completedTasks = state.completedTasks.filter(task => task.Id !== taskId);
        },
        updateTask: (state, action) => {
            const updatedTask = action.payload;

            // Cập nhật task trong pendingTasks
            state.pendingTasks = state.pendingTasks.map(task =>
                task.Id === updatedTask.id ? updatedTask : task
            );

            // Cập nhật task trong completedTasks nếu cần
            state.completedTasks = state.completedTasks.map(task =>
                task.Id === updatedTask.id ? updatedTask : task
            );
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getPendingTasks.pending, (state) => {
                state.loading = true;
            })
            .addCase(getPendingTasks.fulfilled, (state, action) => {
                state.loading = false;
                state.pendingTasks = action.payload;
            })
            .addCase(getPendingTasks.rejected, (state) => {
                state.loading = false;
            })
            .addCase(getCompletedTasks.pending, (state) => {
                state.loading = true;
            })
            .addCase(getCompletedTasks.fulfilled, (state, action) => {
                state.completedTasks = action.payload;
                state.loading = false;
            })
            .addCase(getCompletedTasks.rejected, (state) => {
                state.loading = false;
            })
            .addCase(updatePendingTaskOnSharePoint.fulfilled, (state, action) => {
                const updatedTask = action.payload;
                state.pendingTasks.forEach((task, index) => {
                    if (task.Id === updatedTask.Id) {
                        state.pendingTasks[index] = {
                            ...updatedTask,
                            TaskStatus: updatedTask.TaskStatus as 'Pending', // Chuyển đổi kiểu
                        };
                    }
                });
                state.loading = false;
            })
            .addCase(updateCompletedTaskOnSharePoint.fulfilled, (state, action) => {
                const updatedTask = action.payload;
                state.completedTasks.forEach((task, index) => {
                    if (task.Id === updatedTask.Id) {
                        state.completedTasks[index] = {
                            ...updatedTask,
                            TaskStatus: updatedTask.TaskStatus as 'Completed', // Chuyển đổi kiểu
                        };
                    }
                });
            })
            .addCase(deleteTaskFromSharePoint.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteTaskFromSharePoint.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(deleteTaskFromSharePoint.rejected, (state) => {
                state.loading = false;
            });
    }
});

export const { addTask, deleteTask ,updateTask } = taskSlice.actions;
export default taskSlice.reducer;
