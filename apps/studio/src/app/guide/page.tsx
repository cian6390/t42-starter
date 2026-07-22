import { DeveloperGuide } from '@/components/developer-guide'
import { RequireAuth } from '@/components/require-auth'

export default function GuidePage() {
  return (
    <RequireAuth>
      <DeveloperGuide />
    </RequireAuth>
  )
}
