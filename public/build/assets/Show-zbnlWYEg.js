import{e as i,j as e,H as n,L as s}from"./app-CSlbrAi5.js";import{L as r}from"./Logo-C7BrtvzX.js";import{A as c}from"./arrow-left-VJgwCrkV.js";import{U as x}from"./user-BJrBxXhl.js";import{C as d}from"./calendar-BrIhJeIP.js";import{C as m}from"./clock-D0p62iIb.js";import"./utils-DclmTqRz.js";import"./createLucideIcon-GrLdNqFA.js";function v({blog:t}){const{props:a}=i(),o=a.latestBlogs||[];return e.jsxs(e.Fragment,{children:[e.jsxs(n,{children:[e.jsx("title",{children:`${t.title} · LumeniaCRM`}),e.jsx("meta",{name:"description",content:t.description||t.subtitle}),e.jsx("meta",{property:"og:title",content:t.title}),e.jsx("meta",{property:"og:description",content:t.description||t.subtitle}),t.image_url&&e.jsx("meta",{property:"og:image",content:t.image_url}),e.jsx("meta",{property:"og:type",content:"article"})]}),e.jsxs("div",{className:"min-h-screen bg-[#F4F2FF] font-sans antialiased text-slate-800",children:[e.jsx("header",{className:"sticky top-0 z-50 bg-[#F4F2FF]/85 backdrop-blur-md border-b border-slate-100",children:e.jsxs("div",{className:"max-w-7xl mx-auto px-6 h-16 flex items-center justify-between",children:[e.jsx(s,{href:"/",className:"flex items-center gap-2",children:e.jsx(r,{size:32,showText:!0,text:"LumeniaCRM",textClassName:"text-[17px] font-extrabold"})}),e.jsxs("nav",{className:"hidden md:flex items-center gap-6 text-[14px] font-semibold text-slate-600",children:[e.jsx(s,{href:"/",className:"hover:text-violet-600 transition-colors",children:"Home"}),e.jsx(s,{href:"/blog",className:"text-violet-600",children:"Blog"}),e.jsx(s,{href:"/login",className:"hover:text-violet-600 transition-colors",children:"Sign in"}),e.jsx(s,{href:"/register",className:"px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-[13px] font-bold shadow-sm shadow-violet-500/10 transition-all",children:"Get Started"})]})]})}),e.jsx("div",{className:"max-w-3xl mx-auto px-6 pt-10",children:e.jsxs(s,{href:"/blog",className:"inline-flex items-center gap-1.5 text-[13px] font-bold text-slate-400 hover:text-violet-600 transition-colors",children:[e.jsx(c,{size:14})," Back to articles"]})}),e.jsx("main",{className:"max-w-3xl mx-auto px-6 py-8",children:e.jsxs("article",{className:"bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-6 md:p-10",children:[e.jsxs("header",{className:"space-y-4 mb-8",children:[e.jsx("div",{className:"flex flex-wrap items-center gap-2",children:t.tags.map(l=>e.jsx("span",{className:"px-2.5 py-0.5 rounded bg-violet-50 text-violet-700 text-[10px] font-bold uppercase tracking-wider border border-violet-100",children:l},l))}),e.jsx("h1",{className:"text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight",children:t.title}),t.subtitle&&e.jsx("p",{className:"text-base text-slate-400 font-normal leading-relaxed",children:t.subtitle}),e.jsxs("div",{className:"flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100 text-[12.5px] text-slate-400",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200",children:e.jsx(x,{size:13,className:"text-slate-500"})}),e.jsx("span",{className:"font-semibold text-slate-700",children:t.author_name})]}),e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx(d,{size:13})," ",t.published_at]}),e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx(m,{size:13})," ",t.read_time]})]})]})]}),t.image_url&&e.jsx("div",{className:"aspect-[16/9] w-full rounded-xl overflow-hidden border border-slate-250 mb-8 bg-slate-50",children:e.jsx("img",{src:t.image_url,className:"w-full h-full object-cover",alt:""})}),e.jsx("div",{dangerouslySetInnerHTML:{__html:t.body},className:"blog-content"})]})}),e.jsxs("footer",{className:"bg-slate-900 border-t border-slate-800 text-slate-400 py-16 mt-20",children:[e.jsxs("div",{className:"max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10",children:[e.jsxs("div",{children:[e.jsx(r,{size:28,showText:!0,text:"LumeniaCRM",textClassName:"text-white text-[15px]"}),e.jsx("p",{className:"text-[12px] text-slate-500 mt-2",children:"A CRM for sales teams that actually want to use their CRM. Turn leads into revenue."})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"text-white text-[13px] font-bold uppercase tracking-wider mb-4",children:"Latest Blogs"}),e.jsx("ul",{className:"space-y-2 text-[12.5px]",children:o&&o.length>0?o.map(l=>e.jsx("li",{children:e.jsx(s,{href:`/blog/${l.slug}`,className:"hover:text-violet-400 transition-colors block truncate max-w-[280px]",children:l.title})},l.slug)):e.jsx("li",{className:"text-slate-600 italic text-[12px]",children:"No articles yet"})})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"text-white text-[13px] font-bold uppercase tracking-wider mb-4",children:"Quick Links"}),e.jsxs("ul",{className:"space-y-2 text-[12.5px]",children:[e.jsx("li",{children:e.jsx(s,{href:"/",className:"hover:text-violet-400 transition-colors",children:"Home"})}),e.jsx("li",{children:e.jsx(s,{href:"/blog",className:"hover:text-violet-400 transition-colors",children:"Blog"})})]})]})]}),e.jsx("div",{className:"max-w-7xl mx-auto px-6 border-t border-slate-800/60 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4",children:e.jsxs("p",{className:"text-[12px] text-slate-500",children:["© ",new Date().getFullYear()," LumeniaCRM. All rights reserved."]})})]})]}),e.jsx("style",{children:`
        /* Premium custom typography for Blog Content HTML */
        .blog-content {
          font-size: 15px;
          line-height: 1.75;
          color: #334155; /* Slate 700 */
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        
        .blog-content p {
          margin-top: 0;
          margin-bottom: 1.5rem;
          font-weight: 400;
        }

        .blog-content h1,
        .blog-content h2,
        .blog-content h3,
        .blog-content h4 {
          color: #0f172a; /* Slate 900 */
          font-weight: 800;
          letter-spacing: -0.025em;
          line-height: 1.3;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .blog-content h2 {
          font-size: 21px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 0.5rem;
        }

        .blog-content h3 {
          font-size: 17px;
        }

        .blog-content ul,
        .blog-content ol {
          margin-top: 0;
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }

        .blog-content ul {
          list-style-type: disc;
        }

        .blog-content ol {
          list-style-type: decimal;
        }

        .blog-content li {
          margin-bottom: 0.5rem;
        }

        .blog-content a {
          color: #7c3aed; /* Violet 600 */
          text-decoration: underline;
          font-weight: 500;
        }

        .blog-content a:hover {
          color: #6d28d9;
        }

        .blog-content blockquote {
          font-style: italic;
          border-left: 4px solid #7c3aed;
          padding-left: 1.25rem;
          color: #475569;
          margin: 1.5rem 0;
        }

        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1.5rem 0;
          border: 1px solid #e2e8f0;
        }

        .blog-content pre,
        .blog-content code {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
          font-size: 13px;
        }

        .blog-content code {
          padding: 2px 5px;
          color: #e11d48;
        }

        .blog-content pre {
          padding: 1rem;
          overflow-x: auto;
          margin-bottom: 1.5rem;
        }

        .blog-content pre code {
          padding: 0;
          background-color: transparent;
          border: none;
          color: #334155;
        }
      `})]})}export{v as default};
