import{u as E,b as s,j as e,H as C,L as z,a as V}from"./app-BNEKhtTn.js";import{G as L}from"./GuestLayout-Dy76Bysg.js";import{t as n}from"./index-PdAjNEVj.js";import"./Logo-aGU3We8x.js";import"./utils-DclmTqRz.js";function R({status:p}){const{data:d,setData:h,post:y,processing:l,errors:f,reset:v}=E({code:""}),[x,b]=s.useState(!1),[c,u]=s.useState(90),[i,g]=s.useState(60),[a,m]=s.useState(!1);s.useEffect(()=>{if(c<=0){m(!0);return}const t=setInterval(()=>{u(r=>r-1)},1e3);return()=>clearInterval(t)},[c]),s.useEffect(()=>{if(i<=0)return;const t=setInterval(()=>{g(r=>r-1)},1e3);return()=>clearInterval(t)},[i]);const j=t=>{if(t.preventDefault(),a){n.error("This code has expired. Please request a new code.");return}if(!d.code||d.code.length!==6||isNaN(d.code)){n.error("Please enter a valid 6-digit code.");return}y("/register/verify",{onSuccess:()=>{n.success("Email verified successfully! Logging you in...")},onError:r=>{const o=Object.values(r)[0]||"Verification failed.";n.error(o)}})},k=async()=>{var t,r;if(!(i>0)){b(!0);try{const o=await V.post("/register/resend-code");u(90),g(60),m(!1),v("code"),n.success(o.data.message||"Verification code resent successfully!")}catch(o){const N=((r=(t=o.response)==null?void 0:t.data)==null?void 0:r.message)||"Failed to resend code.";n.error(N)}finally{b(!1)}}},w=t=>{const r=Math.floor(t/60),o=t%60;return`${r}:${o<10?"0":""}${o}`};return e.jsxs(e.Fragment,{children:[e.jsx(C,{title:"Verify Email Code"}),e.jsx("div",{className:"forgot-card",children:e.jsxs("div",{className:"card-content",children:[e.jsxs("div",{className:"forgot-header",children:[e.jsx("h1",{className:"forgot-title",children:"Verify your email"}),e.jsx("p",{className:"forgot-subtitle",children:"We sent a 6-digit verification code to your email. Enter it below to verify your account."})]}),e.jsxs("form",{onSubmit:j,className:"forgot-form",children:[e.jsxs("div",{children:[e.jsx("input",{type:"text",value:d.code,onChange:t=>{const r=t.target.value.trim().substring(0,6);(!r||/^\d+$/.test(r))&&h("code",r)},maxLength:6,placeholder:"123456",className:`code-input ${a?"expired-input":""}`,required:!0,autoFocus:!0,disabled:a||l}),e.jsx("div",{className:"timer-container",children:a?e.jsx("span",{className:"expiry-text expired",children:"Code has expired. Please resend."}):e.jsxs("span",{className:`expiry-text ${c<=15?"warning":""}`,children:["Expires in: ",w(c)]})}),f.code&&e.jsx("p",{className:"error-text",children:f.code})]}),e.jsx("button",{type:"submit",disabled:l||a,className:"submit-btn",children:l?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"btn-spinner"}),"Verifying…"]}):"Verify Code"})]}),e.jsxs("div",{className:"card-footer",children:[i>0?e.jsxs("span",{className:"resend-disabled",children:["Resend Code in ",i,"s"]}):e.jsx("button",{onClick:k,disabled:x,className:"resend-link",children:x?"Resending...":"Resend Code"}),e.jsx(z,{href:"/",className:"back-link-home",children:"Back to Home"})]})]})}),e.jsx("style",{children:`
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
          border-color: rgb(var(--brand-600));
          box-shadow: 0 0 0 3px rgb(var(--brand-600) / 0.15);
        }

        .expired-input {
          background-color: #f8fafc;
          border-color: #e2e8f0;
          color: #94a3b8;
          text-decoration: line-through;
        }

        .timer-container {
          margin-top: 8px;
          text-align: right;
        }

        .expiry-text {
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
        }

        .expiry-text.warning {
          color: #ea580c;
          animation: pulse 1s infinite alternate;
        }

        .expiry-text.expired {
          color: #ef4444;
        }

        @keyframes pulse {
          from { opacity: 0.6; }
          to { opacity: 1; }
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
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 24px;
          font-size: 12.5px;
        }

        .resend-disabled {
          color: #94a3b8;
          font-weight: 500;
          cursor: not-allowed;
        }

        .resend-link {
          color: rgb(var(--brand-600));
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
        }
        .resend-link:hover {
          color: rgb(var(--brand-700));
        }
        .back-link-home {
          color: #64748b;
          text-decoration: none;
        }
        .back-link-home:hover {
          color: #334155;
          text-decoration: underline;
        }
      `})]})}R.layout=p=>e.jsx(L,{children:p});export{R as default};
