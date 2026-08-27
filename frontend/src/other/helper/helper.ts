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

// 🌟 CORRECTION 1 : Gère parfaitement le format DRF ("00:30:00", "1 02:30:00", "00:30:00.123")
const parseDurationToMs = (durationStr: string | number | null) => {
	if (durationStr === null || durationStr === undefined || durationStr === '') {
	console.warn('[QUIZ DEBUG] parseDurationToMs: durationStr is empty/null ->', durationStr);
	return 0;
  }

  // 🌟 CORRECTION 4 : Gère le format "300.0" (nombre pur = SECONDES).
  // C'est le format renvoyé par votre API pour quiz_duree (ex: "300.0", "45", "90.5").
  // On teste AVANT le format HH:MM:SS car il n'y a pas de ":" dans ce cas.
	const asString = String(durationStr);
	if (!asString.includes(':')) {
		const asNumber = parseFloat(asString);
	if (!isNaN(asNumber)) {
	  const result = asNumber * 1000; // secondes -> ms
	  console.log('[QUIZ DEBUG] parseDurationToMs OK (format numérique = secondes):', {
				input: durationStr,
		secondes: asNumber,
		resultMs: result,
		resultMinutes: result / 60000,
	  });
	  return result;
	}
	// Ni un nombre, ni un format HH:MM:SS -> vraiment inconnu
	console.error('[QUIZ DEBUG] parseDurationToMs: FORMAT NON RECONNU (pas de ":" et pas un nombre), retourne 0 !', {
	  input: durationStr,
	});
	return 0;
  }

  // Format DRF classique "HH:MM:SS" ou "D HH:MM:SS"
  let days = 0;
  let timeStr = durationStr;

	if (asString.includes(' ')) {
		const parts = asString.split(' ');
		days = parseInt(parts[0], 10) || 0;
		timeStr = parts[1];
  }
	const timeParts = timeStr.split(':');
  if (timeParts.length >= 3) {
	const hours = parseInt(timeParts[0], 10) || 0;
	const minutes = parseInt(timeParts[1], 10) || 0;
	const seconds = parseFloat(timeParts[2]) || 0;
	const result = (days * 86400 + hours * 3600 + minutes * 60 + seconds) * 1000;
	console.log('[QUIZ DEBUG] parseDurationToMs OK (format HH:MM:SS):', {
	  input: durationStr,
	  days,
	  hours,
	  minutes,
	  seconds,
	  resultMs: result,
	  resultMinutes: result / 60000,
	});
	return result;
  }

  // 🌟 DEBUG: si on arrive ici, le format n'a pas été reconnu -> durée = 0 -> quiz expire instantanément
  console.error('[QUIZ DEBUG] parseDurationToMs: FORMAT NON RECONNU, retourne 0 !', {
	input: durationStr,
	timeStr,
	timeParts,
  });
  return 0; // Si le format est inconnu
};

const formatTime = (ms: number) => {
  if (ms <= 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};


export {
	formChangeHandler,
	getSelectData,
	formatDate,
	formatTime,
	parseDurationToMs
}