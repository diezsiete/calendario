import {ChangeEvent, KeyboardEvent, Ref, useEffect, useImperativeHandle, useRef, useState} from "react";
import classNames from "classnames";
import { TaskData } from "@type/Model";

type TaskFormSimpleProps = {
    task?: TaskData,
    onSuccess?: (data: TaskData) => void,
    ref?: Ref<TaskFormHandle>
};
export interface TaskFormHandle {
    requestSubmit: () => void;
    focus: () => void;
}

export default function TaskForm({ task, onSuccess, ref } : TaskFormSimpleProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);
    const [violations, setViolations] = useState<Record<string, boolean|string>>({});
    const [data, setData] = useState<TaskData>(task)

    useImperativeHandle(ref, () => ({
        requestSubmit: () => formRef.current?.requestSubmit(),
        focus: () => nameRef.current?.focus()
    }));

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
        if (!value.trim()) {
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
        <form noValidate ref={formRef} onSubmit={e => {
            e.preventDefault();
            submit();
        }}>
            <div className="form-floating mb-3">
                <input type="text" id="taskName" placeholder="Nombre" name='name' ref={nameRef}
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
        </form>
    )
}