import { paraglide } from '@inlang/paraglide-vite'
import { sveltekit } from '@sveltejs/kit/vite'
import UnoCSS from '@unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { type Plugin, defineConfig } from 'vite'

// https://github.com/vitejs/vite/issues/16719#issuecomment-2308170706
function workerChunkPlugin(): Plugin {
	return {
		name: workerChunkPlugin.name,
		apply: 'build',
		enforce: 'pre',
		async resolveId(source, importer, _options) {
			// intercept "xxx?worker"
			if (source?.endsWith('?worker')) {
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				const resolved = await this.resolve(source.split('?')[0]!, importer)

				return `\0${resolved?.id}?worker-chunk`
			}

			return undefined
		},
		load(id) {
			if (id.startsWith('\0') && id.endsWith('?worker-chunk')) {
				const referenceId = this.emitFile({
					type: 'chunk',
					// biome-ignore lint/style/noNonNullAssertion: <explanation>
					id: id.slice(1).split('?')[0]!,
				})

				return `
					export default function WorkerWrapper() {
						return new Worker(
							import.meta.ROLLUP_FILE_URL_${referenceId},
							{ type: "module" }
						);
					}
				`
			}

			return undefined
		},
	}
}

export default defineConfig({
	server: {
		fs: {
			allow: ['./.generated'],
		},
		warmup: {
			clientFiles: [
				'src/lib/components/**/*.svelte',
				'src/lib/library/import-tracks/importer.ts',
			],
		},
	},
	worker: {
		format: 'es',
	},
	build: {
		modulePreload: {
			polyfill: false,
		},
		rollupOptions: {
			// Reduce bundle size a bit by tweaking rollup options
			output: {
				// Some chunks will still be smaller than this
				// because of how svelte kit works.
				experimentalMinChunkSize: 20 * 1024, // 20kb
				externalLiveBindings: false,
				freeze: false,
				compact: true,
				generatedCode: {
					preset: 'es2015',
					symbols: false,
				},
			},
		},
		target: 'esnext',
		minify: 'terser',
		terserOptions: {
			output: {
				comments: false,
			},
			module: true,
			compress: {
				passes: 3,
				unsafe_math: true,
				unsafe_methods: true,
				unsafe_arrows: true,
			},
			// mangle: {
			// 	properties: {
			// 		regex: /^_/,
			// 	},
			// },
		},
	},
	plugins: [
		workerChunkPlugin(),
		UnoCSS(),
		sveltekit(),
		AutoImport({
			dts: './.generated/types/auto-imports.d.ts',
			imports: [
				{
					from: 'svelte',
					imports: ['Snippet'],
					type: true,
				},
				{
					'$lib/helpers/clx.ts': ['clx'],
				},
				{
					'$paraglide/messages': [['*', 'm']],
				},
				{
					'$lib/stores/player/store': ['usePlayer'],
				},
				{
					'$lib/components/menu/MenuRenderer.svelte': ['useMenu'],
				},
			],
		}),
		paraglide({
			project: './project.inlang',
			outdir: './.generated/paraglide',
		}),
	],
})
