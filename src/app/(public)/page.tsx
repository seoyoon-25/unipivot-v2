export const dynamic = 'force-dynamic'

import { HeroSection } from '@/components/public/HeroSection'
import { MeaningSection } from '@/components/public/MeaningSection'
import { DonationBanner } from '@/components/public/DonationBanner'
import { KeyProgramsSection } from '@/components/public/KeyProgramsSection'
import { StorySection } from '@/components/public/StorySection'
import { RecentProgramsSection } from '@/components/public/RecentProgramsSection'
import { InstagramFeed } from '@/components/public/InstagramFeed'
import { ResearchLabSection } from '@/components/public/ResearchLabSection'
import { InterestSection } from '@/components/interests'
import { getHomePageData } from '@/lib/actions/public'

export default async function HomePage() {
  let homeData: {
    programs: any[]
    notices: any[]
    stats: {
      members: number
      completedPrograms: number
      totalParticipations: number
    }
  } = {
    programs: [],
    notices: [],
    stats: {
      members: 0,
      completedPrograms: 0,
      totalParticipations: 0
    }
  }

  try {
    homeData = await getHomePageData()
  } catch (error) {
    console.error('Failed to load home page data:', error)
    // 기본값으로 계속 진행
  }

  const { programs, notices, stats } = homeData

  return (
    <>
      <HeroSection stats={stats} />
      <MeaningSection />
      <InterestSection />
      <DonationBanner />
      <KeyProgramsSection />
      <ResearchLabSection />
      <StorySection />
      <RecentProgramsSection programs={programs} />
      <InstagramFeed />
    </>
  )
}
