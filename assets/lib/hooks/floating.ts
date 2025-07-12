import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";

// Types for positioning
export type Position = 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface FloatingOptions {
    position?: Position;
    offset?: number;
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
}

interface FloatingStyle {
    x: number;
    y: number;
    finalPosition: Position;
    visibility: 'visible'|'hidden',
}

export function useFloating(
    isOpen: boolean,
    anchorElement: HTMLElement | null,
    onClose: () => void,
    options: FloatingOptions = {}
) {
    const floatingRef = useRef<HTMLDivElement>(null);
    const [floatingStyle, setFloatingStyle] = useState<FloatingStyle>({
        x: 0,
        y: 0,
        finalPosition: options.position || 'bottom',
        visibility: isOpen ? 'visible' : 'hidden',
    })

    const {
        position = 'bottom',
        offset = 8,
        closeOnClickOutside = true,
        closeOnEscape = true,
    } = options;

    const calculateFloatingStyle = useCallback((): FloatingStyle => {
        if (!anchorElement || !floatingRef.current) {
            return { x: 0, y: 0, finalPosition: position, visibility: 'visible' };
        }

        const anchorRect = anchorElement.getBoundingClientRect();
        const floatingRect = floatingRef.current.getBoundingClientRect();
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight,
        };

        // Calculate all possible positions
        const positions: Record<Position, { x: number; y: number }> = {
            top: {
                x: anchorRect.left + anchorRect.width / 2 - floatingRect.width / 2,
                y: anchorRect.top - floatingRect.height - offset,
            },
            bottom: {
                x: anchorRect.left + anchorRect.width / 2 - floatingRect.width / 2,
                y: anchorRect.bottom + offset,
            },
            left: {
                x: anchorRect.left - floatingRect.width - offset,
                y: anchorRect.top + anchorRect.height / 2 - floatingRect.height / 2,
            },
            right: {
                x: anchorRect.right + offset,
                y: anchorRect.top + anchorRect.height / 2 - floatingRect.height / 2,
            },
            'top-left': {
                x: anchorRect.left,
                y: anchorRect.top - floatingRect.height - offset,
            },
            'top-right': {
                x: anchorRect.right - floatingRect.width,
                y: anchorRect.top - floatingRect.height - offset,
            },
            'bottom-left': {
                x: anchorRect.left,
                y: anchorRect.bottom + offset,
            },
            'bottom-right': {
                x: anchorRect.right - floatingRect.width,
                y: anchorRect.bottom + offset,
            },
        };

        // Check if position fits in viewport
        const fitsInViewport = (pos: Position) => {
            const coords = positions[pos];
            return (
                coords.x >= 0 &&
                coords.y >= 0 &&
                coords.x + floatingRect.width <= viewport.width &&
                coords.y + floatingRect.height <= viewport.height
            );
        };

        // Try preferred position first
        if (fitsInViewport(position)) {
            return { ...positions[position], finalPosition: position, visibility: 'visible' };
        }

        // Fallback positions based on preferred position
        const fallbackOrder: Position[] = (() => {
            switch (position) {
                case 'top': return ['bottom', 'top-left', 'top-right', 'left', 'right'];
                case 'bottom': return ['top', 'bottom-left', 'bottom-right', 'left', 'right'];
                case 'left': return ['right', 'top-left', 'bottom-left', 'top', 'bottom'];
                case 'right': return ['left', 'top-right', 'bottom-right', 'top', 'bottom'];
                default: return ['bottom', 'top', 'right', 'left', 'bottom-right', 'bottom-left', 'top-right', 'top-left'];
            }
        })();

        // Try fallback positions
        for (const fallbackPos of fallbackOrder) {
            if (fitsInViewport(fallbackPos)) {
                return { ...positions[fallbackPos], finalPosition: fallbackPos, visibility: 'visible' };
            }
        }

        // If nothing fits, adjust the preferred position to stay in viewport
        const coords = positions[position];
        return {
            x: Math.max(8, Math.min(coords.x, viewport.width - floatingRect.width - 8)),
            y: Math.max(8, Math.min(coords.y, viewport.height - floatingRect.height - 8)),
            finalPosition: position,
            visibility: 'visible'
        };
    }, [anchorElement, position, offset]);

    // Update position when needed
    const updatePosition = useCallback(() => {
        if (isOpen && floatingRef.current) {
            // Use setTimeout to ensure the element is rendered and has dimensions
            setTimeout(() => {
                setFloatingStyle(calculateFloatingStyle());
            }, 0);
        }
    }, [isOpen, calculateFloatingStyle]);

    // Handle click outside
    useEffect(() => {
        if (!isOpen || !closeOnClickOutside) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                floatingRef.current &&
                !floatingRef.current.contains(event.target as Node) &&
                anchorElement &&
                !anchorElement.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, closeOnClickOutside, onClose, anchorElement]);

    // Handle escape key
    useEffect(() => {
        if (!isOpen || !closeOnEscape) return;

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscapeKey);
        return () => document.removeEventListener('keydown', handleEscapeKey);
    }, [isOpen, closeOnEscape, onClose]);

    // Handle resize and scroll
    useEffect(() => {
        if (!isOpen) return;

        const handleUpdate = () => updatePosition();

        window.addEventListener('resize', handleUpdate);
        window.addEventListener('scroll', handleUpdate, true);

        return () => {
            window.removeEventListener('resize', handleUpdate);
            window.removeEventListener('scroll', handleUpdate, true);
        };
    }, [isOpen, updatePosition]);

    // Initial position calculation
    useEffect(() => {
        if (isOpen) {
            updatePosition();
        } else {
            setFloatingStyle(prev => ({...prev, visibility: 'hidden'}));
        }
    }, [isOpen, updatePosition]);

    return {
        floatingRef,
        style: {
            position: 'fixed',
            zIndex: 1000,
            left: floatingStyle.x,
            top: floatingStyle.y,
            visibility: floatingStyle.visibility,
        } as CSSProperties,
        finalPosition: floatingStyle.finalPosition,
    };
};