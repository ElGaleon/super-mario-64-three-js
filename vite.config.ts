import { cp } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'

function copyRuntimeAssets(): Plugin {
    const source = resolve(__dirname, 'assets')
    const target = resolve(__dirname, 'dist', 'assets')

    return {
        name: 'copy-runtime-assets',
        apply: 'build',
        async closeBundle() {
            if (!existsSync(source)) {
                this.warn('Runtime assets folder not found. The deployed scene may miss 3D models and textures.')
                return
            }

            await cp(source, target, { recursive: true, force: true })
        },
    }
}

export default defineConfig({
    plugins: [copyRuntimeAssets()],
})
