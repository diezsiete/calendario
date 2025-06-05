import { useEffect, useState } from "react";

export const useBreakpoint = () => {
    const [breakpoint, setBreakpoint] = useState('');

    useEffect(() => {
        const getBreakpoint = (width: number) => {
            if (width < 576) return 'xs';
            if (width < 768) return 'sm';
            if (width < 992) return 'md';
            if (width < 1200) return 'lg';
            return 'xl';
        };

        const handleResize = () => {
            setBreakpoint(getBreakpoint(window.innerWidth));
        };

        handleResize(); // Set initial breakpoint
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return breakpoint;
};