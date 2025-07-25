import { useContext, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import classNames from "classnames";
import TaskStopwatch from "@components/Task/TaskStopwatch";
import { Task } from "@type/Model";
import { TaskModalDispatch } from "@lib/state/task-modal-state";
import taskStopwatchManager from "@lib/state/taskStopwatchManager";
import '@styles/components/task/task-card.scss'

type TaskCardProps = { task: Task, isOverlayDragging?: boolean }

export function TaskCard({ task, isOverlayDragging }: TaskCardProps) {
    const dispatch = useContext(TaskModalDispatch);

    useEffect(() => {
        if (task.columnId === 'done' && !isOverlayDragging) {
            taskStopwatchManager.stop(task.id);
        }
    }, [task.id, task.columnId, isOverlayDragging]);

    return (
        <div className={classNames('task card', {'is-overlay-dragging': isOverlayDragging})}>
            <div className="card-body" onClick={() =>
                dispatch({type: 'taskModalOpened', task})
            }>
                <h5 className="card-title">{task.name}</h5>
            </div>
            <div className="card-footer d-flex justify-content-between">
                <TaskStopwatch taskId={task.id} disabled={task.columnId === 'done'} />
            </div>
        </div>
    )
}

export function TaskCardSortable({ task }: TaskCardProps) {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({
        id: task.id,
        data: { task, columnId: task.columnId }
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return <div style={style} ref={setNodeRef} {...attributes} {...listeners}>
        {isSortableDragging
            ? <TaskCardDragging task={task} className='is-sortable-dragging' />
            : <TaskCard task={task} />}
    </div>
}

export function TaskCardDragging({ task, className }: { task: Task, className?: string }) {
    return (
        <div className={classNames('task card', className)}>
            <div className="card-body">
                <h5 className="card-title">{task.name}</h5>
            </div>
            <div className="card-footer d-flex justify-content-between">
                <button type="button" className='btn timer-button'>00:00:00</button>
            </div>
        </div>
)
}