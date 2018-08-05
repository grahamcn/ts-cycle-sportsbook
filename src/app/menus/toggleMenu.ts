import { VNode, ul, li, div, span, DOMSource } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { StateSource } from 'cycle-onionify'

import { Menu } from './interfaces'
import SimpleMenu from './SimpleMenu'
import isolate from '@cycle/isolate'

const openState = {
	open: true,
	classes: ['.header .headerToggle', '.headerToggle--expanded'],
	arrow: '\u2191'
}

const closedState = {
	open: false,
	classes: ['.header .headerToggle', '.headerToggle--closed'],
	arrow: '\u2193'
}

interface State extends Menu {}

interface Sinks {
	DOM: Stream<VNode>
	History: Stream<string>
}

interface Sources {
	DOM: DOMSource
	onion: StateSource<State>
}

function ToggleMenu(sources: Sources): Sinks {
	const state$ = sources.onion.state$

	const open$ =
		sources.DOM
			.select('.headerToggle--closed')
			.events('click')
			.mapTo(openState)

	const close$ =
		sources.DOM
			.select('.headerToggle--expanded')
			.events('click')
			.mapTo(closedState)

	const toggleState$ =
		xs.merge(
			open$,
			close$,
		).startWith(closedState)

	const menuLens = {
		get: (state: State) => ({
			items: state.items
		})
	}
	const Menu = isolate(SimpleMenu, {onion: menuLens})(sources)
	const menuDom$: Stream<VNode> = Menu.DOM
	const menuHistory$: Stream<string> = Menu.History

	const vdom$ =
		xs.combine(
			state$, // title
			toggleState$, // open, classes, arrow character,
			menuDom$,
		).map(([state, toggleState, menuDom]) =>
				li('.listItem', [
					div(toggleState.classes.join(' '), [
						state.title,
						span(toggleState.arrow)
					]),
					toggleState.open ?
						ul('.list', [
							menuDom, // simple menu
						]) : undefined
				])
		)

	return {
		DOM: vdom$,
		History: menuHistory$,
	}
}

export default ToggleMenu
