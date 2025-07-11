import { useContext, useEffect } from "react";
import { Task } from "@type/Model";
import TaskStatus from "@components/Task/TaskStatus";
import TaskStopwatch from "@components/Task/TaskStopwatch";
import { TaskModalDispatch } from "@lib/state/task-modal-state";
import rem from "@lib/idb/rem";
import taskStopwatchManager from "@lib/state/taskStopwatchManager";
import '@styles/components/task/task-card.scss'

export default function TaskCard({ taskId }: { taskId: number }) {
    const task = rem.tasks.getTask(taskId);
    const dispatch = useContext(TaskModalDispatch);

    useEffect(() => {
        if (task) {
            if (task.status === 'inprogress') {
                taskStopwatchManager.start(task.id);
            } else {
                taskStopwatchManager.stop(task.id);
            }
        }
    }, [task, dispatch]);

    if (!task) return

    const updateTask = (data: Partial<Task>) => {
        rem.tasks.updateTask(taskId, data).then(task => task && dispatch({type: 'taskUpdated', task}));
    }

    function handleStopwatchRunning(running: boolean) {
        if (running && task.status !== 'inprogress') {
            updateTask({ status: 'inprogress' })
        } else if (!running && task.status === 'inprogress') {
            updateTask({ status: 'paused' })
        }
    }

    return (
        <div className='task card'>
            <div className="card-body" onClick={() => dispatch({type: 'taskModalOpened', task})}>
                <h5 className="card-title">{task.name}</h5>
                {task.description && <p className="card-text break-words-smart">{task.description}</p>}
            </div>
            <div className="card-footer d-flex justify-content-between">
                <TaskStatus value={task.status} onChange={status => updateTask({ status })} />
                <TaskStopwatch taskId={task.id} disabled={task.status === 'done'} onRunning={handleStopwatchRunning}/>
            </div>
        </div>
    );
}