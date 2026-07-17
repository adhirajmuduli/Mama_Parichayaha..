import PortfolioDocument from '@/components/layout/PortfolioDocument'
import SceneClient from '@/components/scene/SceneClient'
import ScenePoster from '@/components/scene/ScenePoster'

export default function HomePage() {
  return (
    <>
      <ScenePoster />
      <SceneClient />
      <PortfolioDocument interactiveDecorations />
    </>
  )
}
