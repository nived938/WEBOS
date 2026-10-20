import React, { useEffect, useState } from 'react'
import { SettingsProvider } from '@/core/settings/SettingsContext'
import { FileSystemProvider } from '@/core/filesystem/FileSystemContext'
import { NotificationProvider } from '@/core/notifications/NotificationContext'
import { WindowManagerProvider, useWindowManager } from '@/core/windowManager/WindowContext'
import { Desktop } from '@/components/Desktop/Desktop'
import { soundService } from '@/core/audio/soundService'

const AppContent: React.FC = () => {
  const { openApp, windows } = useWindowManager()
  const [hasBooted, setHasBooted] = useState(false)

  // Bootup sequence
  useEffect(() => {
    if (!hasBooted) {
      setHasBooted(true)
      // Open Finder and Notes on initial visit
      setTimeout(() => {
        openApp('notes')
      }, 300)
    }
  }, [hasBooted, openApp])

  return <Desktop />
}

export function App() {
  return (
    <SettingsProvider>
      <FileSystemProvider>
        <NotificationProvider>
          <WindowManagerProvider>
            <AppContent />
          </WindowManagerProvider>
        </NotificationProvider>
      </FileSystemProvider>
    </SettingsProvider>
  )
}

export default App
