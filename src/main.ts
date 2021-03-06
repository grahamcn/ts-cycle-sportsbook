import { run } from '@cycle/run'
import { makeDOMDriver } from '@cycle/dom'
import { makeHTTPDriver } from '@cycle/http'
import { makeHistoryDriver } from '@cycle/history'
import { makeSocketDriver } from './drivers/socket'
import onionify from 'cycle-onionify'

import {socketUrl} from './app/misc/constants'
import App from './app/app'

const drivers = {
	DOM: makeDOMDriver('#app'),
	HTTP: makeHTTPDriver(),
	History: makeHistoryDriver(),
	LiveData: makeSocketDriver(socketUrl),
}

const wrappedMain = onionify(App)

run(wrappedMain, drivers)
