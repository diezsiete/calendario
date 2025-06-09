import classNames from "classnames";
import { TaskStatus as TypeTaskStatus } from "@type/Model";
import { taskStatuses } from "@lib/state/task";
import '@styles/components/task/task-status.scss'

type TaskStatusProps = { value: TypeTaskStatus, onChange: (status: TypeTaskStatus) => void, className?: string}
export default function TaskStatus({ value, onChange, className } : TaskStatusProps) {
    return <select className={classNames('form-select task-status-select w-auto', value, className)}
                   name="task-status-select"
                   value={value}
                   onChange={e => onChange(e.target.value as TypeTaskStatus)}>
        {Object.keys(taskStatuses).map(status => <option key={status} value={status}>{taskStatuses[status]}</option>)}
    </select>
}