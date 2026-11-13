// Remembers a one-time message (e.g. "signed out because inactive") to show on the Login page.
const KEY = 'baq_notice';
export const setNotice = (text) => { try { sessionStorage.setItem(KEY, text); } catch { /* ignore */ } };
export const peekNotice = () => { try { return sessionStorage.getItem(KEY) || ''; } catch { return ''; } };
export const clearNotice = () => { try { sessionStorage.removeItem(KEY); } catch { /* ignore */ } };
