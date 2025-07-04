import { ReactNode, useContext, useEffect, useReducer, useState } from "react";
import { ProjectContext, ProjectDispatch, projectReducer, projectStateClean } from "@lib/state/project-state";
import rem from "@lib/idb/rem";
import { DbContext } from "@components/Db/DbContextProvider";

export default function ProjectContextProvider({ children } : { children: ReactNode } ) {
    const [state, dispatch] = useReducer(projectReducer, projectStateClean());

    return <ProjectContext value={state}>
        <ProjectDispatch value={dispatch}>
            <ProjectContextInit>{children}</ProjectContextInit>
        </ProjectDispatch>
    </ProjectContext>
}

function ProjectContextInit({ children } : { children: ReactNode }) {
    const projectDispatch = useContext(ProjectDispatch);
    const dbContext = useContext(DbContext);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        rem.projects.fetchAllProjects().then(projects => {
            let projectSelected = rem.projects.localFilter.get();
            if (projectSelected && !rem.projects.getProject(projectSelected)) {
                rem.projects.localFilter.set();
                projectSelected = null;
            }
            projectDispatch({ type: 'projectsFetched', projects, projectId: projectSelected });
            setInitialized(true)
        });
    }, [projectDispatch, dbContext]);

    return initialized && children;
}