import { useCallback, useState } from "react";

export function useSimpleForm<T>(stateData: T, customValidate: (name: string, value: null|number|string) => boolean|string) {
    const [violations, setViolations] = useState<Record<string, boolean|string>>({});
    const [data, setStateData] = useState<T>(stateData);

    const setData = useCallback((stateData: T|((prev: T) => T)) => {
        setStateData(stateData);
        if (typeof stateData !== 'function') {
            setViolations({});
        }
    }, [])

    const validate = useCallback((name: string, value: null|number|string): boolean => {
        const violation = customValidate(name, value);
        setViolations(prev => ({...prev, [name]: violation}));
        return !!violation;
    }, [customValidate]);

    const updateField = useCallback((name: string, value: null|number|string) => {
        validate(name, value);
        setStateData(prev => ({ ...prev, [name]: value }));
    }, [validate]);

    const submit = useCallback((onSuccess?: (data: T) => void) => {
        const violation = Object.keys(data).reduce((violation, name) => {
            const currentViolation = name !== 'id' ? validate(name, data[name]) : false;
            return violation || currentViolation;
        }, false);

        if (!violation) {
            onSuccess?.(data);
            return true;
        }
        return false;
    }, [data, validate]);

    return {
        data,
        setData,
        violations,
        updateField,
        submit,
    };
}