'use server'

import { prisma } from '@/lib/db'

export interface InstagramPost {
  id: string
  imageUrl: string
  permalink: string
  caption?: string
}

// Fetch Instagram posts from database (cached/manual)
export async function getInstagramPosts(): Promise<InstagramPost[]> {
  try {
    const section = await prisma.siteSection.findUnique({
      where: { sectionKey: 'instagram' }
    })

    if (!section?.content) {
      return getDefaultPosts()
    }

    const content = typeof section.content === 'string'
      ? JSON.parse(section.content)
      : section.content

    // Check if we have cached posts
    if (content.posts && Array.isArray(content.posts) && content.posts.length > 0) {
      return content.posts
    }

    return getDefaultPosts()
  } catch (error) {
    console.error('Error fetching Instagram posts:', error)
    return getDefaultPosts()
  }
}

// Get Instagram account info
export async function getInstagramAccount(): Promise<{ account: string; link: string }> {
  try {
    const section = await prisma.siteSection.findUnique({
      where: { sectionKey: 'instagram' }
    })

    if (!section?.content) {
      return { account: 'unipivot_2023', link: 'https://www.instagram.com/unipivot_2023' }
    }

    const content = typeof section.content === 'string'
      ? JSON.parse(section.content)
      : section.content

    return {
      account: content.account || 'unipivot_2023',
      link: content.link || 'https://www.instagram.com/unipivot_2023'
    }
  } catch (error) {
    return { account: 'unipivot_2023', link: 'https://www.instagram.com/unipivot_2023' }
  }
}

// Default placeholder posts
function getDefaultPosts(): InstagramPost[] {
  return [
    { id: '1', imageUrl: '', permalink: 'https://www.instagram.com/unipivot_2023', caption: '' },
    { id: '2', imageUrl: '', permalink: 'https://www.instagram.com/unipivot_2023', caption: '' },
    { id: '3', imageUrl: '', permalink: 'https://www.instagram.com/unipivot_2023', caption: '' },
    { id: '4', imageUrl: '', permalink: 'https://www.instagram.com/unipivot_2023', caption: '' },
    { id: '5', imageUrl: '', permalink: 'https://www.instagram.com/unipivot_2023', caption: '' },
    { id: '6', imageUrl: '', permalink: 'https://www.instagram.com/unipivot_2023', caption: '' },
  ]
}

// Fetch from Instagram Basic Display API (requires access token)
export async function fetchInstagramFromAPI(accessToken: string): Promise<InstagramPost[]> {
  try {
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink,thumbnail_url,media_type&access_token=${accessToken}&limit=6`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch from Instagram API')
    }

    const data = await response.json()

    return data.data.map((post: any) => ({
      id: post.id,
      imageUrl: post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url,
      permalink: post.permalink,
      caption: post.caption || ''
    }))
  } catch (error) {
    console.error('Instagram API error:', error)
    return []
  }
}

// Update cached Instagram posts in database
export async function updateInstagramPosts(posts: InstagramPost[]) {
  try {
    const section = await prisma.siteSection.findUnique({
      where: { sectionKey: 'instagram' }
    })

    if (!section) {
      return { success: false, error: 'Instagram section not found' }
    }

    const currentContent = typeof section.content === 'string'
      ? JSON.parse(section.content)
      : section.content || {}

    await prisma.siteSection.update({
      where: { sectionKey: 'instagram' },
      data: {
        content: JSON.stringify({
          ...currentContent,
          posts,
          lastUpdated: new Date().toISOString()
        })
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Error updating Instagram posts:', error)
    return { success: false, error: 'Failed to update' }
  }
}
