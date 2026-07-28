import { initializePaddle } from '@paddle/paddle-js';

let paddleInstance = null;
let paddlePromise = null;

/**
 * Lazily initializes the Paddle.js singleton and reuses it across calls.
 * `environment` and `clientToken` must come from the server (Inertia props,
 * see the `paddle` shared prop) — never hard-code them, and never read the
 * server-side PADDLE_API_KEY here.
 */
export function getPaddle({ environment, clientToken }) {
    if (!environment || !clientToken) {
        return Promise.reject(new Error('Paddle is not configured — missing environment or client token.'));
    }
    if (paddleInstance) {
        return Promise.resolve(paddleInstance);
    }
    if (!paddlePromise) {
        paddlePromise = initializePaddle({ environment, token: clientToken }).then((paddle) => {
            paddleInstance = paddle;
            return paddle;
        });
    }
    return paddlePromise;
}
