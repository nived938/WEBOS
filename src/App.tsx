import React, { useEffect, useState } from 'react'
import { SettingsProvider } from '@/core/settings/SettingsContext'
import { FileSystemProvider } from '@/core/filesystem/FileSystemContext'
import { NotificationProvider } from '@/core/notifications/NotificationContext'
import { AppInstallationProvider } from '@/core/appStore/AppInstallationContext'
import { WindowManagerProvider, useWindowManager } from '@/core/windowManager/WindowContext'
import { PointerLockProvider } from '@/core/pointer/PointerLockContext'
import { SystemProvider, useSystem } from '@/core/system/SystemContext'
import { Desktop } from '@/components/Desktop/Desktop'

const AppContent: React.FC = () => {
  const { openApp } = useWindowManager()
  const { activeProfile, powerState } = useSystem()
  const [hasBooted, setHasBooted] = useState(false)

  // System startup sequence: launch user-configured startup apps once desktop is running
  useEffect(() => {
    if (!hasBooted && powerState === 'running') {
      setHasBooted(true)
      // Only launch applications if explicitly configured by the user in their active profile
      if (activeProfile.startupApps && activeProfile.startupApps.length > 0) {
        activeProfile.startupApps.forEach((appId, index) => {
          setTimeout(() => {
            openApp(appId)
          }, 300 + index * 200)
        })
      }
    }
  }, [hasBooted, powerState, activeProfile.startupApps, openApp])

  return <Desktop />
}

export function App() {
  return (
    <SettingsProvider>
      <FileSystemProvider>
        <NotificationProvider>
          <AppInstallationProvider>
            <PointerLockProvider>
              <SystemProvider>
                <WindowManagerProvider>
                  <AppContent />
                </WindowManagerProvider>
              </SystemProvider>
            </PointerLockProvider>
          </AppInstallationProvider>
        </NotificationProvider>
      </FileSystemProvider>
    </SettingsProvider>
  )
}

export default App
