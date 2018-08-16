import { VNode, DOMSource } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { Location } from 'history'
import { RequestInput, HTTPSource } from '@cycle/http'
import isolate from '@cycle/isolate'
import { Reducer, StateSource } from 'cycle-onionify'

import Betslip from './betslip'

import CatalogComponent from './catalog'
import { Selection } from './interfaces'
import { renderSportsbook } from '../misc/helpers.dom'

interface State {
	selections: Selection[]
}

interface Sinks {
	DOM: Stream<VNode>,
	HTTP: Stream<RequestInput>,
	onion: Stream<Reducer<State>>
}

interface Sources {
	History: Stream<Location>
	HTTP: HTTPSource,
	onion: StateSource<State>
	LiveData: Stream<any>
	DOM: DOMSource
}

function Sportsbook(sources: Sources): Sinks {
	const liveData$ = sources.LiveData

	// we could be better off isolating the sportsbook itself rather than these
	// two children. albeit they could do with working independently, theoretically at least.

	const catalogSinks = isolate(CatalogComponent, {
		onion: 'selections',
		DOM: sources.DOM, // needs access to clicks
	})(sources)
	const catalogDom$: Stream<VNode> = catalogSinks.DOM
	// removals, deletions via clicks on selected/unselecetd outcomes
	const catalogOnion$: Stream<Reducer<State>> = catalogSinks.onion

	const betslipSinks = isolate(Betslip, 'selections')(sources)
	const betslipDom$: Stream<VNode> = betslipSinks.DOM
	// deletions from list
	const betslipOnion$: Stream<Reducer<State>> = betslipSinks.onion

	// the catalog makes http requests. pass these up through our sinks.
	const sportsbookHttp$ = catalogSinks.HTTP

	const vdom$: Stream<VNode> =
		xs.combine(
			catalogDom$,
			betslipDom$,
		).map(renderSportsbook)

	// State - this reducer can be refactored out, used in multiple places that share this state.
	const defaultReducer$: Stream<Reducer<State>> =
		xs.of(function defaultReducer(prev) {
			if (typeof prev === 'undefined') {
				return {
					selections: []
				}
			} else {
				return prev
			}
		})

	// apply live data updates to the state
	// evey time we recieve a live update, run a reducer function against state.
	const liveDataReducer$: Stream<Reducer<State>> =
		liveData$.map((liveData: any) =>
			function liveDataReducer(prev: State): State {
				return {
					selections:
						prev.selections.map(selection => {
							if (selection.id === liveData.outcome.id) {
								return Object.assign({}, selection, {
									price: parseFloat(liveData.outcome.price),
									priceChangeUp: selection.price < parseFloat(liveData.outcome.price),
									priceChangeDown: selection.price > parseFloat(liveData.outcome.price)
								})
							}

							return selection
						})
				}
			}
		)

	const sportsbookOnion$ =
		xs.merge(
			defaultReducer$,
			catalogOnion$,
			betslipOnion$,
			liveDataReducer$,
		)

	return {
		DOM: vdom$,
		HTTP: sportsbookHttp$,
		onion: sportsbookOnion$,
	}
}

export default Sportsbook
