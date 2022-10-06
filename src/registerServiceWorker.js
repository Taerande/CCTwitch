/* eslint-disable no-console */

import { register } from 'register-service-worker'

register('firebase-messaging-sw.js')

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready () {
    },
    registered () {
    },
    cached () {
    },
    updatefound () {
    },
    updated () {
    },
    offline () {
    },
    error (error) {
      console.error('Error during service worker registration:', error)
    }
  })
}
