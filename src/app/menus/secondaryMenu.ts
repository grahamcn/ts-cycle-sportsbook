import xs, { Stream } from 'xstream'
import { VNode, DOMSource } from '@cycle/dom'

import { containerMenuData } from '../misc/constants'
import { getTargetDataUrl } from '../misc/helpers'
import { renderSecondaryMenu } from '../misc/helpers.dom'

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
			.map(renderSecondaryMenu)

	return {
		DOM: vdom$,
		History: history$,
	}
}

export default SecondaryMenu

