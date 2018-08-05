import { div, VNode, DOMSource, h2, h3 } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { StateSource } from 'cycle-onionify'
import { Competition, Selection } from './interfaces'

import EventComponent, { Sinks as EventComponentSinks } from './event'
interface State extends Array<Selection> {}

export interface Sinks {
	DOM: Stream<VNode>,
}

export interface Sources {
	competition$: Stream<Competition>
	onion: StateSource<State>
	LiveData: Stream<any>
	DOM: DOMSource
}

function CompetitionComponent(sources: Sources): Sinks {
	const state$ = sources.onion.state$
	const competition$ = sources.competition$
	const liveData$ = sources.LiveData

	// pretty much as per competition, with some data enrichment happening along the way, plus
	// filtering of live data at event, market, outcome level begins.
	const eventComponentsDom$: Stream<EventComponentSinks[]> =
		competition$
			.map(competition =>
				(competition.preLiveEvents || []).concat(competition.liveEvents || [])
					.map(event =>
						EventComponent({
							DOM: sources.DOM,
							onion: sources.onion,
							event$: xs.of(event),
							LiveData: liveData$.filter((d: any) => {
								return d && d.outcome.eventId === event.id
							}),
						})
				)
			)

	const eventComponentsDomDom$$: Stream<Stream<VNode>[]> =
		eventComponentsDom$
			.map((eventComponentsDom: EventComponentSinks[]) =>
				eventComponentsDom
					.map((eventComponent: EventComponentSinks) =>
						eventComponent.DOM
					)
			)

	const eventComponentDoms$: Stream<VNode[]> =
		eventComponentsDomDom$$
			.map((eventComponentsDoms$: Stream<VNode>[]): Stream<VNode[]> =>
				xs.combine(...eventComponentsDoms$)
			)
			.flatten()

	const vdom$: Stream<VNode> =
		xs.combine(
			competition$,
			eventComponentDoms$,
		).map(([competition, eventComponentDoms]) =>
			div('.sport__competition', [
				h2('.sport__competition', competition.name),
				div('eventList', [
					h3('.eventList__header', 'Date'),
					div('.eventList__events', [
						...eventComponentDoms
					])
				])
			])
		)

	return {
		DOM: vdom$,
	}
}

export default CompetitionComponent
