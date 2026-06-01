import{a as x,u as f,j as e,H as h}from"./app-DPUS_-Lc.js";import{I as a}from"./input-CFaxbnnV.js";import{E as m}from"./eye-off-BzQsqoI8.js";import{E as b}from"./eye-BDL2MRL5.js";import"./createLucideIcon-8Czj-VFC.js";function k({status:n}){const[s,d]=x.useState(!1),{data:r,setData:l,post:p,processing:o,errors:i,reset:c}=f({email:"",password:"",remember:!1}),g=t=>{t.preventDefault(),p(route("login"),{onFinish:()=>c("password")})};return e.jsxs(e.Fragment,{children:[e.jsx(h,{title:"Sign in"}),e.jsxs("div",{className:"login-root",children:[e.jsxs("div",{className:"login-left",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:9},children:[e.jsx("div",{style:{width:26,height:26,borderRadius:6,background:"linear-gradient(135deg, #7c3aed, #4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:e.jsx("span",{style:{color:"white",fontSize:7,fontWeight:800,letterSpacing:"0.04em"},children:"CRM"})}),e.jsx("span",{style:{color:"white",fontWeight:700,fontSize:15,letterSpacing:"-0.3px"},children:"CRM"})]}),e.jsxs("div",{children:[e.jsx("p",{style:{fontSize:11,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase",color:"rgba(255,255,255,0.28)",marginBottom:18},children:"Workspace"}),e.jsxs("h2",{style:{fontSize:46,fontWeight:800,lineHeight:1.08,letterSpacing:"-2.5px",color:"#fff",marginBottom:22},children:["Your pipeline,",e.jsx("br",{}),"your pace."]}),e.jsxs("p",{style:{fontSize:14.5,lineHeight:1.65,color:"rgba(255,255,255,0.38)",maxWidth:320},children:["Manage leads, track activities,",e.jsx("br",{}),"and close deals — all in one place."]})]}),e.jsxs("div",{children:[e.jsx("div",{style:{height:1,background:"rgba(255,255,255,0.07)",marginBottom:18}}),e.jsx("p",{style:{fontSize:11.5,color:"rgba(255,255,255,0.18)",letterSpacing:"0.01em"},children:"Internal tool — authorised access only"})]})]}),e.jsx("div",{className:"login-right",children:e.jsxs("div",{style:{width:"100%",maxWidth:348},children:[e.jsx("h1",{style:{fontSize:24,fontWeight:700,letterSpacing:"-0.8px",color:"#0f172a",marginBottom:5},children:"Welcome back"}),e.jsx("p",{style:{fontSize:13.5,color:"#94a3b8",marginBottom:34},children:"Sign in to your workspace"}),n&&e.jsx("div",{style:{marginBottom:20,fontSize:13,color:"#065f46",background:"#ecfdf5",borderRadius:8,padding:"10px 14px",border:"1px solid #a7f3d0"},children:n}),e.jsxs("form",{onSubmit:g,style:{display:"flex",flexDirection:"column",gap:18},children:[e.jsxs("div",{children:[e.jsx("label",{htmlFor:"email",style:{display:"block",fontSize:12.5,fontWeight:600,color:"#374151",marginBottom:6,letterSpacing:"-0.1px"},children:"Email address"}),e.jsx(a,{id:"email",type:"email",autoComplete:"email",autoFocus:!0,value:r.email,onChange:t=>l("email",t.target.value),placeholder:"you@company.com",className:"h-11 text-[13.5px] bg-white border-slate-200",style:i.email?{borderColor:"#f87171"}:{}}),i.email&&e.jsx("p",{style:{color:"#ef4444",fontSize:11.5,marginTop:5},children:i.email})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"password",style:{display:"block",fontSize:12.5,fontWeight:600,color:"#374151",marginBottom:6,letterSpacing:"-0.1px"},children:"Password"}),e.jsxs("div",{style:{position:"relative"},children:[e.jsx(a,{id:"password",type:s?"text":"password",autoComplete:"current-password",value:r.password,onChange:t=>l("password",t.target.value),placeholder:"••••••••",className:"h-11 text-[13.5px] pr-10 bg-white border-slate-200",style:i.password?{borderColor:"#f87171"}:{}}),e.jsx("button",{type:"button",tabIndex:-1,onClick:()=>d(t=>!t),style:{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:"#94a3b8",background:"none",border:"none",cursor:"pointer",padding:0,display:"flex",alignItems:"center"},children:s?e.jsx(m,{size:15}):e.jsx(b,{size:15})})]}),i.password&&e.jsx("p",{style:{color:"#ef4444",fontSize:11.5,marginTop:5},children:i.password})]}),e.jsx("button",{type:"submit",disabled:o,className:"login-btn",style:{marginTop:6,background:o?"rgba(15,23,42,0.45)":"#0f172a",cursor:o?"not-allowed":"pointer"},children:o?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"login-spinner"}),"Signing in…"]}):"Sign in"})]})]})})]}),e.jsx("style",{children:`
        .login-root {
          display: flex;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
        }

        /* Left dark panel */
        .login-left {
          flex: 0 0 48%;
          background: #090910;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 44px 52px;
          position: relative;
        }
        .login-left::after {
          content: '';
          position: absolute;
          top: 0; right: 0;
          width: 1px; height: 100%;
          background: rgba(255,255,255,0.055);
        }

        /* Right light panel */
        .login-right {
          flex: 1;
          background: #f8f7ff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 52px;
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

        /* Mobile: stack vertically, hide left panel */
        @media (max-width: 640px) {
          .login-root { flex-direction: column; }
          .login-left {
            flex: none;
            padding: 32px 28px 28px;
          }
          .login-left::after { display: none; }
          .login-left h2 { font-size: 30px; letter-spacing: -1.5px; }
          .login-right { padding: 40px 28px; }
        }
      `})]})}export{k as default};
