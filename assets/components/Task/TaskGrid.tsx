import { useContext, useEffect, useState } from "react";
import TaskCard from "@components/Task/TaskCard";
import { match } from "@lib/util/util";
import { useBreakpoint } from "@lib/react";
import { TaskModalContext } from "@lib/state/task-modal-state";
import rem from "@lib/idb/rem";

export default function TaskGrid() {
    const [tasks, setTasks] = useState<number[]>([]);
    const context = useContext(TaskModalContext)
    const columns = useMasonryIds(tasks);

    useEffect(() => {
        setTasks(rem.tasks.getTasks().map(task => task.id));
    }, []);

    useEffect(() => {
        if (context.dateUpd) {
            setTasks(rem.tasks.getTasks().map(task => task.id))
        }
    }, [context.dateUpd]);

    return <div className="container-fluid">
        <div className="row g-3 mt-0">

            {columns.map((tasksIds, index) => <div className="col" key={index}>{tasksIds.map(taskId =>
                <TaskCard key={taskId} taskId={taskId} />
            )}</div>)}

            {/*{tasks.map(task => <div className="col-md-6 col-lg-4 col-xl-3" key={task.id}>
                <TaskCard task={task} onEdit={handleTaskEdit} />
            </div>)}*/}
        </div>
    </div>
}

function useMasonryIds(tasksIds: number[]) {
    const breakpoint = useBreakpoint();
    const [numColumns, setNumColumns] = useState(0);
    const [columns, setColumns] = useState<number[][]>([]);

    useEffect(() => {
        if (breakpoint) {
            setNumColumns(match(breakpoint, {xs: 1, sm: 1, md: 2, lg: 3, xl: 4}, 0))
        }
    }, [breakpoint]);

    useEffect(() => {
        let columnsCount = 0;
        setColumns(tasksIds.reduce<number[][]>((columns, taskId) => {
            if (numColumns) {
                columnsCount = columnsCount === numColumns ? 0 : columnsCount;
                if (columns.length < columnsCount + 1) {
                    columns.push([])
                }
                columns[columnsCount].push(taskId);
                columnsCount++;
            }
            return columns;
        }, []));
    }, [numColumns, tasksIds]);

    return columns;
}