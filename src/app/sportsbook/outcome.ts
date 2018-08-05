import { div, VNode, DOMSource, li } from '@cycle/dom'
import xs, { Stream, MemoryStream } from 'xstream'
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

	const liveOutcome$: MemoryStream<{}> =
		xs.merge(
			outcome$,
			liveData$
		).fold((acc, curr) => {
			if (curr.name) { // it's our outcome
				return curr
			}

			// live upates
			return {
				...acc,
				price: parseFloat(curr.outcome.price)
			}
		}, {})

	const vdom$: Stream<VNode> =
		xs.combine(
			liveOutcome$,
			state$,
		).map(([outcome, selections]: any) =>
			li('.listItem .outcome', {
				class: {
					selected: selections.map(s => s.id).indexOf(outcome.id) > -1,
				},
				dataset: {
					dataOutcome: JSON.stringify(outcome),
				}
			}, [
				div('.outcome__label', outcome.name),
				div(
					div('.price', outcome.price)
				)
			])
		)

	return {
		DOM: vdom$,
	}
}

export default OutcomeComponent
