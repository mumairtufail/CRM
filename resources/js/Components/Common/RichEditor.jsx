import { createPortal } from 'react-dom'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useEditor, EditorContent, Extension } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { Bold, Italic, Underline as UIcon, List, ListOrdered } from 'lucide-react'
import { cn } from '@/lib/utils'

export const TEMPLATE_VARS = [
  { id: 'name',       desc: 'Full name',     ex: 'John Doe' },
  { id: 'first_name', desc: 'First name',    ex: 'John' },
  { id: 'last_name',  desc: 'Last name',     ex: 'Doe' },
  { id: 'email',      desc: 'Email address', ex: 'john@acme.com' },
  { id: 'company',    desc: 'Company name',  ex: 'Acme Inc.' },
  { id: 'phone',      desc: 'Phone number',  ex: '+1 555-0100' },
  { id: 'status',     desc: 'Lead status',   ex: 'qualified' },
  { id: 'form_link',  desc: 'Link to the attached form', ex: 'https://yourapp.com/f/contact' },
]

// Inline decoration: highlights {{var}} tokens in the editor view
const VarHighlight = Extension.create({
  name: 'varHighlight',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('varHighlight'),
        props: {
          decorations(state) {
            const decos = []
            const re = /\{\{[\w_]+\}\}/g
            state.doc.descendants((node, pos) => {
              if (!node.isText || !node.text) return
              re.lastIndex = 0
              let m
              while ((m = re.exec(node.text)) !== null) {
                decos.push(Decoration.inline(
                  pos + m.index,
                  pos + m.index + m[0].length,
                  { class: 'tiptap-var' }
                ))
              }
            })
            return DecorationSet.create(state.doc, decos)
          },
        },
      }),
    ]
  },
})

function ToolBtn({ active, title, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick() }}
      className={cn(
        'p-[5px] rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors',
        active && 'bg-slate-100 text-slate-800'
      )}
    >
      {children}
    </button>
  )
}

