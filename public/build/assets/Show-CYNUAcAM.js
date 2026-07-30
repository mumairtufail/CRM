import{f as o,j as e,L as r}from"./app-DSdNZVzq.js";import{L as n}from"./Logo-DI9u5YUM.js";import{S as l,a as i}from"./SeoHead-CvMKZ3aL.js";import{A as d}from"./arrow-left-twTsNtv_.js";import{U as c}from"./user-k2i_vB60.js";import{C as m}from"./calendar-BjWYTE9L.js";import{C as x}from"./clock-uZFfVn4g.js";import"./utils-DclmTqRz.js";import"./createLucideIcon-Dhz1ErFK.js";function y({blog:t}){const{props:a}=o();return a.latestBlogs,e.jsxs(e.Fragment,{children:[e.jsx(l,{title:`${t.title} · LumeniaCRM`,description:t.description||t.subtitle,path:`/blog/${t.slug}`,image:t.image_url||void 0,type:"article",jsonLd:{"@context":"https://schema.org","@type":"BlogPosting",headline:t.title,description:t.description||t.subtitle||void 0,image:t.image_url||void 0,datePublished:t.published_at_iso||void 0,author:{"@type":"Person",name:t.author_name},mainEntityOfPage:{"@type":"WebPage","@id":`https://${a.appUrl}/blog/${t.slug}`}}}),e.jsxs("div",{className:"min-h-screen bg-[rgb(var(--brand-tint))] font-sans antialiased text-slate-800",children:[e.jsx("header",{className:"sticky top-0 z-50 bg-[rgb(var(--brand-tint))]/85 backdrop-blur-md border-b border-slate-100",children:e.jsxs("div",{className:"max-w-7xl mx-auto px-6 h-16 flex items-center justify-between",children:[e.jsx(r,{href:"/",className:"flex items-center gap-2",children:e.jsx(n,{size:32,showText:!0,text:"LumeniaCRM",textClassName:"text-[17px] font-extrabold"})}),e.jsxs("nav",{className:"hidden md:flex items-center gap-6 text-[14px] font-semibold text-slate-600",children:[e.jsx(r,{href:"/",className:"hover:text-brand-600 transition-colors",children:"Home"}),e.jsx(r,{href:"/blog",className:"text-brand-600",children:"Blog"}),e.jsx(r,{href:"/login",className:"hover:text-brand-600 transition-colors",children:"Sign in"}),e.jsx(r,{href:"/register",className:"px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-[13px] font-bold shadow-sm shadow-brand-500/10 transition-all",children:"Get Started"})]})]})}),e.jsx("div",{className:"max-w-3xl mx-auto px-6 pt-10",children:e.jsxs(r,{href:"/blog",className:"inline-flex items-center gap-1.5 text-[13px] font-bold text-slate-400 hover:text-brand-600 transition-colors",children:[e.jsx(d,{size:14})," Back to articles"]})}),e.jsx("main",{className:"max-w-3xl mx-auto px-6 py-8",children:e.jsxs("article",{className:"bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-6 md:p-10",children:[e.jsxs("header",{className:"space-y-4 mb-8",children:[e.jsx("div",{className:"flex flex-wrap items-center gap-2",children:t.tags.map(s=>e.jsx("span",{className:"px-2.5 py-0.5 rounded bg-brand-50 text-brand-700 text-[10px] font-bold uppercase tracking-wider border border-brand-100",children:s},s))}),e.jsx("h1",{className:"text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight",children:t.title}),t.subtitle&&e.jsx("p",{className:"text-base text-slate-400 font-normal leading-relaxed",children:t.subtitle}),e.jsxs("div",{className:"flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100 text-[12.5px] text-slate-400",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200",children:e.jsx(c,{size:13,className:"text-slate-500"})}),e.jsx("span",{className:"font-semibold text-slate-700",children:t.author_name})]}),e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx(m,{size:13})," ",t.published_at]}),e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx(x,{size:13})," ",t.read_time]})]})]})]}),t.image_url&&e.jsx("div",{className:"aspect-[16/9] w-full rounded-xl overflow-hidden border border-slate-250 mb-8 bg-slate-50",children:e.jsx("img",{src:t.image_url,className:"w-full h-full object-cover",alt:t.title})}),e.jsx("div",{dangerouslySetInnerHTML:{__html:t.body},className:"blog-content"})]})}),e.jsx(i,{})]}),e.jsx("style",{children:`
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
          color: rgb(var(--brand-600)); /* Violet 600 */
          text-decoration: underline;
          font-weight: 500;
        }

        .blog-content a:hover {
          color: rgb(var(--brand-700));
        }

        .blog-content blockquote {
          font-style: italic;
          border-left: 4px solid rgb(var(--brand-600));
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
      `})]})}export{y as default};
