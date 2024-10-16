// TaskInput.tsx
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { addTask } from '../../redux/taskSlice';
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { useState } from 'react';
import { getSP } from '../../redux/pnpjsConfig';
import { getPendingTasks } from '../../redux/taskSlice'; // Thêm import
import { MessageBar, PrimaryButton, Stack, StackItem, TextField } from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';

interface TaskInputProps {
    context: WebPartContext;
}

const TaskInput: React.FC<TaskInputProps> = ({ context }) => {
    const [task, setTask] = useState(""); // State để lưu task nhập vào
    const [showStatus, { setTrue, setFalse }] = useBoolean(false);
    const dispatch = useDispatch(); // Kết nối với Redux
    const [isAdding, setIsAdding] = useState(false); // State để theo dõi trạng thái thêm task

    const handleAddTask = async () => {
        if (!task) {
            setTrue(); // Show message bar if no task is entered
            return {};
        }
        setIsAdding(true); // Disable button khi bắt đầu thêm task
        // Tạo task mới
        const newTask = {
            Summary: task,
            TaskStatus: "Pending",
            CompletedDate: null,
            PendingDate: new Date().toISOString(), // Chuyển thành chuỗi ISO
        };

        const sp = getSP(context); // Lấy SP context

        try {
            // Thêm task vào SharePoint list
            await sp.web.lists.getByTitle("ToDoApp").items.add(newTask);
            dispatch(addTask(newTask)); // Gửi task lên Redux

            // Reload lại danh sách pending tasks
            dispatch(getPendingTasks(context) as any); // Ép kiểu cho dispatch

            setTask(""); // Reset input
            setFalse(); // Hide message bar after successful addition
        } catch (error) {
            console.error("Error adding task to SharePoint: ", error);
        }finally {
            setIsAdding(false); // Enable button sau khi thêm task hoàn tất
        }
    };

    return (

        <Stack>
            <StackItem style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 20
            }}>
                <TextField
                    type="text"
                    value={task}
                    onChange={(e) => setTask((e.target as HTMLInputElement).value)}
                    placeholder="Enter a task"
                />
                <PrimaryButton onClick={handleAddTask} disabled={isAdding}> Add Task</PrimaryButton>
            </StackItem>

            <StackItem role="status" >
                {showStatus && (
                    <MessageBar
                        delayedRender={false}
                        // IMPORTANT: Set role="none" to prevent nested status regions
                        role="none"
                        color='red'
                    >
                        Please input task
                    </MessageBar>
                )}
            </StackItem>
        </Stack>


    );
};

export default TaskInput;
