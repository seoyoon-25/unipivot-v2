import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// 복원 실행 스키마
const restoreSchema = z.object({
  confirmRestore: z.boolean(),
  entities: z.array(z.string()).optional() // 특정 엔티티만 복원 (선택적)
})

// 권한 확인 함수
async function checkAdminPermission() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: '권한이 없습니다.' }
  }

  return { userId: session.user.id, role: session.user.role }
}

// 전체 복원 실행
async function executeFullRestore(snapshot: any, userId: string) {
  const affectedEntities: any[] = []

  try {
    // 트랜잭션으로 전체 복원 실행
    await prisma.$transaction(async (tx) => {
      // 1. 기존 데이터 백업 (현재 상태를 임시 복원 지점으로 저장)
      const currentSnapshot = await createCurrentSnapshot(tx)
      await tx.restorePoint.create({
        data: {
          name: `자동 백업 - ${new Date().toLocaleString()}`,
          description: '복원 실행 전 자동 백업',
          snapshot: JSON.stringify(currentSnapshot),
          userId,
          isAutomatic: true
        }
      })

      // 2. 기존 데이터 삭제
      await tx.siteSection.deleteMany({})
      await tx.siteSettings.deleteMany({})
      await tx.announcementBanner.deleteMany({})
      await tx.floatingButton.deleteMany({})
      await tx.seoSetting.deleteMany({})
      await tx.popup.deleteMany({})
      await tx.popupTemplate.deleteMany({})

      // 3. 스냅샷 데이터 복원
      if (snapshot.sections?.length) {
        await tx.siteSection.createMany({
          data: snapshot.sections.map((section: any) => ({
            id: section.id,
            sectionKey: section.sectionKey,
            sectionName: section.sectionName,
            content: section.content,
            isVisible: section.isVisible,
            order: section.order
          }))
        })
        affectedEntities.push(...snapshot.sections.map((s: any) => ({ type: 'SiteSection', id: s.id })))
      }

      if (snapshot.settings?.length) {
        await tx.siteSettings.createMany({
          data: snapshot.settings.map((setting: any) => ({
            id: setting.id,
            key: setting.key,
            value: setting.value,
            category: setting.category,
            description: setting.description
          }))
        })
        affectedEntities.push(...snapshot.settings.map((s: any) => ({ type: 'SiteSettings', id: s.id })))
      }

      if (snapshot.banners?.length) {
        await tx.announcementBanner.createMany({
          data: snapshot.banners.map((banner: any) => ({
            id: banner.id,
            title: banner.title,
            content: banner.content,
            type: banner.type,
            backgroundColor: banner.backgroundColor,
            textColor: banner.textColor,
            isActive: banner.isActive,
            startDate: banner.startDate ? new Date(banner.startDate) : null,
            endDate: banner.endDate ? new Date(banner.endDate) : null,
            targetPages: banner.targetPages,
            excludePages: banner.excludePages,
            showCloseButton: banner.showCloseButton,
            autoHide: banner.autoHide,
            autoHideDelay: banner.autoHideDelay,
            position: banner.position,
            priority: banner.priority
          }))
        })
        affectedEntities.push(...snapshot.banners.map((b: any) => ({ type: 'AnnouncementBanner', id: b.id })))
      }

      if (snapshot.floatingButtons?.length) {
        await tx.floatingButton.createMany({
          data: snapshot.floatingButtons.map((button: any) => ({
            id: button.id,
            text: button.text,
            icon: button.icon,
            actionType: button.actionType,
            actionUrl: button.actionUrl,
            position: button.position,
            backgroundColor: button.backgroundColor,
            textColor: button.textColor,
            size: button.size,
            isActive: button.isActive,
            startDate: button.startDate ? new Date(button.startDate) : null,
            endDate: button.endDate ? new Date(button.endDate) : null,
            targetPages: button.targetPages,
            excludePages: button.excludePages,
            showOn: button.showOn
          }))
        })
        affectedEntities.push(...snapshot.floatingButtons.map((b: any) => ({ type: 'FloatingButton', id: b.id })))
      }

      if (snapshot.seoSettings?.length) {
        await tx.seoSetting.createMany({
          data: snapshot.seoSettings.map((seo: any) => ({
            id: seo.id,
            pageKey: seo.pageKey,
            pageTitle: seo.pageTitle,
            metaDescription: seo.metaDescription,
            metaKeywords: seo.metaKeywords,
            ogTitle: seo.ogTitle,
            ogDescription: seo.ogDescription,
            ogImage: seo.ogImage,
            twitterCard: seo.twitterCard,
            canonicalUrl: seo.canonicalUrl,
            noindex: seo.noindex,
            nofollow: seo.nofollow,
            structuredData: seo.structuredData
          }))
        })
        affectedEntities.push(...snapshot.seoSettings.map((s: any) => ({ type: 'SEOSettings', id: s.id })))
      }

      if (snapshot.popupTemplates?.length) {
        await tx.popupTemplate.createMany({
          data: snapshot.popupTemplates.map((template: any) => ({
            id: template.id,
            name: template.name,
            category: template.category,
            width: template.width,
            height: template.height,
            borderRadius: template.borderRadius,
            shadow: template.shadow,
            backgroundColor: template.backgroundColor,
            borderColor: template.borderColor,
            textColor: template.textColor,
            animation: template.animation,
            duration: template.duration,
            overlayColor: template.overlayColor,
            blurBackground: template.blurBackground,
            isDefault: template.isDefault
          }))
        })
        affectedEntities.push(...snapshot.popupTemplates.map((t: any) => ({ type: 'PopupTemplate', id: t.id })))
      }

      if (snapshot.popups?.length) {
        await tx.popup.createMany({
          data: snapshot.popups.map((popup: any) => ({
            id: popup.id,
            title: popup.title,
            content: popup.content,
            trigger: popup.trigger,
            triggerValue: popup.triggerValue,
            triggerSelector: popup.triggerSelector,
            isActive: popup.isActive,
            templateId: popup.templateId,
            targetPages: popup.targetPages,
            excludePages: popup.excludePages,
            showOn: popup.showOn,
            priority: popup.priority,
            showTimeSlots: popup.showTimeSlots,
            showOncePerSession: popup.showOncePerSession,
            showOncePerUser: popup.showOncePerUser,
            maxDisplayPerDay: popup.maxDisplayPerDay,
            delayBetweenShows: popup.delayBetweenShows,
            showAfterDate: popup.showAfterDate ? new Date(popup.showAfterDate) : null,
            showUntilDate: popup.showUntilDate ? new Date(popup.showUntilDate) : null,
            showCloseButton: popup.showCloseButton,
            closeOnOverlay: popup.closeOnOverlay,
            closeOnEscape: popup.closeOnEscape,
            autoClose: popup.autoClose,
            autoCloseDelay: popup.autoCloseDelay,
            primaryButton: popup.primaryButton,
            secondaryButton: popup.secondaryButton,
            customCss: popup.customCss
          }))
        })
        affectedEntities.push(...snapshot.popups.map((p: any) => ({ type: 'Popup', id: p.id })))
      }
    })

    return affectedEntities

  } catch (error) {
    console.error('Error executing full restore:', error)
    throw new Error('복원 실행 중 오류가 발생했습니다.')
  }
}

