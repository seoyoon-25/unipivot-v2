import { notFound } from 'next/navigation'
import { getMember } from '@/lib/actions/admin'
import MemberDetail from './MemberDetail'

interface Props {
  params: { id: string }
}

export default async function MemberDetailPage({ params }: Props) {
  const member = await getMember(params.id)

  if (!member) {
    notFound()
  }

  return <MemberDetail member={member} />
}
