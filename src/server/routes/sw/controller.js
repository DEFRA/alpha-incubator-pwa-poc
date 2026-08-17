import { readFile } from 'node:fs/promises'
import path from 'node:path'

const swSourcePath = path.join(process.cwd(), 'src/client/sw.js')

/**
 * Serves the root-scoped service worker script so its scope covers the
 * whole site (a service worker's scope is limited to the directory it's
 * served from and below).
 */
export const swController = {
  async handler(_request, h) {
    const script = await readFile(swSourcePath, 'utf8')

    return h.response(script).type('application/javascript')
  }
}
