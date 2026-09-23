const toastListeners = [];
const confirmListeners = [];

export function onToast(fn) {
  toastListeners.push(fn);
  return () => {
    const i = toastListeners.indexOf(fn);
    if (i > -1) toastListeners.splice(i, 1);
  };
}

export function onConfirm(fn) {
  confirmListeners.push(fn);
  return () => {
    const i = confirmListeners.indexOf(fn);
    if (i > -1) confirmListeners.splice(i, 1);
  };
}

export function notify({ type = 'info', message = '' } = {}) {
  const payload = { id: Date.now() + Math.random(), type, message };
  toastListeners.forEach((fn) => fn(payload));
}

export function confirm(message) {
  return new Promise((resolve) => {
    const payload = { message, resolve };
    // notify all listeners (there will usually be one provider)
    confirmListeners.forEach((fn) => fn(payload));
  });
}

export default { onToast, onConfirm, notify, confirm };
