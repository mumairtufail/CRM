import{u as f,j as r,H as x}from"./app-CDsWcrES.js";import{I as i}from"./input-BT29vA5p.js";import{G as b}from"./GuestLayout-Cqpu-Xwn.js";import{M as u}from"./mail-ClApkwE7.js";import{L as l}from"./lock-rnraq3pv.js";import"./utils-DclmTqRz.js";import"./Logo-CtRxUjaS.js";import"./createLucideIcon-7QJpDi3r.js";function g({token:a,email:p}){const{data:s,setData:t,post:d,processing:n,errors:o,reset:c}=f({token:a,email:p,password:"",password_confirmation:""}),m=e=>{e.preventDefault(),d(route("password.store"),{onFinish:()=>c("password","password_confirmation")})};return r.jsxs(r.Fragment,{children:[r.jsx(x,{title:"Reset Password"}),r.jsx("div",{className:"forgot-card",children:r.jsxs("div",{className:"card-content",children:[r.jsxs("div",{className:"forgot-header",children:[r.jsx("h1",{className:"forgot-title",children:"Reset password"}),r.jsx("p",{className:"forgot-subtitle",children:"Please enter your email and choose a secure new password."})]}),r.jsxs("form",{onSubmit:m,className:"forgot-form",children:[r.jsxs("div",{className:"form-group",children:[r.jsx("label",{htmlFor:"email",className:"form-label",children:"Email address"}),r.jsxs("div",{className:"input-wrapper",children:[r.jsx("div",{className:"input-icon",children:r.jsx(u,{size:16})}),r.jsx(i,{id:"email",type:"email",autoComplete:"username",value:s.email,onChange:e=>t("email",e.target.value),className:"forgot-input",style:o.email?{borderColor:"#ef4444",boxShadow:"0 0 0 1px #ef4444"}:{}})]}),o.email&&r.jsx("p",{className:"error-text",children:o.email})]}),r.jsxs("div",{className:"form-group",children:[r.jsx("label",{htmlFor:"password",className:"form-label",children:"New password"}),r.jsxs("div",{className:"input-wrapper",children:[r.jsx("div",{className:"input-icon",children:r.jsx(l,{size:16})}),r.jsx(i,{id:"password",type:"password",autoComplete:"new-password",autoFocus:!0,value:s.password,onChange:e=>t("password",e.target.value),placeholder:"••••••••",className:"forgot-input",style:o.password?{borderColor:"#ef4444",boxShadow:"0 0 0 1px #ef4444"}:{}})]}),o.password&&r.jsx("p",{className:"error-text",children:o.password})]}),r.jsxs("div",{className:"form-group",children:[r.jsx("label",{htmlFor:"password_confirmation",className:"form-label",children:"Confirm new password"}),r.jsxs("div",{className:"input-wrapper",children:[r.jsx("div",{className:"input-icon",children:r.jsx(l,{size:16})}),r.jsx(i,{id:"password_confirmation",type:"password",autoComplete:"new-password",value:s.password_confirmation,onChange:e=>t("password_confirmation",e.target.value),placeholder:"••••••••",className:"forgot-input",style:o.password_confirmation?{borderColor:"#ef4444",boxShadow:"0 0 0 1px #ef4444"}:{}})]}),o.password_confirmation&&r.jsx("p",{className:"error-text",children:o.password_confirmation})]}),r.jsx("button",{type:"submit",disabled:n,className:"submit-btn",children:n?r.jsxs(r.Fragment,{children:[r.jsx("span",{className:"btn-spinner"}),"Resetting…"]}):"Reset password"})]})]})}),r.jsx("style",{children:`
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
      `})]})}g.layout=a=>r.jsx(b,{children:a});export{g as default};
