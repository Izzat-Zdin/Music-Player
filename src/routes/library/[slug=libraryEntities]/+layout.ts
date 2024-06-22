import type { LayoutLoad } from './$types.ts'
import { LibraryStore } from './store.svelte'

type LibraryStoreNames = 'tracks' | 'albums' | 'artists' | 'playlists'

const nameSortOption = {
	name: 'Name',
	key: 'name',
} as const

const storeMap = {
	tracks: () =>
		new LibraryStore({
			storeName: 'tracks',
			singularTitle: m.track(),
			pluralTitle: m.tracks(),
			sortOptions: [
				nameSortOption,
				{
					name: 'Artist',
					key: 'artists',
				},
				{
					name: 'Album',
					key: 'album',
				},
				{
					name: 'Duration',
					key: 'duration',
				},
				{
					name: 'Year',
					key: 'year',
				},
			],
		}),
	albums: () =>
		new LibraryStore({
			storeName: 'albums',
			singularTitle: m.album(),
			pluralTitle: m.albums(),
			sortOptions: [nameSortOption],
		}),
	artists: () =>
		new LibraryStore({
			storeName: 'artists',
			singularTitle: m.artist(),
			pluralTitle: m.artists(),
			sortOptions: [nameSortOption],
		}),
	playlists: () =>
		new LibraryStore({
			storeName: 'playlists',
			singularTitle: m.playlist(),
			pluralTitle: m.playlists(),
			sortOptions: [nameSortOption],
		}),
} satisfies {
	[K in LibraryStoreNames]: () => LibraryStore<K>
}

export const load: LayoutLoad = async (event) => {
	const { slug } = event.params

	const store = storeMap[slug]()

	await store.preloadData()

	return {
		slug,
		store,
		title: 'Library',
		rootLayoutKey: () => slug,
	}
}
