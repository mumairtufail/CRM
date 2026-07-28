import{b as l,u as U,a as G,j as e,H as T,L as Y}from"./app-bAM33uIj.js";import{I as m}from"./input-DQT5PkBa.js";import{L as $}from"./Logo-BOhmcb63.js";import{A as q}from"./index-CwtNYJYv.js";import{m as S}from"./proxy-BWUEfjVo.js";import{B as D}from"./building-oVXjgJOO.js";import{G as W}from"./globe-BBiVemem.js";import{A as H}from"./arrow-right-DYthznQG.js";import{U as O}from"./user-DvV7pllW.js";import{M as J}from"./mail-D4tW-ji2.js";import{L as E}from"./lock-Bclkbwf6.js";import{E as V}from"./eye-off-B54cSY3y.js";import{E as K}from"./eye-DUXe41mq.js";import{C as N}from"./check-D-YMuUTy.js";import{A as Q}from"./arrow-left-DXmUlSWX.js";import"./utils-DclmTqRz.js";import"./createLucideIcon-H9A179zY.js";const X=/^[^\s@]+@[^\s@]+\.[^\s@]+$/,Z=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;function h(x,r){switch(x){case"workspace":return r.workspace.trim()?"":"Workspace name is required.";case"slug":return r.slug?Z.test(r.slug)?"":"Use lowercase letters, numbers and hyphens only.":"";case"name":return r.name.trim()?"":"Your name is required.";case"email":return r.email.trim()?X.test(r.email)?"":"Enter a valid email address.":"Email address is required.";case"password":return r.password?r.password.length>=8?"":"Must be at least 8 characters.":"Password is required.";case"password_confirmation":return r.password_confirmation?r.password_confirmation===r.password?"":"Passwords do not match.":"Please confirm your password.";default:return""}}function f(){return e.jsx("span",{style:{color:"#ef4444",marginLeft:2},children:"*"})}function be({appDomain:x,draft:r}){const[w,F]=l.useState(!1),[k,b]=l.useState({}),[u,j]=l.useState(r&&(r.name||r.email)?2:1),{data:a,setData:p,post:L,processing:C,errors:v,reset:I}=U({workspace:(r==null?void 0:r.workspace)||"",slug:(r==null?void 0:r.slug)||"",name:(r==null?void 0:r.name)||"",email:(r==null?void 0:r.email)||"",password:"",password_confirmation:""}),z=l.useRef(a);z.current=a;const y=l.useCallback(s=>{const i={};s.forEach(n=>{i[n]=z.current[n]}),G.post(route("register.draft"),i).catch(()=>{})},[]),o=l.useCallback(s=>v[s]?v[s]:k[s]?h(s,a):"",[v,k,a]),c=l.useCallback(s=>{b(i=>i[s]?i:{...i,[s]:!0}),s!=="password"&&s!=="password_confirmation"&&y([s])},[y]),B=s=>{var g,t;s.preventDefault();const i=h("workspace",a),n=h("slug",a);if(b(d=>({...d,workspace:!0,slug:!0})),i||n){i?(g=document.getElementById("workspace"))==null||g.focus():(t=document.getElementById("slug"))==null||t.focus();return}y(["workspace","slug"]),j(2)},A=s=>{s.preventDefault(),j(1)},P=s=>{var g;s.preventDefault();const i=["name","email","password","password_confirmation"],n=i.find(t=>h(t,a));if(b(t=>{const d={...t};return i.forEach(M=>{d[M]=!0}),d}),n){(g=document.getElementById(n))==null||g.focus();return}L(route("register"),{onSuccess:()=>I("password","password_confirmation"),onError:t=>{(t.workspace||t.slug)&&(b(d=>({...d,workspace:!0,slug:!0})),j(1))}})},_=a.password.length>=8,R=a.password_confirmation&&a.password_confirmation===a.password;return e.jsxs(e.Fragment,{children:[e.jsx(T,{title:"Create your workspace"}),e.jsx("div",{className:"login-root",children:e.jsx("div",{className:"login-card",children:e.jsxs("div",{className:"card-content",children:[e.jsx("div",{className:"login-brand",children:e.jsx($,{size:28,showText:!0,text:"LumeniaCRM",textColor:"text-slate-900",textClassName:"text-[17px] font-bold"})}),e.jsxs("div",{className:"login-header",children:[e.jsx("h1",{className:"login-title",children:"Create workspace"}),e.jsx("p",{className:"login-subtitle",children:"Set up your sales dashboard in seconds"})]}),e.jsxs("div",{className:"progress-container",children:[e.jsx("div",{className:"progress-bar",children:e.jsx("div",{className:"progress-fill",style:{width:u===1?"50%":"100%"}})}),e.jsxs("div",{className:"progress-steps",children:[e.jsx("span",{className:`progress-step-text ${u===1?"active":""}`,children:"1. Company"}),e.jsx("span",{className:`progress-step-text ${u===2?"active":""}`,children:"2. Account"})]})]}),e.jsx("form",{onSubmit:u===1?B:P,noValidate:!0,children:e.jsx(q,{mode:"wait",children:u===1?e.jsxs(S.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},exit:{opacity:0,y:-10},transition:{duration:.15},className:"step-section",children:[e.jsxs("div",{className:"form-grid",children:[e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{htmlFor:"workspace",className:"form-label",children:["Workspace name",e.jsx(f,{})]}),e.jsxs("div",{className:"input-wrapper",children:[e.jsx("div",{className:"input-icon",children:e.jsx(D,{size:16})}),e.jsx(m,{id:"workspace",autoFocus:!0,value:a.workspace,onChange:s=>p("workspace",s.target.value),onBlur:()=>c("workspace"),placeholder:"Acme Inc.","aria-invalid":!!o("workspace"),className:"login-input",style:o("workspace")?{borderColor:"#ef4444",boxShadow:"0 0 0 1px #ef4444"}:{}})]}),o("workspace")&&e.jsx("p",{className:"error-text",children:o("workspace")})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{htmlFor:"slug",className:"form-label",children:["Workspace URL ",e.jsx("span",{className:"label-optional",children:"(optional)"})]}),e.jsxs("div",{className:"input-wrapper",children:[e.jsx("div",{className:"input-icon",children:e.jsx(W,{size:16})}),e.jsx(m,{id:"slug",value:a.slug,onChange:s=>p("slug",s.target.value.toLowerCase().replace(/\s+/g,"-")),onBlur:()=>c("slug"),placeholder:"acme","aria-invalid":!!o("slug"),className:`login-input ${x?"pr-24":""}`,style:o("slug")?{borderColor:"#ef4444",boxShadow:"0 0 0 1px #ef4444"}:{}}),x&&e.jsxs("span",{className:"domain-suffix",children:[".",x]})]}),o("slug")?e.jsx("p",{className:"error-text",children:o("slug")}):e.jsx("p",{className:"input-hint",children:"Used in public link. Leaves blank to auto-generate."})]})]}),e.jsxs("button",{type:"submit",className:"submit-btn",style:{marginTop:12},children:["Continue",e.jsx(H,{size:16})]})]},"step1"):e.jsxs(S.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},exit:{opacity:0,y:-10},transition:{duration:.15},className:"step-section",children:[e.jsxs("div",{className:"form-grid",children:[e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{htmlFor:"name",className:"form-label",children:["Your name",e.jsx(f,{})]}),e.jsxs("div",{className:"input-wrapper",children:[e.jsx("div",{className:"input-icon",children:e.jsx(O,{size:16})}),e.jsx(m,{id:"name",autoComplete:"name",autoFocus:!0,value:a.name,onChange:s=>p("name",s.target.value),onBlur:()=>c("name"),placeholder:"Jane Doe","aria-invalid":!!o("name"),className:"login-input",style:o("name")?{borderColor:"#ef4444",boxShadow:"0 0 0 1px #ef4444"}:{}})]}),o("name")&&e.jsx("p",{className:"error-text",children:o("name")})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{htmlFor:"email",className:"form-label",children:["Email address",e.jsx(f,{})]}),e.jsxs("div",{className:"input-wrapper",children:[e.jsx("div",{className:"input-icon",children:e.jsx(J,{size:16})}),e.jsx(m,{id:"email",type:"email",autoComplete:"username",value:a.email,onChange:s=>p("email",s.target.value),onBlur:()=>c("email"),placeholder:"you@company.com","aria-invalid":!!o("email"),className:"login-input",style:o("email")?{borderColor:"#ef4444",boxShadow:"0 0 0 1px #ef4444"}:{}})]}),o("email")&&e.jsx("p",{className:"error-text",children:o("email")})]})]}),e.jsxs("div",{className:"form-grid",children:[e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{htmlFor:"password",className:"form-label",children:["Password",e.jsx(f,{})]}),e.jsxs("div",{className:"input-wrapper",children:[e.jsx("div",{className:"input-icon",children:e.jsx(E,{size:16})}),e.jsx(m,{id:"password",type:w?"text":"password",autoComplete:"new-password",value:a.password,onChange:s=>p("password",s.target.value),onBlur:()=>c("password"),placeholder:"••••••••","aria-invalid":!!o("password"),className:"login-input pr-10",style:o("password")?{borderColor:"#ef4444",boxShadow:"0 0 0 1px #ef4444"}:{}}),e.jsx("button",{type:"button",tabIndex:-1,onClick:()=>F(s=>!s),className:"password-toggle",children:w?e.jsx(V,{size:16}):e.jsx(K,{size:16})})]}),o("password")?e.jsx("p",{className:"error-text",children:o("password")}):e.jsxs("p",{className:"input-hint",style:{color:_?"#10b981":"#94a3b8",display:"flex",alignItems:"center",gap:4},children:[_&&e.jsx(N,{size:12})," At least 8 characters"]})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{htmlFor:"password_confirmation",className:"form-label",children:["Confirm password",e.jsx(f,{})]}),e.jsxs("div",{className:"input-wrapper",children:[e.jsx("div",{className:"input-icon",children:e.jsx(E,{size:16})}),e.jsx(m,{id:"password_confirmation",type:w?"text":"password",autoComplete:"new-password",value:a.password_confirmation,onChange:s=>p("password_confirmation",s.target.value),onBlur:()=>c("password_confirmation"),placeholder:"••••••••","aria-invalid":!!o("password_confirmation"),className:"login-input pr-10",style:o("password_confirmation")?{borderColor:"#ef4444",boxShadow:"0 0 0 1px #ef4444"}:{}}),R&&e.jsx(N,{size:16,className:"text-emerald-500",style:{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)"}})]}),o("password_confirmation")&&e.jsx("p",{className:"error-text",children:o("password_confirmation")})]})]}),e.jsxs("div",{className:"actions-row",children:[e.jsxs("button",{type:"button",onClick:A,className:"back-btn",children:[e.jsx(Q,{size:16}),"Back"]}),e.jsx("button",{type:"submit",disabled:C,className:"submit-btn flex-1",children:C?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"btn-spinner"}),"Creating…"]}):e.jsxs(e.Fragment,{children:["Register",e.jsx(N,{size:16})]})})]})]},"step2")})}),e.jsx("div",{className:"card-footer",children:e.jsxs("p",{children:["Already have an account?"," ",e.jsx(Y,{href:route("login"),className:"signup-link",children:"Sign in"})]})})]})})}),e.jsx("style",{children:`
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
      `})]})}export{be as default};
