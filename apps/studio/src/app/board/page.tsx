import { Suspense } from 'react'
import { RequireAuth } from '@/components/require-auth'
import { TaskBoard } from '@/components/task-board'

export default function BoardPage() {
  return (
    <RequireAuth>
      <Suspense
        fallback={<p className="p-8 text-sm text-muted-foreground">Loading…</p>}
      >
        <TaskBoard />
      </Suspense>
    </RequireAuth>
  )
}
