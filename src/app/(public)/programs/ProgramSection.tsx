import { ProgramCard } from '@/components/public/ProgramCard';

interface Program {
  id: string;
  title: string;
  slug: string;
  type: string;
  description?: string | null;
  image?: string | null;
  thumbnailSquare?: string | null;
  isOnline: boolean;
  feeType: string;
  feeAmount: number;
  status?: string | null;
  recruitStartDate?: Date | null;
  recruitEndDate?: Date | null;
  startDate?: Date | null;
  endDate?: Date | null;
  likeCount?: number;
  applicationCount?: number;
}

interface ProgramSectionProps {
  title: string;
  emoji: string;
  programs: Program[];
  emptyMessage: string;
  showAll?: boolean;
  userLikes?: Set<string>;
  userApplications?: Set<string>;
}

export default function ProgramSection({
  title,
  emoji,
  programs,
  emptyMessage,
  showAll = false,
  userLikes = new Set(),
  userApplications = new Set(),
}: ProgramSectionProps) {
  if (programs.length === 0) {
    return (
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">{emoji}</span>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <span className="text-sm text-gray-500">(0)</span>
        </div>
        <div className="bg-white rounded-xl p-8 text-center text-gray-500">
          {emptyMessage}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">{emoji}</span>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <span className="text-sm text-gray-500">({programs.length})</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((program) => (
          <ProgramCard
            key={program.id}
            id={program.id}
            title={program.title}
            slug={program.slug}
            type={program.type}
            description={program.description}
            image={program.image}
            thumbnailSquare={program.thumbnailSquare}
            isOnline={program.isOnline}
            feeType={program.feeType}
            feeAmount={program.feeAmount}
            status={program.status || undefined}
            recruitStartDate={program.recruitStartDate}
            recruitEndDate={program.recruitEndDate}
            startDate={program.startDate}
            endDate={program.endDate}
            likeCount={program.likeCount}
            applicationCount={program.applicationCount}
            isLiked={userLikes.has(program.id)}
            hasApplied={userApplications.has(program.id)}
          />
        ))}
      </div>
    </section>
  );
}
