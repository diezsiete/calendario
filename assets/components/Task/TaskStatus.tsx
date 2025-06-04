import { useEffect, useState } from "react";
import { Task, TaskStatus } from "@type/Model";
import '@styles/components/task/task-status.scss'
import { upsertTask } from "@lib/idb/tasks";

type TaskStatusProps = { task: Task }

const statuses: Record<TaskStatus, string> = {'pending' : 'Sin empezar', 'developing': 'En desarrollo', 'done': 'Finalizada'};

export default function TaskStatus({ task } : TaskStatusProps ) {
    const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(task.status);

    useEffect(() => {
        if (selectedStatus !== task.status) {
            console.log('useEffect selectedStatus changed', selectedStatus);
            task.status = selectedStatus;
            upsertTask(task)
        }
    }, [selectedStatus, task]);

    return <div>
        <select className={`form-select task-status-select ${selectedStatus ?? 'pending'}`} id={`task-${task.id}-status-select`}
                value={selectedStatus ?? 'pending'}
                onChange={e => setSelectedStatus(e.target.value as TaskStatus)}
        >
            {Object.keys(statuses).map(status =>
                <option key={status} value={status}>{statuses[status]}</option>
            )}
        </select>
    </div>
}