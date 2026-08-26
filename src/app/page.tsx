import ImmersiveStage from '@/components/portfolio/ImmersiveStage'
import PortfolioDocument from '@/components/layout/PortfolioDocument'
import SceneEnhancement from '@/components/scene/SceneEnhancement'
import ScenePoster from '@/components/scene/ScenePoster'

const cyclicJourneyEnabled = process.env.NEXT_PUBLIC_CYCLIC_JOURNEY === 'true'

export default function HomePage() {
  if (cyclicJourneyEnabled) {
    return <ImmersiveStage />
  }

  return (
    <>
      <ScenePoster />
      <SceneEnhancement />
      <PortfolioDocument interactiveDecorations />
    </>
  )
}
