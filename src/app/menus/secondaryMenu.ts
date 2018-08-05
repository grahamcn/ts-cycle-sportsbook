import xs, { Stream } from 'xstream';
import { div, VNode, ul, li, a, DOMSource } from '@cycle/dom'

import { containerMenuData } from '../misc/constants'
import { getTargetDataUrl } from '../misc/helpers'
import { MenuItem } from './interfaces'

export interface Sources {
	DOM: DOMSource
}

export interface Sinks {
	DOM: Stream<VNode>,
	History: Stream<string>
}

function SecondaryMenu(sources): Sinks {

	const history$ =
		sources.DOM.select('.secondaryMenu .link')
			.events('click')
			.map(getTargetDataUrl)

	const vdom$ =
		xs.of(containerMenuData)
			.map(data =>
				div('.secondaryMenu',
					ul('.list .inline',
						data.map((menuItem: MenuItem) =>
							li('.listItem',
								a('.link', {
									attrs: {
										title: menuItem.title,
										href: menuItem.url,
									},
									dataset: {
										dataUrl: menuItem.url
									}
								}, menuItem.title
								)
							))
					)
				)
			)

	return {
		DOM: vdom$,
		History: history$,
	}
}

export default SecondaryMenu
