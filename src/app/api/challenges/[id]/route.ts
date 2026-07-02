import { ChallengeController } from "@/controllers/challengeController";

const challengeController = new ChallengeController();

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return challengeController.getById(id);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return challengeController.delete(id);
}
