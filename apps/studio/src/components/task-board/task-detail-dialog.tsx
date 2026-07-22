'use client'

import { Button } from '@t42/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@t42/ui/components/dialog'
import { Input } from '@t42/ui/components/input'
import { Label } from '@t42/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@t42/ui/components/select'
import { Textarea } from '@t42/ui/components/textarea'
import { useEffect, useState } from 'react'
import type { KanbanTaskStatus, Task } from '@/schemas/task'

const STATUS_OPTIONS: { value: KanbanTaskStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' }
]

export function TaskDetailDialog({
  task,
  open,
  onClose,
  onSave
}: {
  task: Task | null
  open: boolean
  onClose: () => void
  onSave: (input: {
    id: string
    title: string
    description: string
    status: KanbanTaskStatus
  }) => Promise<boolean>
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<KanbanTaskStatus>('backlog')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!task) {
      return
    }
    setTitle(task.title)
    setDescription(task.description ?? '')
    setError(null)
    if (
      task.status === 'backlog' ||
      task.status === 'in_progress' ||
      task.status === 'done'
    ) {
      setStatus(task.status)
    }
  }, [task])

  if (!task) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              className="min-h-40"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description (optional)"
            />
          </div>
          {task.status !== 'archived' ? (
            <div className="space-y-2">
              <Label htmlFor="task-status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as KanbanTaskStatus)}
              >
                <SelectTrigger id="task-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            disabled={saving || !title.trim()}
            onClick={async () => {
              setSaving(true)
              setError(null)
              const saved = await onSave({
                id: task.id,
                title: title.trim(),
                description,
                status
              })
              setSaving(false)
              if (saved) {
                onClose()
              } else {
                setError('Failed to save task. Please try again.')
              }
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
