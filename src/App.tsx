import React, { useEffect, useState } from 'react'
import { SettingsProvider } from '@/core/settings/SettingsContext'
import { FileSystemProvider } from '@/core/filesystem/FileSystemContext'
import { NotificationProvider } from '@/core/notifications/NotificationContext'
import { AppInstallationProvider } from '@/core/appStore/AppInstallationContext'
import { WindowManagerProvider, useWindowManager } from '@/core/windowManager/WindowContext'
import { PointerLockProvider } from '@/core/pointer/PointerLockContext'
import { Desktop } from '@/components/Desktop/Desktop'

const AppContent: React.FC = () => {
  const { openApp } = useWindowManager()
  const [hasBooted, setHasBooted] = useState(false)

  // Bootup sequence
  useEffect(() => {
    if (!hasBooted) {
      setHasBooted(true)
      // Open Notes on initial visit
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
          <AppInstallationProvider>
            <PointerLockProvider>
              <WindowManagerProvider>
                <AppContent />
              </WindowManagerProvider>
            </PointerLockProvider>
          </AppInstallationProvider>
        </NotificationProvider>
      </FileSystemProvider>
    </SettingsProvider>
  )
}

export default App
