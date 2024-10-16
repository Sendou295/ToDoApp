//interface.ts
export interface ToDoTask{
    Id:number;
    Summary: string; 
    TaskStatus: 'Pending' | 'Completed';
    CompletedDate: Date | null; 
    PendingDate: Date; 
}
