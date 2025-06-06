import { MouseEvent, ReactNode, useEffect, useRef } from "react";
import classNames from "classnames";
import BootstrapDropdown from 'bootstrap/js/dist/dropdown';
import '@styles/components/dropdown.scss'

type DropdownProps = { title: string, children: ReactNode, menuEnd?: boolean, className?: string, btnClassName?: string };

export default function Dropdown(props: DropdownProps) {
    const dropdownRef = useRef(null);
    const bootstrapDropdownInstanceRef = useRef<BootstrapDropdown>(null);

    useEffect(() => {
        if (!dropdownRef.current || bootstrapDropdownInstanceRef.current) return;
        bootstrapDropdownInstanceRef.current = new BootstrapDropdown(dropdownRef.current)
        return () => {
            bootstrapDropdownInstanceRef.current.dispose();
            bootstrapDropdownInstanceRef.current = null;
        }
    }, []);

    return (
        <div className={classNames('dropdown', props.className)}>
            <button className={classNames('btn dropdown-toggle', props.btnClassName)} type="button" data-bs-toggle="dropdown"
                    aria-expanded="false" ref={dropdownRef}>
                {props.title}
            </button>
            <ul className={classNames('dropdown-menu', {
                'dropdown-menu-end': props.menuEnd
            })}>
                {props.children}
            </ul>
        </div>
    )
}
type DropdownItemProps = { children: ReactNode, onClick?: (e: MouseEvent) => void, active?: boolean, className?: string};
export function DropdownItemButton({ children, onClick, active, className }: DropdownItemProps) {
    return <li>
        <button type='button' className={classNames('dropdown-item', {active}, className)} onClick={e => onClick?.(e)}>
            {children}
        </button>
    </li>
}

export const DropdownDivider = () => <li><hr className="dropdown-divider"/></li>