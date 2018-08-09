import { MenuItem, Menu, Link} from '../menus/interfaces'
import { ul, h4, li, a, VNode, div } from '@cycle/dom'

// render list title, list item function
export function renderMenuItems(menu: Menu): VNode {
	return (
		li('.listItem', [
			menu.title && menu.items &&
			div('.header', [
				h4('.heading', menu.title),
			]),
			menu.items && ul('.list',
				menu.items.map((menuItem: Link): VNode => renderMenuLink(menuItem))
			),
		])
	)
}

// render listlink
export function renderMenuLink(item: Link): VNode {
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
