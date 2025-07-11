import { AbstractRepo } from "@lib/idb/repo/abstracts";
import { KanbanColumn } from "@type/Model";

export default class KanbanColumnsRepo extends AbstractRepo {
    private columns: KanbanColumn[] = [];

    async fetchAllByPosition() {
        this.columns = await this.fetchAllByOrderedIndex<KanbanColumn>('position');
        return this.columns;
    }

    getAllByPosition() {
        return this.columns;
    }
}