import { VNode, DOMSource, li, ul } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { StateSource } from 'cycle-onionify'

import { Selection, Market } from '../interfaces'
import OutcomeComponent, { Sinks as OutcomeComponentSinks } from './outcome'

export interface State extends Array<Selection> {}

export interface Sinks {
	DOM: Stream<VNode>,
}

export interface Sources {
	market$: Stream<Market>
	onion: StateSource<State>
	LiveData: Stream<any>
	DOM: DOMSource
}

function MarketComponent(sources: Sources): Sinks {
	const market$ = sources.market$
	const liveData$ = sources.LiveData

	// create a lens such that the outcome gets a selected status
	const outcomeComponentsSinks$: Stream<OutcomeComponentSinks[]> =
		market$
			.map(market =>
				market.outcomes.map(outcome =>
					OutcomeComponent({
						DOM: sources.DOM,
						onion: sources.onion,
						outcome$: xs.of(
							Object.assign(outcome, {
								competitionId: market.competitionId,
								competitionName: market.competitionName,
								competitionUrlName: market.competitionUrlName,
								eventId: market.eventId,
								eventName: market.eventName,
								eventUrlName: market.eventUrlName,
								marketId: market.id,
								marketName: market.name,
							}),
						),
						LiveData: liveData$.filter((d: any) =>
							d && d.outcome.id === outcome.id
						),
					})
			)
		)

	const outcomeComponentsDom$$: Stream<Stream<VNode>[]> =
		outcomeComponentsSinks$
			.map((outcomeComponentsSinks: OutcomeComponentSinks[]) =>
				outcomeComponentsSinks
					.map((outcomeComponentSinks: OutcomeComponentSinks) =>
						outcomeComponentSinks.DOM
					)
			)

	const outcomeComponentsDom$: Stream<VNode[]> =
		outcomeComponentsDom$$
			.map((outcomeComponentsDom$: Stream<VNode>[]): Stream<VNode[]> =>
				xs.combine(...outcomeComponentsDom$)
			)
			.flatten()

	const vdom$: Stream<VNode> =
		xs.combine(
			market$,
			outcomeComponentsDom$,
		).map(([market, outcomeComponentsDom]) =>
			li('.listItem .market', [
				ul('.list .inline .market__outcomes', [
					...outcomeComponentsDom,
				]),
			])
		)

	return {
		DOM: vdom$,
	}
}

export default MarketComponent
