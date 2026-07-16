import{b as p,u as y,j as e,H as z,L as C}from"./app-BNd-thlb.js";import{I as w}from"./input-DExsmGaA.js";import{L as F}from"./Logo-BQonXgPq.js";import{U as L}from"./user-CefIx5Nw.js";import{B}from"./building-D7XwZoiJ.js";import{G as E}from"./globe-CRxC_1Az.js";import{A as I}from"./arrow-right-Bb5rsrJv.js";import"./utils-DclmTqRz.js";import"./createLucideIcon-5Nt6p9ZK.js";const S=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;function c(s,a){switch(s){case"workspace":return a.workspace.trim()?"":"Workspace name is required.";case"slug":return a.slug?S.test(a.slug)?"":"Use lowercase letters, numbers and hyphens only.":"";default:return""}}function U(){return e.jsx("span",{style:{color:"#ef4444",marginLeft:2},children:"*"})}function $({name:s,email:a,avatar:d,appDomain:n}){const[g,x]=p.useState({}),{data:i,setData:m,post:v,processing:u,errors:l}=y({workspace:"",slug:""}),o=p.useCallback(r=>l[r]?l[r]:g[r]?c(r,i):"",[l,g,i]),f=p.useCallback(r=>{x(t=>t[r]?t:{...t,[r]:!0})},[]),j=r=>{var b,h;r.preventDefault();const t=c("workspace",i),k=c("slug",i);if(x(N=>({...N,workspace:!0,slug:!0})),t||k){t?(b=document.getElementById("workspace"))==null||b.focus():(h=document.getElementById("slug"))==null||h.focus();return}v(route("register.google.workspace"))};return e.jsxs(e.Fragment,{children:[e.jsx(z,{title:"Almost there"}),e.jsx("div",{className:"login-root",children:e.jsx("div",{className:"login-card",children:e.jsxs("div",{className:"card-content",children:[e.jsx("div",{className:"login-brand",children:e.jsx(F,{size:28,showText:!0,text:"LumeniaCRM",textColor:"text-slate-900",textClassName:"text-[17px] font-bold"})}),e.jsxs("div",{className:"login-header",children:[e.jsx("h1",{className:"login-title",children:"Almost there"}),e.jsx("p",{className:"login-subtitle",children:"Just name your workspace to finish signing in"})]}),e.jsxs("div",{className:"google-preview",children:[d?e.jsx("img",{src:d,alt:"",className:"google-preview-avatar"}):e.jsx("div",{className:"google-preview-avatar google-preview-avatar-fallback",children:e.jsx(L,{size:16})}),e.jsxs("div",{className:"google-preview-text",children:[e.jsx("div",{className:"google-preview-name",children:s}),e.jsx("div",{className:"google-preview-email",children:a})]}),e.jsx(C,{href:route("login"),className:"google-preview-not-you",children:"Not you?"})]}),e.jsxs("form",{onSubmit:j,noValidate:!0,children:[e.jsxs("div",{className:"form-grid",children:[e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{htmlFor:"workspace",className:"form-label",children:["Workspace name",e.jsx(U,{})]}),e.jsxs("div",{className:"input-wrapper",children:[e.jsx("div",{className:"input-icon",children:e.jsx(B,{size:16})}),e.jsx(w,{id:"workspace",autoFocus:!0,value:i.workspace,onChange:r=>m("workspace",r.target.value),onBlur:()=>f("workspace"),placeholder:"Acme Inc.","aria-invalid":!!o("workspace"),className:"login-input",style:o("workspace")?{borderColor:"#ef4444",boxShadow:"0 0 0 1px #ef4444"}:{}})]}),o("workspace")&&e.jsx("p",{className:"error-text",children:o("workspace")})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{htmlFor:"slug",className:"form-label",children:["Workspace URL ",e.jsx("span",{className:"label-optional",children:"(optional)"})]}),e.jsxs("div",{className:"input-wrapper",children:[e.jsx("div",{className:"input-icon",children:e.jsx(E,{size:16})}),e.jsx(w,{id:"slug",value:i.slug,onChange:r=>m("slug",r.target.value.toLowerCase().replace(/\s+/g,"-")),onBlur:()=>f("slug"),placeholder:"acme","aria-invalid":!!o("slug"),className:`login-input ${n?"pr-24":""}`,style:o("slug")?{borderColor:"#ef4444",boxShadow:"0 0 0 1px #ef4444"}:{}}),n&&e.jsxs("span",{className:"domain-suffix",children:[".",n]})]}),o("slug")?e.jsx("p",{className:"error-text",children:o("slug")}):e.jsx("p",{className:"input-hint",children:"Used in public link. Leaves blank to auto-generate."})]})]}),e.jsx("button",{type:"submit",disabled:u,className:"submit-btn",style:{marginTop:12},children:u?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"btn-spinner"}),"Creating…"]}):e.jsxs(e.Fragment,{children:["Continue",e.jsx(I,{size:16})]})})]})]})})}),e.jsx("style",{children:`
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

        .login-card {
          width: 100%;
          max-width: 460px;
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
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .login-header {
          margin-bottom: 20px;
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

        .google-preview {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          margin-bottom: 24px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }
        .google-preview-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          flex-shrink: 0;
          object-fit: cover;
        }
        .google-preview-avatar-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e2e8f0;
          color: #64748b;
        }
        .google-preview-text {
          flex: 1;
          min-width: 0;
        }
        .google-preview-name {
          font-size: 13.5px;
          font-weight: 600;
          color: #0f172a;
          line-height: 1.3;
        }
        .google-preview-email {
          font-size: 12px;
          color: #64748b;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .google-preview-not-you {
          font-size: 12px;
          font-weight: 600;
          color: rgb(var(--brand-600));
          text-decoration: none;
          flex-shrink: 0;
        }
        .google-preview-not-you:hover {
          color: rgb(var(--brand-700));
        }

        .form-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
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

        .submit-btn {
          height: 44px;
          width: 100%;
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
      `})]})}export{$ as default};
