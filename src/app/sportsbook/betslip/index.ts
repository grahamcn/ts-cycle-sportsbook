import { VNode } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { StateSource, makeCollection, Reducer } from 'cycle-onionify'

import { Selection } from '../interfaces'
import SelectionComponent from './selection'
import { renderBetslip } from '../../misc/helpers.dom'

interface State extends Array<Selection> {}

interface Sinks {
	DOM: Stream<VNode>,
	onion: Stream<Reducer<State>>
}

interface Sources {
	onion: StateSource<State>
}

function Betslip(sources: Sources): Sinks {
	const state$ = sources.onion.state$

	// a list derived from the components state
	const List = makeCollection({
		item: SelectionComponent,
		itemKey: (item: any) => item.id,
		itemScope: key => key,
		collectSinks: instances => ({
			onion: instances.pickMerge('onion'), // merge all the state streams
			DOM: instances.pickCombine('DOM') // combine all the dom streams
		})
	})

	const listSinks = List(sources) // no isolation in particular, just against state by default
	const listSinksDOM$: Stream<VNode[]> = listSinks.DOM
	const linkOnion$: Stream<Reducer<State>> = listSinks.onion

	// "😸"
	const vdom$: Stream<VNode> =
		xs.combine(
			state$.map(state => state.length),
			listSinksDOM$,
		).map(renderBetslip)

	return {
		DOM: vdom$,
		onion: linkOnion$,
	}
}

export default Betslip
