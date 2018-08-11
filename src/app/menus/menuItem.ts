import { VNode, DOMSource } from '@cycle/dom'
import { Stream } from 'xstream'
import { StateSource } from 'cycle-onionify'

import MenuLinkComponent from './menuLink'
import MenuGroupComponent from './menuGroup'
import { MenuLink, Menu } from './interfaces'

interface Sinks {
	DOM: Stream<VNode>,
	History: Stream<string>
}

interface Sources {
	DOM: DOMSource,
	onion: StateSource<any>
}

function MenuItemComponent(sources: Sources): Sinks {
	const state$ = sources.onion.state$

	const menuItemComponent$: Stream<Sinks> =
		state$.map((state: Menu|MenuLink) =>
			!!state['url'] ? MenuLinkComponent(sources) :  MenuGroupComponent(sources)
		)

	const menuItemComponentDom$: Stream<VNode> =
		menuItemComponent$.map(c => c.DOM).flatten()

	const menuItemComponentHistory$: Stream<string> =
		menuItemComponent$.map(c => c.History).flatten()

	return {
		DOM: menuItemComponentDom$,
		History: menuItemComponentHistory$,
	}
}

export default MenuItemComponent
