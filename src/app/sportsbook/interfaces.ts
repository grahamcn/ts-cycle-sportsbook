import { VNode } from '@cycle/dom'
import { Stream } from 'xstream'
import { Reducer } from 'cycle-onionify'

export interface Catalog {
	competitions: Map<string, Competition>
	events: Map<string, Event>
	markets: Map<string, Market>
	outcomes: Map<string, Outcome>
}

export interface Competition {
	displayOrder: number
	id: string
	liveEvents?: Event[]
	name: string
	preLiveEvents?: Event[]
	urlName: string
}

export interface Event {
	id: string
	name: string
	status: string
	live: boolean
	started: boolean
	startTime: string
	displayOrder: number
	urlName: string
	markets: Market[]

	competitionId: string
	competitionName: string
	competitionUrlName: string
}

export interface Market {
	id: string
	name: string
	minorCode: string
	status: string
	inRunning: boolean
	displayOrder: boolean
	outcomes: Outcome[]

	competitionId: string
	competitionName: string
	competitionUrlName: string

	eventId: string
	eventName: string
	eventUrlName: string
}

export interface Outcome {
	id: string
	name: string
	type: string
	price: number
	priceDen: number
	priceNum: number
	displayOrder: number
	status: string

	competitionId: string
	competitionName: string
	competitionUrlName: string

	eventId: string
	eventName: string
	eventUrlName: string

	marketId: string
	marketName: string

	selected?: boolean
	priceChangeUp?: boolean
	priceChangeDown?: boolean
}

export interface Selection extends Outcome {
	isBanker?: boolean
}

export interface CatalogComponentSinks {
	DOM?: Stream<VNode>
	onion?: Stream<Reducer<any>>
}
