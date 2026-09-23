'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ExpertEvaluationsTodoPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/expert/evaluations')
  }, [router])

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="animate-pulse space-y-4">
        <div className="h-7 w-64 bg-border rounded-lg" />
      </div>
    </div>
  )
}
