import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { getRSVPById } from '@/lib/actions/rsvp'
import { RSVPResponseForm } from '@/components/rsvp/RSVPResponseForm'

interface RSVPResponsePageProps {
  params: Promise<{ rsvpId: string }>
}

async function RSVPContent({ rsvpId }: { rsvpId: string }) {
  const rsvp = await getRSVPById(rsvpId)

  if (!rsvp) {
    notFound()
  }

  return (
    <RSVPResponseForm
      rsvpId={rsvp.id}
      userId={rsvp.userId}
      currentStatus={rsvp.status as any}
      currentNote={rsvp.note}
      respondedAt={rsvp.respondedAt}
      session={{
        id: rsvp.session.id,
        title: rsvp.session.title,
        date: rsvp.session.date,
        location: rsvp.session.location,
        program: rsvp.session.program,
      }}
    />
  )
}

export default async function RSVPResponsePage({ params }: RSVPResponsePageProps) {
  const { rsvpId } = await params

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <RSVPContent rsvpId={rsvpId} />
    </Suspense>
  )
}
