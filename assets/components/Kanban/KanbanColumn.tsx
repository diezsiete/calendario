import { useContext, useEffect, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanColumn, Task, TaskStatus } from "@type/Model";
import { TaskCardSortable } from "@components/Kanban/TaskCard";
import rem from "@lib/idb/rem";
import { TaskModalDispatch } from "@lib/state/task-modal-state";

type ColumnProps = { column: KanbanColumn };
export default function KanbanColumn({ column } : ColumnProps) {
    const taskModalDispatch = useContext(TaskModalDispatch)
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        setTasks(rem.tasks.getTasksByColumn(column.id));
    }, [column.id, column.dateUpd]);

    const { setNodeRef } = useDroppable({id: column.id, data: {columnId: column.id}});

    const handleAdd = () => taskModalDispatch({
        type: 'taskModalOpened',
        task: rem.tasks.newTask({columnId: column.id, status: column.id as TaskStatus})
    })

    return <div className='kanban-column'>
        <div className="kanban-column-droppable-content" ref={setNodeRef}>
            <div className="kanban-column-content">
                <div className="kanban-column-content-header">
                    <h2 className='kanban-column-content-header-title'>
                        {column.title}
                    </h2>
                    <button className='btn add-task' onClick={handleAdd}>
                        <i className="bi bi-plus"></i>
                    </button>
                </div>
                {/*items={tasks}*/}
                <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                    <div className="kanban-column-content-body">
                        {tasks.map((task: Task) =>
                            <TaskCardSortable key={task.id} task={task} />
                        )}
                    </div>
                </SortableContext>
            </div>
        </div>
    </div>
}