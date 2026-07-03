import{u as y,b as f,j as e,H as j,L as k,a as v}from"./app-Cq6jhjRy.js";import{G as w}from"./GuestLayout-CgyEvtKC.js";import{t as s}from"./index-BZBoSyjH.js";import"./Logo-D_AaRgzY.js";import"./utils-DclmTqRz.js";function N({status:i}){const{data:n,setData:p,post:x,processing:a,errors:d}=y({code:""}),[c,l]=f.useState(!1),[b,u]=f.useState(""),g=r=>{if(r.preventDefault(),!n.code||n.code.length!==6||isNaN(n.code)){s.error("Please enter a valid 6-digit code.");return}x("/register/verify",{onSuccess:()=>{s.success("Email verified successfully! Logging you in...")},onError:t=>{const o=Object.values(t)[0]||"Verification failed.";s.error(o)}})},m=async()=>{var r,t;l(!0);try{const o=await v.post("/register/resend-code");u("code-resent"),s.success(o.data.message||"Verification code resent successfully!")}catch(o){const h=((t=(r=o.response)==null?void 0:r.data)==null?void 0:t.message)||"Failed to resend code.";s.error(h)}finally{l(!1)}};return e.jsxs(e.Fragment,{children:[e.jsx(j,{title:"Verify Email Code"}),e.jsx("div",{className:"forgot-card",children:e.jsxs("div",{className:"card-content",children:[e.jsxs("div",{className:"forgot-header",children:[e.jsx("h1",{className:"forgot-title",children:"Verify your email"}),e.jsx("p",{className:"forgot-subtitle",children:"We sent a 6-digit verification code to your email. Enter it below to verify your account."})]}),(i==="code-resent"||b==="code-resent")&&e.jsx("div",{className:"status-banner",children:"A new 6-digit verification code has been sent."}),e.jsxs("form",{onSubmit:g,className:"forgot-form",children:[e.jsxs("div",{children:[e.jsx("input",{type:"text",value:n.code,onChange:r=>{const t=r.target.value.trim().substring(0,6);(!t||/^\d+$/.test(t))&&p("code",t)},maxLength:6,placeholder:"123456",className:"code-input",required:!0,autoFocus:!0}),d.code&&e.jsx("p",{className:"error-text",children:d.code})]}),e.jsx("button",{type:"submit",disabled:a,className:"submit-btn",children:a?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"btn-spinner"}),"Verifying…"]}):"Verify Code"})]}),e.jsxs("div",{className:"card-footer",children:[e.jsx("button",{onClick:m,disabled:c,className:"resend-link",children:c?"Resending...":"Resend Code"}),e.jsx(k,{href:"/",className:"back-link-home",children:"Back to Home"})]})]})}),e.jsx("style",{children:`
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

        .code-input {
          width: 100%;
          height: 48px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          outline: none;
          text-align: center;
          font-size: 20px;
          font-weight: 750;
          letter-spacing: 6px;
          color: #1e293b;
          background: #ffffff;
          transition: all 0.2s ease;
        }

        .code-input:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
        }

        .error-text {
          font-size: 11.5px;
          color: #ef4444;
          margin-top: 5px;
          text-align: left;
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
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 24px;
          font-size: 12.5px;
        }
        .resend-link {
          color: #7c3aed;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
        }
        .resend-link:hover {
          color: #6d28d9;
        }
        .back-link-home {
          color: #64748b;
          text-decoration: none;
        }
        .back-link-home:hover {
          color: #334155;
          text-decoration: underline;
        }
      `})]})}N.layout=i=>e.jsx(w,{children:i});export{N as default};
