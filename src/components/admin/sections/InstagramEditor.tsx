'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TextField } from './FormField'
import { Save, Loader2, RotateCcw, Eye, Instagram, ExternalLink, Plus, Trash2, Image as ImageIcon, RefreshCw } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useAutoSave } from '@/hooks/use-auto-save'

interface InstagramPost {
  id: string
  imageUrl: string
  permalink: string
  caption?: string
}

interface InstagramSectionContent {
  account: string
  link: string
  posts?: InstagramPost[]
  lastUpdated?: string
}

interface InstagramEditorProps {
  section: {
    id: string
    sectionKey: string
    sectionName: string
    content: InstagramSectionContent
    isVisible: boolean
    order: number
  }
  onUpdate: (sectionKey: string, content: InstagramSectionContent) => void
  onSave: (sectionKey: string) => void
}

export function InstagramEditor({ section, onUpdate, onSave }: InstagramEditorProps) {
  const [content, setContent] = useState<InstagramSectionContent>(section.content)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Auto-save hook
  const { isAutoSaving, lastSaved } = useAutoSave({
    key: `instagram-section-${section.id}`,
    value: JSON.stringify(content),
    onSave: async (data) => {
      const parsedContent = JSON.parse(data)
      onUpdate(section.sectionKey, parsedContent)
      await handleSave(false)
    },
    delay: 5000,
    enabled: hasChanges
  })

  // Track changes
  useEffect(() => {
    const hasContentChanged = JSON.stringify(content) !== JSON.stringify(section.content)
    setHasChanges(hasContentChanged)
  }, [content, section.content])

  const handleSave = async (showToast = true) => {
    try {
      setSaving(true)
      onUpdate(section.sectionKey, content)
      await new Promise(resolve => setTimeout(resolve, 0))
      await onSave(section.sectionKey)
      setHasChanges(false)

      if (showToast) {
        toast({
          title: '성공',
          description: 'Instagram 섹션이 저장되었습니다.',
        })
      }
    } catch (error) {
      if (showToast) {
        toast({
          title: '오류',
          description: '저장 중 오류가 발생했습니다.',
          variant: 'destructive',
        })
      }
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setContent(section.content)
    setHasChanges(false)
    toast({
      title: '초기화',
      description: '변경사항이 초기화되었습니다.',
    })
  }

  const handleContentChange = (field: keyof InstagramSectionContent, value: any) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Auto-fill link when account changes
  const handleAccountChange = (account: string) => {
    handleContentChange('account', account)

    // Auto-generate Instagram URL if not manually set
    if (account && !content.link?.includes('instagram.com')) {
      const cleanAccount = account.startsWith('@') ? account.slice(1) : account
      handleContentChange('link', `https://www.instagram.com/${cleanAccount}`)
    }
  }

  // Post management
  const posts = content.posts || []

  const addPost = () => {
    const newPost: InstagramPost = {
      id: `post-${Date.now()}`,
      imageUrl: '',
      permalink: content.link || 'https://www.instagram.com/',
      caption: ''
    }
    handleContentChange('posts', [...posts, newPost])
  }

  const updatePost = (index: number, field: keyof InstagramPost, value: string) => {
    const newPosts = [...posts]
    newPosts[index] = { ...newPosts[index], [field]: value }
    handleContentChange('posts', newPosts)
  }

  const removePost = (index: number) => {
    const newPosts = posts.filter((_, i) => i !== index)
    handleContentChange('posts', newPosts)
  }

  // Extract post ID from Instagram URL
  const extractPostId = (url: string): string => {
    const match = url.match(/instagram\.com\/p\/([^\/\?]+)/)
    return match ? match[1] : ''
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Instagram className="h-5 w-5" />
                Instagram 섹션 편집
                {hasChanges && <Badge variant="outline">변경됨</Badge>}
                {isAutoSaving && (
                  <Badge variant="secondary" className="animate-pulse">
                    자동 저장 중...
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Instagram 피드 섹션의 계정 정보와 포스트를 관리합니다.
                {lastSaved && (
                  <span className="text-xs text-muted-foreground block mt-1">
                    마지막 저장: {new Date(lastSaved).toLocaleTimeString()}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={!hasChanges || saving}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                초기화
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const previewSection = document.getElementById('instagram-preview')
                  if (previewSection) {
                    previewSection.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                미리보기
              </Button>
              <Button
                onClick={() => handleSave(true)}
                disabled={!hasChanges || saving}
                className="min-w-[80px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    저장 중
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    저장
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Instagram 계정 정보</CardTitle>
          <CardDescription>표시할 Instagram 계정의 정보를 입력합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TextField
            label="계정명"
            description="Instagram 계정명을 입력하세요 (@는 선택사항)"
            value={content.account || ''}
            onChange={handleAccountChange}
            placeholder="예: unipivot_2023"
            required
          />

          <TextField
            label="Instagram 링크"
            type="url"
            description="Instagram 프로필 페이지의 전체 URL"
            value={content.link || ''}
            onChange={(value) => handleContentChange('link', value)}
            placeholder="https://www.instagram.com/unipivot_2023"
            required
          />

          {content.link && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  <span className="font-medium">@{(content.account || '').replace('@', '')}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-6 px-2"
                >
                  <a href={content.link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Posts Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Instagram 포스트</CardTitle>
              <CardDescription>
                메인 페이지에 표시할 Instagram 포스트 이미지를 관리합니다. (최대 6개)
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addPost}
              disabled={posts.length >= 6}
            >
              <Plus className="h-4 w-4 mr-2" />
              포스트 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>아직 추가된 포스트가 없습니다.</p>
              <p className="text-sm mt-1">포스트를 추가하여 실제 Instagram 이미지를 표시하세요.</p>
              <Button variant="outline" className="mt-4" onClick={addPost}>
                <Plus className="h-4 w-4 mr-2" />
                첫 포스트 추가
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post, index) => (
                <div key={post.id} className="border rounded-lg p-4 bg-gray-50/50">
                  <div className="flex items-start gap-4">
                    {/* Preview */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      {post.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.imageUrl}
                          alt={`Post ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Fields */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">포스트 {index + 1}</Label>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removePost(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">이미지 URL</Label>
                        <Input
                          value={post.imageUrl}
                          onChange={(e) => updatePost(index, 'imageUrl', e.target.value)}
                          placeholder="https://scontent.cdninstagram.com/..."
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Instagram 포스트 이미지의 직접 URL을 입력하세요.
                        </p>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">포스트 링크</Label>
                        <Input
                          value={post.permalink}
                          onChange={(e) => updatePost(index, 'permalink', e.target.value)}
                          placeholder="https://www.instagram.com/p/..."
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {posts.length < 6 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={addPost}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  포스트 추가 ({posts.length}/6)
                </Button>
              )}
            </div>
          )}

          {/* Help Text */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm">
            <h4 className="font-medium text-blue-900 mb-2">Instagram 이미지 URL 가져오는 방법</h4>
            <ol className="list-decimal list-inside text-blue-800 space-y-1">
              <li>Instagram 웹사이트에서 원하는 포스트를 엽니다.</li>
              <li>이미지를 우클릭하고 &quot;이미지 주소 복사&quot;를 선택합니다.</li>
              <li>복사한 URL을 위 이미지 URL 필드에 붙여넣습니다.</li>
            </ol>
            <p className="mt-2 text-blue-700">
              * Instagram CDN URL은 시간이 지나면 만료될 수 있습니다. 주기적으로 업데이트가 필요합니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card id="instagram-preview">
        <CardHeader>
          <CardTitle className="text-base">콘텐츠 미리보기</CardTitle>
          <CardDescription>현재 설정된 Instagram 섹션을 확인할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Visual Preview */}
            <div className="border rounded-lg p-6 bg-white">
              <div className="text-center space-y-4">
                <span className="text-primary text-sm font-semibold tracking-wider uppercase">Instagram</span>
                <h2 className="text-2xl font-bold">@{(content.account || 'unipivot_2023').replace('@', '')}</h2>
                <p className="text-gray-600">인스타그램에서 유니피벗의 일상을 만나보세요</p>

                {/* Posts Grid */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 max-w-2xl mx-auto">
                  {(posts.length > 0 ? posts : Array(6).fill(null)).slice(0, 6).map((post, i) => (
                    <div
                      key={post?.id || i}
                      className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100"
                    >
                      {post?.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.imageUrl}
                          alt={`Post ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Instagram className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <Button className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90">
                  <Instagram className="h-4 w-4 mr-2" />
                  팔로우하기
                </Button>
              </div>
            </div>

            {/* JSON Preview */}
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground group-open:text-foreground">
                JSON 데이터 보기
              </summary>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-48 mt-2">
                {JSON.stringify(content, null, 2)}
              </pre>
            </details>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
