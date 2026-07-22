'use client'

import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@t42/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@t42/ui/components/dropdown-menu'
import { Input } from '@t42/ui/components/input'
import {
  Archive,
  GripVertical,
  MoreHorizontal,
  Plus,
  Trash2
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { ConfirmDialog } from '@/components/task-board/confirm-dialog'
import {
  buildColumnIds,
  type ColumnIds,
  KANBAN_STATUSES
} from '@/lib/task-board/active-tasks'
import type { KanbanTaskStatus, Task } from '@/schemas/task'

const COLUMNS: { status: KanbanTaskStatus; label: string }[] = [
  { status: 'backlog', label: 'Backlog' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'done', label: 'Done' }
]

const ICON_CLASS = 'size-3.5 shrink-0'

const sortableId = (taskId: string) => `sort:${taskId}`
const cardDragId = (taskId: string) => `card:${taskId}`
const columnDropId = (status: KanbanTaskStatus) => `col:${status}`

type ActiveDrag =
  | { kind: 'sort'; taskId: string }
  | { kind: 'card'; taskId: string }

type KanbanBoardProps = {
  tasks: Task[]
  onArchive: (id: string) => void
  onTrash: (id: string) => void
  /** Grip handle — same column only */
  onReorder: (input: {
    id: string
    status: KanbanTaskStatus
    position: number
  }) => void
  /** Card body — append to target column via PATCH /status */
  onChangeStatus: (id: string, status: KanbanTaskStatus) => void
  onAddTask: (title: string, status: KanbanTaskStatus) => void
  onOpenTask: (task: Task) => void
}

function parseSortId(id: string) {
  return id.startsWith('sort:') ? id.slice(5) : null
}

function parseCardId(id: string) {
  return id.startsWith('card:') ? id.slice(5) : null
}

function parseColumnId(id: string): KanbanTaskStatus | null {
  if (!id.startsWith('col:')) {
    return null
  }
  const status = id.slice(4)
  return KANBAN_STATUSES.includes(status as KanbanTaskStatus)
    ? (status as KanbanTaskStatus)
    : null
}

function resolveStatusDropTarget(
  overId: string,
  tasksById: Record<string, Task>
): KanbanTaskStatus | null {
  const column = parseColumnId(overId)
  if (column) {
    return column
  }
  const overTaskId = parseSortId(overId)
  if (!overTaskId) {
    return null
  }
  const overTask = tasksById[overTaskId]
  return overTask ? (overTask.status as KanbanTaskStatus) : null
}

function TaskCard({
  task,
  onOpen,
  onArchive,
  onTrash
}: {
  task: Task
  onOpen: (task: Task) => void
  onArchive: (id: string) => void
  onTrash: (id: string) => void
}) {
  const [confirm, setConfirm] = useState<'archive' | 'trash' | null>(null)

  const {
    attributes: sortAttributes,
    listeners: sortListeners,
    setNodeRef: setSortRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging: isSortDragging
  } = useSortable({ id: sortableId(task.id) })

  const {
    attributes: cardAttributes,
    listeners: cardListeners,
    setNodeRef: setCardRef,
    isDragging: isCardDragging
  } = useDraggable({ id: cardDragId(task.id) })

  const hidden = isSortDragging || isCardDragging

  return (
    <>
      <div
        ref={setSortRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition: hidden ? undefined : transition,
          opacity: hidden ? 0 : 1
        }}
        className="group relative flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2"
      >
        <button
          type="button"
          ref={setActivatorNodeRef}
          className="shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing"
          aria-label="Drag to reorder within column"
          {...sortAttributes}
          {...sortListeners}
        >
          <GripVertical className={ICON_CLASS} aria-hidden />
        </button>
        <button
          type="button"
          ref={setCardRef}
          className="min-w-0 flex-1 cursor-grab truncate text-left text-sm font-medium active:cursor-grabbing"
          aria-label="Drag to change status"
          onClick={() => onOpen(task)}
          {...cardAttributes}
          {...cardListeners}
        >
          {task.title}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="size-7 shrink-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(event) => event.stopPropagation()}
            >
              <MoreHorizontal className={ICON_CLASS} />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setConfirm('archive')}>
              <Archive className={ICON_CLASS} aria-hidden />
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setConfirm('trash')}
            >
              <Trash2 className={ICON_CLASS} aria-hidden />
              Move to trash
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConfirmDialog
        open={confirm === 'archive'}
        title="Archive this task?"
        description="Archived tasks move to the Archived tab. You can restore them later."
        confirmLabel="Archive"
        onConfirm={() => {
          onArchive(task.id)
          setConfirm(null)
        }}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === 'trash'}
        title="Move this task to trash?"
        description="Trashed tasks can be restored from the Trash tab."
        confirmLabel="Move to trash"
        destructive
        onConfirm={() => {
          onTrash(task.id)
          setConfirm(null)
        }}
        onCancel={() => setConfirm(null)}
      />
    </>
  )
}

