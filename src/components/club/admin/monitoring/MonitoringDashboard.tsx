'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Database,
  Cpu,
  Clock,
  RefreshCw,
  Users,
  BookOpen,
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react'

interface HealthData {
  status: string
  timestamp: string
  version: string
  services: Record<string, { status: string; latency?: number; detail?: string }>
}

interface MetricsData {
  timestamp: string
  users: { total: number; today: number; members: number }
  programs: { active: number; total: number }
  activity: { reportsToday: number; reportsTotal: number; attendancesToday: number }
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'ok') return <CheckCircle className="w-5 h-5 text-green-500" />
  if (status === 'warning') return <AlertTriangle className="w-5 h-5 text-amber-500" />
  return <XCircle className="w-5 h-5 text-red-500" />
}

function ServiceIcon({ name }: { name: string }) {
  if (name === 'database') return <Database className="w-5 h-5 text-blue-500" />
  if (name === 'memory') return <Cpu className="w-5 h-5 text-purple-500" />
  return <Clock className="w-5 h-5 text-gray-500" />
}

export default function MonitoringDashboard({
  initialHealth,
  initialMetrics,
}: {
  initialHealth: HealthData | null
  initialMetrics: MetricsData | null
}) {
  const [health, setHealth] = useState<HealthData | null>(initialHealth)
  const [metrics, setMetrics] = useState<MetricsData | null>(initialMetrics)
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [healthRes, metricsRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/monitoring/metrics'),
      ])
      if (healthRes.ok) setHealth(await healthRes.json())
      if (metricsRes.ok) setMetrics(await metricsRes.json())
      setLastRefresh(new Date())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(refresh, 60_000)
    return () => clearInterval(interval)
  }, [refresh])

  const statusColor =
    health?.status === 'ok'
      ? 'bg-green-100 text-green-800 border-green-200'
      : health?.status === 'degraded'
        ? 'bg-amber-100 text-amber-800 border-amber-200'
        : 'bg-red-100 text-red-800 border-red-200'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">시스템 모니터링</h1>
          <p className="text-sm text-gray-500 mt-1">
            마지막 갱신: {lastRefresh.toLocaleTimeString('ko-KR')}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </button>
      </div>

      {/* System Status Banner */}
      {health && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${statusColor}`}>
          <StatusIcon status={health.status} />
          <span className="font-medium">
            {health.status === 'ok'
              ? '모든 시스템 정상 작동 중'
              : health.status === 'degraded'
                ? '일부 서비스 성능 저하'
                : '시스템 오류 감지'}
          </span>
          <span className="ml-auto text-sm">v{health.version}</span>
        </div>
      )}

      {/* Service Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {health &&
          Object.entries(health.services).map(([name, service]) => (
            <div
              key={name}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ServiceIcon name={name} />
                  <span className="font-medium text-gray-900 capitalize">
                    {name === 'database'
                      ? '데이터베이스'
                      : name === 'memory'
                        ? '메모리'
                        : name === 'uptime'
                          ? '업타임'
                          : name}
                  </span>
                </div>
                <StatusIcon status={service.status} />
              </div>
              {service.latency !== undefined && (
                <p className="text-2xl font-bold text-gray-900">
                  {name === 'database'
                    ? `${service.latency}ms`
                    : name === 'memory'
                      ? `${service.latency}MB`
                      : `${Math.floor(service.latency / 3600)}h ${Math.floor((service.latency % 3600) / 60)}m`}
                </p>
              )}
              {service.detail && (
                <p className="text-sm text-gray-500 mt-1">{service.detail}</p>
              )}
            </div>
          ))}
      </div>

      {/* Metrics */}
      {metrics && (
        <>
          <h2 className="text-lg font-semibold text-gray-900">활동 메트릭</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              icon={Users}
              label="전체 사용자"
              value={metrics.users.total}
              sub={`오늘 +${metrics.users.today}`}
              color="blue"
            />
            <MetricCard
              icon={Users}
              label="클럽 회원"
              value={metrics.users.members}
              color="indigo"
            />
            <MetricCard
              icon={BookOpen}
              label="진행 중 프로그램"
              value={metrics.programs.active}
              sub={`전체 ${metrics.programs.total}`}
              color="green"
            />
            <MetricCard
              icon={FileText}
              label="오늘 독후감"
              value={metrics.activity.reportsToday}
              sub={`전체 ${metrics.activity.reportsTotal}`}
              color="amber"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-medium text-gray-900 mb-3">오늘 활동 요약</h3>
              <div className="space-y-3">
                <ActivityRow label="신규 사용자" value={metrics.users.today} />
                <ActivityRow label="독후감 작성" value={metrics.activity.reportsToday} />
                <ActivityRow label="출석 체크" value={metrics.activity.attendancesToday} />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-medium text-gray-900 mb-3">시스템 정보</h3>
              <div className="space-y-3">
                <InfoRow label="환경" value={process.env.NODE_ENV === 'production' ? '프로덕션' : '개발'} />
                <InfoRow label="타임스탬프" value={new Date(metrics.timestamp).toLocaleString('ko-KR')} />
                {health && <InfoRow label="버전" value={`v${health.version}`} />}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  sub?: string
  color: string
}) {
  const bgMap: Record<string, string> = {
    blue: 'bg-blue-50',
    indigo: 'bg-indigo-50',
    green: 'bg-green-50',
    amber: 'bg-amber-50',
  }
  const iconMap: Record<string, string> = {
    blue: 'text-blue-600',
    indigo: 'text-indigo-600',
    green: 'text-green-600',
    amber: 'text-amber-600',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={`inline-flex p-2 rounded-lg ${bgMap[color] || 'bg-gray-50'} mb-3`}>
        <Icon className={`w-5 h-5 ${iconMap[color] || 'text-gray-600'}`} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function ActivityRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value.toLocaleString()}</span>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  )
}
