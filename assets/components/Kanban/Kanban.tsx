import { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent, KeyboardSensor, PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { DbContext } from "@components/Db/DbContextProvider";
import { TaskCard } from "@components/Kanban/TaskCard";
import KanbanColumn from "@components/Kanban/KanbanColumn";
import { KanbanColumn as KanbanColumnType } from "@type/Model";
import { KanbanContext } from "@lib/state/kanban-state";
import { ProjectContext } from "@lib/state/project-state";
import rem from "@lib/idb/rem";

export default function Kanban() {
    const [initialized, setInitialized] = useState(false);
    const [columns, setColumns] = useState<KanbanColumnType[]>([]);
    const [activeId, setActiveId] = useState(null);
    const dbContext = useContext(DbContext);
    const context = useContext(KanbanContext);
    const projectContext = useContext(ProjectContext);

    useEffect(() => {
        rem.kanbanColumns.fetchAllByPosition().then(async columns => {
            for (const column of columns) {
                await rem.tasksTimers.fetchTasksWithCompleteTimersByColumnId(column.id, projectContext.projectId);
            }
            const dateUpd = Date.now();
            setColumns(columns.map(column => ({...column, dateUpd})));
            setInitialized(true);
        })
    }, [dbContext, projectContext.projectId]);

    useEffect(() => {
        if (context.columnId && context.dateUpd) {
            const columnId = context.columnId.includes(',') ? context.columnId.split(',') : [context.columnId]
            setColumns(value => value.map(column =>
                columnId.includes(column.id) ? {...column, dateUpd: context.dateUpd} : column
            ));
        }
    }, [context.columnId, context.dateUpd]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // drag only activates after moving 8px
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragStart(event: DragStartEvent) {
        const { active } = event;
        setActiveId(active.id)
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id as number;
        const activeColumnId = active.data.current.columnId;
        const overColumnId = over.data.current.columnId;

        if (!activeColumnId || !overColumnId) return;
        if (activeColumnId === overColumnId) return;

        rem.tasks.setTaskColumnId(activeId, overColumnId);
        setColumns(value => value.map(column =>
            column.id === activeColumnId || column.id === overColumnId ? {...column, dateUpd: Date.now()} : column
        ));
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }
        const activeId = active.id as number;
        const overId = over.id;
        const activeColumnId = active.data.current.columnId;
        const overColumnId = over.data.current.columnId;

        if (!activeColumnId || !overColumnId) {
            setActiveId(null);
            return;
        }

        if (activeColumnId === overColumnId) {
            // overId puede ser columnId si es number over es otra task: calculamos posicionamiento
            if (typeof overId === 'number' && rem.tasks.swapTaskPosition(activeId, overId)) {
                setColumns(value => value.map(column =>
                    column.id === overColumnId ? {...column, dateUpd: Date.now()} : column
                ));
            }
            rem.tasks.updateTasksWithColumnId(overColumnId);
        }

        setActiveId(null);
    }

    const activeTask = activeId ? rem.tasks.getTask(activeId) : null;

    return initialized && <main>
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            {columns.map(column => <KanbanColumn key={column.id} column={column} />)}
            {createPortal(
                <DragOverlay>{activeTask && <TaskCard task={activeTask} isOverlayDragging />}</DragOverlay>,
                document.body,
            )}
        </DndContext>
    </main>
}