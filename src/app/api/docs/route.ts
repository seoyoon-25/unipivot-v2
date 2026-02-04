import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import yaml from 'js-yaml'

export const dynamic = 'force-dynamic'

let cachedSpec: unknown = null

export async function GET() {
  try {
    if (!cachedSpec) {
      const filePath = path.join(process.cwd(), 'src/docs/openapi.yaml')
      const fileContents = await fs.readFile(filePath, 'utf8')
      cachedSpec = yaml.load(fileContents)
    }
    return NextResponse.json(cachedSpec)
  } catch {
    return NextResponse.json(
      { error: 'OpenAPI 스펙을 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}
