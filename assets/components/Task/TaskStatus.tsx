import classNames from "classnames";
import { TaskStatus as TypeTaskStatus } from "@type/Model";
import '@styles/components/task/task-status.scss'

const statuses: Record<TypeTaskStatus, string> = {
    'backlog': 'Backlog', 'todo' : 'To Do', 'inprogress': 'In Progress', 'paused': 'Paused', 'done': 'Done'
};
type TaskStatusProps = { value: TypeTaskStatus, onChange: (status: TypeTaskStatus) => void, className?: string}
export default function TaskStatus({ value, onChange, className } : TaskStatusProps) {
    return <select className={classNames('form-select task-status-select w-auto', value, className)}
                   name="task-status-select"
                   value={value}
                   onChange={e => onChange(e.target.value as TypeTaskStatus)}>
        {Object.keys(statuses).map(status => <option key={status} value={status}>{statuses[status]}</option>)}
    </select>
}