import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ToDoTask } from '../../interface';
import { getSP } from '../../pnpjsConfig';
import { WebPartContext } from '@microsoft/sp-webpart-base';

const LIST_NAME = 'ToDoApp';

// Thunks để fetch tasks từ SharePoint
export const fetchTasks = createAsyncThunk<ToDoTask[], WebPartContext>(
    'tasks/fetchTasks',
    async (context: WebPartContext) => {
        const sp = getSP(context);
        const items: ToDoTask[] = await sp.web.lists.getByTitle(LIST_NAME).items();
        return items;
    }
);
// Slice cho tasks
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
        },
        updateTask: (state, action) => {
            let taskIndex = -1; // Mặc định không tìm thấy
            state.pendingTasks.forEach((t, index) => {
                if (t.Id === action.payload.Id) {
                    taskIndex = index; // Lưu chỉ mục nếu tìm thấy
                }
            });

            if (taskIndex >= 0) {
                state.pendingTasks[taskIndex] = action.payload;
            }
        },
        deleteTask: (state, action) => {
            state.pendingTasks = state.pendingTasks.filter(t => t.Id !== action.payload);
        },
        completeTask: (state, action) => {
            // Tìm chỉ mục của task bằng forEach hoặc một phương pháp khác
            let taskIndex = -1;
            state.pendingTasks.forEach((t, index) => {
                if (t.Id === action.payload.Id) {
                    taskIndex = index;
                }
            });
            // Kiểm tra xem task có tồn tại không
            if (taskIndex !== -1) {
                // Chuyển task từ pending sang completed
                const completedTask: ToDoTask = {
                    ...state.pendingTasks[taskIndex],
                    TaskStatus: 'Completed' as 'Completed', // Chỉ định rõ ràng kiểu
                    CompletedDate: new Date(), // Thiết lập ngày hoàn thành
                };

                // Thêm task đã hoàn thành vào danh sách
                state.completedTasks.push(completedTask);
                state.pendingTasks.splice(taskIndex, 1); // Xóa task khỏi pending
            }
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchTasks.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.pendingTasks = action.payload.filter(task => task.TaskStatus === 'Pending');
                state.completedTasks = action.payload.filter(task => task.TaskStatus === 'Completed');
                state.loading = false;
            })
            .addCase(fetchTasks.rejected, (state) => {
                state.loading = false;
            });
    }
});

export const { addTask, updateTask, deleteTask,completeTask } = taskSlice.actions;
export default taskSlice.reducer;
