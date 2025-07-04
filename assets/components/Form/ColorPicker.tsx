import { CSSProperties, MouseEvent, Ref, useCallback, useRef, useState } from "react";
import { Compact } from "@uiw/react-color";
import '@styles/components/form/color-picker.scss';

type ColorPickerProps = { color?: string, onChange?: (color: string) => void, style?: CSSProperties, ref?: Ref<HTMLDivElement> };
export default function ColorPicker({ color, onChange, style, ref }: ColorPickerProps) {
    return <div className="color-picker" style={style} ref={ref}>
        <Compact prefixCls='color-picker' color={color} onChange={colorResult => onChange?.(colorResult.hex)} />
    </div>
}

export const ColorPickerHidder = ({ onClick, style } : { onClick?: (e: MouseEvent) => void, style?: CSSProperties }) =>
    <div className='color-picker-hidder' onClick={onClick} style={style}></div>;

export function useShowColorPicker() {
    const colorPickerTriggerRef = useRef<HTMLButtonElement>(null);
    const colorPickerRef = useRef<HTMLDivElement>(null);
    const [colorPickerStyle, setColorPickerStyle] = useState<CSSProperties>({display: 'none'})

    const showColorPicker = useCallback(() => {
        const rect = colorPickerTriggerRef.current.getBoundingClientRect();
        setColorPickerStyle({display: 'flex', top: `${rect.bottom + window.scrollY}px`, left: `${rect.left + window.scrollX}px`})
    }, [])

    const hideColorPicker = useCallback(() => setColorPickerStyle({display: 'none'}), []);

    return {colorPickerTriggerRef, colorPickerRef, colorPickerStyle, showColorPicker, hideColorPicker}
}