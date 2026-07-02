import { ChallengeController } from "@/controllers/challengeController";

const challengeController = new ChallengeController();

export async function GET() {
  return challengeController.list();
}

export async function POST(request: Request) {
  return challengeController.create(request);
}