export default function RichEditor({
  value,
  onChange,
  placeholder = 'Write your email body… Type {{ to insert a variable.',
  minHeight = 200,
}) {
  const menuRef = useRef(null)
  const [menu, setMenu] = useState(null)
  // { items[], query, startPos, selectedIdx, coords:{left,bottom} }

  // Keep a stable ref to menu for use inside editor callbacks
  const menuStateRef = useRef(null)
  menuStateRef.current = menu

  const detectVarTrigger = useCallback((editorInstance) => {
    try {
      const { state } = editorInstance
      const { from, to } = state.selection
      if (from !== to) { setMenu(null); return } // don't show on selection
      const before = state.doc.textBetween(Math.max(0, from - 40), from)
      const m = before.match(/\{\{(\w*)$/)
      if (m) {
        const q = m[1].toLowerCase()
        const items = TEMPLATE_VARS.filter(v => q === '' || v.id.startsWith(q))
        if (items.length) {
          const coords = editorInstance.view.coordsAtPos(from)
          setMenu(prev => ({
            items,
            query: m[1],
            startPos: from - m[0].length,
            selectedIdx: prev?.selectedIdx ?? 0,
            coords,
          }))
          return
        }
      }
      setMenu(null)
    } catch {
      setMenu(null)
    }
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false, horizontalRule: false }),
      Underline,
      Placeholder.configure({ placeholder }),
      VarHighlight,
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'tiptap-body',
        style: `min-height:${minHeight}px; padding:10px 12px; font-size:13px; color:#1e293b;`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
      detectVarTrigger(editor)
    },
    onSelectionUpdate: ({ editor }) => {
      detectVarTrigger(editor)
    },
  })

  // Sync external value (template switch)
  const prevVal = useRef(value)
  useEffect(() => {
    if (!editor || value === prevVal.current) return
    const cur = editor.getHTML()
    if (value !== cur) {
      editor.commands.setContent(value || '', false)
    }
    prevVal.current = value
  }, [value, editor])

  // Close menu when clicking outside
  useEffect(() => {
    if (!menu) return
    const handler = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenu(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menu])

  const insertVar = useCallback((v) => {
    if (!editor) return
    const m = menuStateRef.current
    if (!m) return
    const to = m.startPos + 2 + m.query.length
    editor.chain().focus()
      .insertContentAt({ from: m.startPos, to }, `{{${v.id}}}`)
      .run()
    setMenu(null)
  }, [editor])

  const handleKeyDown = useCallback((e) => {
    if (!menuStateRef.current) return
    const m = menuStateRef.current
    if (e.key === 'Escape') { e.preventDefault(); setMenu(null); return }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setMenu(prev => prev ? ({ ...prev, selectedIdx: (prev.selectedIdx + 1) % prev.items.length }) : null)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setMenu(prev => prev ? ({ ...prev, selectedIdx: (prev.selectedIdx - 1 + prev.items.length) % prev.items.length }) : null)
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      const item = m.items[m.selectedIdx]
      if (item) { e.preventDefault(); insertVar(item) }
    }
  }, [insertVar])

  if (!editor) return null

  const dropdown = menu ? createPortal(
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: Math.min(menu.coords.left, window.innerWidth - 264),
        top: menu.coords.bottom + 6,
        width: 252,
        zIndex: 99999,
        background: 'white',
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '6px 12px 5px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Variables{menu.query ? ` — "${menu.query}"` : ''}
        </span>
      </div>
      {menu.items.map((v, i) => (
        <button
          key={v.id}
          type="button"
          onMouseDown={e => { e.preventDefault(); insertVar(v) }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            padding: '8px 12px',
            textAlign: 'left',
            background: i === menu.selectedIdx ? 'rgb(var(--brand-600) / 0.06)' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.1s',
          }}
          onMouseEnter={() => setMenu(m => m ? ({ ...m, selectedIdx: i }) : null)}
        >
          <code style={{
            fontSize: 11,
            fontFamily: 'ui-monospace, monospace',
            background: 'rgb(var(--brand-600) / 0.1)',
            color: 'rgb(var(--brand-700))',
            padding: '2px 6px',
            borderRadius: 5,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            {`{{${v.id}}}`}
          </code>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#334155', margin: 0, lineHeight: 1.2 }}>{v.desc}</p>
            <p style={{ fontSize: 10.5, color: '#94a3b8', margin: '2px 0 0', lineHeight: 1 }}>e.g. {v.ex}</p>
          </div>
        </button>
      ))}
    </div>,
    document.body
  ) : null

  return (
    <div
      className="rounded-xl"
      style={{ border: '1px solid rgba(0,0,0,0.09)', background: 'white', position: 'relative' }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-0.5 px-2 py-1"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}
      >
        <ToolBtn active={editor.isActive('bold')} title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={13} />
        </ToolBtn>
        <ToolBtn active={editor.isActive('italic')} title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={13} />
        </ToolBtn>
        <ToolBtn active={editor.isActive('underline')} title="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UIcon size={13} />
        </ToolBtn>
        <div className="w-px h-3.5 bg-slate-200 mx-1 shrink-0" />
        <ToolBtn active={editor.isActive('bulletList')} title="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={13} />
        </ToolBtn>
        <ToolBtn active={editor.isActive('orderedList')} title="Numbered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={13} />
        </ToolBtn>
        <div className="flex-1" />
        <span className="text-[10px] text-slate-400 pr-1 hidden sm:block">
          Type{' '}
          <code className="bg-slate-100 text-brand-600 px-1 rounded text-[10px]">{'{{'}</code>
          {' '}to insert a variable
        </span>
      </div>

      {/* Editor content */}
      <div onKeyDown={handleKeyDown}>
        <EditorContent editor={editor} />
      </div>

      {dropdown}
    </div>
  )
}
