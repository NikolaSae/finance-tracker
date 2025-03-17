'use client'

import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { useServerInsertedHTML } from 'next/navigation'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from '@/theme/theme'
import { useState } from 'react'

export default function EmotionCacheProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [cache] = useState(() =>
    createCache({
      key: 'css',
      prepend: true,
      compat: true
    })
  )

  useServerInsertedHTML(() => (
    <style
      data-emotion={`${cache.key} ${Object.keys(cache.inserted).join(' ')}`}
      dangerouslySetInnerHTML={{
        __html: Object.values(cache.inserted).join(' '),
      }}
    />
  ))

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  )
}