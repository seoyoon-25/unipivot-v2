import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src/docs/openapi.yaml')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const spec = yaml.load(fileContents)

    return NextResponse.json(spec)
  } catch {
    return NextResponse.json(
      { error: 'OpenAPI 스펙을 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}
