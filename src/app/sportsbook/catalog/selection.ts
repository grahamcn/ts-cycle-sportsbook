import xs, { Stream } from 'xstream'
import { DOMSource, VNode } from '@cycle/dom'
import { StateSource, Reducer } from 'cycle-onionify'

import { Selection } from '../interfaces'
import { renderSelection } from '../../misc/helpers.dom'

export interface State extends Selection { }

export interface Sources {
	DOM: DOMSource
	onion: StateSource<State>
	socket: Stream<any>
}

export interface Sinks {
	DOM: Stream<VNode>
	onion: Stream<Reducer<State>>
}

function SelectionCompenent(sources: Sources): Sinks {
	const state$ = sources.onion.state$

	const deleteReducer$: Stream<Reducer<State>> =
		sources.DOM.select('.selection__remove').events('click')
			.mapTo(function deleteReducer() {
				return undefined
			})

	const reducer$: Stream<Reducer<State>> = deleteReducer$

	const vdom$: Stream<VNode> =
		state$.map(renderSelection)

	return {
		DOM: vdom$,
		onion: reducer$,
	}
}

export default SelectionCompenent
