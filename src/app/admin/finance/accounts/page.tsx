import { getFinanceAccounts } from '@/lib/actions/admin'

export default async function AccountsPage() {
  const accounts = await getFinanceAccounts()

  // 타입별로 그룹화
  const groupedAccounts = accounts.reduce((acc, account) => {
    const type = account.type
    if (!acc[type]) acc[type] = []
    acc[type].push(account)
    return acc
  }, {} as Record<string, typeof accounts>)

  const typeLabels: Record<string, string> = {
    'INCOME': '수입',
    'EXPENSE': '지출',
    'ASSET': '자산',
    'LIABILITY': '부채'
  }

  const typeColors: Record<string, string> = {
    'INCOME': 'bg-green-100 text-green-800',
    'EXPENSE': 'bg-red-100 text-red-800',
    'ASSET': 'bg-blue-100 text-blue-800',
    'LIABILITY': 'bg-yellow-100 text-yellow-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">계정과목</h1>
          <p className="text-gray-600">비영리법인 표준 계정과목 ({accounts.length}개)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(groupedAccounts).map(([type, typeAccounts]) => (
          <div key={type} className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                {typeLabels[type] || type} 계정
              </h2>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[type]}`}>
                {typeAccounts.length}개
              </span>
            </div>
            <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
              {typeAccounts.map((account) => (
                <div key={account.id} className="p-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-mono text-gray-500 mr-2">
                        {account.code}
                      </span>
                      <span className="font-medium text-gray-900">
                        {account.name}
                      </span>
                    </div>
                    {account.isSystem && (
                      <span className="text-xs text-gray-400">시스템</span>
                    )}
                  </div>
                  {account.category && (
                    <p className="text-xs text-gray-500 mt-1">
                      {account.category}
                      {account.subcategory && ` > ${account.subcategory}`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>안내:</strong> 계정과목은 비영리법인 회계기준에 따른 표준 과목입니다.
          추가 계정이 필요한 경우 관리자에게 문의하세요.
        </p>
      </div>
    </div>
  )
}
