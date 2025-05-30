import { FormEvent, ReactNode, Ref, useImperativeHandle, useRef } from "react";

export interface FormHandle {
    requestSubmit: () => void;
    focus: () => void;
}

type FormProps = {children: ReactNode, onSubmit?: (e: FormEvent) => void, preventDefault?: boolean, ref?: Ref<FormHandle>}

export default function Form({ children, onSubmit, preventDefault, ref }: FormProps) {
    const formRef = useRef<HTMLFormElement>(null);

    useImperativeHandle(ref, () => ({
        requestSubmit: () => formRef.current?.requestSubmit(),
        focus: () => formRef.current?.querySelector<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>(
                'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])'
            )?.focus()
    }));

    function submitHandler(e: FormEvent) {
        if (preventDefault) {
            e.preventDefault();
        }
        onSubmit?.(e);
    }

    return (
        <form noValidate ref={formRef} onSubmit={submitHandler}>
            {children}
        </form>
    )
}