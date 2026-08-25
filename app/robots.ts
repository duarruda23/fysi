import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin/',
        '/api/',
        '/auth/',
        '/checkout',
        '/carrinho',
        '/login',
        '/meus-pedidos',
        '/minha-conta',
        '/lan-jul26-calca/obrigado',
      ],
    },
    sitemap: 'https://fysiatacado.com.br/sitemap.xml',
  }
}
