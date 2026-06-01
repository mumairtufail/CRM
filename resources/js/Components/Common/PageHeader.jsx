export default function PageHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-xl font-display font-bold text-gray-900">{title}</h2>
        {description && (
          <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0 ml-4">{action}</div>}
    </div>
  )
}
