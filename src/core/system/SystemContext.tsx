import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type {
  SystemPowerState,
  StartupStageInfo,
  UserProfile,
  RecoveryAction,
} from './systemTypes'
import { systemLifecycle } from './systemLifecycle'
import { userManager } from './userManager'
import { recoveryManager } from './recoveryManager'

export interface SystemContextType {
  powerState: SystemPowerState
  startupProgress: number
  currentStage: StartupStageInfo | null
  activeProfile: UserProfile
  userProfiles: UserProfile[]
  switchProfile: (id: string) => void
  createProfile: (data: Partial<UserProfile>) => UserProfile
  updateProfile: (id: string, partial: Partial<UserProfile>) => void
  deleteProfile: (id: string) => boolean
  sleep: () => void
  wake: () => void
  lock: () => void
  unlock: () => void
  restart: () => void
  shutdown: () => void
  powerOn: () => void
  enterRecovery: () => void
  executeRecovery: (actionId: RecoveryAction['id']) => { success: boolean; message: string }
}

const SystemContext = createContext<SystemContextType | null>(null)

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [powerState, setPowerState] = useState<SystemPowerState>(() => systemLifecycle.getState())
  const [startupProgress, setStartupProgress] = useState(0)
  const [currentStage, setCurrentStage] = useState<StartupStageInfo | null>(null)
  const [activeProfile, setActiveProfileState] = useState<UserProfile>(() => userManager.getActiveProfile())
  const [userProfiles, setUserProfilesState] = useState<UserProfile[]>(() => userManager.getProfiles())

  // Subscribe to lifecycle changes
  useEffect(() => {
    const unsub = systemLifecycle.subscribe((state) => {
      setPowerState(state)
    })
    return unsub
  }, [])

  // Execute genuine boot on initial mount
  useEffect(() => {
    let isMounted = true

    systemLifecycle.executeStartupSequence((stage) => {
      if (!isMounted) return
      setCurrentStage(stage)
      setStartupProgress(stage.progress)
    })

    return () => {
      isMounted = false
    }
  }, [])

  const switchProfile = useCallback((id: string) => {
    const p = userManager.setActiveProfile(id)
    setActiveProfileState(p)
    setUserProfilesState(userManager.getProfiles())
  }, [])

  const createProfile = useCallback((data: Partial<UserProfile>) => {
    const p = userManager.createProfile(data)
    setUserProfilesState(userManager.getProfiles())
    return p
  }, [])

  const updateProfile = useCallback((id: string, partial: Partial<UserProfile>) => {
    const p = userManager.updateProfile(id, partial)
    if (p) {
      if (p.id === activeProfile.id) {
        setActiveProfileState(p)
      }
      setUserProfilesState(userManager.getProfiles())
    }
  }, [activeProfile.id])

  const deleteProfile = useCallback((id: string) => {
    const ok = userManager.deleteProfile(id)
    if (ok) {
      setActiveProfileState(userManager.getActiveProfile())
      setUserProfilesState(userManager.getProfiles())
    }
    return ok
  }, [])

  const sleep = useCallback(() => systemLifecycle.sleep(), [])
  const wake = useCallback(() => systemLifecycle.wake(), [])
  const lock = useCallback(() => systemLifecycle.lock(), [])
  const unlock = useCallback(() => systemLifecycle.unlock(), [])
  const restart = useCallback(() => systemLifecycle.restart(), [])
  const shutdown = useCallback(() => systemLifecycle.shutdown(), [])
  const powerOn = useCallback(() => systemLifecycle.powerOn(), [])
  const enterRecovery = useCallback(() => systemLifecycle.enterRecovery(), [])

  const executeRecovery = useCallback((actionId: RecoveryAction['id']) => {
    const res = recoveryManager.executeRecovery(actionId)
    setActiveProfileState(userManager.getActiveProfile())
    setUserProfilesState(userManager.getProfiles())
    return res
  }, [])

  return (
    <SystemContext.Provider
      value={{
        powerState,
        startupProgress,
        currentStage,
        activeProfile,
        userProfiles,
        switchProfile,
        createProfile,
        updateProfile,
        deleteProfile,
        sleep,
        wake,
        lock,
        unlock,
        restart,
        shutdown,
        powerOn,
        enterRecovery,
        executeRecovery,
      }}
    >
      {children}
    </SystemContext.Provider>
  )
}

export function useSystem(): SystemContextType {
  const context = useContext(SystemContext)
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider')
  }
  return context
}
