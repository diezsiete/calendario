import { useContext, useEffect, useRef } from "react";
import classNames from "classnames";
import Modal, { ModalHeader } from "@components/Modal/Modal";
import Form, { FormHandle } from "@components/Form/Form";
import { useSimpleForm } from "@lib/hooks/form";
import { ProjectContext, ProjectDispatch } from "@lib/state/project-state";
import rem from "@lib/idb/rem";
import { isEmpty } from "@lib/util/validation";
import ColorPicker, { ColorPickerHidder, useShowColorPicker } from "@components/Form/ColorPicker";
import '@styles/components/project/project-modal.scss';

export default function ProjectModal() {
    const projectContext = useContext(ProjectContext);
    const projectDispatch = useContext(ProjectDispatch);
    const formRef = useRef<FormHandle>(null);
    const {data, setData, violations, updateField, submit} = useSimpleForm(rem.projects.newProject(), (name, value) => name === 'name' && isEmpty(value));
    const {colorPickerTriggerRef, colorPickerRef, colorPickerStyle, showColorPicker, hideColorPicker} = useShowColorPicker();

    useEffect(() => {
        if (projectContext.modalShow) {
            setData(projectContext.modalShow === 'new'
                ? rem.projects.newProject()
                : rem.projects.getProject(projectContext.modalShow)
            );
        } else {
            hideColorPicker();
        }
    }, [projectContext.modalShow, setData, hideColorPicker]);

    const handleColorPickerChange = (color: string) => setData(prev =>  {
        if (prev.color === color) {
            hideColorPicker();
        }
        return { ...prev, color }
    })


    function handleUpsert() {
        if (submit()) {
            if (data.id) {
                rem.projects.updateProject(data.id, data).then(() => projectDispatch({type: 'projectUpdated', projectId: data.id}))
            } else {
                rem.projects.addProject(data).then(project => projectDispatch({type: 'projectCreated', projectId: project.id}));
            }
        } else {
            formRef.current.focus();
        }
    }

    function handleDelete() {
        rem.projects.deleteProject(data.id).then(() => projectDispatch({type: 'projectDeleted', projectId: data.id}));
    }

    return <>
        <Modal id='projectModal' className='project border-inner untransformable' size='xl' centered nested
               show={!!projectContext.modalShow}
               onShown={() => formRef.current.focus()}
               backdropStatic blockEsc
               onHidePrevented={() => projectDispatch({type: 'projectClosed'})}
        >
            <Form preventDefault onSubmit={() => handleUpsert()} ref={formRef}>
                <ModalHeader className='is-input'>
                    <div className="input-group">
                        {data.id &&
                            <button type='button' className='btn btn-outline-danger' onClick={handleDelete}>
                                <i className="bi bi-eraser"></i>
                            </button>}
                        <input type="text" id="projectName" placeholder="Nombre" name="name" aria-label="Project name"
                               value={data.name} className={classNames('form-control', {'is-invalid': !!violations.name})}
                               onChange={e => updateField('name', e.target.value)}
                        />
                        <button type='button' className="btn btn-outline-secondary color-picker-trigger" ref={colorPickerTriggerRef} onClick={showColorPicker}>
                            <i className="bi bi-palette-fill" style={{color: data.color}}></i>
                        </button>
                        <button className="btn btn-primary">Guardar</button>
                    </div>
                </ModalHeader>
            </Form>
        </Modal>
        <ColorPicker color={data.color} onChange={handleColorPickerChange} style={colorPickerStyle} ref={colorPickerRef} />
        <ColorPickerHidder onClick={hideColorPicker} style={{display: colorPickerStyle.display}} />
    </>
}