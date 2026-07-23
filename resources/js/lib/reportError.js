// Fire-and-forget error reporting to the backend so a superadmin can review
// what broke (and for whom) after the fact, from /admin/error-log. Never
// throws — a failure here must not compound whatever already went wrong.
export function reportError({ message, file, line, stack, context } = {}) {
  if (!message) return

  try {
    fetch('/errors/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]')?.content ?? '',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        message: String(message).slice(0, 1000),
        file,
        line,
        stack: stack ? String(stack).slice(0, 20000) : undefined,
        url: window.location.href,
        context,
      }),
      keepalive: true,
    }).catch(() => {})
  } catch {}
}
