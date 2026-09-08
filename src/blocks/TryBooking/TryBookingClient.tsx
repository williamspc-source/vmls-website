'use client'

import React, { useEffect, useRef, useState } from 'react'

const SCRIPT_SRC = 'https://www.trybooking.com/widget.js'
const TRYBOOKING_ORIGIN = 'https://www.trybooking.com'

/**
 * Mounts TryBooking's widget and decides whether it actually worked.
 *
 * ── Why the fallback is hidden by a MESSAGE and not by an iframe appearing ──
 * The obvious check — "an <iframe> is now inside the container" — is wrong, and
 * was measured to be wrong. When framing is refused the iframe ELEMENT is still
 * created and still has a height (380px, against 1324px when it works), holding
 * a `chrome-error://chromewebdata/` document. So that check hides the fallback
 * precisely when the visitor most needs it, and the page shows a blank box.
 *
 * A cross-origin frame that never loaded cannot post a message. TryBooking's
 * widget wraps iframe-resizer, whose child sends `[iFrameSizer]…:init` to the
 * parent as soon as it runs. Receiving that from their origin is proof the
 * booking form is really there — the one signal a blocked frame cannot fake.
 *
 * ── Why the fallback is in the server HTML ──
 * It renders visible and is hidden on success, rather than appearing on failure.
 * With JavaScript disabled the widget cannot work at all, and a fallback that
 * needs JavaScript to appear would leave those visitors with nothing. The cost
 * is a brief flash of the button before the form loads; the benefit is that
 * every failure mode — script blocked, widget changed, JS off, arriving by
 * client-side navigation — lands on a working booking link.
 */
export const TryBookingClient: React.FC<{
  eventId: string
  widgetType: string
  fallbackHref: string
  children: React.ReactNode
}> = ({ eventId, widgetType, fallbackHref, children }) => {
  const [embedded, setEmbedded] = useState(false)
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== TRYBOOKING_ORIGIN) return
      // Any message from their frame means it loaded and is running.
      setEmbedded(true)
    }
    window.addEventListener('message', onMessage)

    // Load their script live from their servers. TryBooking's own guidance is
    // not to cache widget.js locally, because fixes are pushed through it.
    if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      const script = document.createElement('script')
      script.src = SCRIPT_SRC
      script.async = true
      script.defer = true
      document.body.appendChild(script)
    }
    // Deliberately no re-init attempt when the script is already present. It
    // guards itself with a private `trybWidgetsInitialized` global and exposes
    // no re-init API, so on a client-side navigation the widget stays empty and
    // the fallback stays visible. Reaching into that global is an undocumented
    // internal, and this site has no maintainer to fix it when it changes.

    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <div ref={hostRef} className="vf-trybooking">
      {/* Collapsed until the form proves it loaded. A refused frame still creates
          an iframe ELEMENT and still gets a height, so leaving this visible shows
          a large grey box with the browser's "refused to connect" face above a
          working booking button — which reads as broken even though the fallback
          did its job. Measured: the widget initialises perfectly inside
          `height: 0; overflow: hidden` (the frame loaded, 1498 characters of the
          listing, and it sized to 1328px the moment the wrapper was revealed), so
          hiding it costs nothing and no visitor ever sees a failed embed. */}
      <div className={`vf-trybooking__embed${embedded ? ' is-loaded' : ''}`}>
        <div className="tryb-widget" data-type={widgetType} data-eid={eventId} />
      </div>
      {/* `hidden` rather than unmounting: removing the node on success would let
          a later failure leave nothing behind, and it keeps the link in the DOM
          for anything reading the page without running scripts. */}
      <p className="vf-trybooking__fallback" hidden={embedded}>
        <a className="btn btn-primary" href={fallbackHref} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      </p>
    </div>
  )
}
