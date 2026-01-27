'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { ProgramForm } from '@/components/admin/programs'

interface Program {
  id: string
  slug: string
  title: string
  type: string
  description: string
  content: string
  scheduleContent: string
  currentBookContent: string
  capacity: number
  feeType: string
  feeAmount: number
  location: string
  isOnline: boolean
  status: string
  image: string
  thumbnailSquare: string
  recruitStartDate: string
  recruitEndDate: string
  startDate: string
  endDate: string
  sessions?: any[]
}

export default function EditProgramPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const res = await fetch(`/api/admin/programs/${id}`)
        if (!res.ok) {
          if (res.status === 403) {
            throw new Error('권한이 없습니다.')
          }
          if (res.status === 404) {
            throw new Error('프로그램을 찾을 수 없습니다.')
          }
          throw new Error('프로그램을 불러올 수 없습니다.')
        }

        const data = await res.json()
        setProgram(data)
      } catch (error: any) {
        setError(error.message || '프로그램을 불러올 수 없습니다.')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProgram()
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => router.push('/admin/programs')}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          프로그램 목록으로 돌아가기
        </button>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-gray-500">프로그램을 찾을 수 없습니다.</p>
        <button
          onClick={() => router.push('/admin/programs')}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          프로그램 목록으로 돌아가기
        </button>
      </div>
    )
  }

  return <ProgramForm program={program} />
}
