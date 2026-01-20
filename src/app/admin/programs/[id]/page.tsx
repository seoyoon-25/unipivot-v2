import { notFound } from 'next/navigation'
import { getProgram, getProgramParticipants, getProgramSessions, getDepositSetting } from '@/lib/actions/admin'
import ProgramDetailTabs from './ProgramDetailTabs'
import type { ReportStructureCode } from '@/types/report'

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

  // Transform program to match expected type
  const programForTabs = {
    ...program,
    reportStructure: program.reportStructure as ReportStructureCode | null,
  }

  return (
    <ProgramDetailTabs
      program={programForTabs}
      participants={participants}
      sessions={sessions}
      depositSetting={depositSetting}
    />
  )
}
