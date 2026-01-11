import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import * as readline from 'readline'

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function createAdmin() {
  console.log('\n=== UniPivot Admin Account Creation ===\n')

  try {
    // Get admin details
    const name = await question('Admin name: ')
    const email = await question('Admin email: ')
    const password = await question('Admin password (min 8 chars): ')

    // Validate input
    if (!name || !email || !password) {
      console.error('\nError: All fields are required.')
      process.exit(1)
    }

    if (password.length < 8) {
      console.error('\nError: Password must be at least 8 characters.')
      process.exit(1)
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      // Update existing user to admin
      const confirm = await question(
        `\nUser with email ${email} already exists. Make them admin? (y/n): `
      )

      if (confirm.toLowerCase() !== 'y') {
        console.log('Operation cancelled.')
        process.exit(0)
      }

      await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
      })

      console.log(`\nUser ${email} has been promoted to admin.`)
    } else {
      // Create new admin user
      const hashedPassword = await hash(password, 12)

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      })

      console.log(`\nAdmin account created successfully!`)
      console.log(`ID: ${user.id}`)
      console.log(`Name: ${user.name}`)
      console.log(`Email: ${user.email}`)
      console.log(`Role: ${user.role}`)
    }

    // Create activity log
    const adminUser = await prisma.user.findUnique({
      where: { email },
    })

    if (adminUser) {
      await prisma.activityLog.create({
        data: {
          userId: adminUser.id,
          action: 'ADMIN_CREATED',
          target: 'User',
          targetId: adminUser.id,
          details: 'Admin account created via CLI',
        },
      })
    }

    console.log('\nDone!')
  } catch (error) {
    console.error('\nError creating admin:', error)
    process.exit(1)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

createAdmin()
