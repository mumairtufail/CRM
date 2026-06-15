import{a as x,u as m,j as e,H as f,L as b}from"./app-CXZmrqsk.js";import{I as l}from"./input-D7hyg-q7.js";import{L as h}from"./Logo-BZZolyAg.js";import{E as u}from"./eye-off-Dw6c1YXM.js";import{E as y}from"./eye-DvS3ZHRD.js";import"./utils-DPfHYXv4.js";function F({status:s}){const[r,d]=x.useState(!1),{data:a,setData:n,post:p,processing:i,errors:t,reset:c}=m({email:"",password:"",remember:!1}),g=o=>{o.preventDefault(),p(route("login"),{onFinish:()=>c("password")})};return e.jsxs(e.Fragment,{children:[e.jsx(f,{title:"Sign in"}),e.jsx("div",{className:"login-root",children:e.jsxs("div",{className:"login-card",children:[e.jsxs("div",{className:"login-brand",children:[e.jsx(h,{size:40,showText:!1}),e.jsx("span",{className:"login-brand-name",children:"CRM"})]}),e.jsx("h1",{className:"login-title",children:"Welcome back"}),e.jsx("p",{className:"login-subtitle",children:"Sign in to your workspace"}),s&&e.jsx("div",{style:{marginBottom:20,fontSize:13,color:"#065f46",background:"#ecfdf5",borderRadius:8,padding:"10px 14px",border:"1px solid #a7f3d0"},children:s}),e.jsxs("form",{onSubmit:g,style:{display:"flex",flexDirection:"column",gap:18},children:[e.jsxs("div",{children:[e.jsx("label",{htmlFor:"email",style:{display:"block",fontSize:12.5,fontWeight:600,color:"#374151",marginBottom:6,letterSpacing:"-0.1px"},children:"Email address"}),e.jsx(l,{id:"email",type:"email",autoComplete:"email",autoFocus:!0,value:a.email,onChange:o=>n("email",o.target.value),placeholder:"you@company.com",className:"h-11 text-[13.5px] bg-white border-slate-200",style:t.email?{borderColor:"#f87171"}:{}}),t.email&&e.jsx("p",{style:{color:"#ef4444",fontSize:11.5,marginTop:5},children:t.email})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"password",style:{display:"block",fontSize:12.5,fontWeight:600,color:"#374151",marginBottom:6,letterSpacing:"-0.1px"},children:"Password"}),e.jsxs("div",{style:{position:"relative"},children:[e.jsx(l,{id:"password",type:r?"text":"password",autoComplete:"current-password",value:a.password,onChange:o=>n("password",o.target.value),placeholder:"••••••••",className:"h-11 text-[13.5px] pr-10 bg-white border-slate-200",style:t.password?{borderColor:"#f87171"}:{}}),e.jsx("button",{type:"button",tabIndex:-1,onClick:()=>d(o=>!o),style:{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:"#94a3b8",background:"none",border:"none",cursor:"pointer",padding:0,display:"flex",alignItems:"center"},children:r?e.jsx(u,{size:15}):e.jsx(y,{size:15})})]}),t.password&&e.jsx("p",{style:{color:"#ef4444",fontSize:11.5,marginTop:5},children:t.password})]}),e.jsx("button",{type:"submit",disabled:i,className:"login-btn",style:{marginTop:6,background:i?"rgba(15,23,42,0.45)":"#0f172a",cursor:i?"not-allowed":"pointer"},children:i?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"login-spinner"}),"Signing in…"]}):"Sign in"})]}),e.jsxs("p",{style:{textAlign:"center",fontSize:13,color:"#94a3b8",marginTop:22},children:["Don't have an account?"," ",e.jsx(b,{href:route("register"),style:{color:"#0f172a",fontWeight:600},children:"Create workspace"})]})]})}),e.jsx("style",{children:`
        .login-root {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 24px;
          background: #F4F2FF;
          font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
        }

        /* Single centered card */
        .login-card {
          width: 100%;
          max-width: 400px;
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 18px;
          padding: 40px 36px;
          box-shadow: 0 20px 60px rgba(79,70,229,0.10), 0 2px 8px rgba(0,0,0,0.04);
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
        }
        .login-brand-name {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.4px;
          color: #0f172a;
        }

        .login-title {
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.8px;
          color: #0f172a;
          margin-bottom: 5px;
        }
        .login-subtitle {
          font-size: 13.5px;
          color: #94a3b8;
          margin-bottom: 30px;
        }

        /* Submit button */
        .login-btn {
          height: 44px;
          border-radius: 9px;
          border: none;
          color: white;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: -0.2px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.15s ease, opacity 0.15s ease;
        }
        .login-btn:not(:disabled):hover {
          background: #1e293b !important;
        }

        /* Spinner */
        .login-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
          flex-shrink: 0;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .login-card { padding: 32px 24px; }
        }
      `})]})}export{F as default};
