export const defaultSecondarySegment = 'calcio'
export const baseUrl = 'https://vkyyqd7276.execute-api.eu-west-2.amazonaws.com/public/catalog'
export const socketUrl = 'http://ec2-18-130-224-107.eu-west-2.compute.amazonaws.com:8000'

import { Menu, MenuItem } from '../menus/interfaces'

export const containerMenuData: MenuItem[] = [{
	title: 'Home',
	url: '/'
}, {
	title: 'Calcio',
	url: '/calcio'
}, {
	title: 'Tennis',
	url: '/tennis'
}, {
	title: 'Rugby',
	url: '/rugby'
}, {
	title: 'Rollerball',
	url: '/rollerball'
}]

// menu functions operate on a listof menus, hence the wrapping array.
export function staticTertiaryMenus(secondaryKey: string): Menu[] {
	const menuItems: MenuItem[] =  [{
		title: 'Home',
		url: `/${secondaryKey}`
	}, {
		title: 'Live',
		url: `/${secondaryKey}/live`,
	}, {
		title: 'Antepost',
		url: `/${secondaryKey}/antepost`,
	}, {
		title: 'Oggi',
		url: `/${secondaryKey}/oggi`,
	}, {
		title: 'Domani',
		url: `/${secondaryKey}/domani`,
	}, {
		title: 'Weekend',
		url: `/${secondaryKey}/weekend`,
  }]

  if (secondaryKey === 'rugby') {
    menuItems.splice(1, 1) // remove live
  }

  return [{
    title: 'static menu',
    items: menuItems
  }]
}
