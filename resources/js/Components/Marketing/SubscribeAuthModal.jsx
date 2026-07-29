import { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { toast } from 'sonner';

function firstError(errors, field) {
    const value = errors?.[field];
    return Array.isArray(value) ? value[0] : value;
}

/**
 * Login/register (with the mandatory 6-digit email code step) entirely inside
 * a modal, so a Subscribe click on the pricing section never leaves the page.
 * Talks to the same /login, /register, /register/verify, /register/resend-code
 * endpoints the full-page auth flow uses — Accept: application/json makes
 * those controllers return JSON instead of redirecting (see
 * AuthenticatedSessionController::store / RegisteredUserController).
 */
export default function SubscribeAuthModal({ open, onClose, onAuthenticated }) {
    const [view, setView] = useState('login'); // 'login' | 'register' | 'verify'
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [workspace, setWorkspace] = useState('');
    const [name, setName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regPasswordConfirmation, setRegPasswordConfirmation] = useState('');

    const [code, setCode] = useState('');
    const [expiryTime, setExpiryTime] = useState(90);
    const [resendCooldown, setResendCooldown] = useState(60);
    const [resending, setResending] = useState(false);

    useEffect(() => {
        if (open) return;
        setView('login');
        setErrors({});
        setEmail(''); setPassword('');
        setWorkspace(''); setName(''); setRegEmail(''); setRegPassword(''); setRegPasswordConfirmation('');
        setCode(''); setExpiryTime(90); setResendCooldown(60);
    }, [open]);

    useEffect(() => {
        if (view !== 'verify' || expiryTime <= 0) return;
        const t = setInterval(() => setExpiryTime((s) => s - 1), 1000);
        return () => clearInterval(t);
    }, [view, expiryTime]);

    useEffect(() => {
        if (view !== 'verify' || resendCooldown <= 0) return;
        const t = setInterval(() => setResendCooldown((s) => s - 1), 1000);
        return () => clearInterval(t);
    }, [view, resendCooldown]);

    const jsonHeaders = { headers: { Accept: 'application/json' } };

    const submitLogin = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        try {
            await axios.post('/login', { email, password }, jsonHeaders);
            onAuthenticated();
        } catch (err) {
            setErrors(err.response?.data?.errors || { email: 'Those credentials don’t match an account.' });
        } finally {
            setProcessing(false);
        }
    };

    const submitRegister = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        try {
            await axios.post('/register', {
                workspace,
                name,
                email: regEmail,
                password: regPassword,
                password_confirmation: regPasswordConfirmation,
            }, jsonHeaders);
            setView('verify');
            setExpiryTime(90);
            setResendCooldown(60);
        } catch (err) {
            setErrors(err.response?.data?.errors || {});
        } finally {
            setProcessing(false);
        }
    };

    const submitVerify = async (e) => {
        e.preventDefault();
        if (expiryTime <= 0) {
            toast.error('This code has expired. Please request a new one.');
            return;
        }
        setProcessing(true);
        setErrors({});
        try {
            await axios.post('/register/verify', { code }, jsonHeaders);
            onAuthenticated();
        } catch (err) {
            setErrors(err.response?.data?.errors || { code: 'The verification code is invalid or has expired.' });
        } finally {
            setProcessing(false);
        }
    };

    const resend = async () => {
        if (resendCooldown > 0) return;
        setResending(true);
        try {
            const res = await axios.post('/register/resend-code');
            setExpiryTime(90);
            setResendCooldown(60);
            setCode('');
            toast.success(res.data?.message || 'Verification code resent.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to resend code.');
        } finally {
            setResending(false);
        }
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="max-w-sm">
                {view === 'login' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Sign in to subscribe</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitLogin} className="space-y-3 mt-1">
                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email</Label>
                                <Input type="email" autoFocus required value={email}
                                       onChange={(e) => setEmail(e.target.value)} className="h-9 text-[13px]" />
                                {firstError(errors, 'email') && <p className="text-[11.5px] text-red-500">{firstError(errors, 'email')}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Password</Label>
                                <Input type="password" required value={password}
                                       onChange={(e) => setPassword(e.target.value)} className="h-9 text-[13px]" />
                                {firstError(errors, 'password') && <p className="text-[11.5px] text-red-500">{firstError(errors, 'password')}</p>}
                            </div>
                            <Button type="submit" disabled={processing} className="w-full h-9 text-[13px] mt-1">
                                {processing ? 'Signing in…' : 'Sign in & continue'}
                            </Button>
                            <p className="text-[12px] text-slate-500 text-center pt-1">
                                New here?{' '}
                                <button type="button" onClick={() => { setView('register'); setErrors({}); }}
                                        className="text-brand-600 font-medium hover:underline">
                                    Create a free workspace
                                </button>
                            </p>
                        </form>
                    </>
                )}

                {view === 'register' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Create your workspace</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitRegister} className="space-y-3 mt-1">
                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Workspace name</Label>
                                <Input autoFocus required value={workspace}
                                       onChange={(e) => setWorkspace(e.target.value)} className="h-9 text-[13px]" placeholder="Acme Inc" />
                                {firstError(errors, 'workspace') && <p className="text-[11.5px] text-red-500">{firstError(errors, 'workspace')}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Your name</Label>
                                <Input required value={name} onChange={(e) => setName(e.target.value)} className="h-9 text-[13px]" />
                                {firstError(errors, 'name') && <p className="text-[11.5px] text-red-500">{firstError(errors, 'name')}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email</Label>
                                <Input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="h-9 text-[13px]" />
                                {firstError(errors, 'email') && <p className="text-[11.5px] text-red-500">{firstError(errors, 'email')}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Password</Label>
                                <Input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="h-9 text-[13px]" />
                                {firstError(errors, 'password') && <p className="text-[11.5px] text-red-500">{firstError(errors, 'password')}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Confirm password</Label>
                                <Input type="password" required value={regPasswordConfirmation} onChange={(e) => setRegPasswordConfirmation(e.target.value)} className="h-9 text-[13px]" />
                            </div>
                            <Button type="submit" disabled={processing} className="w-full h-9 text-[13px] mt-1">
                                {processing ? 'Creating…' : 'Create workspace & continue'}
                            </Button>
                            <p className="text-[12px] text-slate-500 text-center pt-1">
                                Already have a workspace?{' '}
                                <button type="button" onClick={() => { setView('login'); setErrors({}); }}
                                        className="text-brand-600 font-medium hover:underline">
                                    Sign in
                                </button>
                            </p>
                        </form>
                    </>
                )}

                {view === 'verify' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Verify your email</DialogTitle>
                        </DialogHeader>
                        <p className="text-[12.5px] text-slate-500 -mt-1">
                            We sent a 6-digit code to {regEmail}. Enter it below to continue.
                        </p>
                        <form onSubmit={submitVerify} className="space-y-3 mt-1">
                            <div>
                                <Input
                                    value={code}
                                    onChange={(e) => {
                                        const val = e.target.value.trim().slice(0, 6);
                                        if (!val || /^\d+$/.test(val)) setCode(val);
                                    }}
                                    maxLength={6}
                                    autoFocus
                                    disabled={expiryTime <= 0 || processing}
                                    placeholder="123456"
                                    className="h-11 text-center text-lg font-bold tracking-[6px]"
                                />
                                <p className="text-[11px] text-slate-400 text-right mt-1">
                                    {expiryTime > 0 ? `Expires in ${formatTime(expiryTime)}` : 'Code expired — request a new one'}
                                </p>
                                {firstError(errors, 'code') && <p className="text-[11.5px] text-red-500">{firstError(errors, 'code')}</p>}
                            </div>
                            <Button type="submit" disabled={processing || expiryTime <= 0 || code.length !== 6} className="w-full h-9 text-[13px]">
                                {processing ? 'Verifying…' : 'Verify & continue'}
                            </Button>
                            <div className="text-center pt-1">
                                {resendCooldown > 0 ? (
                                    <span className="text-[12px] text-slate-400">Resend code in {resendCooldown}s</span>
                                ) : (
                                    <button type="button" onClick={resend} disabled={resending}
                                            className="text-[12px] text-brand-600 font-medium hover:underline">
                                        {resending ? 'Resending…' : 'Resend code'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
