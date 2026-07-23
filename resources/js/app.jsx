import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Component } from 'react';
import { reportError } from './lib/reportError';

const appName = import.meta.env.VITE_APP_NAME || 'LumeniaCRM';

// Catch anything that escapes React's render tree (async callbacks, timers,
// event handlers not wrapped by an error boundary) so it still ends up in
// the same /admin/error-log as render-time crashes and backend exceptions.
window.addEventListener('error', (event) => {
    reportError({
        message: event.message,
        file: event.filename,
        line: event.lineno,
        stack: event.error?.stack,
    });
});

window.addEventListener('unhandledrejection', (event) => {
    reportError({
        message: event.reason?.message ?? String(event.reason ?? 'Unhandled promise rejection'),
        stack: event.reason?.stack,
    });
});

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        reportError({
            message: error?.message ?? 'React render error',
            stack: error?.stack,
            context: { componentStack: info?.componentStack },
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', height: '100vh', gap: '16px',
                    background: 'rgb(var(--brand-tint))',
                }}>
                    <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                        Something went wrong loading this page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '8px 20px', borderRadius: '10px',
                            background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))',
                            color: 'white', fontSize: '13px', fontWeight: 600,
                            cursor: 'pointer', border: 'none',
                        }}
                    >
                        Reload page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ErrorBoundary>
                <App {...props} />
            </ErrorBoundary>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
