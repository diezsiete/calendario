import { useContext, useEffect, useState } from "react";
import { ProjectContext, ProjectDispatch } from "@lib/state/project-state";
import EditableSelect from "@components/Form/EditableSelect";
import rem from "@lib/idb/rem";
import { Project } from "@type/Model";

type ProjectSelectProps = { value?: number, className?: string, unselectOption?: string, onChange?: (value: number|null) => void };

export default function ProjectSelect({ value, className, unselectOption, onChange }: ProjectSelectProps) {
    const projectContext = useContext(ProjectContext);
    const projectDispatch = useContext(ProjectDispatch);
    const [projects, setProjects] = useState<Project[]>(projectContext.projects);
    const [project, setProject] = useState<Project>(null);

    useEffect(() => {
        setProject(value ? rem.projects.getProject(value) : null);
    }, [value]);

    useEffect(() => {
        setProjects(projectContext.projects);
    }, [projectContext.projects]);

    return <EditableSelect value={project} label='Proyecto' className={['project-select', className]}
        unselectOption={unselectOption}
        options={projects}
        onCreate={() => projectDispatch({type: 'projectOpened', projectId: 'new'})}
        onEdit={project => projectDispatch({type: 'projectOpened', projectId: project.id})}
        onChange={project => onChange?.(project?.id ?? null)}
    />
}

export function ProjectFilter({ className }: { className?: string }) {
    const projectDispatch = useContext(ProjectDispatch);
    const [value, setValue] = useState(rem.projects.localFilter.get());

    function handleChange(selectedValue: number|null) {
        rem.projects.localFilter.set(selectedValue);
        projectDispatch({ type: 'projectSelected', projectId: selectedValue})
        setValue(selectedValue);
    }

    return <ProjectSelect value={value} className={className} unselectOption='Todos' onChange={handleChange} />
}