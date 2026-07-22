'use client'

import { Button } from '@t42/ui/components/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@t42/ui/components/select'
import {
  Archive,
  ArchiveRestore,
  Columns3,
  RotateCcw,
  Trash2
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { AppChrome } from '@/components/app-chrome'
import { ConfirmDialog } from '@/components/task-board/confirm-dialog'
import { KanbanBoard } from '@/components/task-board/kanban-board'
import { TaskDetailDialog } from '@/components/task-board/task-detail-dialog'
import {
  useCreateTask,
  useMoveTask,
  usePermanentDeleteTask,
  useReorderTask,
  useRestoreTask,
  useTasks,
  useTrashTask,
  useUpdateTask
} from '@/hooks/use-tasks'
import type { KanbanTaskStatus, Task, TaskView } from '@/schemas/task'
import { taskViewSchema } from '@/schemas/task'

const TABS: {
  view: TaskView
  label: string
  icon: typeof Columns3
}[] = [
  { view: 'active', label: 'Active', icon: Columns3 },
  { view: 'archived', label: 'Archived', icon: Archive },
  { view: 'trash', label: 'Trash', icon: Trash2 }
]

const ICON_CLASS = 'size-3.5 shrink-0'

const STATUS_LABELS: Record<Task['status'], string> = {
  backlog: 'Backlog',
  in_progress: 'In Progress',
  done: 'Done',
  archived: 'Archived'
}

const MOVE_OPTIONS: { value: KanbanTaskStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' }
]

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  })
}

function useBoardView(): TaskView {
  const searchParams = useSearchParams()
  const parsed = taskViewSchema.safeParse(searchParams.get('view') ?? 'active')
  return parsed.success ? parsed.data : 'active'
}

