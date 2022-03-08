/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import './fonts/index.css'

import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter as Router } from 'react-router-dom'

import NotificationBar from './components/NotificationBar'
import * as serviceWorker from './serviceWorker'
import { GlobalContextInterface } from './types/context'

export const GlobalContext = React.createContext<GlobalContextInterface>({
  client: undefined,
  explorerClient: undefined,
  networkType: undefined,
  currentTheme: 'dark',
  switchTheme: () => null,
  setSnackbarMessage: () => null,
  timestampPrecisionMode: 'off',
  setTimestampPrecisionMode: () => null
})

let browserIsOld = false

try {
  BigInt(1)
} catch {
  browserIsOld = true
}

if (browserIsOld) {
  ReactDOM.render(
    <NotificationBar>
      Your browser version appears to be out of date. To use our app, please update your browser.
    </NotificationBar>,
    document.getElementById('root')
  )
} else {
  import('./App').then(({ default: App }) => {
    ReactDOM.render(
      <Router>
        <App />
      </Router>,
      document.getElementById('root')
    )
  })
}

//
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
