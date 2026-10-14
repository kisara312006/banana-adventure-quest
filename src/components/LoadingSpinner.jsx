export default function LoadingSpinner({ text = 'Loading…' }) {
  return <div className="center"><div className="spinner" /><p className="muted">{text}</p></div>;
}
