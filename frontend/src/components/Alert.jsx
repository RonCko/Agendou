export default function Alert({ type = 'info', message, onClose }) {
  const styles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200'
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  return (
    <div className={`border rounded-lg p-4 mb-4 ${styles[type]} flex items-center justify-between`}>
      <div className="flex items-center space-x-2">
        <span className="text-xl">{icons[type]}</span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-xl hover:opacity-70">
          ×
        </button>
      )}
    </div>
  );
}
