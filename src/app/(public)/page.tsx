export const dynamic = 'force-dynamic'

import { HeroSection } from '@/components/public/HeroSection'
import { MeaningSection } from '@/components/public/MeaningSection'
import { DonationBanner } from '@/components/public/DonationBanner'
import { KeyProgramsSection } from '@/components/public/KeyProgramsSection'
import { StorySection } from '@/components/public/StorySection'
import { RecentProgramsSection } from '@/components/public/RecentProgramsSection'
import { InstagramFeed } from '@/components/public/InstagramFeed'
import { getHomePageData } from '@/lib/actions/public'

export default async function HomePage() {
  const { programs, notices, stats } = await getHomePageData()

  return (
    <>
      <HeroSection stats={stats} />
      <MeaningSection />
      <DonationBanner />
      <KeyProgramsSection />
      <StorySection />
      <RecentProgramsSection programs={programs} />
      <InstagramFeed />
    </>
  )
}
