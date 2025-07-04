import { KeyboardEvent } from "react";
import classNames from "classnames";
import { isEmpty } from "@lib/util/validation";

type TaskFieldProps = { value: string, violation: boolean|string,  onChange: (name: string, value: string) => void};
type TaskDescriptionProps = TaskFieldProps & { onShiftEnter?: () => void };

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

export function validateTaskForm(name: string, value: null|number|string): boolean|string {
    let violation = false;
    if (name === 'name' && isEmpty(value)) {
        violation = true;
    }
    return violation;
}