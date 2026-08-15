import { NavRail } from './components/NavRail'
import { ValleyBackdrop } from './components/ValleyBackdrop'
import { useViewportScale } from './hooks/useViewportScale'
import { HomeScreen } from './screens/HomeScreen'
import { LiveScreen } from './screens/LiveScreen'
import { PairScreen } from './screens/PairScreen'
import { PlanScreen } from './screens/PlanScreen'
import { ProgressScreen } from './screens/ProgressScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { SetupScreen } from './screens/SetupScreen'
import { SummaryScreen } from './screens/SummaryScreen'
import { AppProvider } from './state/AppProvider'
import { useApp, type ScreenId } from './state/context'

const SCREENS: Record<ScreenId, () => React.JSX.Element> = {
  home: HomeScreen,
  setup: SetupScreen,
  live: LiveScreen,
  summary: SummaryScreen,
  progress: ProgressScreen,
  plan: PlanScreen,
  pair: PairScreen,
  settings: SettingsScreen,
}

function Shell() {
  const { screen } = useApp()
  const Screen = SCREENS[screen]

  return (
    <div className="app">
      <NavRail />
      <main className="content">
        <ValleyBackdrop />
        <Screen />
      </main>
    </div>
  )
}

export default function App() {
  useViewportScale()
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
