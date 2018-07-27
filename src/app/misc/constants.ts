export const defaultSecondarySegment = 'calcio'
export const baseUrl = 'https://vkyyqd7276.execute-api.eu-west-2.amazonaws.com/public/catalog'
// export const baseUrl = 'http://localhost:8000/catalog'
// export const baseUrl = 'ec2-18-130-224-107.eu-west-2.compute.amazonaws.com:8000/catalog'
import { MenuItem } from '../sideMenu.interfaces'

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
	title: 'Rollerball',
	url: '/rollerball'
}]

export function staticTertiaryMenuItems(secondaryKey: string): MenuItem[] {
	return [{
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
}
