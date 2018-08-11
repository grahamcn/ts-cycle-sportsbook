import { MenuLink } from '../menus/interfaces'
import { li, a, VNode, div, ul, h2, h3, p, span, h1 } from '@cycle/dom'
import { Selection, Outcome, Event, Competition, Market } from '../sportsbook/interfaces'

export function renderListItem(dom: VNode): VNode {
	return li('.listItem', dom)
}

export function renderDataError(err?: string): VNode {
	debugger
	return div('.error', err  || 'error loading dynamic data')
}

export function renderLoading(): VNode {
	return div('.loading', 'loading')
}

export function renderMenu([title, menuItemListDom]: [string, VNode[]]): VNode {
	return div('.menu', [
		title && div('.header',
			div('.heading', title)
		),
		ul('.list', menuItemListDom)
	])
}

export function renderMenuGroup([title, groupState, menuDom]) {
	return li('.listItem', [
	div(groupState.classes.join(' '), [
		title,
		span(groupState.arrow)
	]),
	!groupState.open ? undefined :
		ul('.list', [
			menuDom,
		])
])
}
export function renderMenuLink(item: MenuLink): VNode {
	return renderListItem(renderLink(item.url, item.title))
}

export function renderLink(url, title): VNode {
	return a('.link', {
		attrs: {
			href: url,
			title: title,
		},
		dataset: {
			dataUrl: url
		}
	}, title)
}

export function renderHeader(heading) {
	return div('.header', [
		h2('.heading', heading),
	])
}

export function renderSelection(selection: Selection): VNode {
	return li(`.listItem .selection ${selection.priceChangeUp || selection.priceChangeDown ? `priceTo-${selection.price * 100}` : ''}`, {
		class: {
			priceChange: selection.priceChangeUp || selection.priceChangeDown,
		},
	}, [
			div('.selection__price', [
				div('.price', {
				},
					selection.price,
				),
			]),
			div('.selection__details', [
				div('.selection__outcome', selection.name),
				div('.selection__market', selection.marketName),
				div('.selection__startTime', 'time'),
			]),
			div('.selection__remove', 'x')
		])
}

export function renderOutcome(outcome: Outcome): VNode {
	return li(`.listItem .outcome ${outcome.priceChangeUp || outcome.priceChangeDown && `priceTo-${outcome.price * 100}`}`, { // force class to change
		class: {
			selected: outcome.selected,
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
}

export function renderMarket([market, outcomeComponentsDom]: [Market, VNode[]]): VNode {
	return li('.listItem .market', [
		ul('.list .inline .market__outcomes', [
			...outcomeComponentsDom,
		]),
	])
}

export function renderEvent([event, marketComponentsDom]: [Event, VNode[]]) {
	return li('.listItem .event', [
		renderLink('#', event.name),
		ul('.list .inline .markets', [
			...marketComponentsDom,
		])
	])
}


export function renderCompetition([competition, eventComponentsDom]: [Competition, VNode[]]): VNode {
	return li('.listItem .competition', [
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
}

export function renderSport([competitionComponentsDom]: [VNode[]]): VNode {
	return competitionComponentsDom.length === 0 ?
		p('No competitions found for sport') :
		ul('.list', [
			...competitionComponentsDom,
		])
}

export function renderSportsbook([catalogDom, betslipDom]: [VNode, VNode]): VNode {
	return div('.sportsbook', [
		catalogDom,
		betslipDom,
	])
}

export function renderBetslip([count, selectionsDom]: [number, VNode[]]): VNode {
	return div('.betslip', [
		div('.header', [
			h3('.heading', [
				!count ? undefined : span('.count', `${count} `),
				span('Betslip'),
			]),
		]),
		ul('.list', [
			...selectionsDom
		])
	])
}

export function renderCatalog(dom: VNode): VNode {
	return div('.catalog', [
		dom,
	])
}

export function renderSecondaryMenu(links: MenuLink[]): VNode {
	return div('.secondaryMenu',
		ul('.list .inline',
			links.map(renderMenuLink)
		)
	)
}

export function renderTertiaryMenu([staticMenusDom, dynamicDom]: [VNode[], VNode[]]): VNode {
	return div('.tertiaryMenu', [
		ul('.list', staticMenusDom),
		ul('.list', dynamicDom),
	])
}

export function renderApp([secondaryMenuDom, tertiaryMenuDom, sportsbookDom]) {
	return div('.container', [
		div('.head', [
			div('.header',
				h1('.heading', 'Sky Bet POC')
			),
		]),
		secondaryMenuDom,
		div('.content', [
			tertiaryMenuDom,
			sportsbookDom,
		])
])
}
