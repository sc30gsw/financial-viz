import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ShimmerProvider } from 'shimmer-from-structure'
import './index.css'
import App from './App.tsx'
import { QueryProvider } from './providers/QueryProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <ShimmerProvider
        config={{
          shimmerColor: 'rgba(99, 102, 241, 0.4)',
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          duration: 2,
          fallbackBorderRadius: 8,
        }}
      >
        <App />
      </ShimmerProvider>
    </QueryProvider>
  </StrictMode>,
)
