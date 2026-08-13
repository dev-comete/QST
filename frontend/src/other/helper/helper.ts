import type { ChangeEvent } from 'react';

const formChangeHandler = <T, K extends keyof T>(
    setter: React.Dispatch<React.SetStateAction<T>>,
    field: K,
    transform?: (value: string) => T[K]
) => {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const rawValue = event.target.value;
		const parsedValue: T[K] = transform ? transform(rawValue) : (rawValue as unknown as T[K]);

        setter((prev) => ({
            ...prev,
            [field]: parsedValue,
        }));
    };
};

export interface SelectOption {
    id: string;
    value: string;
}

const getSelectData = <T extends Record<string, unknown>>(
    data: T[], 
    key: keyof T
): SelectOption[] => {
    return data.map((item, idx) => ({
        id: String(idx),
        value: String(item[key]),
    }));
};

export {
	formChangeHandler,
	getSelectData
}