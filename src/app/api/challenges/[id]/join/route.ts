import { ChallengeController } from "@/controllers/challengeController";

const challengeController = new ChallengeController();

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return challengeController.join(id);
}
