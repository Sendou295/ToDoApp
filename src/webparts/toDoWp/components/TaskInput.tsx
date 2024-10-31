//TaskInput.tsx
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { addTask } from '../../redux/taskSlice';
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { useState } from 'react';
import { getSP } from '../../redux/pnpjsConfig';
import { getPendingTasks } from '../../redux/taskSlice'; // Thêm import
import { DatePicker, defaultDatePickerStrings, Dialog, DialogFooter, DialogType, MessageBar, PrimaryButton, Stack, TextField } from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';

interface TaskInputProps {
    context: WebPartContext;
    
}

const TaskInput: React.FC<TaskInputProps> = ({ context }) => {
    const [task, setTask] = useState(""); // State để lưu task nhập vào
    const [description, setDescription] = useState(""); // State để lưu task nhập vào
    const [deadline, setDeadline] = useState<Date | undefined>(undefined); // State để lưu deadline
    const [showStatus, { setTrue, setFalse }] = useBoolean(false);
    const dispatch = useDispatch(); // Kết nối với Redux
    const [isAdding, setIsAdding] = useState(false); // State để theo dõi trạng thái thêm task
    const [isDialogOpen, { setTrue: openDialog, setFalse: closeDialog }] = useBoolean(false); // State để mở/đóng dialog
    const [multiline, { toggle: toggleMultiline }] = useBoolean(false);
    const onChange = (_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newText: string): void => {
        const newMultiline = newText.length > 50;
        if (newMultiline !== multiline) {
            toggleMultiline();
        }
    };

    const handleAddTask = async () => {
        if (deadline == undefined || !task) {
            setTrue(); // Show message bar if no task is entered
            return {};
        }
        setIsAdding(true); // Disable button khi bắt đầu thêm task
        // Tạo task mới
        const newTask = {
            Summary: task,
            TaskStatus: "Pending",
            CompletedDate: null,
            PendingDate: new Date(), // Chuyển thành chuỗi ISO
            Deadline: deadline, // Chuyển đổi deadline thành chuỗi ISO
            Description: description,
        };

        const sp = getSP(context); // Lấy SP context

        try {
            // Thêm task vào SharePoint list
            await sp.web.lists.getByTitle("ToDoApp").items.add(newTask);
            dispatch(addTask(newTask)); // Gửi task lên Redux

            // Reload lại danh sách pending tasks
            dispatch(getPendingTasks(context) as any); // Ép kiểu cho dispatch

            setTask(""); // Reset input
            setDescription("");
            setDeadline(undefined); // Reset input
            setFalse(); // Hide message bar after successful addition
            closeDialog(); // Đóng dialog sau khi thêm task
        } catch (error) {
            console.error("Error adding task to SharePoint: ", error);
        } finally {
            setIsAdding(false); // Enable button sau khi thêm task hoàn tất
        }
    };

    const handleSelectDate = (date: Date | undefined) => {
        if (date) {
            // Đặt giờ và phút cho deadline là 23:59
            const adjustedDate = new Date(date.toDateString());
            adjustedDate.setHours(23);
            adjustedDate.setMinutes(59);
            setDeadline(adjustedDate);
        }
    };

    return (
        <>
            <PrimaryButton text="Create New Task" onClick={openDialog} />

            <Dialog
                hidden={!isDialogOpen}
                onDismiss={closeDialog}
                dialogContentProps={{
                    type: DialogType.largeHeader,
                    title: 'Add a new task',
                    subText: 'Enter task details below'
                }}
                
            >
                <Stack>
                    <TextField
                        type="text"
                        value={task}
                        onChange={(e) => setTask((e.target as HTMLInputElement).value)}
                        placeholder="Enter a task"
                    />
                    <DatePicker
                        placeholder="Select a date"
                        value={deadline}
                        onSelectDate={handleSelectDate} // Cập nhật deadline
                        minDate={new Date()}
                        strings={defaultDatePickerStrings}
                    />
                    <TextField
                        placeholder='Enter task description'
                        value={description}
                        onChange={(e) => {
                            const newValue = (e.target as HTMLInputElement).value;
                            setDescription(newValue);
                            onChange(e, newValue); // Pass both the event and the new value
                        }}
                        multiline={multiline}
                        rows={5}
                    />
                    {showStatus && (
                        <MessageBar
                            delayedRender={false}
                            role="none"
                        >
                            Please input task and deadline
                        </MessageBar>
                    )}
                </Stack>

                <DialogFooter>
                    <PrimaryButton onClick={handleAddTask} disabled={isAdding}> Add Task</PrimaryButton>
                    <PrimaryButton onClick={closeDialog} text="Cancel" />
                </DialogFooter>
            </Dialog>
        </>
    );
};

export default TaskInput;
