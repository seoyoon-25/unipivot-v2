import { prisma } from '@/lib/db'

// 변경 추적 옵션
interface TrackChangeOptions {
  entityType: string
  entityId: string
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  userId: string
  fieldName?: string
  previousValue?: any
  newValue?: any
  fullSnapshot: any
  description?: string
  isAutoSave?: boolean
  ipAddress?: string
  userAgent?: string
}

// 변경 사항 추적 함수
export async function trackChange(options: TrackChangeOptions) {
  try {
    await prisma.changeHistory.create({
      data: {
        entityType: options.entityType,
        entityId: options.entityId,
        action: options.action,
        fieldName: options.fieldName,
        previousValue: options.previousValue,
        newValue: options.newValue,
        fullSnapshot: options.fullSnapshot,
        userId: options.userId,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        description: options.description,
        isAutoSave: options.isAutoSave || false
      }
    })
  } catch (error) {
    console.error('Error tracking change:', error)
    // 변경 추적 실패는 원본 작업을 방해하지 않도록 에러를 던지지 않음
  }
}

// 엔티티별 변경 추적 헬퍼 함수들

// 사이트 섹션 변경 추적
export async function trackSiteSectionChange(
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  entityId: string,
  userId: string,
  fullSnapshot: any,
  previousSnapshot?: any,
  options?: Partial<TrackChangeOptions>
) {
  await trackChange({
    entityType: 'SiteSection',
    entityId,
    action,
    userId,
    fullSnapshot,
    previousValue: previousSnapshot,
    newValue: fullSnapshot,
    description: options?.description || `사이트 섹션 ${getActionLabel(action)}`,
    ...options
  })
}

// 사이트 설정 변경 추적
export async function trackSiteSettingsChange(
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  entityId: string,
  userId: string,
  fullSnapshot: any,
  previousSnapshot?: any,
  options?: Partial<TrackChangeOptions>
) {
  await trackChange({
    entityType: 'SiteSettings',
    entityId,
    action,
    userId,
    fullSnapshot,
    previousValue: previousSnapshot,
    newValue: fullSnapshot,
    description: options?.description || `사이트 설정 ${getActionLabel(action)}`,
    ...options
  })
}

// 공지 배너 변경 추적
export async function trackAnnouncementBannerChange(
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  entityId: string,
  userId: string,
  fullSnapshot: any,
  previousSnapshot?: any,
  options?: Partial<TrackChangeOptions>
) {
  await trackChange({
    entityType: 'AnnouncementBanner',
    entityId,
    action,
    userId,
    fullSnapshot,
    previousValue: previousSnapshot,
    newValue: fullSnapshot,
    description: options?.description || `공지 배너 ${getActionLabel(action)}`,
    ...options
  })
}

// 플로팅 버튼 변경 추적
export async function trackFloatingButtonChange(
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  entityId: string,
  userId: string,
  fullSnapshot: any,
  previousSnapshot?: any,
  options?: Partial<TrackChangeOptions>
) {
  await trackChange({
    entityType: 'FloatingButton',
    entityId,
    action,
    userId,
    fullSnapshot,
    previousValue: previousSnapshot,
    newValue: fullSnapshot,
    description: options?.description || `플로팅 버튼 ${getActionLabel(action)}`,
    ...options
  })
}

// SEO 설정 변경 추적
export async function trackSEOSettingsChange(
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  entityId: string,
  userId: string,
  fullSnapshot: any,
  previousSnapshot?: any,
  options?: Partial<TrackChangeOptions>
) {
  await trackChange({
    entityType: 'SEOSettings',
    entityId,
    action,
    userId,
    fullSnapshot,
    previousValue: previousSnapshot,
    newValue: fullSnapshot,
    description: options?.description || `SEO 설정 ${getActionLabel(action)}`,
    ...options
  })
}

// 팝업 변경 추적
export async function trackPopupChange(
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  entityId: string,
  userId: string,
  fullSnapshot: any,
  previousSnapshot?: any,
  options?: Partial<TrackChangeOptions>
) {
  await trackChange({
    entityType: 'Popup',
    entityId,
    action,
    userId,
    fullSnapshot,
    previousValue: previousSnapshot,
    newValue: fullSnapshot,
    description: options?.description || `팝업 ${getActionLabel(action)}`,
    ...options
  })
}

// 팝업 템플릿 변경 추적
export async function trackPopupTemplateChange(
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  entityId: string,
  userId: string,
  fullSnapshot: any,
  previousSnapshot?: any,
  options?: Partial<TrackChangeOptions>
) {
  await trackChange({
    entityType: 'PopupTemplate',
    entityId,
    action,
    userId,
    fullSnapshot,
    previousValue: previousSnapshot,
    newValue: fullSnapshot,
    description: options?.description || `팝업 템플릿 ${getActionLabel(action)}`,
    ...options
  })
}

