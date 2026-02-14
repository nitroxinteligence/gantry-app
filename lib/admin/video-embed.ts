import type { VideoProvider, VideoEmbed } from '@/types/admin'

function detectProvider(url: string): VideoProvider {
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube'
  if (/vimeo\.com/.test(url)) return 'vimeo'
  if (/pandavideo\.com/.test(url)) return 'pandavideo'
  return 'unknown'
}

function getYouTubeEmbedUrl(url: string): string {
  const regExp = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  const match = url.match(regExp)
  if (!match?.[1]) return url
  return `https://www.youtube.com/embed/${match[1]}`
}

function getVimeoEmbedUrl(url: string): string {
  const regExp = /vimeo\.com\/(?:video\/)?(\d+)/
  const match = url.match(regExp)
  if (!match?.[1]) return url
  return `https://player.vimeo.com/video/${match[1]}`
}

function getPandaVideoEmbedUrl(url: string): string {
  if (url.includes('/embed/')) return url
  return url.replace('/watch/', '/embed/')
}

export function parseVideoUrl(url: string): VideoEmbed {
  const provider = detectProvider(url)

  switch (provider) {
    case 'youtube':
      return { provider, url, embedUrl: getYouTubeEmbedUrl(url) }
    case 'vimeo':
      return { provider, url, embedUrl: getVimeoEmbedUrl(url) }
    case 'pandavideo':
      return { provider, url, embedUrl: getPandaVideoEmbedUrl(url) }
    default:
      return { provider: 'unknown', url, embedUrl: url }
  }
}
