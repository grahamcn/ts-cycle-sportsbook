import { div, VNode, DOMSource, a } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { StateSource } from 'cycle-onionify'
import { Event, Selection } from './interfaces'

import MarketComponent, { Sinks as MarketComponentSinks } from './market'

export interface State extends Array<Selection> {}

export interface Sinks {
	DOM: Stream<VNode>,
}

export interface Sources {
	event$: Stream<Event>
	onion: StateSource<State>
	LiveData: Stream<any>
	DOM: DOMSource
}

function EventComponent(sources: Sources): Sinks {
	const event$ = sources.event$
	const liveData$ = sources.LiveData

	const marketComponentsSinks$: Stream<MarketComponentSinks[]> =
		event$
			.map(({markets}) =>
					markets.map(market =>
						MarketComponent({
							DOM: sources.DOM,
							onion: sources.onion,
							market$: xs.of(market),
							LiveData: liveData$.filter((d: any) => d && d.outcome.marketId === market.id),
						})
				)
			)

	const marketComponentsDom$$: Stream<Stream<VNode>[]> =
		marketComponentsSinks$
			.map((marketComponentsSinks: MarketComponentSinks[]) =>
				marketComponentsSinks
					.map((marketComponentSinks: MarketComponentSinks) =>
						marketComponentSinks.DOM
					)
			)

	const marketComponentDoms$: Stream<VNode[]> =
		marketComponentsDom$$
			.map((marketComponentsDom$: Stream<VNode>[]): Stream<VNode[]> =>
				xs.combine(...marketComponentsDom$)
			)
			.flatten()


	const vdom$: Stream<VNode> =
		xs.combine(
			event$,
			marketComponentDoms$,
		).map(([event, marketComponentDoms]) =>
			div('.event', [
				a('.event__name',
					event.name
				),
				div('.event__markets', [
					...marketComponentDoms,
				])
			])
		)

	return {
		DOM: vdom$,
	}
}

export default EventComponent