function BoardTabs({
  currentView,
  counts,
  onChange
}: {
  currentView: TaskView
  counts: Record<TaskView, number>
  onChange: (view: TaskView) => void
}) {
  return (
    <nav className="mt-6 flex gap-1 border-b border-border">
      {TABS.map((tab) => {
        const selected = currentView === tab.view
        const Icon = tab.icon
        return (
          <button
            key={tab.view}
            type="button"
            onClick={() => onChange(tab.view)}
            className={[
              '-mb-px inline-flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm transition-colors',
              selected
                ? 'border-foreground font-medium text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            ].join(' ')}
          >
            <Icon className={ICON_CLASS} aria-hidden />
            {tab.label} ({counts[tab.view]})
          </button>
        )
      })}
    </nav>
  )
}

function MutationErrorBanner({
  message,
  onDismiss
}: {
  message: string
  onDismiss: () => void
}) {
  return (
    <div className="mt-4 flex items-start justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      <p>{message}</p>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 shrink-0 px-2 text-destructive hover:text-destructive"
        onClick={onDismiss}
      >
        Dismiss
      </Button>
    </div>
  )
}

function ArchivedTaskRow({
  task,
  onEdit,
  onUnarchive,
  onMove,
  onTrash
}: {
  task: Task
  onEdit: (task: Task) => void
  onUnarchive: (id: string) => void
  onMove: (id: string, status: KanbanTaskStatus) => void
  onTrash: (id: string) => void
}) {
  const [confirmTrash, setConfirmTrash] = useState(false)

  return (
    <>
      <article className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background p-3">
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={() => onEdit(task)}
        >
          <p className="text-sm font-medium">{task.title}</p>
          <p className="text-xs text-muted-foreground">
            Updated {formatShortDate(task.updatedAt)}
          </p>
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Move to</span>
            <Select
              onValueChange={(value) =>
                onMove(task.id, value as KanbanTaskStatus)
              }
            >
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue placeholder="Choose column" />
              </SelectTrigger>
              <SelectContent>
                {MOVE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onUnarchive(task.id)}
          >
            <ArchiveRestore className={ICON_CLASS} aria-hidden />
            Unarchive
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-destructive hover:text-destructive"
            onClick={() => setConfirmTrash(true)}
          >
            <Trash2 className={ICON_CLASS} aria-hidden />
            Move to trash
          </Button>
        </div>
      </article>
      <ConfirmDialog
        open={confirmTrash}
        title="Move this task to trash?"
        description="Trashed tasks can be restored from the Trash tab."
        confirmLabel="Move to trash"
        destructive
        onConfirm={() => {
          onTrash(task.id)
          setConfirmTrash(false)
        }}
        onCancel={() => setConfirmTrash(false)}
      />
    </>
  )
}

function TrashTaskRow({
  task,
  onRestore,
  onPermanentDelete
}: {
  task: Task
  onRestore: (id: string) => void
  onPermanentDelete: (id: string) => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <>
      <article className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background p-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{task.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono uppercase">
              {STATUS_LABELS[task.status]}
            </span>
            <span>·</span>
            <span>
              Deleted {formatShortDate(task.deletedAt ?? task.updatedAt)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onRestore(task.id)}
          >
            <RotateCcw className={ICON_CLASS} aria-hidden />
            Restore
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-destructive hover:text-destructive"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className={ICON_CLASS} aria-hidden />
            Delete permanently
          </Button>
        </div>
      </article>
      <ConfirmDialog
        open={confirmDelete}
        title="Permanently delete this task?"
        description="This cannot be undone."
        confirmLabel="Delete permanently"
        destructive
        onConfirm={() => {
          onPermanentDelete(task.id)
          setConfirmDelete(false)
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  )
}

function firstMutationError(errors: Array<Error | null | undefined>) {
  const error = errors.find(Boolean)
  return error instanceof Error ? error.message : null
}

export function TaskBoard() {
  const router = useRouter()
  const view = useBoardView()
  const { data, isLoading, error } = useTasks(view)
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const moveTask = useMoveTask()
  const reorderTask = useReorderTask()
  const trashTask = useTrashTask()
  const restoreTask = useRestoreTask()
  const permanentDeleteTask = usePermanentDeleteTask()
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [dismissedMutationError, setDismissedMutationError] = useState(false)

  const tasks = data?.tasks ?? []
  const counts = data?.counts ?? { active: 0, archived: 0, trash: 0 }

  const mutationError = useMemo(
    () =>
      firstMutationError([
        createTask.error,
        updateTask.error,
        moveTask.error,
        reorderTask.error,
        trashTask.error,
        restoreTask.error,
        permanentDeleteTask.error
      ]),
    [
      createTask.error,
      updateTask.error,
      moveTask.error,
      reorderTask.error,
      trashTask.error,
      restoreTask.error,
      permanentDeleteTask.error
    ]
  )

  const showMutationError = mutationError && !dismissedMutationError

  const setView = (nextView: TaskView) => {
    const query = nextView === 'active' ? '' : `?view=${nextView}`
    router.replace(`/board${query}`)
  }

  const clearMutationError = () => setDismissedMutationError(false)

  return (
    <>
      <AppChrome />
      <main className="mx-auto min-h-screen max-w-6xl px-6 py-8 sm:px-8">
        <header>
          <h1 className="text-2xl font-bold">Task Board</h1>
          <p className="text-sm text-muted-foreground">
            Track work items for your team.
          </p>
        </header>

        <BoardTabs currentView={view} counts={counts} onChange={setView} />

        {error ? (
          <p className="mt-6 text-sm text-destructive">
            {error instanceof Error ? error.message : 'Failed to load tasks'}
          </p>
        ) : null}

        {showMutationError ? (
          <MutationErrorBanner
            message={mutationError}
            onDismiss={() => setDismissedMutationError(true)}
          />
        ) : null}

        {isLoading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
        ) : view === 'active' ? (
          <KanbanBoard
            tasks={tasks}
            onOpenTask={setEditingTask}
            onArchive={(id) => {
              clearMutationError()
              moveTask.mutate({ id, status: 'archived' })
            }}
            onTrash={(id) => {
              clearMutationError()
              trashTask.mutate(id)
            }}
            onReorder={(input) => {
              clearMutationError()
              reorderTask.mutate(input)
            }}
            onChangeStatus={(id, status) => {
              clearMutationError()
              moveTask.mutate({ id, status })
            }}
            onAddTask={(title, status) => {
              clearMutationError()
              createTask.mutate({ title, status })
            }}
          />
        ) : view === 'archived' ? (
          <div className="mt-8 space-y-3">
            {tasks.length === 0 ? (
              <p className="py-12 text-center text-xs text-muted-foreground">
                No archived tasks
              </p>
            ) : (
              tasks.map((task) => (
                <ArchivedTaskRow
                  key={task.id}
                  task={task}
                  onEdit={setEditingTask}
                  onUnarchive={(id) => {
                    clearMutationError()
                    moveTask.mutate({ id, status: 'backlog' })
                  }}
                  onMove={(id, status) => {
                    clearMutationError()
                    moveTask.mutate({ id, status })
                  }}
                  onTrash={(id) => {
                    clearMutationError()
                    trashTask.mutate(id)
                  }}
                />
              ))
            )}
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {tasks.length === 0 ? (
              <p className="py-12 text-center text-xs text-muted-foreground">
                Trash is empty
              </p>
            ) : (
              tasks.map((task) => (
                <TrashTaskRow
                  key={task.id}
                  task={task}
                  onRestore={(id) => {
                    clearMutationError()
                    restoreTask.mutate(id)
                  }}
                  onPermanentDelete={(id) => {
                    clearMutationError()
                    permanentDeleteTask.mutate(id)
                  }}
                />
              ))
            )}
          </div>
        )}
      </main>

      <TaskDetailDialog
        task={editingTask}
        open={editingTask !== null}
        onClose={() => setEditingTask(null)}
        onSave={async (input) => {
          if (!editingTask) {
            return false
          }
          clearMutationError()
          const textChanged =
            input.title !== editingTask.title ||
            input.description !== (editingTask.description ?? '')
          const statusChanged =
            editingTask.status !== 'archived' &&
            input.status !== editingTask.status

          try {
            if (textChanged) {
              await updateTask.mutateAsync({
                id: input.id,
                title: input.title,
                description: input.description
              })
            }
            if (statusChanged) {
              await moveTask.mutateAsync({ id: input.id, status: input.status })
            }
            return true
          } catch {
            return false
          }
        }}
      />
    </>
  )
}
