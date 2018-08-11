import { VNode, DOMSource } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { StateSource } from 'cycle-onionify'

import { MenuLink } from './interfaces'
import { renderMenuLink } from '../misc/helpers.dom'
import { getTargetDataUrl } from '../misc/helpers'

interface State extends MenuLink { }

interface Sinks {
	DOM: Stream<VNode>,
	History: Stream<string>
}

interface Sources {
	DOM: DOMSource,
	onion: StateSource<State>
}

function MenuLinkComponent(sources: Sources): Sinks {
	const state$ = sources.onion.state$

	const vdom$ = state$.map(renderMenuLink)

	const history$ =
		sources.DOM.select('.link')
			.events('click')
			.map(getTargetDataUrl)

	return {
		DOM: vdom$,
		History: history$
	}
}

export default MenuLinkComponent
