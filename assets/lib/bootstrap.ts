import BootstrapModal from "bootstrap/js/dist/modal";
import BootstrapBackdrop from 'bootstrap/js/dist/util/backdrop'
import { ModalProps } from "@components/Modal/Modal";

export function instanceBootstrapModal(
    element: HTMLDivElement,
    handleShown: () => void,
    handleHidden: () => void,
    handleHidePrevented: () => void,
    nested: boolean,
) {
    // Initialize Bootstrap Modal
    const instance = new BootstrapModal(element);
    if (nested) {
        (instance as any)._backdrop = new BootstrapBackdrop({isAnimated: true, className: 'modal-backdrop nested'});
    }

    // Event listeners
    element.addEventListener('shown.bs.modal', handleShown);
    element.addEventListener('hide.bs.modal', removeModalFocus);
    element.addEventListener('hidden.bs.modal', handleHidden);
    element.addEventListener('hidePrevented.bs.modal', handleHidePrevented);

    return instance;
}

export function cleanupBootstrapModal(
    element: HTMLDivElement,
    handleShown: () => void,
    handleHidden: () => void,
    handleHidePrevented: () => void,
    instance: BootstrapModal|null
) {
    element.removeEventListener('shown.bs.modal', handleShown);
    element.removeEventListener('hide.bs.modal', removeModalFocus);
    element.removeEventListener('hidden.bs.modal', handleHidden);
    element.removeEventListener('hidePrevented.bs.modal', handleHidePrevented);
    // Dispose of modal instance
    instance?.dispose();
}

export const getSizeClass = (size: ModalProps['size']) => {
    switch (size) {
        case 'sm': return 'modal-sm';
        case 'lg': return 'modal-lg';
        case 'xl': return 'modal-xl';
        default: return '';
    }
};

/**
 * onHide remove any focus to avoid Blocked aria-hidden warning
 */
function removeModalFocus() {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement.closest('.modal')) {
        activeElement.blur();
    }
}