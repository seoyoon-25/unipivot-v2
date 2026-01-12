import { notFound } from 'next/navigation'
import { getProgram, getProgramParticipants, getProgramSessions, getDepositSetting } from '@/lib/actions/admin'
import ProgramDetailTabs from './ProgramDetailTabs'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProgramDetailPage({ params }: Props) {
  const { id } = await params

  const [program, participants, sessions, depositSetting] = await Promise.all([
    getProgram(id),
    getProgramParticipants(id),
    getProgramSessions(id),
    getDepositSetting(id)
  ])

  if (!program) {
    notFound()
  }

  return (
    <ProgramDetailTabs
      program={program}
      participants={participants}
      sessions={sessions}
      depositSetting={depositSetting}
    />
  )
}
