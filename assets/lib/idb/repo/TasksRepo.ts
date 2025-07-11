import rem from "@lib/idb/rem";
import { AbstractQuery, AbstractRepo, OrderBySort } from "@lib/idb/repo/abstracts";
import { Task, TaskData, TaskStatus } from "@type/Model";
import { arrayMove } from "@dnd-kit/sortable";

export default class TasksRepo extends AbstractRepo<Task> {
    private _query: TasksQuery|null = null;

    private tasksByColumn: Record<string, Task[]> = {};
    private tasks: Map<number, Task> = new Map;

    get query() {
        return this._query ? this._query : this._query = new TasksQuery(this.rem, this.store);
    }

    fetchAllTasks(projectId?: number|null): Promise<Task[]> {
        return TasksRepo.singletonAsync(this, `fetchAll${projectId}`, async () => {
            const columns = await rem.kanbanColumns.fetchAllByPosition();
            this.tasks = new Map;
            this.tasksByColumn = {};
            for (const column of columns) {
                await this.fetchAllByColumnId(column.id, projectId);
            }
            return this.getTasks();
        });
    }

    async fetchAllByColumnId(columnId: string, projectId?: number|null): Promise<Task[]> {
        this.tasksByColumn[columnId] = await this.query.getAllFromIndex(columnId, projectId);
        this.tasksByColumn[columnId].forEach(task => this.tasks.set(task.id, task))
        return this.tasksByColumn[columnId]
    }

    newTask(custom?: Partial<TaskData>): TaskData {
        return {
            name: '',
            description: '',
            status: 'todo',
            position: 0,
            projectId: this.rem.projects.localFilter.get(),
            ...custom
        };
    }

    getTask(taskId: number): Task|undefined {
        return this.tasks.get(taskId);
    }
    getTasks(): Task[] {
        return Array.from(this.tasks, value => value[1]);
    }

    getTasksByColumn(columnId: string) {
        return this.tasksByColumn[columnId] ?? []
    }

    setTaskColumnId(taskId: number, columnId: string) {
        const task = this.getTask(taskId);
        this.removeTaskFromColumn(task.id, task.columnId);
        task.columnId = columnId;
        this.tasksByColumn[columnId] = [task, ...this.tasksByColumn[columnId]];
    }

    swapTaskPosition(taskId: number, swapId: number): boolean {
        const columnId = this.getTask(taskId)?.columnId
        if (columnId) {
            const index = this.getTaskPositionInColumn(taskId, columnId);
            const swapIndex = this.getTaskPositionInColumn(swapId, columnId);
            if (index >= 0 && swapIndex >= 0) {
                if (index !== swapIndex) {
                    this.tasksByColumn[columnId] = arrayMove(this.tasksByColumn[columnId], index, swapIndex);
                    this.tasksByColumn[columnId].forEach((task, index) => task.position = index);
                    return true;
                // cuando se pasa de col A a B en primera posicion taskId y swapId son 0, corremos todas las demas posiciones 1
                } else if (!index) {
                    this.unshiftTaskPosition(taskId);
                    return true;
                }
            }
        }
        return false;
    }
    unshiftTaskPosition(taskId: number): void {
        const task = this.getTask(taskId);
        const columnId = task?.columnId
        if (task && columnId) {
            let newPos = 1;
            for (const task of this.tasksByColumn[columnId]) {
                task.position = task.id === taskId ? 0 : newPos++;
            }
        }
    }

    updateTasksWithColumnId(columnId: string): Promise<void> {
        return this.writeTransaction(async ({ store }) => {
            for (const task of this.tasksByColumn[columnId]) {
                await store.put(task);
            }
        })
    }

    addTask(data: TaskData): Promise<Task> {
        return this.writeTransaction<Task>(async ({ store }) => {
            data.timersTotal = 0;
            data.position = 0;
            if (!data.columnId) {
                data.columnId = data.status;
            }

            const id = await store.add(data) as number;
            const task = {id, ...data} as Task;

            this.tasks.set(id, task);

            for (const task of this.tasksByColumn[data.columnId]) {
                task.position += 1;
                await store.put(task);
            }

            this.tasksByColumn[data.columnId]?.unshift(task);

            return task;
        })
    }

    async updateTask(task: number|Task, data: Partial<TaskData>): Promise<Task|undefined> {
        task = typeof task === 'number' ? this.getTask(task) : task;
        if (!task) return;

        const tx = this.db.transaction(this.store, 'readwrite');
        const store = tx.objectStore(this.store);

        const taskUpdated = {...task} as Task;
        for (const key in data) {
            if (data[key] !== undefined) {
                taskUpdated[key] = data[key];
            }
        }

        await store.put(taskUpdated);

        this.tasks.set(taskUpdated.id, taskUpdated);
        this.tasksByColumn[taskUpdated.columnId] = this.tasksByColumn[taskUpdated.columnId]?.map(
            task => task.id === taskUpdated.id ? taskUpdated : task
        );

        await tx.done;

        return taskUpdated;
    }
    async updateTaskTimersTotal(taskId: number, status?: TaskStatus): Promise<number> {
        const timersTotal = await rem.timers.fetchTimersTotalByTask(taskId);
        await this.updateTask(taskId, { timersTotal, status })
        return timersTotal;
    }

    async deleteTask(taskId: number): Promise<Task|undefined> {
        const task = this.getTask(taskId);
        if (task) {
            this.tasks.delete(taskId);
            this.removeTaskFromColumn(taskId, task.columnId);
            await this.rem.timers.deleteByTask(taskId);
            await this.db.delete(this.store, taskId);
            this.rem.tasksTimers.local.remove(taskId)
            return task;
        }
    }

    private getTaskPositionInColumn(taskId: number, columnId: string): number {
        return this.tasksByColumn[columnId].findIndex(task => task.id === taskId);
    }

    private removeTaskFromColumn(taskId: number, columnId: string) {
        this.tasksByColumn[columnId] = this.tasksByColumn[columnId]?.filter(task => task.id !== taskId);
    }
}

class TasksQuery extends AbstractQuery {

    getAllFromIndex(columnId: string, projectId?: number|null) {
        let indexName: string
        let query: IDBValidKey|IDBKeyRange;
        if (projectId) {
            indexName = 'projectId_columnId_position';
            query = IDBKeyRange.bound([projectId, columnId, -Infinity], [projectId, columnId, Infinity])
        } else {
            indexName = 'columnId_position';
            query = IDBKeyRange.bound([columnId, -Infinity], [columnId, Infinity])
        }
        return this.db.getAllFromIndex(this.store, indexName, query);
    }

    whereColumnIdOrderByPosition(columnId: string, sort: OrderBySort = 'ASC') {
        return TasksQuery.singletonAsync<Task[]>(this, `whereColumnIdOrderByPosition${sort}`, async () => {
            const orderBound0 = sort === 'ASC' ? -Infinity : Infinity;
            const orderBound1 = sort === 'ASC' ? Infinity : -Infinity;
            return this.db.getAllFromIndex(
                this.store, 'columnId_position', IDBKeyRange.bound([columnId, orderBound0], [columnId, orderBound1])
            );
        })
    }
}