import { MenuLink } from '../menus/interfaces'
import { li, a, VNode, div, ul } from '@cycle/dom'

export function renderMenu([title, menuItemListDom]: [string, VNode[]]): VNode {
	return div('.menu', [
		title && div('.header',
			div('.heading', title)
		),
		ul('.list', menuItemListDom)
	])
}

export function renderMenuLink(item: MenuLink): VNode {
	return li('.listItem',
		a('.link', {
			attrs: {
				href: item.url,
				title: item.title,
			},
			dataset: {
				dataUrl: item.url
			}
		}, item.title)
	)
}
