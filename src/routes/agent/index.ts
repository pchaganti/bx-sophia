import type { AppFastifyInstance } from '#app/applicationTypes';
import { cancelAgentRoute } from './cancelAgentRoute';
import { deleteAgentsRoute } from './deleteAgentsRoute';
import { forceStopAgentRoute } from './forceStopAgentRoute';
import { getAgentDetailsRoute } from './getAgentDetailsRoute';
import { getAgentIterationDetailRoute } from './getAgentIterationDetailRoute';
import { getAgentIterationSummariesRoute } from './getAgentIterationSummariesRoute';
import { getAgentIterationsRoute } from './getAgentIterationsRoute';
import { getAvailableFunctionsRoute } from './getAvailableFunctionsRoute';
import { listAgentsRoute } from './listAgentsRoute';
import { listHumanInLoopAgentsRoute } from './listHumanInLoopAgentsRoute';
import { listenAgentEventsRoute } from './listenAgentEventsRoute';
import { provideFeedbackRoute } from './provideFeedbackRoute';
import { requestAgentHilRoute } from './requestAgentHilRoute';
import { resumeAgentCompletedRoute } from './resumeAgentCompletedRoute';
import { resumeAgentErrorRoute } from './resumeAgentErrorRoute';
import { resumeAgentHilRoute } from './resumeAgentHilRoute';
import { startAgentRoute } from './startAgentRoute';
import { updateAgentFunctionsRoute } from './updateAgentFunctionsRoute';

export async function agentRoutes(fastify: AppFastifyInstance) {
	await listAgentsRoute(fastify);
	await getAvailableFunctionsRoute(fastify);
	await listHumanInLoopAgentsRoute(fastify);
	await getAgentDetailsRoute(fastify);
	await getAgentIterationsRoute(fastify);
	await getAgentIterationSummariesRoute(fastify);
	await getAgentIterationDetailRoute(fastify);
	await deleteAgentsRoute(fastify);
	await listenAgentEventsRoute(fastify); // This function internally calls fastify.get, so it's awaited for consistency.

	// Execution routes
	await forceStopAgentRoute(fastify);
	await provideFeedbackRoute(fastify);
	await resumeAgentErrorRoute(fastify);
	await resumeAgentHilRoute(fastify);
	await requestAgentHilRoute(fastify);
	await cancelAgentRoute(fastify);
	await resumeAgentCompletedRoute(fastify);
	await updateAgentFunctionsRoute(fastify);

	await startAgentRoute(fastify);
}
