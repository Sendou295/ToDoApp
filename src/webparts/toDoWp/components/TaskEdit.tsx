import { DatePicker, Label, PrimaryButton, Stack, TextField } from '@fluentui/react';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ToDoTask } from '../../../interface'; // Nhập interface ToDoTask
import { updateTaskInSharePoint } from '../../redux/taskSlice'; // Nhập action cập nhật

interface TaskEditProps {
    task: ToDoTask; // Sử dụng ToDoTask cho task
    onClose: () => void; // Hàm để đóng dialog
    onSave: (task: ToDoTask) => void; // Hàm để lưu task
}

const TaskEdit: React.FC<TaskEditProps> = ({ task, onClose, onSave }) => {
    const dispatch = useDispatch();
    const [summary, setSummary] = useState(task.Summary);
    const [description, setDescription] = useState(task.Description);

    const [deadline, setDeadline] = useState<Date>(); // Khởi tạo deadline là null

    useEffect(() => {
        if (task.Deadline) {
            const date = typeof task.Deadline === 'string'
                ? new Date(task.Deadline)
                : task.Deadline; // Nếu đã là Date thì sử dụng luôn

            // Kiểm tra xem date có hợp lệ không
            if (!isNaN(date.getTime())) { // Kiểm tra tính hợp lệ
                setDeadline(date); // Lưu giá trị deadline dưới dạng Date
            }
        }
    }, [task.Deadline]);

    const handleSave = async () => {
        const updatedTask: ToDoTask = {
            ...task,
            Summary: summary,
            Deadline: deadline!!, // Thêm deadline vào task đã cập nhật
            Description: description
        };

        // Gọi action để cập nhật task
        await dispatch(updateTaskInSharePoint(updatedTask) as any); // Sử dụng await để đợi async thunk hoàn thành

        // Có thể gọi onSave nếu bạn cần truyền task lên component cha
        onSave(updatedTask);
    };

    const onDeadlineChange = (date: Date | null) => {
        // Kiểm tra xem date có hợp lệ không trước khi cập nhật
        if (date && !isNaN(date.getTime())) {
            setDeadline(date); // Cập nhật deadline
        }
        if (date) {
            // Đặt giờ và phút cho deadline là 23:59
            const adjustedDate = new Date(date.toDateString());
            adjustedDate.setHours(23);
            adjustedDate.setMinutes(59);
            setDeadline(adjustedDate);
        }
    };

    return (
        <Stack>
            <Label>
                Summary:
                <TextField
                    type="text"
                    value={summary}
                    onChange={(e) => setSummary((e.target as HTMLInputElement).value)}
                />
            </Label>
            <Label>
                Deadline:
                <DatePicker
                    allowTextInput
                    value={deadline || undefined} // Đảm bảo giá trị không null
                    onSelectDate={onDeadlineChange}
                />
            </Label>
            <Label>
                Pending:
                <DatePicker
                    disabled
                    value={typeof task.PendingDate === 'string'
                        ? new Date(task.PendingDate)
                        : task.PendingDate} // Đảm bảo giá trị không null
                />
            </Label>
            <Label>
                Description:
                <TextField
                    multiline autoAdjustHeight
                    type="text"
                    value={description}
                    onChange={(e) => setDescription((e.target as HTMLInputElement).value)}
                />
            </Label>
            <Stack style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between', // Căn hai nút sang hai bên
                width: '100%' // Đảm bảo Stack chiếm hết chiều rộng
            }}>
                <PrimaryButton onClick={handleSave}>Save</PrimaryButton>
                <PrimaryButton onClick={onClose}>Cancel</PrimaryButton> {/* Nút để đóng dialog */}
            </Stack>
        </Stack>
    );
};

export default TaskEdit;
