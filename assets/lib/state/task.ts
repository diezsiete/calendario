import { TaskStatus as TypeTaskStatus } from "@type/Model";

export const taskStatuses: Record<TypeTaskStatus, string> = {
    'backlog': 'Backlog', 'todo' : 'To Do', 'inprogress': 'In Progress', 'paused': 'Paused', 'done': 'Done'
};