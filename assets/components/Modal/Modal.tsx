import { ReactNode, Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import BootstrapModal from 'bootstrap/js/dist/modal';
import BootstrapBackdrop from 'bootstrap/js/dist/util/backdrop'
import '@styles/components/modal.scss';
import classNames from "classnames";

export interface ModalHandle {
    display: (show: boolean) => void;
    show: () => void;
    hide: () => void;
}
export type ModalProps = {
    children: ReactNode,
    id?: string,
    size?: 'sm'|'md'|'lg'|'xl',
    centered?: boolean,
    className?: string,
    title?: string,
    onShown?: () => void;
    onHidden?: () => void;
    onHidePrevented?: () => void;
    ref?: Ref<ModalHandle>,
    nested?: boolean,
    backdropStatic?: boolean,
    blockEsc?: boolean,
};

export default function Modal({
    id,
    children,
    size = "md",
    centered,
    className,
    title,
    onShown,
    onHidden,
    onHidePrevented,
    ref,
    nested,
    backdropStatic,
    blockEsc,
}: ModalProps) {
    const [show, setShow] = useState(false);
    const modalRef = useRef(null);
    const modalInstanceRef = useRef(null);
    const onShownRef = useRef(onShown);
    const onHiddenRef = useRef(onHidden);
    const onHidePreventedRef = useRef(onHidePrevented);

    useImperativeHandle(ref, () => ({
        display: (show: boolean) => setShow(show),
        show: () => setShow(true),
        hide: () => setShow(false),
    }));

    useEffect(() => {
        onShownRef.current = onShown;
    }, [onShown]);
    useEffect(() => {
        onHiddenRef.current = onHidden;
    }, [onHidden]);
    useEffect(() => {
        onHidePreventedRef.current = onHidePrevented;
    }, [onHidePrevented]);

    useEffect(() => {
        if (modalRef.current && !modalInstanceRef.current) {
            // Initialize Bootstrap Modal
            modalInstanceRef.current = new BootstrapModal(modalRef.current);
            if (nested) {
                modalInstanceRef.current._backdrop = new BootstrapBackdrop({isAnimated: true, className: 'modal-backdrop nested'});
            }

            const handleShown = () => onShownRef.current?.();
            const handleHidden = () => {
                setShow(false);
                onHiddenRef.current?.();
            }
            const handleHidePrevented = () => onHidePreventedRef.current?.();

            // Event listeners
            const modalElement = modalRef.current;
            modalElement.addEventListener('shown.bs.modal', handleShown);
            modalElement.addEventListener('hidden.bs.modal', handleHidden);
            modalElement.addEventListener('hidePrevented.bs.modal', handleHidePrevented);

            return () => {
                modalElement.removeEventListener('shown.bs.modal', handleShown);
                modalElement.removeEventListener('hidden.bs.modal', handleHidden);
                modalElement.removeEventListener('hidePrevented.bs.modal', handleHidePrevented);
                // Dispose of modal instance
                if (modalInstanceRef.current) {
                    modalInstanceRef.current.dispose();
                    modalInstanceRef.current = null;
                }
            };
        }
    }, [nested]);

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
        <div className={classNames('modal fade', className, {nested})}
             id={id} tabIndex={-1}
             aria-labelledby={title && id + 'Label'}
             ref={modalRef}
             data-bs-backdrop={backdropStatic ? 'static' : undefined}
             data-bs-keyboard={blockEsc ? 'false' : undefined}
        >
            <div className={`modal-dialog ${getSizeClass(size)} ${centered ? 'modal-dialog-centered' : ''}`}>
                <div className="modal-content">
                    {title && (
                        <ModalHeader>
                            <h1 className="modal-title fs-5" id={id ? id + 'Label' : id}>{title}</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </ModalHeader>
                    )}
                    {children}
                </div>
            </div>
        </div>
    )
}

export const ModalHeader = ({ children, className }: { children: ReactNode, className?: string }) =>
    <div className={classNames('modal-header', className)}>{children}</div>;
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