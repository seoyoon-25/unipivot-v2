import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// 롤백 요청 스키마
const rollbackSchema = z.object({
  historyId: z.string().cuid(),
  rollbackType: z.enum(['SINGLE', 'BATCH', 'RESTORE_POINT']).default('SINGLE'),
  reason: z.string().optional(),
  includeDependencies: z.boolean().default(false)
})

// 권한 확인 함수
async function checkAdminPermission() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: '권한이 없습니다.' }
  }

  return { userId: session.user.id, role: session.user.role }
}

// POST: 변경사항 롤백
export async function POST(request: NextRequest) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = rollbackSchema.parse(body)

    // 변경 이력 조회
    const history = await prisma.changeHistory.findUnique({
      where: { id: validatedData.historyId },
      include: {
        rollbacks: true
      }
    })

    if (!history) {
      return NextResponse.json(
        { error: '변경 이력을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 이미 롤백된 변경사항인지 확인
    if (history.rollbacks.length > 0) {
      return NextResponse.json(
        { error: '이미 롤백된 변경사항입니다.' },
        { status: 400 }
      )
    }

    let affectedEntities: any[] = []
    let rollbackResult: any = {}

    // 엔티티 타입별 롤백 처리
    try {
      switch (history.entityType) {
        case 'SiteSection':
          rollbackResult = await rollbackSiteSection(history)
          break
        case 'SiteSettings':
          rollbackResult = await rollbackSiteSettings(history)
          break
        case 'AnnouncementBanner':
          rollbackResult = await rollbackAnnouncementBanner(history)
          break
        case 'FloatingButton':
          rollbackResult = await rollbackFloatingButton(history)
          break
        case 'SEOSettings':
          rollbackResult = await rollbackSEOSettings(history)
          break
        case 'Popup':
          rollbackResult = await rollbackPopup(history)
          break
        default:
          throw new Error(`지원하지 않는 엔티티 타입: ${history.entityType}`)
      }

      affectedEntities = rollbackResult.affectedEntities || []

    } catch (rollbackError) {
      console.error('Rollback execution error:', rollbackError)
      return NextResponse.json(
        { error: '롤백 실행에 실패했습니다.', details: rollbackError instanceof Error ? rollbackError.message : String(rollbackError) },
        { status: 500 }
      )
    }

    // 롤백 기록 생성
    const rollback = await prisma.rollback.create({
      data: {
        targetHistoryId: validatedData.historyId,
        rollbackType: validatedData.rollbackType,
        affectedEntities: JSON.stringify(affectedEntities),
        userId: userId!,
        reason: validatedData.reason
      }
    })

    return NextResponse.json({
      success: true,
      rollback,
      affectedEntities,
      message: '성공적으로 롤백되었습니다.'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error processing rollback:', error)
    return NextResponse.json(
      { error: '롤백 처리에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// 사이트 섹션 롤백
async function rollbackSiteSection(history: any) {
  const { entityId, action, fullSnapshot, previousValue } = history

  switch (action) {
    case 'CREATE':
      // 생성된 섹션 삭제
      await prisma.siteSection.delete({
        where: { id: entityId }
      })
      return { affectedEntities: [{ type: 'SiteSection', id: entityId, action: 'deleted' }] }

    case 'UPDATE':
      // 이전 상태로 복원
      await prisma.siteSection.update({
        where: { id: entityId },
        data: {
          sectionName: fullSnapshot.sectionName,
          content: fullSnapshot.content,
          isVisible: fullSnapshot.isVisible,
          order: fullSnapshot.order
        }
      })
      return { affectedEntities: [{ type: 'SiteSection', id: entityId, action: 'restored' }] }

    case 'DELETE':
      // 삭제된 섹션 재생성
      await prisma.siteSection.create({
        data: {
          id: entityId,
          sectionKey: fullSnapshot.sectionKey,
          sectionName: fullSnapshot.sectionName,
          content: fullSnapshot.content,
          isVisible: fullSnapshot.isVisible,
          order: fullSnapshot.order
        }
      })
      return { affectedEntities: [{ type: 'SiteSection', id: entityId, action: 'recreated' }] }
  }
}

// 사이트 설정 롤백
async function rollbackSiteSettings(history: any) {
  const { entityId, action, fullSnapshot } = history

  switch (action) {
    case 'CREATE':
      await prisma.siteSettings.delete({
        where: { id: entityId }
      })
      return { affectedEntities: [{ type: 'SiteSettings', id: entityId, action: 'deleted' }] }

    case 'UPDATE':
      await prisma.siteSettings.update({
        where: { id: entityId },
        data: {
          value: fullSnapshot.value,
          category: fullSnapshot.category,
          description: fullSnapshot.description
        }
      })
      return { affectedEntities: [{ type: 'SiteSettings', id: entityId, action: 'restored' }] }

    case 'DELETE':
      await prisma.siteSettings.create({
        data: {
          id: entityId,
          key: fullSnapshot.key,
          value: fullSnapshot.value,
          category: fullSnapshot.category,
          description: fullSnapshot.description
        }
      })
      return { affectedEntities: [{ type: 'SiteSettings', id: entityId, action: 'recreated' }] }
  }
}

// 공지 배너 롤백
async function rollbackAnnouncementBanner(history: any) {
  const { entityId, action, fullSnapshot } = history

  switch (action) {
    case 'CREATE':
      await prisma.announcementBanner.delete({
        where: { id: entityId }
      })
      return { affectedEntities: [{ type: 'AnnouncementBanner', id: entityId, action: 'deleted' }] }

    case 'UPDATE':
      await prisma.announcementBanner.update({
        where: { id: entityId },
        data: {
          title: fullSnapshot.title,
          content: fullSnapshot.content,
          type: fullSnapshot.type,
          backgroundColor: fullSnapshot.backgroundColor,
          textColor: fullSnapshot.textColor,
          isActive: fullSnapshot.isActive,
          startDate: fullSnapshot.startDate ? new Date(fullSnapshot.startDate) : null,
          endDate: fullSnapshot.endDate ? new Date(fullSnapshot.endDate) : null,
          targetPages: fullSnapshot.targetPages,
          excludePages: fullSnapshot.excludePages,
          showCloseButton: fullSnapshot.showCloseButton,
          autoDismiss: fullSnapshot.autoDismiss,
          autoDismissDelay: fullSnapshot.autoDismissDelay,
          position: fullSnapshot.position,
          priority: fullSnapshot.priority
        }
      })
      return { affectedEntities: [{ type: 'AnnouncementBanner', id: entityId, action: 'restored' }] }

    case 'DELETE':
      await prisma.announcementBanner.create({
        data: {
          id: entityId,
          title: fullSnapshot.title,
          content: fullSnapshot.content,
          type: fullSnapshot.type,
          backgroundColor: fullSnapshot.backgroundColor,
          textColor: fullSnapshot.textColor,
          isActive: fullSnapshot.isActive,
          startDate: fullSnapshot.startDate ? new Date(fullSnapshot.startDate) : null,
          endDate: fullSnapshot.endDate ? new Date(fullSnapshot.endDate) : null,
          targetPages: fullSnapshot.targetPages,
          excludePages: fullSnapshot.excludePages,
          showCloseButton: fullSnapshot.showCloseButton,
          autoDismiss: fullSnapshot.autoDismiss,
          autoDismissDelay: fullSnapshot.autoDismissDelay,
          position: fullSnapshot.position,
          priority: fullSnapshot.priority
        }
      })
      return { affectedEntities: [{ type: 'AnnouncementBanner', id: entityId, action: 'recreated' }] }
  }
}

// 플로팅 버튼 롤백
async function rollbackFloatingButton(history: any) {
  const { entityId, action, fullSnapshot } = history

  switch (action) {
    case 'CREATE':
      await prisma.floatingButton.delete({
        where: { id: entityId }
      })
      return { affectedEntities: [{ type: 'FloatingButton', id: entityId, action: 'deleted' }] }

    case 'UPDATE':
      await prisma.floatingButton.update({
        where: { id: entityId },
        data: {
          title: fullSnapshot.title,
          icon: fullSnapshot.icon,
          color: fullSnapshot.color,
          hoverColor: fullSnapshot.hoverColor,
          textColor: fullSnapshot.textColor,
          linkUrl: fullSnapshot.linkUrl,
          openInNewTab: fullSnapshot.openInNewTab,
          position: fullSnapshot.position,
          offsetX: fullSnapshot.offsetX,
          offsetY: fullSnapshot.offsetY,
          size: fullSnapshot.size,
          showLabel: fullSnapshot.showLabel,
          animation: fullSnapshot.animation,
          animationDelay: fullSnapshot.animationDelay,
          showOn: fullSnapshot.showOn,
          scrollThreshold: fullSnapshot.scrollThreshold,
          isScheduled: fullSnapshot.isScheduled,
          startDate: fullSnapshot.startDate ? new Date(fullSnapshot.startDate) : null,
          endDate: fullSnapshot.endDate ? new Date(fullSnapshot.endDate) : null,
          targetPages: fullSnapshot.targetPages,
          targetRoles: fullSnapshot.targetRoles,
          excludePages: fullSnapshot.excludePages,
          isActive: fullSnapshot.isActive,
          priority: fullSnapshot.priority,
          maxDisplayCount: fullSnapshot.maxDisplayCount
        }
      })
      return { affectedEntities: [{ type: 'FloatingButton', id: entityId, action: 'restored' }] }

    case 'DELETE':
      await prisma.floatingButton.create({
        data: {
          id: entityId,
          title: fullSnapshot.title,
          icon: fullSnapshot.icon,
          color: fullSnapshot.color,
          hoverColor: fullSnapshot.hoverColor,
          textColor: fullSnapshot.textColor,
          linkUrl: fullSnapshot.linkUrl,
          openInNewTab: fullSnapshot.openInNewTab,
          position: fullSnapshot.position,
          offsetX: fullSnapshot.offsetX,
          offsetY: fullSnapshot.offsetY,
          size: fullSnapshot.size,
          showLabel: fullSnapshot.showLabel,
          animation: fullSnapshot.animation,
          animationDelay: fullSnapshot.animationDelay,
          showOn: fullSnapshot.showOn,
          scrollThreshold: fullSnapshot.scrollThreshold,
          isScheduled: fullSnapshot.isScheduled,
          startDate: fullSnapshot.startDate ? new Date(fullSnapshot.startDate) : null,
          endDate: fullSnapshot.endDate ? new Date(fullSnapshot.endDate) : null,
          targetPages: fullSnapshot.targetPages,
          targetRoles: fullSnapshot.targetRoles,
          excludePages: fullSnapshot.excludePages,
          isActive: fullSnapshot.isActive,
          priority: fullSnapshot.priority,
          maxDisplayCount: fullSnapshot.maxDisplayCount
        }
      })
      return { affectedEntities: [{ type: 'FloatingButton', id: entityId, action: 'recreated' }] }
  }
}

// SEO 설정 롤백
async function rollbackSEOSettings(history: any) {
  const { entityId, action, fullSnapshot } = history

  switch (action) {
    case 'CREATE':
      await prisma.seoSetting.delete({
        where: { id: entityId }
      })
      return { affectedEntities: [{ type: 'SEOSettings', id: entityId, action: 'deleted' }] }

    case 'UPDATE':
      await prisma.seoSetting.update({
        where: { id: entityId },
        data: {
          pageKey: fullSnapshot.pageKey,
          pageName: fullSnapshot.pageName,
          title: fullSnapshot.title,
          description: fullSnapshot.description,
          keywords: fullSnapshot.keywords,
          canonical: fullSnapshot.canonical,
          ogTitle: fullSnapshot.ogTitle,
          ogDescription: fullSnapshot.ogDescription,
          ogImage: fullSnapshot.ogImage,
          ogImageAlt: fullSnapshot.ogImageAlt,
          ogType: fullSnapshot.ogType,
          ogUrl: fullSnapshot.ogUrl,
          twitterCard: fullSnapshot.twitterCard,
          twitterTitle: fullSnapshot.twitterTitle,
          twitterDescription: fullSnapshot.twitterDescription,
          twitterImage: fullSnapshot.twitterImage,
          twitterImageAlt: fullSnapshot.twitterImageAlt,
          twitterSite: fullSnapshot.twitterSite,
          twitterCreator: fullSnapshot.twitterCreator,
          schemaType: fullSnapshot.schemaType,
          schemaData: fullSnapshot.schemaData,
          customHead: fullSnapshot.customHead,
          robots: fullSnapshot.robots,
          isActive: fullSnapshot.isActive,
          priority: fullSnapshot.priority
        }
      })
      return { affectedEntities: [{ type: 'SEOSettings', id: entityId, action: 'restored' }] }

    case 'DELETE':
      await prisma.seoSetting.create({
        data: {
          id: entityId,
          pageKey: fullSnapshot.pageKey,
          pageName: fullSnapshot.pageName,
          title: fullSnapshot.title,
          description: fullSnapshot.description,
          keywords: fullSnapshot.keywords,
          canonical: fullSnapshot.canonical,
          ogTitle: fullSnapshot.ogTitle,
          ogDescription: fullSnapshot.ogDescription,
          ogImage: fullSnapshot.ogImage,
          ogImageAlt: fullSnapshot.ogImageAlt,
          ogType: fullSnapshot.ogType,
          ogUrl: fullSnapshot.ogUrl,
          twitterCard: fullSnapshot.twitterCard,
          twitterTitle: fullSnapshot.twitterTitle,
          twitterDescription: fullSnapshot.twitterDescription,
          twitterImage: fullSnapshot.twitterImage,
          twitterImageAlt: fullSnapshot.twitterImageAlt,
          twitterSite: fullSnapshot.twitterSite,
          twitterCreator: fullSnapshot.twitterCreator,
          schemaType: fullSnapshot.schemaType,
          schemaData: fullSnapshot.schemaData,
          customHead: fullSnapshot.customHead,
          robots: fullSnapshot.robots,
          isActive: fullSnapshot.isActive,
          priority: fullSnapshot.priority
        }
      })
      return { affectedEntities: [{ type: 'SEOSettings', id: entityId, action: 'recreated' }] }
  }
}

// 팝업 롤백
async function rollbackPopup(history: any) {
  const { entityId, action, fullSnapshot } = history

  switch (action) {
    case 'CREATE':
      await prisma.popup.delete({
        where: { id: entityId }
      })
      return { affectedEntities: [{ type: 'Popup', id: entityId, action: 'deleted' }] }

    case 'UPDATE':
      await prisma.popup.update({
        where: { id: entityId },
        data: {
          title: fullSnapshot.title,
          content: fullSnapshot.content,
          trigger: fullSnapshot.trigger,
          triggerValue: fullSnapshot.triggerValue,
          triggerSelector: fullSnapshot.triggerSelector,
          isActive: fullSnapshot.isActive,
          templateId: fullSnapshot.templateId,
          targetPages: fullSnapshot.targetPages,
          excludePages: fullSnapshot.excludePages,
          showOn: fullSnapshot.showOn,
          priority: fullSnapshot.priority,
          showTimeSlots: fullSnapshot.showTimeSlots,
          showOncePerSession: fullSnapshot.showOncePerSession,
          showOncePerUser: fullSnapshot.showOncePerUser,
          maxDisplayPerDay: fullSnapshot.maxDisplayPerDay,
          delayBetweenShows: fullSnapshot.delayBetweenShows,
          showAfterDate: fullSnapshot.showAfterDate ? new Date(fullSnapshot.showAfterDate) : null,
          showUntilDate: fullSnapshot.showUntilDate ? new Date(fullSnapshot.showUntilDate) : null,
          showCloseButton: fullSnapshot.showCloseButton,
          closeOnOverlay: fullSnapshot.closeOnOverlay,
          closeOnEscape: fullSnapshot.closeOnEscape,
          autoClose: fullSnapshot.autoClose,
          autoCloseDelay: fullSnapshot.autoCloseDelay,
          primaryButton: fullSnapshot.primaryButton,
          secondaryButton: fullSnapshot.secondaryButton,
          customCss: fullSnapshot.customCss
        }
      })
      return { affectedEntities: [{ type: 'Popup', id: entityId, action: 'restored' }] }

    case 'DELETE':
      await prisma.popup.create({
        data: {
          id: entityId,
          title: fullSnapshot.title,
          content: fullSnapshot.content,
          trigger: fullSnapshot.trigger,
          triggerValue: fullSnapshot.triggerValue,
          triggerSelector: fullSnapshot.triggerSelector,
          isActive: fullSnapshot.isActive,
          templateId: fullSnapshot.templateId,
          targetPages: fullSnapshot.targetPages,
          excludePages: fullSnapshot.excludePages,
          showOn: fullSnapshot.showOn,
          priority: fullSnapshot.priority,
          showTimeSlots: fullSnapshot.showTimeSlots,
          showOncePerSession: fullSnapshot.showOncePerSession,
          showOncePerUser: fullSnapshot.showOncePerUser,
          maxDisplayPerDay: fullSnapshot.maxDisplayPerDay,
          delayBetweenShows: fullSnapshot.delayBetweenShows,
          showAfterDate: fullSnapshot.showAfterDate ? new Date(fullSnapshot.showAfterDate) : null,
          showUntilDate: fullSnapshot.showUntilDate ? new Date(fullSnapshot.showUntilDate) : null,
          showCloseButton: fullSnapshot.showCloseButton,
          closeOnOverlay: fullSnapshot.closeOnOverlay,
          closeOnEscape: fullSnapshot.closeOnEscape,
          autoClose: fullSnapshot.autoClose,
          autoCloseDelay: fullSnapshot.autoCloseDelay,
          primaryButton: fullSnapshot.primaryButton,
          secondaryButton: fullSnapshot.secondaryButton,
          customCss: fullSnapshot.customCss
        }
      })
      return { affectedEntities: [{ type: 'Popup', id: entityId, action: 'recreated' }] }
  }
}