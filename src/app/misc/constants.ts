export const defaultSecondarySegment = 'calcio'
export const baseUrl = 'https://vkyyqd7276.execute-api.eu-west-2.amazonaws.com/public/catalog'
export const socketUrl = 'http://ec2-18-130-224-107.eu-west-2.compute.amazonaws.com:8000'

import { Menu, MenuLink } from '../menus/interfaces'

export const containerMenuData: MenuLink[] = [{
	id: '1',
	title: 'Home',
	url: '/'
}, {
	id: '2',
	title: 'Calcio',
	url: '/calcio'
}, {
	id: '3',
	title: 'Tennis',
	url: '/tennis'
}, {
	id: '4',
	title: 'Rugby',
	url: '/rugby'
}, {
	id: '5',
	title: 'Rollerball',
	url: '/rollerball'
}]

// menu functions operate on a listof menus, hence the wrapping array.
export function staticTertiaryMenus(secondaryKey: string): Menu[] {
	const menuItems: MenuLink[] = [{
		id: '1',
		title: 'Home',
		url: `/${secondaryKey}`
	}, {
		id: '2',
		title: 'Live',
		url: `/${secondaryKey}/live`,
	}, {
		id: '3',
		title: 'Antepost',
		url: `/${secondaryKey}/antepost`,
	}, {
		id: '4',
		title: 'Oggi',
		url: `/${secondaryKey}/oggi`,
	}, {
		id: '5',
		title: 'Domani',
		url: `/${secondaryKey}/domani`,
	}, {
		id: '6',
		title: 'Weekend',
		url: `/${secondaryKey}/weekend`,
	}]

	if (secondaryKey === 'rugby') {
		menuItems.splice(1, 1) // remove live
	}

	return [{
		id: 'staticMenu',
		items: menuItems
	}]
}
