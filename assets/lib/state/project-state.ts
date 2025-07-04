import { ActionDispatch, createContext } from "react";
import { Project } from "@type/Model";
import rem from "@lib/idb/rem";

type ProjectState = { projects: Project[], modalShow: 'new'|number|false, projectId: number|null };

interface ProjectActions {
    projectsFetched: { projects: Project[], projectId: number|null };
    projectOpened: { projectId: 'new' | number };
    projectClosed: unknown; // No additional properties
    projectCreated: { projectId: number };
    projectUpdated: { projectId: number };
    projectDeleted: { projectId: number };
    projectSelected: { projectId: number|null };
}
type ProjectReducerAction = {
    [K in keyof ProjectActions]: { type: K } & ProjectActions[K]
}[keyof ProjectActions];


// Define separate action interfaces for each action type
// type ProjectsFetchedAction = {
//     type: 'projectsFetched';
//     projects: Project[];
// };
// type ProjectOpenedAction = {
//     type: 'projectOpened';
//     projectId: 'new' | number;
// };
// type ProjectClosedAction = {
//     type: 'projectClosed';
// };
// type ProjectCreatedAction = {
//     type: 'projectCreated';
//     projectId: number; // Only number, not 'new' since we're creating
// };
// type ProjectUpdatedAction = {
//     type: 'projectUpdated';
//     projectId: number;
// };
// type ProjectDeletedAction = {
//     type: 'projectDeleted';
//     projectId: number;
// };
// type ProjectSelectedAction = {
//     type: 'projectSelected';
//     projectId?: number;
// };
//
// // Union all action types together
// export type ProjectReducerAction =
//     | ProjectsFetchedAction
//     | ProjectOpenedAction
//     | ProjectClosedAction
//     | ProjectCreatedAction
//     | ProjectUpdatedAction
//     | ProjectDeletedAction
//     | ProjectSelectedAction
// ;

export const projectStateClean = (): ProjectState => ({ projects: [], modalShow: false, projectId: null });

export const ProjectContext = createContext<ProjectState>(null);
export const ProjectDispatch = createContext<ActionDispatch<[action: ProjectReducerAction]>>(null);

export function projectReducer(state: ProjectState, action: ProjectReducerAction): ProjectState {
    switch (action.type) {
        case 'projectsFetched' :
            return {...state, projects: action.projects, projectId: action.projectId };
        case 'projectOpened' :
            return {...state, modalShow: action.projectId }
        case "projectClosed":
            return {...state, modalShow: false }
        case 'projectCreated':
            return {...state, modalShow: false, projects: [...state.projects, rem.projects.getProject(action.projectId)]}
        case 'projectUpdated':
            return {...state, modalShow: false, projects: state.projects.map(project => project.id === action.projectId
                ? rem.projects.getProject(action.projectId)
                : project)}
        case 'projectDeleted':
            return {...state, modalShow: false, projects: state.projects.filter(project => project.id !== action.projectId)}
        case 'projectSelected':
            return {...state, projectId: action.projectId ?? null}
        default : {
            throw Error('Unknown action: ' + (action as any).type);
        }
    }
}