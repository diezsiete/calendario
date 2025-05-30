import { ReactNode, Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import BootstrapModal from 'bootstrap/js/dist/modal';

export interface ModalHandle {
    display: (show: boolean) => void;
    show: () => void;
    hide: () => void;
}
export type ModalProps = {
    id?: string,
    children: ReactNode,
    size?: 'sm'|'md'|'lg'|'xl',
    title?: string,
    onShown?: () => void;
    onHidden?: () => void;
    ref?: Ref<ModalHandle>
};

export default function Modal({
    id,
    children,
    size = "md",
    title,
    onShown,
    onHidden,
    ref,
}: ModalProps) {
    const [show, setShow] = useState(false);
    const modalRef = useRef(null);
    const modalInstanceRef = useRef(null);
    const onShownRef = useRef(onShown);
    const onHiddenRef = useRef(onHidden);

    useImperativeHandle(ref, () => ({
        display: (show: boolean) => setShow(show),
        show: () => setShow(true),
        hide: () => setShow(false),
    }));

    useEffect(() => {
        if (modalRef.current && !modalInstanceRef.current) {
            // Initialize Bootstrap Modal
            modalInstanceRef.current = new BootstrapModal(modalRef.current);
            // console.log('modal created')

            const handleShown = () => onShownRef.current?.();
            const handleHidden = () => {
                setShow(false);
                onHiddenRef.current?.();
            }

            // Event listeners
            const modalElement = modalRef.current;
            modalElement.addEventListener('shown.bs.modal', handleShown);
            modalElement.addEventListener('hidden.bs.modal', handleHidden);

            return () => {
                modalElement.removeEventListener('shown.bs.modal', handleShown);
                modalElement.removeEventListener('hidden.bs.modal', handleHidden);
                // Dispose of modal instance
                if (modalInstanceRef.current) {
                    modalInstanceRef.current.dispose();
                    modalInstanceRef.current = null;
                }
            };
        }
    }, []);

    useEffect(() => {
        if (modalInstanceRef.current) {
            if (show) {
                modalInstanceRef.current.show();
            } else {
                modalInstanceRef.current.hide();
            }
        }
    }, [show]);

    return (
        <div className="modal fade" id={id} tabIndex={-1} aria-labelledby={title && id + 'Label'} aria-hidden="true" ref={modalRef}>
            <div className={`modal-dialog ${getSizeClass(size)}`}>
                <div className="modal-content">
                    {title && (
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id={id ? id + 'Label' : id}>{title}</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                    )}
                    {children}
                </div>
            </div>
        </div>
    )
}

export const ModalBody = ({ children }: { children: ReactNode }) => <div className="modal-body">{children}</div>;
export const ModalFooter = ({ children }: { children: ReactNode }) => <div className="modal-footer">{children}</div>;

const getSizeClass = (size: ModalProps['size']) => {
    switch (size) {
        case 'sm': return 'modal-sm';
        case 'lg': return 'modal-lg';
        case 'xl': return 'modal-xl';
        default: return '';
    }
};