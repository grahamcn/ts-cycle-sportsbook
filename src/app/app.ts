import xs, { Stream } from 'xstream'
import { div, VNode, DOMSource } from '@cycle/dom'
import { RequestInput, HTTPSource } from '@cycle/http'
import { Location } from '@cycle/history'
import { StateSource, Reducer } from 'cycle-onionify'
import isolate from '@cycle/isolate'

import '../css/styles.css'

import SideMenu from './menus/sideMenu'
import Sportsbook from './sportsbook'
import ContainerMenu from './menus/containerMenu'
import { Catalog } from './sportsbook/interfaces'

interface State {
	catalog: Catalog,
}

interface Sinks {
	DOM: Stream<VNode>,
	HTTP: Stream<RequestInput>,
	onion: Stream<Reducer<State>>,
	History: Stream<string>
}

interface Sources {
	DOM: DOMSource,
	HTTP: HTTPSource,
	History: Stream<Location>,
	onion: StateSource<State>,
	Socket: Stream<any>,
}

function App(sources: Sources): Sinks {
	const containerMenuSinks = ContainerMenu(sources)
	const containerMenuDom$ = containerMenuSinks.DOM
	const containerMenuHistory$ = containerMenuSinks.History

	const sideMenuSinks = isolate(SideMenu)(sources)
	const sideMenuDom$: Stream<VNode> = sideMenuSinks.DOM
	const sideMenuHttp$: Stream<RequestInput> = sideMenuSinks.HTTP
	const sideMenuReducer$: Stream<Reducer<State>> = sideMenuSinks.onion
	const sideMenuHistory$: Stream<string> = sideMenuSinks.History

	const sportsbookSinks = Sportsbook(sources)
	const sportsbookDom$: Stream<VNode> = sportsbookSinks.DOM
	const sportsbookHttp$: Stream<RequestInput> = sportsbookSinks.HTTP
	const sportsbookOnion$: Stream<Reducer<State>> = sportsbookSinks.onion

	// merge child sinks and pass to our sink
	const appHttp$: Stream<RequestInput> =
		xs.merge(sideMenuHttp$, sportsbookHttp$)

	// merge child sinks and pass to our sink
	const appHistory$: Stream<string> =
		xs.merge(
			containerMenuHistory$,
			sideMenuHistory$,
		)

	// merge child reducers
	const appReducer$: Stream<Reducer<State>> =
		xs.merge(sideMenuReducer$, sportsbookOnion$)

	const vdom$: Stream<VNode> =
		xs.combine(
			containerMenuDom$,
			sideMenuDom$,
			sportsbookDom$,
		).map(([containerMenuDom, sideMenuDom, sportsbookDom]) =>
			div('.container', [
				div('.container__title',
					'Sky Bet POC'
				),
				containerMenuDom,
				div('.container__content', [
					sideMenuDom,
					sportsbookDom,
				])
			])
		)

	return {
		DOM: vdom$,
		HTTP: appHttp$,
		onion: appReducer$,
		History: appHistory$,
	}
}

export default App
