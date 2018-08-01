import { div, VNode } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { StateSource } from '../../../node_modules/cycle-onionify'
import { Competition } from './interfaces'

interface State extends Map<string, Competition> { }

export interface Sinks {
	DOM: Stream<VNode>,
}

export interface Sources {
	onion: StateSource<State>
}

function Competitions(sources: Sources): Sinks {
	const state$ = sources.onion.state$

	const vdom$: Stream<VNode> =
		state$
			.filter(state => !!state) // ths ensures we do not emit a value 'undefined' when there is a change from state to undefined state.
			.map((state: State) =>
				div([
					div('state...'),
					div(state.size ? 'Competitions!' : 'No comps found for sport'),
				])
			)

	return {
		DOM: vdom$,
	}
}

export default Competitions
