import { VNode, DOMSource } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { StateSource } from 'cycle-onionify'

import { Selection, Outcome } from '../interfaces'
import { renderOutcome } from '../../misc/helpers.dom'

export interface State extends Array<Selection> { }

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

	const liveOutcome$: Stream<Outcome> =
		outcome$
			.map(outcome =>
				liveData$
					.fold((acc, curr) => ({
						...acc,
						price: parseFloat(curr.outcome.price),
						priceChangeUp: acc.price < parseFloat(curr.outcome.price),
						priceChangeDown: acc.price > parseFloat(curr.outcome.price)
					}), outcome)
					.startWith(outcome)
			)
			.flatten()

	const vdom$: Stream<VNode> =
		xs.combine(
			liveOutcome$,
			state$,
		)
		.map(([outcome, selections]): Outcome => ({
			...outcome,
			selected: selections.map(s => s.id).indexOf(outcome.id) > -1,
		}))
		.map(renderOutcome)

	return {
		DOM: vdom$,
	}
}

export default OutcomeComponent
