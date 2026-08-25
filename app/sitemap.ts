import type { MetadataRoute } from 'next'

const SITE_URL = 'https://fysiatacado.com.br'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/produtos`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/lan-jul26-calca`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/politica-de-privacidade`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/politica-de-devolucao`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/termos-de-servico`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/termos-de-uso`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
