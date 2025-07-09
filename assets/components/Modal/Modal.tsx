import { ReactNode, useEffect, useRef } from "react";
import BootstrapModal from 'bootstrap/js/dist/modal';
import classNames from "classnames";
import { cleanupBootstrapModal, getSizeClass, instanceBootstrapModal } from "@lib/bootstrap";
import '@styles/components/modal.scss';

export type ModalProps = {
    children: ReactNode,
    show: boolean,
    id?: string,
    size?: 'sm'|'md'|'lg'|'xl',
    centered?: boolean,
    className?: string,
    title?: string,
    onShown?: () => void;
    onHidden?: () => void;
    onHidePrevented?: () => void;
    nested?: boolean,
    backdropStatic?: boolean,
    blockEsc?: boolean,
};

export default function Modal({
    show,
    id,
    children,
    size = "md",
    centered,
    className,
    title,
    onShown,
    onHidden,
    onHidePrevented,
    nested,
    backdropStatic,
    blockEsc,
}: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const modalInstanceRef = useRef<BootstrapModal>(null);
    const onShownRef = useRef(onShown);
    const onHiddenRef = useRef(onHidden);
    const onHidePreventedRef = useRef(onHidePrevented);

    onShownRef.current = onShown;
    onHiddenRef.current = onHidden;
    onHidePreventedRef.current = onHidePrevented;

    useEffect(() => {
        if (modalRef.current && !modalInstanceRef.current) {
            const modalElement = modalRef.current;
            const handleShown = () => onShownRef.current?.();
            const handleHidden = () => onHiddenRef.current?.();
            const handleHidePrevented = () => onHidePreventedRef.current?.();
            modalInstanceRef.current = instanceBootstrapModal(modalElement, handleShown, handleHidden, handleHidePrevented, nested);
            return () => {
                cleanupBootstrapModal(modalElement, handleShown, handleHidden, handleHidePrevented, modalInstanceRef.current);
                modalInstanceRef.current = null;
            }
        }
    }, [nested]);

    useEffect(() => {
        if (show) {
            modalInstanceRef.current?.show();
        } else {
            modalInstanceRef.current?.hide();
        }
    }, [show]);

    return (
        <div className={classNames('modal fade', className, {nested})}
             id={id} tabIndex={-1}
             aria-labelledby={title && id + 'Label'}
             aria-hidden="true"
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