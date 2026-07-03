import{u as l,j as o,H as d}from"./app--gmQ17hX.js";import{I as f}from"./input-C7dQHxRk.js";import{G as c}from"./GuestLayout-ntVc-sI4.js";import{L as x}from"./lock-C-u19Cd8.js";import"./utils-DclmTqRz.js";import"./Logo-D6ZUlzqq.js";import"./createLucideIcon-C2RBdSJy.js";function m(){const{data:r,setData:i,post:a,processing:s,errors:t,reset:n}=l({password:""}),p=e=>{e.preventDefault(),a(route("password.confirm"),{onFinish:()=>n("password")})};return o.jsxs(o.Fragment,{children:[o.jsx(d,{title:"Confirm Password"}),o.jsx("div",{className:"forgot-card",children:o.jsxs("div",{className:"card-content",children:[o.jsxs("div",{className:"forgot-header",children:[o.jsx("h1",{className:"forgot-title",children:"Confirm password"}),o.jsx("p",{className:"forgot-subtitle",children:"This is a secure area. Please confirm your password before continuing."})]}),o.jsxs("form",{onSubmit:p,className:"forgot-form",children:[o.jsxs("div",{className:"form-group",children:[o.jsx("label",{htmlFor:"password",className:"form-label",children:"Password"}),o.jsxs("div",{className:"input-wrapper",children:[o.jsx("div",{className:"input-icon",children:o.jsx(x,{size:16})}),o.jsx(f,{id:"password",type:"password",autoFocus:!0,value:r.password,onChange:e=>i("password",e.target.value),placeholder:"••••••••",className:"forgot-input",style:t.password?{borderColor:"#ef4444",boxShadow:"0 0 0 1px #ef4444"}:{}})]}),t.password&&o.jsx("p",{className:"error-text",children:t.password})]}),o.jsx("button",{type:"submit",disabled:s,className:"submit-btn",children:s?o.jsxs(o.Fragment,{children:[o.jsx("span",{className:"btn-spinner"}),"Confirming…"]}):"Confirm password"})]})]})}),o.jsx("style",{children:`
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
            0 20px 40px -15px rgba(124, 58, 237, 0.08),
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
          border-color: #7c3aed !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12) !important;
        }
        .input-wrapper:focus-within .input-icon {
          color: #7c3aed;
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
          background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.18);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .submit-btn:not(:disabled):hover {
          background: linear-gradient(135deg, #8b5cf6 0%, #5b52f9 100%);
          box-shadow: 0 6px 16px rgba(124, 58, 237, 0.25);
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
      `})]})}m.layout=r=>o.jsx(c,{children:r});export{m as default};
