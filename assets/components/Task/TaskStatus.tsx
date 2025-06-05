import { useEffect, useState } from "react";
import { Task, TaskStatus as TypeTaskStatus } from "@type/Model";
import '@styles/components/task/task-status.scss'

type TaskStatusProps = { task: Task, onChange: (status: TypeTaskStatus) => void }

const statuses: Record<TypeTaskStatus, string> = {
    'todo' : 'To Do', 'inprogress': 'In Progress', 'paused': 'Paused', 'done': 'Done'
};

export default function TaskStatus({ task, onChange } : TaskStatusProps ) {
    const [selectedStatus, setSelectedStatus] = useState<TypeTaskStatus>(task.status);

    useEffect(() => setSelectedStatus(task.status), [task.status]);

    return <div>
        <select className={`form-select task-status-select ${selectedStatus}`} id={`task-${task.id}-status-select`}
                value={selectedStatus}
                onChange={e => onChange(e.target.value as TypeTaskStatus)}
        >
            {Object.keys(statuses).map(status =>
                <option key={status} value={status}>{statuses[status]}</option>
            )}
        </select>
    </div>
}