// 현재 상태 스냅샷 생성 (트랜잭션 내)
async function createCurrentSnapshot(tx: any) {
  const [
    sections,
    settings,
    banners,
    floatingButtons,
    seoSettings,
    popups,
    popupTemplates
  ] = await Promise.all([
    tx.siteSection.findMany(),
    tx.siteSettings.findMany(),
    tx.announcementBanner.findMany(),
    tx.floatingButton.findMany(),
    tx.seoSetting.findMany(),
    tx.popup.findMany({ include: { template: true } }),
    tx.popupTemplate.findMany()
  ])

  return {
    timestamp: new Date().toISOString(),
    sections,
    settings,
    banners,
    floatingButtons,
    seoSettings,
    popups,
    popupTemplates
  }
}

// GET: 특정 복원 지점 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const restorePoint = await prisma.restorePoint.findUnique({
      where: { id: params.id }
    })

    if (!restorePoint) {
      return NextResponse.json(
        { error: '복원 지점을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ restorePoint })

  } catch (error) {
    console.error('Error fetching restore point:', error)
    return NextResponse.json(
      { error: '복원 지점을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 복원 지점으로 복원 실행
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = restoreSchema.parse(body)

    if (!validatedData.confirmRestore) {
      return NextResponse.json(
        { error: '복원 확인이 필요합니다.' },
        { status: 400 }
      )
    }

    // 복원 지점 조회
    const restorePoint = await prisma.restorePoint.findUnique({
      where: { id: params.id }
    })

    if (!restorePoint) {
      return NextResponse.json(
        { error: '복원 지점을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 복원 실행
    const snapshotData = typeof restorePoint.snapshot === 'string'
      ? JSON.parse(restorePoint.snapshot)
      : restorePoint.snapshot
    const affectedEntities = await executeFullRestore(
      snapshotData,
      userId!
    )

    // 복원 이력 기록
    await prisma.changeHistory.create({
      data: {
        entityType: 'RestorePoint',
        entityId: params.id,
        action: 'RESTORE',
        fullSnapshot: JSON.stringify({
          restorePointName: restorePoint.name,
          affectedEntities
        }),
        userId: userId!,
        description: `복원 지점 "${restorePoint.name}"로 복원 실행`
      }
    })

    return NextResponse.json({
      success: true,
      message: '성공적으로 복원되었습니다.',
      affectedEntities,
      restorePoint: {
        id: restorePoint.id,
        name: restorePoint.name,
        createdAt: restorePoint.createdAt
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error executing restore:', error)
    return NextResponse.json(
      { error: '복원 실행에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE: 복원 지점 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    await prisma.restorePoint.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting restore point:', error)
    return NextResponse.json(
      { error: '복원 지점 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}