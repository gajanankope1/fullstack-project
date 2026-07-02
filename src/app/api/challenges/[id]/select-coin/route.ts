import { ChallengeController } from "@/controllers/challengeController";

const challengeController = new ChallengeController();

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return challengeController.selectCoin(id, request);
}