function KanbanColumn({
  status,
  label,
  sortableIds,
  tasksById,
  onOpenTask,
  onArchive,
  onTrash,
  onAddTask
}: {
  status: KanbanTaskStatus
  label: string
  sortableIds: string[]
  tasksById: Record<string, Task>
  onOpenTask: (task: Task) => void
  onArchive: (id: string) => void
  onTrash: (id: string) => void
  onAddTask: (title: string, status: KanbanTaskStatus) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: columnDropId(status) })
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')

  return (
    <section>
      <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {label} ({sortableIds.length})
      </h2>
      <div
        ref={setNodeRef}
        className={[
          'mt-3 min-h-48 space-y-3 rounded-lg border border-border bg-muted/20 p-4',
          isOver ? 'ring-2 ring-ring' : ''
        ].join(' ')}
      >
        <SortableContext
          items={sortableIds}
          strategy={verticalListSortingStrategy}
        >
          {sortableIds.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No tasks
            </p>
          ) : (
            sortableIds.map((id) => {
              const taskId = parseSortId(id)
              const task = taskId ? tasksById[taskId] : undefined
              if (!task) {
                return null
              }
              return (
                <TaskCard
                  key={id}
                  task={task}
                  onOpen={onOpenTask}
                  onArchive={onArchive}
                  onTrash={onTrash}
                />
              )
            })
          )}
        </SortableContext>
        {!open ? (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setOpen(true)}
          >
            <Plus className={ICON_CLASS} aria-hidden />
            Add task
          </Button>
        ) : (
          <form
            className="space-y-2"
            onSubmit={(event) => {
              event.preventDefault()
              if (!title.trim()) {
                return
              }
              onAddTask(title.trim(), status)
              setTitle('')
              setOpen(false)
            }}
          >
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Task title"
              autoFocus
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                Add
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOpen(false)
                  setTitle('')
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

function sortableIdsForColumn(columnIds: ColumnIds, status: KanbanTaskStatus) {
  return columnIds[status].map((id) => sortableId(id))
}

export function KanbanBoard({
  tasks,
  onArchive,
  onTrash,
  onReorder,
  onChangeStatus,
  onAddTask,
  onOpenTask
}: KanbanBoardProps) {
  const tasksById = useMemo(
    () => Object.fromEntries(tasks.map((task) => [task.id, task])),
    [tasks]
  )
  const columnIds = useMemo(() => buildColumnIds(tasks), [tasks])
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const overlayTask = activeDrag ? tasksById[activeDrag.taskId] : null

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id)
    const cardTaskId = parseCardId(id)
    if (cardTaskId) {
      setActiveDrag({ kind: 'card', taskId: cardTaskId })
      return
    }
    const sortTaskId = parseSortId(id)
    if (sortTaskId) {
      setActiveDrag({ kind: 'sort', taskId: sortTaskId })
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveDrag(null)
    if (!over) {
      return
    }

    const activeStr = String(active.id)
    const overStr = String(over.id)

    const cardTaskId = parseCardId(activeStr)
    if (cardTaskId) {
      const task = tasksById[cardTaskId]
      const targetStatus = resolveStatusDropTarget(overStr, tasksById)
      if (task && targetStatus && task.status !== targetStatus) {
        onChangeStatus(cardTaskId, targetStatus)
      }
      return
    }

    const sortTaskId = parseSortId(activeStr)
    const overSortTaskId = parseSortId(overStr)
    if (!sortTaskId || !overSortTaskId) {
      return
    }

    const task = tasksById[sortTaskId]
    const overTask = tasksById[overSortTaskId]
    if (!task || !overTask || task.status !== overTask.status) {
      return
    }

    const columnTasks = tasks
      .filter((row) => row.status === task.status)
      .sort((a, b) => a.position - b.position)
    const oldIndex = columnTasks.findIndex((row) => row.id === sortTaskId)
    const newIndex = columnTasks.findIndex((row) => row.id === overSortTaskId)
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
      return
    }

    const reordered = arrayMove(columnTasks, oldIndex, newIndex)
    onReorder({
      id: sortTaskId,
      status: task.status as KanbanTaskStatus,
      position: reordered.findIndex((row) => row.id === sortTaskId)
    })
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDrag(null)}
    >
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.status}
            status={column.status}
            label={column.label}
            sortableIds={sortableIdsForColumn(columnIds, column.status)}
            tasksById={tasksById}
            onOpenTask={onOpenTask}
            onArchive={onArchive}
            onTrash={onTrash}
            onAddTask={onAddTask}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {overlayTask ? (
          <div className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium shadow-sm">
            {overlayTask.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
