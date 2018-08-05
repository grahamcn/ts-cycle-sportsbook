import { div, VNode, h4, ul, p, DOMSource, span } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { StateSource } from 'cycle-onionify'
import { Selection, Outcome } from './interfaces'

export interface State extends Array<Selection> {}

export interface Sinks {
	DOM: Stream<VNode>,
}

export interface Sources {
	outcome$: Stream<Outcome>
	onion: StateSource<State>
	LiveData: Stream<any>
	DOM: DOMSource
}

function OutcomeComponent(sources: Sources): Sinks {
	const state$ = sources.onion.state$
	const outcome$ = sources.outcome$
	const liveData$ = sources.LiveData

	const vdom$: Stream<VNode> =
		xs.combine(
			xs.merge(outcome$, liveData$.map(x =>
				Object.assign(x.outcome, {
					name: 'updated'
				})
			)),
			state$,
		).map(([outcome, selections]) =>
			div('.outcome', {
				class: {
					selected: selections.map(s => s.id).indexOf(outcome.id) > -1,
				},
				dataset: {
					dataOutcome: JSON.stringify(outcome),
				}
			}, [
				span(outcome.name),
				h4(outcome.price),
			])
		)

	return {
		DOM: vdom$,
	}
}

export default OutcomeComponent
