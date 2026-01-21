import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setup() {
  const user = await prisma.user.findFirst({ where: { email: 'chulsu@example.com' } })
  const program = await prisma.program.findFirst()
  const session = await prisma.programSession.findFirst()

  if (!user || !program || !session) {
    console.log('Missing data:', { user: !!user, program: !!program, session: !!session })
    await prisma.$disconnect()
    return
  }

  console.log('User:', user.id, user.name)
  console.log('Program:', program.id, program.title)
  console.log('Session:', session.id, session.title)

  const existing = await prisma.programMembership.findUnique({
    where: {
      programId_userId: {
        programId: program.id,
        userId: user.id
      }
    }
  })

  if (existing) {
    console.log('Membership already exists')
  } else {
    const membership = await prisma.programMembership.create({
      data: {
        programId: program.id,
        userId: user.id,
        role: 'PARTICIPANT'
      }
    })
    console.log('Created membership:', membership.id)
  }

  await prisma.$disconnect()
}

setup()