// 액션 라벨 헬퍼
function getActionLabel(action: string): string {
  switch (action) {
    case 'CREATE': return '생성'
    case 'UPDATE': return '수정'
    case 'DELETE': return '삭제'
    default: return action
  }
}

// 자동 백업 관리
export async function createAutoBackup(entityType: string, reason: string, userId: string) {
  try {
    // 기존 자동 백업 설정 확인
    const backupConfig = await prisma.backupConfig.findUnique({
      where: { entityType }
    })

    if (!backupConfig?.enableAutoBackup) {
      return
    }

    // 최근 백업 확인
    const lastBackup = await prisma.restorePoint.findFirst({
      where: {
        isAutomatic: true,
        userId
      },
      orderBy: { createdAt: 'desc' }
    })

    const now = new Date()
    const shouldCreateBackup = !lastBackup ||
      (now.getTime() - new Date(lastBackup.createdAt).getTime()) > (backupConfig.backupInterval * 60 * 60 * 1000)

    if (shouldCreateBackup) {
      // 전체 사이트 스냅샷 생성
      const [
        sections,
        settings,
        banners,
        floatingButtons,
        seoSettings,
        popups,
        popupTemplates
      ] = await Promise.all([
        prisma.siteSection.findMany(),
        prisma.siteSettings.findMany(),
        prisma.announcementBanner.findMany(),
        prisma.floatingButton.findMany(),
        prisma.seoSetting.findMany(),
        prisma.popup.findMany({ include: { template: true } }),
        prisma.popupTemplate.findMany()
      ])

      const snapshot = {
        timestamp: now.toISOString(),
        sections,
        settings,
        banners,
        floatingButtons,
        seoSettings,
        popups,
        popupTemplates
      }

      // 자동 백업 생성
      await prisma.restorePoint.create({
        data: {
          name: `자동 백업 - ${now.toLocaleString()}`,
          description: reason,
          snapshot: JSON.stringify(snapshot),
          userId,
          isAutomatic: true
        }
      })

      // 오래된 백업 정리
      await cleanupOldBackups(backupConfig)
    }
  } catch (error) {
    console.error('Error creating auto backup:', error)
  }
}

// 오래된 백업 정리
async function cleanupOldBackups(config: any) {
  try {
    if (!config.autoCleanup) return

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - config.retentionDays)

    // 오래된 자동 백업 삭제
    await prisma.restorePoint.deleteMany({
      where: {
        isAutomatic: true,
        createdAt: { lt: cutoffDate }
      }
    })

    // 최대 버전 수 초과 시 오래된 순으로 삭제
    const totalBackups = await prisma.restorePoint.count({
      where: { isAutomatic: true }
    })

    if (totalBackups > config.maxVersions) {
      const excessCount = totalBackups - config.maxVersions
      const oldestBackups = await prisma.restorePoint.findMany({
        where: { isAutomatic: true },
        orderBy: { createdAt: 'asc' },
        take: excessCount,
        select: { id: true }
      })

      await prisma.restorePoint.deleteMany({
        where: {
          id: { in: oldestBackups.map(b => b.id) }
        }
      })
    }
  } catch (error) {
    console.error('Error cleaning up old backups:', error)
  }
}

// 변경 추적과 함께 데이터베이스 작업을 수행하는 헬퍼
export async function withChangeTracking<T>(
  operation: () => Promise<T>,
  trackingOptions: TrackChangeOptions
): Promise<T> {
  try {
    // 원본 작업 실행
    const result = await operation()

    // 성공 시 변경 추적
    await trackChange(trackingOptions)

    // 자동 백업 트리거 (필요시)
    if (!trackingOptions.isAutoSave) {
      await createAutoBackup(
        trackingOptions.entityType,
        trackingOptions.description || '데이터 변경',
        trackingOptions.userId
      )
    }

    return result
  } catch (error) {
    console.error('Operation failed:', error)
    throw error
  }
}

// 필드별 변경 사항 비교
export function compareObjects(previous: any, current: any): Array<{
  field: string
  previousValue: any
  newValue: any
}> {
  const changes: Array<{ field: string; previousValue: any; newValue: any }> = []

  if (!previous || !current) return changes

  const allKeys = new Set([
    ...Object.keys(previous || {}),
    ...Object.keys(current || {})
  ])

  for (const key of Array.from(allKeys)) {
    const prevValue = previous[key]
    const currValue = current[key]

    // 깊은 비교 (간단한 JSON 비교)
    if (JSON.stringify(prevValue) !== JSON.stringify(currValue)) {
      changes.push({
        field: key,
        previousValue: prevValue,
        newValue: currValue
      })
    }
  }

  return changes
}