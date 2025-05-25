import { ReactNode, useEffect, useRef} from "react";
import BootstrapModal from 'bootstrap/js/dist/modal';

type ModalProps = {
    id: string,
    show: boolean,
    children: ReactNode,
    size?: 'sm'|'md'|'lg'|'xl',
    title?: string
};

export default function Modal({
    id,
    children,
    show = false,
    size = "md", // sm, md, lg, xl
    title
} : ModalProps ) {

    const modalRef = useRef(null);
    const modalInstanceRef = useRef(null);

    useEffect(() => {
        if (modalRef.current) {
            // Initialize Bootstrap Modal
            modalInstanceRef.current = new BootstrapModal(modalRef.current);
            console.log('modal created')

            // // Event listeners
            // const modalElement = modalRef.current;
            // modalElement.addEventListener('show.bs.modal', onShow);
            // modalElement.addEventListener('hide.bs.modal', () => {
            //     onHide();
            //     onClose();
            // });

            return () => {
                // modalElement.removeEventListener('show.bs.modal', onShow);
                // modalElement.removeEventListener('hide.bs.modal', onHide);

                // Dispose of modal instance
                if (modalInstanceRef.current) {
                    modalInstanceRef.current.dispose();
                }
            };
        }
    }, []);

    useEffect(() => {
        if (modalInstanceRef.current) {
            if (show) {
                modalInstanceRef.current.show();
                console.log('modal show')
            } else {
                modalInstanceRef.current.hide();
                console.log('modal hide')
            }
        }
    }, [show]);

    const getSizeClass = () => {
        switch (size) {
            case 'sm': return 'modal-sm';
            case 'lg': return 'modal-lg';
            case 'xl': return 'modal-xl';
            default: return '';
        }
    };

    return (
        <div className="modal fade" id={id} tabIndex={-1} aria-labelledby={title && id + 'Label'} aria-hidden="true" ref={modalRef}>
            <div className={`modal-dialog ${getSizeClass()}`}>
                <div className="modal-content">
                    {title && (
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id={id + 'Label'}>{title}</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                    )}
                    <div className="modal-body">
                        {children}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" className="btn btn-primary">Save changes</button>
                    </div>
                </div>
            </div>
        </div>
    )
}