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

// Accept unknown or T[keyof T] | undefined
function formatDate(value?: unknown): string {
	if (typeof value !== 'string' || !value) {
		return '-'; // Fallback for null, undefined, or empty values
	}

	const date = new Date(value);
	if (isNaN(date.getTime())) return '-';

	return new Intl.DateTimeFormat('en-GB', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		// second: '2-digit',
		hourCycle: 'h23',
		timeZone: 'UTC'
	})
	.format(date)
	.replace(',', '');
}

export {
	formChangeHandler,
	getSelectData,
	formatDate
}