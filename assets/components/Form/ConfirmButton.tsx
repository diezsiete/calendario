import { useState, useEffect } from 'react';
import '@styles/components/form/confirm-button.scss';

export default function ConfirmButton({ onConfirm, reset }: { onConfirm: () => void, reset?: boolean }) {
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

    return <div className='confirm-button-component position-relative d-inline-block'>
        <button type="button" className={`primary-button btn ${isConfirming ? 'btn-secondary' : 'btn-outline-danger'}`}
                onClick={() => setIsConfirming(prev => !prev)}>
            {isConfirming ? 'Cancelar' : 'Eliminar'}
        </button>
        <button type="button" className={`confirm-button btn btn-danger${isConfirming ? ' visible' : ''}`} onClick={handleConfirm}>
            Seguro?
        </button>
    </div>
}