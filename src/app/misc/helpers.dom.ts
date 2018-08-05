import { MenuItem, Menu } from '../menus/interfaces'
import { ul, h4, li, a, VNode, div } from '@cycle/dom'

// render list title, list item function
export function renderMenuItems({ title, items }: Menu): VNode {
	return (
		li('.listItem', [
			title && items &&
			div('.header', [
				h4('.heading', title),
			]),
			items && ul('.list',
				items.map(renderMenuItem)
			),
		])
	)
}

// render listlink
export function renderMenuItem(item: MenuItem): VNode {
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
