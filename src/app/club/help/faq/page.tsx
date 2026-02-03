import { faqItems } from '@/data/help-content'
import HelpBreadcrumb from '@/components/club/help/HelpBreadcrumb'
import FaqAccordion from '@/components/club/help/FaqAccordion'

export const metadata = { title: 'FAQ | 도움말 | 유니클럽' }

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <HelpBreadcrumb current="자주 묻는 질문" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">자주 묻는 질문</h1>
      <p className="text-gray-500 mb-8">
        궁금한 내용을 찾아보세요. 원하는 답변이 없다면 관리자에게 문의해 주세요.
      </p>

      <div className="space-y-8">
        {faqItems.map((category) => (
          <section key={category.category}>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-sm">
                {category.category}
              </span>
            </h2>
            <FaqAccordion questions={category.questions} />
          </section>
        ))}
      </div>
    </div>
  )
}
