import { div, VNode, DOMSource, li } from '@cycle/dom'
import xs, { Stream, MemoryStream } from 'xstream'
import { StateSource } from 'cycle-onionify'

import { Selection, Outcome } from '../interfaces'

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

	const liveOutcome$: Stream<Outcome> =
    outcome$
      .map(outcome =>
        liveData$
          .fold((acc, curr) => ({
            ...acc,
            price: parseFloat(curr.outcome.price), // new price
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
		).map(([outcome, selections]: any) =>
			li(`.listItem .outcome ${outcome.priceChangeUp || outcome.priceChangeDown && `priceTo-${outcome.price * 100}`}`, { // force class to change
				class: {
          selected: selections.map(s => s.id).indexOf(outcome.id) > -1,
          priceChange: outcome.priceChangeUp || outcome.priceChangeDown,
				},
				dataset: {
					dataOutcome: JSON.stringify(outcome),
				}
			}, [
				div('.outcome__label', outcome.name),
				div('.outcome__price', [
					div('.price', outcome.price)
        ])
			])
		)

	return {
		DOM: vdom$,
	}
}

export default OutcomeComponent
