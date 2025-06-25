import { useContext, useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import classNames from "classnames";
import TaskStopWatch, { TaskStopWatchDragging } from "@components/Task/TaskStopWatch";
import { StopWatchHandle } from "@components/StopWatch";
import { Task, Timer } from "@type/Model";
import { KanbanDispatch } from "@lib/state/kanban-state";
import rem from "@lib/idb/rem";
import '@styles/components/task/task-card.scss'

type TaskCardProps = { task: Task, isOverlayDragging?: boolean }

export function TaskCard({ task, isOverlayDragging }: TaskCardProps) {
    const dispatch = useContext(KanbanDispatch);
    const stopWatchRef = useRef<StopWatchHandle>(null);
    const taskCurrentTimer = useRef<Timer>(null);
    const [stopWatchSeconds, setStopWatchSeconds] = useState(task.timersTotal);

    useEffect(() => {
        if (rem.tasksTimers.local.get(task.id) !== null) {
            rem.timers.findLastTaskTimerWithoutEnd(task.id).then(timer => {
                if (timer && task.columnId === 'done' && !isOverlayDragging) {
                    rem.tasksTimers.stopTaskTimer(task.id, timer.id).then(timersTotal => setStopWatchSeconds(timersTotal));
                } else if (timer) {
                    setStopWatchSeconds(task.timersTotal + (Math.floor(Date.now() / 1000) - timer.start));
                    stopWatchRef.current?.run();
                }
            })
        }
    }, [task.id, task.timersTotal, task.columnId, isOverlayDragging]);

    const startTimerHandler = async (start: number) =>
        taskCurrentTimer.current = await rem.tasksTimers.startTaskTimer(task.id, start);

    const endTimerHandler = (end: number) => taskCurrentTimer.current &&
        rem.tasksTimers.stopTaskTimer(task.id, taskCurrentTimer.current.id, end).then(timersTotal => setStopWatchSeconds(timersTotal));

    return (
        <div className={classNames('task card', {'is-overlay-dragging': isOverlayDragging})}>
            <div className="card-body" onClick={() => dispatch({type: 'editTaskOpened', taskId: task.id})}>
                <h5 className="card-title">{task.name}</h5>
            </div>
            <div className="card-footer d-flex justify-content-between">
                <TaskStopWatch taskId={task.id} onStart={startTimerHandler} onEnd={endTimerHandler} ref={stopWatchRef}
                               seconds={stopWatchSeconds} disabled={task.columnId === 'done'}/>
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
                <TaskStopWatchDragging seconds={task.timersTotal} />
            </div>
        </div>
    )
}