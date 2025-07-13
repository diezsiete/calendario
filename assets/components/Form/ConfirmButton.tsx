import { useState, useEffect, ReactNode } from 'react';
import classNames from "classnames";
import '@styles/components/form/confirm-button.scss';

type ConfirmButtonProps =  {
    onConfirm: () => void,
    reset?: boolean,
    className?: string,
    label?: ReactNode,
    labelCancel?: ReactNode,
    labelConfirm?: ReactNode,
};
export default function ConfirmButton({
    onConfirm,
    reset,
    className,
    label = 'Eliminar',
    labelCancel = 'Cancelar',
    labelConfirm = 'Seguro?',
}: ConfirmButtonProps) {
    const [isConfirming, setIsConfirming] = useState(false);

    useEffect(() => {
        if (reset) {
            setIsConfirming(false);
        }
    }, [reset]);

    const handleConfirm = () => {
        onConfirm();
        setIsConfirming(false);
    };

    return <div className={classNames('confirm-button-component position-relative d-inline-block', className)}>
        <button type="button" className={`primary-button btn ${isConfirming ? 'btn-secondary' : 'btn-outline-danger'}`}
                onClick={() => setIsConfirming(prev => !prev)}>
            {isConfirming ? labelCancel : label}
        </button>
        <button type="button" className={`confirm-button btn btn-danger${isConfirming ? ' visible' : ''}`} onClick={handleConfirm}>
            {labelConfirm}
        </button>
    </div>
}