import type { MetadataRoute } from 'next'
import { getPecaIdsParaSitemap } from '@/lib/data/pecas'

const SITE_URL = 'https://www.fysiatacado.com.br'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pecas = await getPecaIdsParaSitemap()

  const produtoEntries: MetadataRoute.Sitemap = pecas.map((peca) => ({
    url: `${SITE_URL}/produtos/${peca.id}`,
    lastModified: new Date(peca.criadoEm),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

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
    ...produtoEntries,
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
