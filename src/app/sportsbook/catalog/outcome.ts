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

	// live outcome is a reduction (fold in xs) on the outcome with the live update data.
	// we 'start with' outcome such that we don't have to wait for a live data update to arrive
	// for this stream to emit.
	// we flatten as we map each outcome stream value (which only emits once) to a stream emitting many
	// liveOutcomes (from the reduction), starting with the original outcome.
	const liveOutcome$: Stream<Outcome> =
		outcome$
			.map(outcome =>
				liveData$
					.fold((liveOutcome, liveData) => ({
						...liveOutcome,
						price: parseFloat(liveData.outcome.price),
						priceChangeUp: liveOutcome.price < parseFloat(liveData.outcome.price),
						priceChangeDown: liveOutcome.price > parseFloat(liveData.outcome.price)
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
