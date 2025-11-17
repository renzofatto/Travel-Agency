'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Component that handles scrolling to hash anchors when navigating from other pages
 * Ensures smooth scroll behavior when clicking navbar links like /#servicios from /paquetes
 */
export default function ScrollToHash() {
  const pathname = usePathname()

  useEffect(() => {
    // Only run on the landing page
    if (pathname !== '/') return

    // Check if there's a hash in the URL
    const hash = window.location.hash
    if (!hash) return

    // Wait for the page to fully load and render
    const scrollToElement = () => {
      const element = document.querySelector(hash)
      if (element) {
        // Scroll to the element with smooth behavior
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    // Try immediately
    scrollToElement()

    // Also try after a short delay to ensure everything is rendered
    const timeout = setTimeout(scrollToElement, 100)

    return () => clearTimeout(timeout)
  }, [pathname])

  return null
}
