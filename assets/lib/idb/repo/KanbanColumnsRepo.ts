import { AbstractRepo } from "@lib/idb/repo/abstracts";
import { KanbanColumn } from "@type/Model";

export default class KanbanColumnsRepo extends AbstractRepo {
    fetchAllByPosition() {
        return this.fetchAllByOrderedIndex<KanbanColumn>('position');
    }
}