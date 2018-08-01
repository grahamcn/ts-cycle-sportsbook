import { div, VNode, h4, ul, p } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { StateSource } from 'cycle-onionify'
import { Competition } from './interfaces'

interface State extends Competition { }

export interface Sinks {
	DOM: Stream<VNode>,
}

export interface Sources {
	onion: StateSource<State>
}

function Competition(sources: Sources): Sinks {
	const state$ = sources.onion.state$

	const vdom$: Stream<VNode> =
		state$.map(state =>
			div('.competition', [
				h4(state.name),
				ul('.events'),
				p('No events found'),
			])

		)

	return {
		DOM: vdom$,
	}
}

export default Competition
