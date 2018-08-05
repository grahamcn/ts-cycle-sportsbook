import xs, { Stream } from 'xstream'
import { div, VNode, DOMSource, h1 } from '@cycle/dom'
import { RequestInput, HTTPSource } from '@cycle/http'
import { Location } from '@cycle/history'
import { StateSource, Reducer } from 'cycle-onionify'
import isolate from '@cycle/isolate'

import '../css/styles.css'

import TertiaryMenu from './menus/tertiaryMenu'
import Sportsbook from './sportsbook'
import SecondaryMenu from './menus/secondaryMenu'

interface State {}

interface Sinks {
	DOM: Stream<VNode>
	HTTP: Stream<RequestInput>
	onion: Stream<Reducer<State>>
	History: Stream<string>
}

interface Sources {
	DOM: DOMSource
	HTTP: HTTPSource
	History: Stream<Location>
	onion: StateSource<State>
	LiveData: Stream<any>
}

function App(sources: Sources): Sinks {
	const secondaryMenuSinks = SecondaryMenu(sources)
	const secondaryMenuDom$ = secondaryMenuSinks.DOM
	const secondaryMenuHistory$ = secondaryMenuSinks.History

	const tertiaryMenuSinks = isolate(TertiaryMenu)(sources)
	const tertiaryMenuDom$: Stream<VNode> = tertiaryMenuSinks.DOM
	const tertiaryMenuHttp$: Stream<RequestInput> = tertiaryMenuSinks.HTTP
	const tertiaryMenuReducer$: Stream<Reducer<State>> = tertiaryMenuSinks.onion
	const tertiaryMenuHistory$: Stream<string> = tertiaryMenuSinks.History

	const sportsbookSinks = isolate(Sportsbook, 'sportsbook')(sources)
	const sportsbookDom$: Stream<VNode> = sportsbookSinks.DOM
	const sportsbookHttp$: Stream<RequestInput> = sportsbookSinks.HTTP
	const sportsbookOnion$: Stream<Reducer<State>> = sportsbookSinks.onion

	// merge child sinks and pass to our sink
	const appHttp$: Stream<RequestInput> =
		xs.merge(tertiaryMenuHttp$, sportsbookHttp$)

	// merge child sinks and pass to our sink
	const appHistory$: Stream<string> =
		xs.merge(
			secondaryMenuHistory$,
			tertiaryMenuHistory$,
		)

	// merge child reducers
	const appReducer$: Stream<Reducer<State>> =
		xs.merge(tertiaryMenuReducer$, sportsbookOnion$)

	const vdom$: Stream<VNode> =
		xs.combine(
			secondaryMenuDom$,
			tertiaryMenuDom$,
			sportsbookDom$,
		).map(([secondaryMenuDom, tertiaryMenuDom, sportsbookDom]) =>
			div('.container', [
				div('.head', [
					div('.header',
						h1('.heading', 'Sky Bet POC')
					),
				]),
				secondaryMenuDom,
				div('.content', [
					tertiaryMenuDom,
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
