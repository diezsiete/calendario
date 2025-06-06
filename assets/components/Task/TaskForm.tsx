import { KeyboardEvent, useCallback, useEffect, useState } from "react";
import classNames from "classnames";
import { TaskData } from "@type/Model";

type TaskFieldProps = { value: string, violation: boolean|string,  onChange: (name: string, value: string) => void};
type TaskDescriptionProps = TaskFieldProps & { onShiftEnter?: () => void };

export function useTaskForm(task: TaskData) {
    const [violations, setViolations] = useState<Record<string, boolean|string>>({});
    const [data, setData] = useState<TaskData>(task);

    useEffect(() => {
        setData(task);
        setViolations({});
    }, [task]);

    const validate = useCallback((name: string, value: string): boolean => {
        let violation = false;
        if (name === 'name' && !value.trim()) {
            violation = true;
        }
        setViolations(prev => ({...prev, [name]: violation}));
        return violation;
    }, []);

    const updateField = useCallback((name: string, value: string) => {
        validate(name, value);
        setData(prev => ({ ...prev, [name]: value }));
    }, [validate]);

    const submit = useCallback((onSuccess?: (data: TaskData) => void) => {
        const violation = Object.keys(data).reduce((violation, name) => {
            const currentViolation = name !== 'id' ? validate(name, data[name]) : false;
            return violation || currentViolation;
        }, false);

        if (!violation) {
            onSuccess?.(data);
            return true;
        }
        return false;
    }, [data, validate]);

    return {
        data,
        violations,
        updateField,
        submit,
    };
}

export function TaskName ({ value, violation, onChange }: TaskFieldProps) {
    return <input type="text" id="taskName" placeholder="Nombre" name='name'
                  value={value} onChange={e => onChange('name', e.target.value)}
                  className={classNames('form-control', {'is-invalid': !!violation})}/>
}

export function TaskDescription({value, violation, onChange, onShiftEnter}: TaskDescriptionProps) {
    function handleDescriptionKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && e.shiftKey) {
            e.preventDefault();
            onShiftEnter?.();
        }
    }

    return <div className="form-floating">
        <textarea id="taskDescription" name="description" value={value}
                  onChange={e => onChange('description', e.target.value)}
                  onKeyDown={e => handleDescriptionKeyDown(e)}
                  className={classNames('form-control', {'is-invalid': !!violation})}></textarea>
        <label htmlFor="taskDescription">Descripción</label>
    </div>
}