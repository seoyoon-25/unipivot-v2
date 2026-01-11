import { notFound } from 'next/navigation'
import { getProgram } from '@/lib/actions/admin'
import ProgramDetail from './ProgramDetail'

interface Props {
  params: { id: string }
}

export default async function ProgramDetailPage({ params }: Props) {
  const program = await getProgram(params.id)

  if (!program) {
    notFound()
  }

  return <ProgramDetail program={program} />
}
