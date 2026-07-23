import{u as d,j as r,H as p,L as c}from"./app-CqLSscV2.js";import{I as f}from"./input-BEn-JTHk.js";import{G as b}from"./GuestLayout-t4YQVW8g.js";import{M as m}from"./mail-D283xxHT.js";import{A as x}from"./arrow-left-dEIT74Qv.js";import"./utils-DclmTqRz.js";import"./Logo-k3EUTwkL.js";import"./createLucideIcon-CFAhK7kz.js";function g({status:o}){const{data:i,setData:n,post:s,processing:a,errors:e}=d({email:""}),l=t=>{t.preventDefault(),s(route("password.email"))};return r.jsxs(r.Fragment,{children:[r.jsx(p,{title:"Forgot Password"}),r.jsx("div",{className:"forgot-card",children:r.jsxs("div",{className:"card-content",children:[r.jsxs("div",{className:"forgot-header",children:[r.jsx("h1",{className:"forgot-title",children:"Forgot password?"}),r.jsx("p",{className:"forgot-subtitle",children:"Enter your email and we'll send you a password reset link."})]}),o&&r.jsx("div",{className:"status-banner",children:o}),r.jsxs("form",{onSubmit:l,className:"forgot-form",children:[r.jsxs("div",{className:"form-group",children:[r.jsx("label",{htmlFor:"email",className:"form-label",children:"Email address"}),r.jsxs("div",{className:"input-wrapper",children:[r.jsx("div",{className:"input-icon",children:r.jsx(m,{size:16})}),r.jsx(f,{id:"email",type:"email",autoComplete:"email",autoFocus:!0,value:i.email,onChange:t=>n("email",t.target.value),placeholder:"you@company.com",className:"forgot-input",style:e.email?{borderColor:"#ef4444",boxShadow:"0 0 0 1px #ef4444"}:{}})]}),e.email&&r.jsx("p",{className:"error-text",children:e.email})]}),r.jsx("button",{type:"submit",disabled:a,className:"submit-btn",children:a?r.jsxs(r.Fragment,{children:[r.jsx("span",{className:"btn-spinner"}),"Sending link…"]}):"Send reset link"})]}),r.jsx("div",{className:"card-footer",children:r.jsxs(c,{href:route("login"),className:"back-link",children:[r.jsx(x,{size:14})," Back to Sign in"]})})]})}),r.jsx("style",{children:`
        /* Glassmorphic card styling - Light Mode */
        .forgot-card {
          width: 100%;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 20px;
          padding: 36px 32px;
          box-shadow: 
            0 20px 40px -15px rgb(var(--brand-600) / 0.08),
            0 2px 10px rgba(0, 0, 0, 0.02);
        }

        .forgot-header {
          margin-bottom: 24px;
        }
        .forgot-title {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: #0f172a;
          margin-bottom: 5px;
          line-height: 1.2;
        }
        .forgot-subtitle {
          font-size: 13px;
          color: #64748b;
          font-weight: 400;
          line-height: 1.4;
        }

        .status-banner {
          margin-bottom: 20px;
          font-size: 12.5px;
          color: #15803d;
          background: #f0fdf4;
          border-radius: 10px;
          padding: 10px 14px;
          border: 1px solid #bbf7d0;
        }

        .forgot-form {
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
        .forgot-input {
          height: 44px !important;
          padding-left: 42px !important;
          font-size: 13.5px !important;
          color: #0f172a !important;
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 10px !important;
          transition: all 0.2s ease !important;
        }
        .forgot-input::placeholder {
          color: #cbd5e1;
        }
        .forgot-input:hover {
          border-color: #cbd5e1 !important;
        }
        .forgot-input:focus {
          border-color: rgb(var(--brand-600)) !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 3px rgb(var(--brand-600) / 0.12) !important;
        }
        .input-wrapper:focus-within .input-icon {
          color: rgb(var(--brand-600));
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

        .card-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 13px;
        }
        .back-link {
          color: rgb(var(--brand-600));
          font-weight: 600;
          text-decoration: none;
          transition: color 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .back-link:hover {
          color: rgb(var(--brand-700));
        }
      `})]})}g.layout=o=>r.jsx(b,{children:o});export{g as default};
