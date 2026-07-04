import{u as a,j as e,H as s,L as d}from"./app-B7CeO2f5.js";import{G as l}from"./GuestLayout-1pr5cYFo.js";import"./Logo-DSnbKl97.js";import"./utils-DclmTqRz.js";function c({status:r}){const{post:i,processing:t}=a({}),o=n=>{n.preventDefault(),i(route("verification.send"))};return e.jsxs(e.Fragment,{children:[e.jsx(s,{title:"Email Verification"}),e.jsx("div",{className:"forgot-card",children:e.jsxs("div",{className:"card-content",children:[e.jsxs("div",{className:"forgot-header",children:[e.jsx("h1",{className:"forgot-title",children:"Verify your email"}),e.jsx("p",{className:"forgot-subtitle",children:"Thanks for signing up! Please verify your email by clicking on the link we sent you."})]}),r==="verification-link-sent"&&e.jsx("div",{className:"status-banner",children:"A new verification link has been sent to your email address."}),e.jsx("form",{onSubmit:o,className:"forgot-form",children:e.jsx("button",{type:"submit",disabled:t,className:"submit-btn",children:t?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"btn-spinner"}),"Resending…"]}):"Resend verification email"})}),e.jsx("div",{className:"card-footer",children:e.jsx(d,{href:route("logout"),method:"post",as:"button",className:"back-link",style:{background:"none",border:"none",cursor:"pointer",padding:0},children:"Log Out"})})]})}),e.jsx("style",{children:`
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

        .card-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 13px;
        }
        .back-link {
          color: #7c3aed;
          font-weight: 600;
          text-decoration: underline;
          transition: color 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .back-link:hover {
          color: #6d28d9;
        }
      `})]})}c.layout=r=>e.jsx(l,{children:r});export{c as default};
