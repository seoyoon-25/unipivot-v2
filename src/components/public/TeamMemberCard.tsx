import Image from 'next/image';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  position?: string | null;
  photo?: string | null;
  programs?: string | null;
  introduction?: string | null;
  period?: string | null;
}

interface TeamMemberCardProps {
  member: TeamMember;
  compact?: boolean;
}

export default function TeamMemberCard({ member, compact = false }: TeamMemberCardProps) {
  const programs = member.programs ? JSON.parse(member.programs) as string[] : [];

  if (compact) {
    // 역대 운영진용 간단한 카드
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
            {member.photo ? (
              <Image
                src={member.photo}
                alt={member.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-medium">
                {member.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{member.name}</h3>
            {member.period && (
              <p className="text-sm text-gray-500">{member.period}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 운영진/자문위원용 상세 카드
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
      {/* 사진 */}
      <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden mx-auto mb-4">
        {member.photo ? (
          <Image
            src={member.photo}
            alt={member.name}
            width={128}
            height={128}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl font-medium">
            {member.name.charAt(0)}
          </div>
        )}
      </div>

      {/* 이름 & 직책 */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
        {member.position && (
          <p className="text-orange-500 font-medium">{member.position}</p>
        )}
      </div>

      {/* 참여 프로그램 */}
      {programs.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {programs.map((program, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-orange-50 text-orange-600 text-sm rounded-full"
            >
              {program}
            </span>
          ))}
        </div>
      )}

      {/* 한줄 소개 */}
      {member.introduction && (
        <p className="text-center text-gray-600 text-sm leading-relaxed">
          &ldquo;{member.introduction}&rdquo;
        </p>
      )}
    </div>
  );
}
