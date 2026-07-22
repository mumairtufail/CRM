import{b as x,u as P,j as e,H as M,L as R}from"./app-CktuaLF1.js";import{I as p}from"./input-DrKlkpVY.js";import{L as U}from"./Logo-D8cMYrNW.js";import{A as G}from"./index-DOhtepEQ.js";import{m as C}from"./proxy-grmRBzgD.js";import{B as T}from"./building-z5sMwSjg.js";import{G as Y}from"./globe-DmhF0nXE.js";import{A as $}from"./arrow-right-BOWCpPS0.js";import{U as q}from"./user-BNjckHgx.js";import{M as W}from"./mail-DBn5hHfC.js";import{L as z}from"./lock-DgduwI-M.js";import{E as D}from"./eye-off-DU9vM-8g.js";import{E as H}from"./eye-DdP66YaF.js";import{C as j}from"./check-DFKU4qSJ.js";import{A as O}from"./arrow-left-CvNXzJB5.js";import"./utils-DclmTqRz.js";import"./createLucideIcon-DxwTv3nJ.js";const J=/^[^\s@]+@[^\s@]+\.[^\s@]+$/,V=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;function b(c,a){switch(c){case"workspace":return a.workspace.trim()?"":"Workspace name is required.";case"slug":return a.slug?V.test(a.slug)?"":"Use lowercase letters, numbers and hyphens only.":"";case"name":return a.name.trim()?"":"Your name is required.";case"email":return a.email.trim()?J.test(a.email)?"":"Enter a valid email address.":"Email address is required.";case"password":return a.password?a.password.length>=8?"":"Must be at least 8 characters.":"Password is required.";case"password_confirmation":return a.password_confirmation?a.password_confirmation===a.password?"":"Passwords do not match.":"Please confirm your password.";default:return""}}function u(){return e.jsx("span",{style:{color:"#ef4444",marginLeft:2},children:"*"})}function xe({appDomain:c}){const[a,_]=x.useState(!1),[v,h]=x.useState({}),[d,y]=x.useState(1),{data:o,setData:i,post:S,processing:N,errors:w,reset:E}=P({workspace:"",slug:"",name:"",email:"",password:"",password_confirmation:""}),r=x.useCallback(s=>w[s]?w[s]:v[s]?b(s,o):"",[w,v,o]),n=x.useCallback(s=>{h(t=>t[s]?t:{...t,[s]:!0})},[]),F=s=>{var m,l;s.preventDefault();const t=b("workspace",o),f=b("slug",o);if(h(g=>({...g,workspace:!0,slug:!0})),t||f){t?(m=document.getElementById("workspace"))==null||m.focus():(l=document.getElementById("slug"))==null||l.focus();return}y(2)},L=s=>{s.preventDefault(),y(1)},I=s=>{var m;s.preventDefault();const t=["name","email","password","password_confirmation"],f=t.find(l=>b(l,o));if(h(l=>{const g={...l};return t.forEach(A=>{g[A]=!0}),g}),f){(m=document.getElementById(f))==null||m.focus();return}S(route("register"),{onFinish:()=>E("password","password_confirmation")})},k=o.password.length>=8,B=o.password_confirmation&&o.password_confirmation===o.password;return e.jsxs(e.Fragment,{children:[e.jsx(M,{title:"Create your workspace"}),e.jsx("div",{className:"login-root",children:e.jsx("div",{className:"login-card",children:e.jsxs("div",{className:"card-content",children:[e.jsx("div",{className:"login-brand",children:e.jsx(U,{size:28,showText:!0,text:"LumeniaCRM",textColor:"text-slate-900",textClassName:"text-[17px] font-bold"})}),e.jsxs("div",{className:"login-header",children:[e.jsx("h1",{className:"login-title",children:"Create workspace"}),e.jsx("p",{className:"login-subtitle",children:"Set up your sales dashboard in seconds"})]}),e.jsxs("div",{className:"progress-container",children:[e.jsx("div",{className:"progress-bar",children:e.jsx("div",{className:"progress-fill",style:{width:d===1?"50%":"100%"}})}),e.jsxs("div",{className:"progress-steps",children:[e.jsx("span",{className:`progress-step-text ${d===1?"active":""}`,children:"1. Company"}),e.jsx("span",{className:`progress-step-text ${d===2?"active":""}`,children:"2. Account"})]})]}),e.jsx("form",{onSubmit:d===1?F:I,noValidate:!0,children:e.jsx(G,{mode:"wait",children:d===1?e.jsxs(C.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},exit:{opacity:0,y:-10},transition:{duration:.15},className:"step-section",children:[e.jsxs("div",{className:"form-grid",children:[e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{htmlFor:"workspace",className:"form-label",children:["Workspace name",e.jsx(u,{})]}),e.jsxs("div",{className:"input-wrapper",children:[e.jsx("div",{className:"input-icon",children:e.jsx(T,{size:16})}),e.jsx(p,{id:"workspace",autoFocus:!0,value:o.workspace,onChange:s=>i("workspace",s.target.value),onBlur:()=>n("workspace"),placeholder:"Acme Inc.","aria-invalid":!!r("workspace"),className:"login-input",style:r("workspace")?{borderColor:"#ef4444",boxShadow:"0 0 0 1px #ef4444"}:{}})]}),r("workspace")&&e.jsx("p",{className:"error-text",children:r("workspace")})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{htmlFor:"slug",className:"form-label",children:["Workspace URL ",e.jsx("span",{className:"label-optional",children:"(optional)"})]}),e.jsxs("div",{className:"input-wrapper",children:[e.jsx("div",{className:"input-icon",children:e.jsx(Y,{size:16})}),e.jsx(p,{id:"slug",value:o.slug,onChange:s=>i("slug",s.target.value.toLowerCase().replace(/\s+/g,"-")),onBlur:()=>n("slug"),placeholder:"acme","aria-invalid":!!r("slug"),className:`login-input ${c?"pr-24":""}`,style:r("slug")?{borderColor:"#ef4444",boxShadow:"0 0 0 1px #ef4444"}:{}}),c&&e.jsxs("span",{className:"domain-suffix",children:[".",c]})]}),r("slug")?e.jsx("p",{className:"error-text",children:r("slug")}):e.jsx("p",{className:"input-hint",children:"Used in public link. Leaves blank to auto-generate."})]})]}),e.jsxs("button",{type:"submit",className:"submit-btn",style:{marginTop:12},children:["Continue",e.jsx($,{size:16})]})]},"step1"):e.jsxs(C.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},exit:{opacity:0,y:-10},transition:{duration:.15},className:"step-section",children:[e.jsxs("div",{className:"form-grid",children:[e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{htmlFor:"name",className:"form-label",children:["Your name",e.jsx(u,{})]}),e.jsxs("div",{className:"input-wrapper",children:[e.jsx("div",{className:"input-icon",children:e.jsx(q,{size:16})}),e.jsx(p,{id:"name",autoComplete:"name",autoFocus:!0,value:o.name,onChange:s=>i("name",s.target.value),onBlur:()=>n("name"),placeholder:"Jane Doe","aria-invalid":!!r("name"),className:"login-input",style:r("name")?{borderColor:"#ef4444",boxShadow:"0 0 0 1px #ef4444"}:{}})]}),r("name")&&e.jsx("p",{className:"error-text",children:r("name")})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{htmlFor:"email",className:"form-label",children:["Email address",e.jsx(u,{})]}),e.jsxs("div",{className:"input-wrapper",children:[e.jsx("div",{className:"input-icon",children:e.jsx(W,{size:16})}),e.jsx(p,{id:"email",type:"email",autoComplete:"username",value:o.email,onChange:s=>i("email",s.target.value),onBlur:()=>n("email"),placeholder:"you@company.com","aria-invalid":!!r("email"),className:"login-input",style:r("email")?{borderColor:"#ef4444",boxShadow:"0 0 0 1px #ef4444"}:{}})]}),r("email")&&e.jsx("p",{className:"error-text",children:r("email")})]})]}),e.jsxs("div",{className:"form-grid",children:[e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{htmlFor:"password",className:"form-label",children:["Password",e.jsx(u,{})]}),e.jsxs("div",{className:"input-wrapper",children:[e.jsx("div",{className:"input-icon",children:e.jsx(z,{size:16})}),e.jsx(p,{id:"password",type:a?"text":"password",autoComplete:"new-password",value:o.password,onChange:s=>i("password",s.target.value),onBlur:()=>n("password"),placeholder:"••••••••","aria-invalid":!!r("password"),className:"login-input pr-10",style:r("password")?{borderColor:"#ef4444",boxShadow:"0 0 0 1px #ef4444"}:{}}),e.jsx("button",{type:"button",tabIndex:-1,onClick:()=>_(s=>!s),className:"password-toggle",children:a?e.jsx(D,{size:16}):e.jsx(H,{size:16})})]}),r("password")?e.jsx("p",{className:"error-text",children:r("password")}):e.jsxs("p",{className:"input-hint",style:{color:k?"#10b981":"#94a3b8",display:"flex",alignItems:"center",gap:4},children:[k&&e.jsx(j,{size:12})," At least 8 characters"]})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{htmlFor:"password_confirmation",className:"form-label",children:["Confirm password",e.jsx(u,{})]}),e.jsxs("div",{className:"input-wrapper",children:[e.jsx("div",{className:"input-icon",children:e.jsx(z,{size:16})}),e.jsx(p,{id:"password_confirmation",type:a?"text":"password",autoComplete:"new-password",value:o.password_confirmation,onChange:s=>i("password_confirmation",s.target.value),onBlur:()=>n("password_confirmation"),placeholder:"••••••••","aria-invalid":!!r("password_confirmation"),className:"login-input pr-10",style:r("password_confirmation")?{borderColor:"#ef4444",boxShadow:"0 0 0 1px #ef4444"}:{}}),B&&e.jsx(j,{size:16,className:"text-emerald-500",style:{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)"}})]}),r("password_confirmation")&&e.jsx("p",{className:"error-text",children:r("password_confirmation")})]})]}),e.jsxs("div",{className:"actions-row",children:[e.jsxs("button",{type:"button",onClick:L,className:"back-btn",children:[e.jsx(O,{size:16}),"Back"]}),e.jsx("button",{type:"submit",disabled:N,className:"submit-btn flex-1",children:N?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"btn-spinner"}),"Creating…"]}):e.jsxs(e.Fragment,{children:["Register",e.jsx(j,{size:16})]})})]})]},"step2")})}),e.jsx("div",{className:"card-footer",children:e.jsxs("p",{children:["Already have an account?"," ",e.jsx(R,{href:route("login"),className:"signup-link",children:"Sign in"})]})})]})})}),e.jsx("style",{children:`
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
          max-width: 540px; /* Wider card to fit two columns comfortably */
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 
            0 20px 40px -15px rgb(var(--brand-600) / 0.08),
            0 2px 10px rgba(0, 0, 0, 0.02);
          position: relative;
          z-index: 10;
          overflow: hidden;
          transition: max-width 0.3s ease;
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .login-header {
          margin-bottom: 24px;
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

        /* Progress Steps Indicator */
        .progress-container {
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .progress-bar {
          height: 4px;
          width: 100%;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 2px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, rgb(var(--brand-600)) 0%, rgb(var(--brand2-600)) 100%);
          transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .progress-steps {
          display: flex;
          justify-content: space-between;
        }
        .progress-step-text {
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: color 0.3s ease;
        }
        .progress-step-text.active {
          color: rgb(var(--brand-600));
        }

        .step-section {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        /* Form Grid (Two Columns) */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0; /* Prevents flex/grid blowouts */
        }

        .form-label {
          font-size: 12.5px;
          font-weight: 600;
          color: #374151;
          letter-spacing: -0.1px;
        }
        .label-optional {
          color: #94a3b8;
          font-weight: 400;
          font-size: 11.5px;
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
          width: 100% !important;
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

        .domain-suffix {
          position: absolute;
          right: 14px;
          color: #64748b;
          font-size: 13.5px;
          pointer-events: none;
          font-weight: 500;
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

        .input-hint {
          color: #64748b;
          font-size: 11px;
          margin-top: 4px;
          line-height: 1.4;
        }

        .actions-row {
          display: flex;
          gap: 12px;
          margin-top: 10px;
        }

        .back-btn {
          height: 44px;
          padding: 0 18px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          font-weight: 600;
          font-size: 13.5px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .back-btn:hover {
          background: #f8fafc;
          color: #0f172a;
          border-color: #cbd5e1;
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
          color: #64748b;
          border-top: 1px solid #f1f5f9;
          padding-top: 18px;
        }
        .signup-link {
          color: rgb(var(--brand-600));
          font-weight: 600;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .signup-link:hover {
          color: rgb(var(--brand-700));
        }

        @media (max-width: 600px) {
          .login-card {
            padding: 32px 20px;
            border-radius: 16px;
            max-width: 100%;
          }
          .form-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .login-title {
            font-size: 21px;
          }
        }
      `})]})}export{xe as default};
