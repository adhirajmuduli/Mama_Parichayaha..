import PortfolioDocument from '@/components/layout/PortfolioDocument'
import SceneEnhancement from '@/components/scene/SceneEnhancement'
import ScenePoster from '@/components/scene/ScenePoster'

export default function HomePage() {
  return (
    <>
      <ScenePoster />
      <SceneEnhancement />
      <PortfolioDocument interactiveDecorations />
    </>
  )
}
