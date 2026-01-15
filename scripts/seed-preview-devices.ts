import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultDevices = [
  // 모바일 디바이스
  {
    name: 'iPhone 14',
    type: 'mobile' as const,
    width: 390,
    height: 844,
    pixelRatio: 3.0,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    isDefault: true,
    order: 1
  },
  {
    name: 'iPhone 14 Plus',
    type: 'mobile' as const,
    width: 428,
    height: 926,
    pixelRatio: 3.0,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    isDefault: false,
    order: 2
  },
  {
    name: 'Galaxy S23',
    type: 'mobile' as const,
    width: 360,
    height: 780,
    pixelRatio: 3.0,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    isDefault: false,
    order: 3
  },

  // 태블릿 디바이스
  {
    name: 'iPad Air',
    type: 'tablet' as const,
    width: 820,
    height: 1180,
    pixelRatio: 2.0,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    isDefault: true,
    order: 4
  },
  {
    name: 'iPad Pro 12.9"',
    type: 'tablet' as const,
    width: 1024,
    height: 1366,
    pixelRatio: 2.0,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    isDefault: false,
    order: 5
  },
  {
    name: 'Galaxy Tab S8',
    type: 'tablet' as const,
    width: 753,
    height: 1037,
    pixelRatio: 2.65,
    userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-X906C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    isDefault: false,
    order: 6
  },

  // 데스크톱 디바이스
  {
    name: 'Desktop HD',
    type: 'desktop' as const,
    width: 1920,
    height: 1080,
    pixelRatio: 1.0,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    isDefault: true,
    order: 7
  },
  {
    name: 'Desktop FHD',
    type: 'desktop' as const,
    width: 1366,
    height: 768,
    pixelRatio: 1.0,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    isDefault: false,
    order: 8
  },
  {
    name: 'Desktop 4K',
    type: 'desktop' as const,
    width: 2560,
    height: 1440,
    pixelRatio: 1.0,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    isDefault: false,
    order: 9
  },
  {
    name: 'MacBook Air',
    type: 'desktop' as const,
    width: 1440,
    height: 900,
    pixelRatio: 2.0,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    isDefault: false,
    order: 10
  },
  {
    name: 'MacBook Pro 16"',
    type: 'desktop' as const,
    width: 1728,
    height: 1117,
    pixelRatio: 2.0,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    isDefault: false,
    order: 11
  }
]

async function seedPreviewDevices() {
  console.log('🌱 미리보기 디바이스 시드 데이터 생성 시작...')

  try {
    // 기존 디바이스 확인
    const existingDevices = await prisma.previewDevice.findMany()

    if (existingDevices.length > 0) {
      console.log(`⚠️  이미 ${existingDevices.length}개의 디바이스가 존재합니다.`)
      const answer = process.argv.includes('--force') ? 'y' : 'n'

      if (answer !== 'y') {
        console.log('❌ 시드 데이터 생성이 취소되었습니다.')
        console.log('💡 기존 데이터를 덮어쓰려면 --force 플래그를 사용하세요.')
        return
      }

      // 기존 데이터 삭제
      await prisma.previewDevice.deleteMany()
      console.log('🗑️  기존 디바이스 데이터를 삭제했습니다.')
    }

    // 새 디바이스 생성
    let createdCount = 0
    for (const device of defaultDevices) {
      try {
        await prisma.previewDevice.create({
          data: device
        })
        createdCount++
        console.log(`✅ ${device.name} (${device.type}) 생성 완료`)
      } catch (error) {
        console.error(`❌ ${device.name} 생성 실패:`, error)
      }
    }

    console.log(`\n🎉 미리보기 디바이스 시드 데이터 생성 완료!`)
    console.log(`📱 총 ${createdCount}개의 디바이스가 생성되었습니다.`)
    console.log(`
생성된 디바이스:
- 모바일: ${defaultDevices.filter(d => d.type === 'mobile').length}개
- 태블릿: ${defaultDevices.filter(d => d.type === 'tablet').length}개
- 데스크톱: ${defaultDevices.filter(d => d.type === 'desktop').length}개
`)

    // 기본 디바이스 확인
    const defaultDevicesByType = await prisma.previewDevice.groupBy({
      by: ['type'],
      where: { isDefault: true },
      _count: true
    })

    console.log('🔧 기본 디바이스 설정:')
    defaultDevicesByType.forEach(({ type, _count }) => {
      console.log(`  - ${type}: ${_count}개`)
    })

  } catch (error) {
    console.error('💥 시드 데이터 생성 중 오류 발생:', error)
    throw error
  }
}

// 메인 실행
async function main() {
  try {
    await seedPreviewDevices()
  } catch (error) {
    console.error('시드 데이터 생성 실패:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// 스크립트가 직접 실행된 경우에만 main 함수 호출
if (require.main === module) {
  main()
}

export { seedPreviewDevices }