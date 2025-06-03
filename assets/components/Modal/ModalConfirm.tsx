import {ReactNode, useRef, useState} from "react";
import Modal, { ModalProps, ModalBody, ModalFooter, ModalHandle } from "@components/Modal/Modal";

type ConfirmProps = Omit<ModalProps, 'onHidden'> & {
    onConfirm: (confirm: boolean) => void;
    confirmLabel?: string;
};
export default function ModalConfirm(props: ConfirmProps) {
    const {onConfirm, children, ...modalProps} = props;
    const handleConfirm = useHandleConfirm(onConfirm);

    return <Modal {...modalProps} onHidden={() => handleConfirm(false, 'backdrop')} ref={props.ref}>
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
            <button type="button" className="btn btn-secondary" onClick={() => handleConfirm(false, 'button')}>
                Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={() => handleConfirm(true, 'button')}>
                { props.confirmLabel ?? 'Guardar' }
            </button>
        </ModalFooter>
    </Modal>
}

export function useModalConfirm(defaultMessage: ReactNode = 'ok') {
    const [message, setMessage] = useState(defaultMessage);
    const ref = useRef<ModalHandle>(null);
    const resolveRef = useRef(null);
    const waitConfirm = (message?: ReactNode) => {
        setMessage(message ?? defaultMessage);
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            ref.current?.show();
        });
    };
    const handleConfirm = (confirm: boolean) => {
        resolveRef.current?.(confirm);
        resolveRef.current = null;
        ref.current?.hide();
    };

    return {message, ref, waitConfirm, handleConfirm};
}

export function useHandleConfirm(onConfirm?: (confirm: boolean) => void) {
    const prevCancelSource = useRef(null);

    return (confirm: boolean, source: string) => {
        const emit = source !== 'backdrop' || prevCancelSource.current !== 'button';
        prevCancelSource.current = source
        if (emit) {
            onConfirm?.(confirm);
        }
    }
}