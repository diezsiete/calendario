import { CSSProperties, MouseEvent, ReactNode, useState } from "react";
import { FloatingOptions, useFloating } from "@lib/hooks/floating";

export interface FloatingProps {
    isOpen: boolean;
    onClose: () => void;
    anchorElement: HTMLElement | null;
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    options?: FloatingOptions;
}

export default function Floating({
    isOpen,
    onClose,
    anchorElement,
    children,
    className = '',
    style = {},
    options = {},
}: FloatingProps) {
    const { floatingRef, style: floatingStyle } = useFloating(
        isOpen,
        anchorElement,
        onClose,
        options
    );

    if (!isOpen) return null;

    return (
        <div
            ref={floatingRef}
            className={className}
            style={{ ...floatingStyle, ...style }}
        >
            {children}
        </div>
    );
}


export function Dropdown({children, ...floatingProps}: FloatingProps) {
    return <Floating {...floatingProps} className='bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-48'>
        {children}
    </Floating>
}

export function Popover({children, ...floatingProps}: FloatingProps) {
    return <Floating {...floatingProps} className='bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm'>
        {children}
    </Floating>
}


export function FloatingExample() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [dropdownAnchor, setDropdownAnchor] = useState<HTMLElement | null>(null);
    const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);

    const handleDropdownClick = (event: MouseEvent<HTMLButtonElement>) => {
        setDropdownAnchor(event.currentTarget);
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handlePopoverClick = (event: MouseEvent<HTMLButtonElement>) => {
        setPopoverAnchor(event.currentTarget);
        setIsPopoverOpen(!isPopoverOpen);
    };

    return <>
        <button className='btn btn-lg btn-primary' onClick={handleDropdownClick}>
            Toggle Dropdown
        </button>
        <button className='btn btn-lg btn-warning-alt float-end' onClick={handlePopoverClick}>
            Toggle Popover
        </button>

        <Dropdown
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            anchorElement={dropdownAnchor}
            options={{position: 'bottom'}}
        >
            <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Option 1</div>
            <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Option 2</div>
            <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Option 3</div>
            <div className="border-t border-gray-200 my-1"></div>
            <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600">Delete</div>
        </Dropdown>

        <Popover
            isOpen={isPopoverOpen}
            onClose={() => setIsPopoverOpen(false)}
            anchorElement={popoverAnchor}
            options={{ position: 'right' }}
        >
            <h3 className="font-semibold mb-2">Popover Title</h3>
            <p className="text-sm text-gray-600 mb-3">
                This is a popover with some information. It automatically positions itself
                to stay within the viewport bounds.
            </p>
            <button onClick={() => setIsPopoverOpen(false)} className="btn btn-secondary">
                Close
            </button>
        </Popover>
    </>
}