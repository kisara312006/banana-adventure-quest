// Session-control settings (milliseconds). Lower them temporarily to test.
export const IDLE_MS = 15 * 60 * 1000;          // auto logout after 15 min with no activity
export const WARN_MS = 60 * 1000;               // show "still there?" warning for the last 60 s
export const MAX_SESSION_MS = 8 * 60 * 60 * 1000; // force a fresh login after 8 hours
