import { useState, useImperativeHandle, Ref } from 'react';
import '@styles/components/form/confirm-button.scss';

interface ConfirmButtonProps {
    onConfirm: () => void;
    ref: Ref<ConfirmButtonHandle>
}

export interface ConfirmButtonHandle {
    reset: () => void;
}

export default function ConfirmButton(props: ConfirmButtonProps) {
        const [isConfirming, setIsConfirming] = useState(false);

        useImperativeHandle(props.ref, () => ({
            reset: () => setIsConfirming(false)
        }));

        const handleConfirm = () => {
            props.onConfirm();
            setIsConfirming(false);
        };

        return <div className='confirm-button-component position-relative d-inline-block'>
            <button className={`primary-button btn ${isConfirming ? 'btn-secondary' : 'btn-outline-danger'}`}
                    onClick={() => setIsConfirming(prev => !prev)}>
                {isConfirming ? 'Cancelar' : 'Eliminar'}
            </button>
            <button className={`confirm-button btn btn-danger${isConfirming ? ' visible' : ''}`} onClick={handleConfirm}>
                Seguro?
            </button>
        </div>;
}