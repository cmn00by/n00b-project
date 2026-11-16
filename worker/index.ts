// Le Worker Cloudflare du jeu : il sert le jeu construit (dist/) et réserve /api/ au serveur du jeu.
// Expose : le gestionnaire fetch du Worker (point d'entrée déclaré dans wrangler.jsonc).
// Pourquoi : une seule adresse pour tout. Les fichiers du jeu sont servis directement par Cloudflare (assets) ; seules les adresses /api/ passent
// par ce code. C'est là que viendront les salons de jeu en ligne (bloc 16, coop) : un Durable Object par salon, où se connectent tous les joueurs
// de la même partie (voir docs/deploiement.md).

interface Env {
  /** Les fichiers du jeu (dist/), servis par Cloudflare. */
  ASSETS: Fetcher
}

/** La version du protocole entre le jeu et le serveur : à augmenter quand les messages de /api/ changent. */
const API_VERSION = 1

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url)
    // Pour vérifier qu'un déploiement répond (et, plus tard, que le jeu et le serveur parlent la même version).
    if (pathname === '/api/sante') return Response.json({ ok: true, apiVersion: API_VERSION })
    if (pathname.startsWith('/api/')) return Response.json({ error: 'Adresse inconnue' }, { status: 404 })
    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
