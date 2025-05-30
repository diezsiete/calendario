import { useRef } from "react";
import Modal, { ModalProps, ModalBody, ModalFooter, ModalHandle } from "@components/Modal/Modal";

type ConfirmProps = Omit<ModalProps, 'onHidden'> & {
    onConfirm: (confirm: boolean) => void;
    confirmLabel?: string;
};
export default function ModalConfirm(props: ConfirmProps) {
    const {onConfirm, children, ...modalProps} = props;
    const prevCancelSource = useRef(null);

    const handleConfirm = (confirm: boolean, source: string) => {
        const emit = source !== 'backdrop' || prevCancelSource.current !== 'button';
        prevCancelSource.current = source
        if (emit) {
            onConfirm?.(confirm);
        }
    }

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

export function useModalConfirm() {
    const modalConfirmRef = useRef<ModalHandle>(null);
    const resolveRef = useRef(null);
    const waitConfirm = () => new Promise((resolve) => {
        resolveRef.current = resolve;
        modalConfirmRef.current?.show();
    });
    const handleModalConfirm = (confirm: boolean) => {
        resolveRef.current?.(confirm);
        resolveRef.current = null;
        modalConfirmRef.current?.hide();
    };

    return [modalConfirmRef, waitConfirm, handleModalConfirm] as const;
}