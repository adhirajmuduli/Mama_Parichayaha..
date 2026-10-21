import { buildClientContent, validatedContent } from '@/content'

import ImmersiveStage from '@/ui/stage/ImmersiveStage'

export default function HomePage() {
  // Server-side projection: zod validation and provenance stay on the server;
  // the client stage receives only serializable ClientContent.
  const content = buildClientContent(validatedContent)

  return <ImmersiveStage content={content} />
}
