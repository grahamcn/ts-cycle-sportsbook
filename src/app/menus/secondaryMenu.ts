import xs, { Stream } from 'xstream';
import { div, VNode, ul, DOMSource } from '@cycle/dom'

import { containerMenuData } from '../misc/constants'
import { getTargetDataUrl } from '../misc/helpers'
import { renderMenuLink } from '../misc/helpers.dom'

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
						data.map(renderMenuLink)
					)
				)
			)

	return {
		DOM: vdom$,
		History: history$,
	}
}

export default SecondaryMenu

