import { MouseEvent } from "react";
import classNames from "classnames";
import Dropdown, { DropdownDivider, DropdownItemButton } from "@components/Dropdown";
import '@styles/components/form/editable-select.scss';

type EditableSelectOption = { id: string|number, name: string, color?: string, [k: string]: any};
type EditableSelectProps<T extends EditableSelectOption> = {
    value?: T,
    label?: string,
    options?: T[],
    className?: string|string[],
    unselectOption?: string,
    onCreate?: (e: MouseEvent) => void,
    createOptionName?: string,
    onEdit?: (option: T) => void,
    onChange?: (option?: T) => void,
};

export default function EditableSelect<T extends EditableSelectOption>(
    { value, label, options, className, unselectOption, onCreate, createOptionName, onEdit, onChange }: EditableSelectProps<T>
) {
    function handleSelectOption(option?: T) {
        onChange?.(option);
    }

    return <>
        <Dropdown className={classNames('editable-select', className, {editable: !!onEdit})}
                  title={value
                      ? <><ColorRect color={value.color} />{value.name}</>
                      : label}
        >
            {!!options.length && <>
                {unselectOption && value &&
                    <DropdownItemButton onClick={() => handleSelectOption()}>{unselectOption}</DropdownItemButton>
                }
                {options.map(option =>
                    <li key={option.id} className={classNames('option', { selected: option.name === value?.name})}>
                        <button type='button' className='dropdown-item' onClick={() => handleSelectOption(option)}>
                            <ColorRect color={option.color} />
                            {option.name}
                        </button>
                        {onEdit &&
                            <button type='button' className='dropdown-item edit' onClick={() => onEdit(option)}>
                                <i className="bi bi-pencil"></i>
                            </button>}
                    </li>
                )}
                {onCreate && <DropdownDivider />}
            </>}
            {onCreate && <DropdownItemButton onClick={onCreate}>{createOptionName || 'Crear'}</DropdownItemButton>}
        </Dropdown>
    </>
}

function ColorRect({ color }: { color: string }) {
    return (
        <svg aria-hidden="true" className="bd-placeholder-img rounded me-2" height="15"
                preserveAspectRatio="xMidYMid slice" width="15" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill={color ?? 'none'}></rect>
        </svg>
    )
}