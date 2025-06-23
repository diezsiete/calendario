import { Rem } from "@lib/idb/rem";
import { AbstractRepo } from "@lib/idb/repo/abstracts";
import { STORE_KANBAN_COLUMNS } from "@lib/idb/idb";
import { KanbanColumn } from "@type/Model";

export default class KanbanColumnsRepo extends AbstractRepo {
    constructor(rem: Rem) {
        super(rem, STORE_KANBAN_COLUMNS)
    }

    fetchAllByPosition() {
        return this.fetchAllByOrderedIndex<KanbanColumn>('position');
    }
}