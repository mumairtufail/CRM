import{j as e,a as m,u as f,H as h}from"./app-CdLOXKBT.js";import{I as d}from"./input-CbLmi3qu.js";import{a as p}from"./createLucideIcon-Cbbp00oe.js";import{E as b}from"./eye-off-CkwUc--v.js";import{E as u}from"./eye-CV0JQvfm.js";function j({size:s=32,className:t="",radius:r=8}){const i=`crmGrad-${s}-${r}`;return e.jsxs("svg",{width:s,height:s,viewBox:"0 0 32 32",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:t,"aria-hidden":"true",children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:i,x1:"0",y1:"0",x2:"32",y2:"32",gradientUnits:"userSpaceOnUse",children:[e.jsx("stop",{stopColor:"#7C3AED"}),e.jsx("stop",{offset:"1",stopColor:"#4F46E5"})]})}),e.jsx("rect",{width:"32",height:"32",rx:r,fill:`url(#${i})`}),e.jsxs("g",{stroke:"#ffffff",strokeWidth:"1.6",strokeLinecap:"round",opacity:"0.9",children:[e.jsx("line",{x1:"16",y1:"11.5",x2:"10",y2:"20.5"}),e.jsx("line",{x1:"16",y1:"11.5",x2:"22",y2:"20.5"}),e.jsx("line",{x1:"10",y1:"20.5",x2:"22",y2:"20.5"})]}),e.jsxs("g",{fill:"#ffffff",children:[e.jsx("circle",{cx:"16",cy:"11.5",r:"3"}),e.jsx("circle",{cx:"10",cy:"20.5",r:"2.6"}),e.jsx("circle",{cx:"22",cy:"20.5",r:"2.6"})]})]})}function y({size:s=32,showText:t=!0,text:r="CRM",className:i="",textClassName:a=""}){return e.jsxs("div",{className:p("flex items-center gap-2.5",i),children:[e.jsx(j,{size:s}),t&&e.jsx("span",{className:p("font-bold tracking-tight",a),children:r})]})}function C({status:s}){const[t,r]=m.useState(!1),{data:i,setData:a,post:c,processing:l,errors:n,reset:x}=f({email:"",password:"",remember:!1}),g=o=>{o.preventDefault(),c(route("login"),{onFinish:()=>x("password")})};return e.jsxs(e.Fragment,{children:[e.jsx(h,{title:"Sign in"}),e.jsx("div",{className:"login-root",children:e.jsxs("div",{className:"login-card",children:[e.jsxs("div",{className:"login-brand",children:[e.jsx(y,{size:40,showText:!1}),e.jsx("span",{className:"login-brand-name",children:"CRM"})]}),e.jsx("h1",{className:"login-title",children:"Welcome back"}),e.jsx("p",{className:"login-subtitle",children:"Sign in to your workspace"}),s&&e.jsx("div",{style:{marginBottom:20,fontSize:13,color:"#065f46",background:"#ecfdf5",borderRadius:8,padding:"10px 14px",border:"1px solid #a7f3d0"},children:s}),e.jsxs("form",{onSubmit:g,style:{display:"flex",flexDirection:"column",gap:18},children:[e.jsxs("div",{children:[e.jsx("label",{htmlFor:"email",style:{display:"block",fontSize:12.5,fontWeight:600,color:"#374151",marginBottom:6,letterSpacing:"-0.1px"},children:"Email address"}),e.jsx(d,{id:"email",type:"email",autoComplete:"email",autoFocus:!0,value:i.email,onChange:o=>a("email",o.target.value),placeholder:"you@company.com",className:"h-11 text-[13.5px] bg-white border-slate-200",style:n.email?{borderColor:"#f87171"}:{}}),n.email&&e.jsx("p",{style:{color:"#ef4444",fontSize:11.5,marginTop:5},children:n.email})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"password",style:{display:"block",fontSize:12.5,fontWeight:600,color:"#374151",marginBottom:6,letterSpacing:"-0.1px"},children:"Password"}),e.jsxs("div",{style:{position:"relative"},children:[e.jsx(d,{id:"password",type:t?"text":"password",autoComplete:"current-password",value:i.password,onChange:o=>a("password",o.target.value),placeholder:"••••••••",className:"h-11 text-[13.5px] pr-10 bg-white border-slate-200",style:n.password?{borderColor:"#f87171"}:{}}),e.jsx("button",{type:"button",tabIndex:-1,onClick:()=>r(o=>!o),style:{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:"#94a3b8",background:"none",border:"none",cursor:"pointer",padding:0,display:"flex",alignItems:"center"},children:t?e.jsx(b,{size:15}):e.jsx(u,{size:15})})]}),n.password&&e.jsx("p",{style:{color:"#ef4444",fontSize:11.5,marginTop:5},children:n.password})]}),e.jsx("button",{type:"submit",disabled:l,className:"login-btn",style:{marginTop:6,background:l?"rgba(15,23,42,0.45)":"#0f172a",cursor:l?"not-allowed":"pointer"},children:l?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"login-spinner"}),"Signing in…"]}):"Sign in"})]})]})}),e.jsx("style",{children:`
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
      `})]})}export{C as default};
