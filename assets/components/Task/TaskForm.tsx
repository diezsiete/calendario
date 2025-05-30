import { ChangeEvent, KeyboardEvent, Ref, useEffect, useState } from "react";
import classNames from "classnames";
import Form, { FormHandle } from '@components/Form/Form';
import { TaskData } from "@type/Model";

type TaskFormSimpleProps = {
    task?: TaskData,
    onSuccess?: (data: TaskData) => void,
    ref?: Ref<FormHandle>
};
export default function TaskForm({ task, onSuccess, ref } : TaskFormSimpleProps) {
    const [violations, setViolations] = useState<Record<string, boolean|string>>({});
    const [data, setData] = useState<TaskData>(task)

    useEffect(() => {
        setData(task);
        setViolations({});
    }, [task])

    function handleInputChange(e: ChangeEvent) {
        const target = e.target as HTMLInputElement|HTMLTextAreaElement;
        const name = target.name;
        const value = target.value;
        validate(name, value);
        setData(prev => ({
            ...prev,
            [name] : value,
        }));
    }

    function handleDescriptionKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && e.shiftKey) {
            e.preventDefault();
            submit();
        }
    }

    function validate(name: string, value: string): boolean {
        let violation = false;
        if (name === 'name' && !value.trim()) {
            violation = true;
        }
        setViolations(prev => ({...prev, [name]: violation}))
        return violation
    }

    function submit() {
        const violation = Object.keys(data).reduce((violation, name) => {
            const currentViolation = name !== 'id' ? validate(name, data[name]) : false;
            return violation || currentViolation;
        }, false)
        if (!violation) {
            onSuccess?.(data);
        }
    }

    return (
        <Form preventDefault onSubmit={submit} ref={ref}>
            <div className="form-floating mb-3">
                <input type="text" id="taskName" placeholder="Nombre" name='name'
                       value={data.name} onChange={e => handleInputChange(e)}
                       className={classNames('form-control', {'is-invalid': !!violations.name})} />
                <label htmlFor="taskName">Nombre</label>
            </div>
            <div className="form-floating">
                <textarea id="taskDescription" name="description" style={{height: '150px'}}
                          value={data.description}
                          onChange={e => handleInputChange(e)}
                          onKeyDown={e => handleDescriptionKeyDown(e)}
                          className={classNames('form-control', {'is-invalid': !!violations.description})}></textarea>
                <label htmlFor="taskDescription">Descripción</label>
            </div>
        </Form>
    )
}