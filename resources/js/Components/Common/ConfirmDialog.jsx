import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/Components/ui/alert-dialog'

export default function ConfirmDialog({
  open, onOpenChange, title, description, onConfirm, loading,
  confirmText = 'Delete',
  loadingText = 'Deleting...',
  // 'destructive' (default) keeps the red button; 'default' uses the primary color.
  variant = 'destructive',
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title ?? 'Are you sure?'}</AlertDialogTitle>
          <AlertDialogDescription>
            {description ?? 'This action cannot be undone.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className={variant === 'destructive'
              ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
              : ''}
          >
            {loading ? loadingText : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
