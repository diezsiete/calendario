import { useEffect, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanColumn, Task } from "@type/Model";
import { TaskCardSortable } from "@components/Kanban/TaskCard";
import rem from "@lib/idb/rem";

type ColumnProps = { column: KanbanColumn };
export default function KanbanColumn({ column } : ColumnProps) {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        setTasks(rem.tasks.getTasksByColumn(column.id));
    }, [column.id, column.dateUpd]);

    const { setNodeRef } = useDroppable({id: column.id, data: {columnId: column.id}})

    return <div className='kanban-column'>
        <div className="kanban-column-droppable-content" ref={setNodeRef}>
            <div className="kanban-column-content">
                <div className="kanban-column-content-header">
                    {column.title}
                </div>
                {/*items={tasks.map(task => task.id)}*/}
                <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
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