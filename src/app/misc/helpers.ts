import {
	defaultSecondarySegment,
	baseUrl,
} from './constants'

import { Menu } from '../menus/interfaces'

interface PickKey extends Function {
	(s: Object): string | number | Object // could be others, extend if required
}

// returns a function that will pick the key created in the closure from a given object
export function pick(key: any): PickKey {
	return function (o: Object): any {
		return o[key] || undefined // not null, see Crockford
	}
}

export function transformPathToSecondaryDataKey(pathname: string, defaultSecondary: string = defaultSecondarySegment): string {
	return pathname.split('/')[1] || defaultSecondary
}

export function transformPathToPageDataPath(path: string, defaultSecondary: string = defaultSecondarySegment): string {
	return path === '/' ? `/${defaultSecondary}` : path
}

export function getTertiaryMenuDataUrl(key: string, base: string = baseUrl): string {
	return `${base}/${key}/competitions`
}

export function getCatalogDataUrl(path: string, base: string = baseUrl): string {
	return `${base}${path}/events`
}

export function getTargetDataUrl(event: MouseEvent): string {
	event.preventDefault()
	const target: EventTarget = event.target
	return target['dataset'].dataUrl
}

export function transformToMenuItemsByCountry(types: any[], secondarySegmentUrl: string): Map<string, Menu[]> {
	return types // competitions, with the country name embedded in each type name. eg "england - premier league"
		.map(type =>
			Object.assign({}, type, {
				id: type.id,
				country: type.name.split(' - ')[0].trim(),
				title: type.name.split(' - ')[1].trim(),
				url: `/${secondarySegmentUrl}/${type.urlName}`,
			})
		)
		.map(({ id, url, title, country }) => ({ id, url, title, country }))
		.reduce(groupByKey('country'), new Map())
}

// reducer fn that groups objects as an array on a Map, keyed by key
function groupByKey(key) {
	return (acc, curr): Map<string, Array<any>> => {
		return !acc.get(curr[key]) ?
			acc.set(curr[key], [curr])
			:
			acc.set(curr[key], [...acc.get(curr[key]), curr])
	}
}

export function sortMapByKey(map: Map<string, any>): Map<string, any> {
	return new Map([...map.entries()].sort())
}

export function transformDynamicMenuDataToMenus(menuData): Menu[] {
	const secondarySegmentUrl = menuData.data.urlName

	const inEvidenzaMenuItems =
		menuData.data.types
			.slice(0, 5)
			.map(({ urlName, name }, index) => {
				return {
					id: index.toString(),
					title: name.split(' - ')[1].trim(),
					url: `/${secondarySegmentUrl}/${urlName}`,
				}
			})

	const tutteLeCompetizioniMenuItems: Map<string, Menu[]> =
		[menuData]
			.map(pick('data'))
			.map(pick('types'))
			.map((competitions: Array<any>) => transformToMenuItemsByCountry(competitions, secondarySegmentUrl))
			.map(menuItemsByCountry => sortMapByKey(menuItemsByCountry))[0]

	// convert the map to an array of Menus - probably possible to simplify the above
	const tutteLeCompetizioniMenus: Menu[] = []
		tutteLeCompetizioniMenuItems.forEach((value, key) => {
			tutteLeCompetizioniMenus.push({
				id: key,
				title: key,
				items: value
			})
		})

	return [{
		id: '1',
		title: 'In Evidenza',
		items: inEvidenzaMenuItems,
	}, {
		id: '2',
		title: 'Tutte Le Competizioni',
		items: tutteLeCompetizioniMenus,
	}]
}
