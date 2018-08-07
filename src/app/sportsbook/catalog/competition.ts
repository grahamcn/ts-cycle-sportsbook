import { div, VNode, DOMSource, h2, h3, li, ul } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { StateSource } from 'cycle-onionify'

import { Competition, Selection } from '../interfaces'
import EventComponent, { Sinks as EventComponentSinks } from './event'

interface State extends Array<Selection> { }

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
	const competition$ = sources.competition$
	const liveData$ = sources.LiveData

	// pretty much as per competition, with some data enrichment happening along the way, plus
	// filtering of live data at event, market, outcome level begins.
	const eventComponentSinks$: Stream<EventComponentSinks[]> =
		competition$
			.map(competition =>
				(competition.preLiveEvents || []).concat(competition.liveEvents || [])
					.map(event =>
						EventComponent({
							DOM: sources.DOM,
							onion: sources.onion,
							event$: xs.of(
								Object.assign(event, {
									competitionId: competition.id,
									competitionName: competition.name,
									competitioUrlName: competition.urlName
								})
							),
							LiveData: liveData$.filter((d: any) => {
								return d && d.outcome.eventId === event.id
							}),
						})
					)
			)

	const eventComponentDoms$$: Stream<Stream<VNode>[]> =
		eventComponentSinks$
			.map((eventComponentsSinks: EventComponentSinks[]) =>
				eventComponentsSinks
					.map((eventComponentSinks: EventComponentSinks) =>
						eventComponentSinks.DOM
					)
			)

	const eventComponentsDom$: Stream<VNode[]> =
		eventComponentDoms$$
			.map((eventComponentDoms$: Stream<VNode>[]): Stream<VNode[]> =>
				xs.combine(...eventComponentDoms$)
			)
			.flatten()

	const vdom$: Stream<VNode> =
		xs.combine(
			competition$,
			eventComponentsDom$,
		).map(([competition, eventComponentsDom]) =>
			li('.listItem .competition', [
				div('.header', [
					h2('.heading', competition.name),
				]),
				li('.list .eventGroup', [
					div('.header', [
						h3('.heading', 'Date'),
					]),
					ul('.list .events', [
						...eventComponentsDom
					])
				])
			])
		)

	return {
		DOM: vdom$,
	}
}

export default CompetitionComponent
