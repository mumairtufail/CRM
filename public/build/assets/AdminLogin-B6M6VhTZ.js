import{b as x,u as b,j as e,H as g}from"./app-BBJOi8UI.js";import{I as l}from"./input-B7YjEwsz.js";import{L as f}from"./Logo-jxNXjSW-.js";import{M as u}from"./mail-C7T-Z_Z-.js";import{L as h}from"./lock-DL5VwNhq.js";import{E as w}from"./eye-off-Cd7ournU.js";import{E as j}from"./eye-Blmm-3yt.js";import{S as v}from"./shield-DH0qvat8.js";import"./utils-DclmTqRz.js";import"./createLucideIcon-X3MqDx9N.js";function M({status:a}){const[i,d]=x.useState(!1),{data:t,setData:s,post:p,processing:n,errors:o,reset:c}=b({email:"",password:"",remember:!1}),m=r=>{r.preventDefault(),p(route("admin.login.store"),{onFinish:()=>c("password")})};return e.jsxs(e.Fragment,{children:[e.jsx(g,{title:"Platform Admin Sign In"}),e.jsx("div",{className:"login-root",children:e.jsx("div",{className:"login-card",children:e.jsxs("div",{className:"card-content",children:[e.jsxs("div",{className:"login-brand",children:[e.jsx(f,{size:28,showText:!0,text:"LumeniaCRM",textColor:"text-slate-900",textClassName:"text-[17px] font-bold"}),e.jsx("span",{className:"admin-badge",children:"Admin"})]}),e.jsxs("div",{className:"login-header",children:[e.jsx("h1",{className:"login-title",children:"Admin sign in"}),e.jsx("p",{className:"login-subtitle",children:"Restricted to platform administrators"})]}),a&&e.jsx("div",{className:"status-banner",children:a}),e.jsxs("form",{onSubmit:m,className:"login-form",children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{htmlFor:"email",className:"form-label",children:"Email address"}),e.jsxs("div",{className:"input-wrapper",children:[e.jsx("div",{className:"input-icon",children:e.jsx(u,{size:16})}),e.jsx(l,{id:"email",type:"email",autoComplete:"email",autoFocus:!0,value:t.email,onChange:r=>s("email",r.target.value),placeholder:"admin@platform.com",className:"login-input",style:o.email?{borderColor:"#ef4444",boxShadow:"0 0 0 1px #ef4444"}:{}})]}),o.email&&e.jsx("p",{className:"error-text",children:o.email})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{htmlFor:"password",className:"form-label",children:"Password"}),e.jsxs("div",{className:"input-wrapper",children:[e.jsx("div",{className:"input-icon",children:e.jsx(h,{size:16})}),e.jsx(l,{id:"password",type:i?"text":"password",autoComplete:"current-password",value:t.password,onChange:r=>s("password",r.target.value),placeholder:"••••••••",className:"login-input pr-10",style:o.password?{borderColor:"#ef4444",boxShadow:"0 0 0 1px #ef4444"}:{}}),e.jsx("button",{type:"button",tabIndex:-1,onClick:()=>d(r=>!r),className:"password-toggle",children:i?e.jsx(w,{size:16}):e.jsx(j,{size:16})})]}),o.password&&e.jsx("p",{className:"error-text",children:o.password})]}),e.jsx("button",{type:"submit",disabled:n,className:"submit-btn",children:n?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"btn-spinner"}),"Signing in…"]}):e.jsxs(e.Fragment,{children:[e.jsx(v,{size:15}),"Sign in to portal"]})})]})]})})}),e.jsx("style",{children:`
        .login-root {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 24px;
          background: rgb(var(--brand-tint));
          position: relative;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        /* Glassmorphic card styling - Light Mode */
        .login-card {
          width: 100%;
          max-width: 400px;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 20px;
          padding: 40px 36px;
          box-shadow: 
            0 20px 40px -15px rgb(var(--brand-600) / 0.08),
            0 2px 10px rgba(0, 0, 0, 0.02);
          position: relative;
          z-index: 10;
          overflow: hidden;
        }

        .login-brand {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
        }

        .admin-badge {
          font-size: 11px;
          font-weight: 700;
          color: rgb(var(--brand-600));
          background: rgb(var(--brand-600) / 0.1);
          padding: 3px 8px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .login-header {
          margin-bottom: 28px;
        }
        .login-title {
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.6px;
          color: #0f172a;
          margin-bottom: 5px;
          line-height: 1.2;
        }
        .login-subtitle {
          font-size: 13.5px;
          color: #64748b;
          font-weight: 400;
        }

        .status-banner {
          margin-bottom: 20px;
          font-size: 13px;
          color: #065f46;
          background: #ecfdf5;
          border-radius: 10px;
          padding: 10px 14px;
          border: 1px solid #a7f3d0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 12.5px;
          font-weight: 600;
          color: #374151;
          letter-spacing: -0.1px;
        }

        /* Input styling */
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          pointer-events: none;
          transition: color 0.2s ease;
        }
        .login-input {
          height: 44px !important;
          padding-left: 42px !important;
          font-size: 13.5px !important;
          color: #0f172a !important;
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 10px !important;
          transition: all 0.2s ease !important;
        }
        .login-input::placeholder {
          color: #cbd5e1;
        }
        .login-input:hover {
          border-color: #cbd5e1 !important;
        }
        .login-input:focus {
          border-color: rgb(var(--brand-600)) !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 3px rgb(var(--brand-600) / 0.12) !important;
        }
        .input-wrapper:focus-within .input-icon {
          color: rgb(var(--brand-600));
        }

        .password-toggle {
          position: absolute;
          right: 14px;
          color: #94a3b8;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          transition: color 0.15s ease;
        }
        .password-toggle:hover {
          color: #475569;
        }

        .error-text {
          color: #ef4444;
          font-size: 11.5px;
          margin-top: 4px;
          font-weight: 500;
        }

        /* Gradient submit button */
        .submit-btn {
          height: 44px;
          border-radius: 10px;
          border: none;
          color: #ffffff;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: -0.2px;
          background: linear-gradient(135deg, rgb(var(--brand-600)) 0%, rgb(var(--brand2-600)) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgb(var(--brand-600) / 0.18);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .submit-btn:not(:disabled):hover {
          background: linear-gradient(135deg, rgb(var(--brand-500)) 0%, #5b52f9 100%);
          box-shadow: 0 6px 16px rgb(var(--brand-600) / 0.25);
          transform: translateY(-1px);
        }
        .submit-btn:not(:disabled):active {
          transform: translateY(1px);
        }
        .submit-btn:disabled {
          background: #e2e8f0;
          color: #94a3b8;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.25);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .login-card {
            padding: 32px 24px;
            border-radius: 16px;
          }
          .login-title {
            font-size: 21px;
          }
        }
      `})]})}export{M as default};
