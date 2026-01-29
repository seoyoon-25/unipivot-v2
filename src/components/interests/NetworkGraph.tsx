'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Loader2, ZoomIn, ZoomOut, Maximize2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Dynamic import for react-force-graph-2d (SSR disabled)
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  ),
})

interface NetworkNode {
  id: string
  keyword: string
  totalCount: number
  monthlyCount: number
  likeCount: number
  category: string | null
  isFixed: boolean
  isRecommended: boolean
  x?: number
  y?: number
}

interface NetworkLink {
  source: string | NetworkNode
  target: string | NetworkNode
  strength: number
}

interface NetworkData {
  nodes: NetworkNode[]
  links: NetworkLink[]
  stats?: {
    totalNodes: number
    totalLinks: number
    avgStrength: number
    maxStrength: number
  }
}

interface NetworkGraphProps {
  onNodeClick?: (node: NetworkNode) => void
  className?: string
}

// 카테고리별 색상 매핑
const categoryColors: Record<string, string> = {
  '교육': '#4ECDC4',
  '문화': '#FF6B6B',
  '사회': '#45B7D1',
  '기술': '#96CEB4',
  '경제': '#FFEAA7',
  '정치': '#DDA0DD',
  '환경': '#98D8C8',
  'default': '#A8D8EA',
}

// 노드 색상 결정
function getNodeColor(node: NetworkNode): string {
  if (node.isFixed) return '#FF9F43' // 고정 키워드: 주황색
  if (node.isRecommended) return '#26DE81' // 추천 키워드: 초록색
  if (node.likeCount > 10) return '#FF6B6B' // 인기 키워드: 빨간색
  if (node.category) return categoryColors[node.category] || categoryColors['default']
  return categoryColors['default']
}

// 노드 크기 계산 (totalCount 기반)
function getNodeSize(node: NetworkNode, maxCount: number): number {
  const minSize = 6
  const maxSize = 25
  const ratio = Math.sqrt(node.totalCount / Math.max(maxCount, 1))
  return minSize + ratio * (maxSize - minSize)
}

export function NetworkGraph({ onNodeClick, className = '' }: NetworkGraphProps) {
  const [data, setData] = useState<NetworkData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null)
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 })
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<any>(null)

  // 데이터 로드
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/interests/network?minCount=1&minStrength=1&limit=100')
      if (!response.ok) throw new Error('Failed to fetch network data')
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError('네트워크 데이터를 불러올 수 없습니다')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // 컨테이너 크기 감지
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width: width || 400, height: height || 400 })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // 줌 컨트롤
  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() * 1.5, 300)
    }
  }

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() / 1.5, 300)
    }
  }

  const handleFitView = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50)
    }
  }

  // 노드 클릭 핸들러
  const handleNodeClick = useCallback((node: any) => {
    if (onNodeClick && node) {
      onNodeClick(node as NetworkNode)
    }
  }, [onNodeClick])

  // 노드 호버 핸들러
  const handleNodeHover = useCallback((node: any) => {
    setHoveredNode(node as NetworkNode | null)
  }, [])

  // 최대 카운트 계산
  const maxCount = data?.nodes.reduce((max, n) => Math.max(max, n.totalCount), 1) || 1

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-xl ${className}`} style={{ minHeight: 400 }}>
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
          <p className="text-gray-500">네트워크 그래프 로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-xl ${className}`} style={{ minHeight: 400 }}>
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 시도
          </Button>
        </div>
      </div>
    )
  }

  if (!data || data.nodes.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-xl ${className}`} style={{ minHeight: 400 }}>
        <div className="text-center text-gray-500">
          <p className="mb-2">아직 키워드 데이터가 없습니다</p>
          <p className="text-sm">관심사를 입력하면 네트워크가 생성됩니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden ${className}`}>
      {/* 컨트롤 버튼 */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        <Button
          variant="secondary"
          size="icon"
          className="w-8 h-8 bg-white/90 hover:bg-white shadow-sm"
          onClick={handleZoomIn}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="w-8 h-8 bg-white/90 hover:bg-white shadow-sm"
          onClick={handleZoomOut}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="w-8 h-8 bg-white/90 hover:bg-white shadow-sm"
          onClick={handleFitView}
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="w-8 h-8 bg-white/90 hover:bg-white shadow-sm"
          onClick={fetchData}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* 통계 정보 */}
      {data.stats && (
        <div className="absolute top-3 left-3 z-10 bg-white/90 rounded-lg px-3 py-2 text-xs shadow-sm">
          <div className="flex gap-4">
            <span>키워드: <strong>{data.stats.totalNodes}</strong></span>
            <span>연결: <strong>{data.stats.totalLinks}</strong></span>
          </div>
        </div>
      )}

      {/* 호버 툴팁 */}
      {hoveredNode && (
        <div className="absolute bottom-3 left-3 z-10 bg-white rounded-lg px-4 py-3 shadow-lg max-w-xs">
          <p className="font-semibold text-gray-900">{hoveredNode.keyword}</p>
          <div className="flex gap-3 text-sm text-gray-600 mt-1">
            <span>언급 {hoveredNode.totalCount}회</span>
            <span>공감 {hoveredNode.likeCount}</span>
          </div>
          {hoveredNode.category && (
            <span className="inline-block mt-1 text-xs bg-gray-100 px-2 py-0.5 rounded">
              {hoveredNode.category}
            </span>
          )}
        </div>
      )}

      {/* 그래프 */}
      <div ref={containerRef} style={{ width: '100%', height: 400 }}>
        <ForceGraph2D
          ref={graphRef}
          graphData={data}
          width={dimensions.width}
          height={dimensions.height}
          nodeId="id"
          nodeLabel={(node: any) => `${node.keyword}\n언급: ${node.totalCount}회 | 공감: ${node.likeCount}`}
          nodeVal={(node: any) => getNodeSize(node, maxCount)}
          nodeColor={(node: any) => getNodeColor(node)}
          nodeCanvasObjectMode={() => 'after'}
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = node.keyword
            const fontSize = Math.max(10 / globalScale, 3)
            ctx.font = `${fontSize}px 'Pretendard', sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            // 텍스트 배경
            const textWidth = ctx.measureText(label).width
            const bgPadding = 2 / globalScale
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
            ctx.fillRect(
              node.x! - textWidth / 2 - bgPadding,
              node.y! + getNodeSize(node, maxCount) + 2,
              textWidth + bgPadding * 2,
              fontSize + bgPadding * 2
            )

            // 텍스트
            ctx.fillStyle = '#333'
            ctx.fillText(label, node.x!, node.y! + getNodeSize(node, maxCount) + fontSize / 2 + 4)
          }}
          linkWidth={(link: any) => Math.sqrt(link.strength) * 1.5}
          linkColor={() => 'rgba(100, 100, 100, 0.3)'}
          linkDirectionalParticles={0}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          cooldownTicks={100}
          d3VelocityDecay={0.3}
          d3AlphaDecay={0.02}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
        />
      </div>

      {/* 범례 */}
      <div className="absolute bottom-3 right-3 z-10 bg-white/90 rounded-lg px-3 py-2 text-xs shadow-sm">
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[#FF9F43]" />
            고정
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[#26DE81]" />
            추천
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[#FF6B6B]" />
            인기
          </span>
        </div>
      </div>
    </div>
  )
}
