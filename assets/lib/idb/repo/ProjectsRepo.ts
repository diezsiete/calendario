import { AbstractRepo } from "@lib/idb/repo/abstracts";
import { ModelData, Project } from "@type/Model";
import { Rem } from "@lib/idb/rem";

export default class ProjectsRepo extends AbstractRepo<Project> {
    private projects: Project[] = [];
    public readonly localFilter: Local;

    constructor(store: string, rem: Rem) {
        super(store, rem);
        this.localFilter = new Local('project-filter');
    }

    fetchAllProjects() {
        return AbstractRepo.singletonAsync(this, `fetchAll`, async () => {
            this.projects = await this.db.getAll(this.store);
            return this.projects;
        });
    }

    getProjects(): Project[] {
        return this.projects;
    }
    getProject(projectId: number): Project|undefined {
        return this.projects.reduce((project, current) => project || (current.id === projectId ? current : undefined), undefined);
    }

    newProject(): ModelData<Project> {
        return { name: '' };
    }

    async addProject(data: ModelData<Project>) {
        const project = await this.add(data);
        this.projects = [...this.projects, project]
        return project;
    }

    async updateProject(project: number|Project, data: Partial<Project>) {
        const projectUpdated = await this.update(project, data);
        if (projectUpdated) {
            // para que name en ProjectSelect cambie, si hacemos : this.projects = this.projects.map(project => project.id === projectUpdated.id ? projectUpdated : project);
            // react no detecta el cambio en name
            this.projects.forEach(project => {
                if (project.id === projectUpdated.id) {
                    project.name = projectUpdated.name;
                }
            })
        }
        return projectUpdated;
    }

    deleteProject(projectId: number) {
        this.projects = this.projects.filter(project => project.id !== projectId);
        return this.delete(projectId);
    }

}

class Local {
    constructor(
        private readonly key: string
    ) {}

    get(): number|null {
        const saved = localStorage.getItem(this.key);
        return saved ? parseInt(saved, 10) : null;
    }
    set(value?: number|null) {
        if (value) {
            localStorage.setItem(this.key, value + '')
        } else {
            localStorage.removeItem(this.key);
        }
    }
}