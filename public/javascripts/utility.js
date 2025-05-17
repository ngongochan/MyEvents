export function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatTime(timeString) {
  const [h, m] = timeString.split(':');
  const d = new Date();
  d.setHours(+h, +m);
  return d.toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit'
  });
}
