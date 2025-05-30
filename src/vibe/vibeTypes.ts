import type { FieldValue } from '@google-cloud/firestore';
import type { SelectedFile } from '#swe/discovery/selectFilesAgent'; // Import SelectedFile

// Represents a node in a file system tree (example structure)
export interface FileSystemNode {
	path: string;
	name: string;
	type: 'file' | 'directory';
	children?: FileSystemNode[];
	summary?: string; // Optional summary from indexing agent
}

// --- VibeSession interface and related types ---
export interface VibeSession {
	id: string; // Primary key, ideally a UUID
	userId: string; // To associate with a user
	title: string;
	instructions: string;
	repositorySource: 'local' | 'github' | 'gitlab'; // Source of the repository
	repositoryId: string; // Identifier for the repository (e.g., local path, 'owner/repo', 'group/project')
	repositoryName?: string; // Optional: User-friendly name (e.g., 'my-cool-project')
	targetBranch: string; // The existing branch to base the work on and potentially merge into
	workingBranch: string; // The name of the branch to perform work on (can be new or existing)
	createWorkingBranch: boolean; // Whether the workingBranch needs to be created
	useSharedRepos: boolean; // Flag indicating if shared repository storage should be used
	status:
		| 'initializing' // Session created, preparing workspace
		| 'design_review' // Waiting for user approval on the AI-generated design/plan
		| 'coding' // AI is actively writing or modifying code
		| 'code_review' // Waiting for user feedback on the generated code changes
		| 'committing' // AI is preparing and making the commit
		| 'monitoring_ci' // Changes committed, waiting for CI/CD pipeline results
		| 'ci_failed' // CI/CD pipeline failed
		| 'completed' // Process finished successfully (including potential CI success)
		| 'error'; // An unrecoverable error occurred during the process
	lastAgentActivity: FieldValue | Date; // Timestamp of the last significant action by an agent
	fileSelection?: SelectedFile[]; // Array of files selected by the file selection agent for the task
	designAnswer?: string; // The AI-generated plan or design document for the task
	codeDiff?: string; // The generated code changes in diff format
	commitSha?: string; // The SHA hash of the commit generated by the Vibe session
	pullRequestUrl?: string; // The URL of the pull/merge request created (if applicable)
	ciCdStatus?: 'pending' | 'running' | 'success' | 'failed' | 'cancelled'; // Status of the associated CI/CD pipeline run
	ciCdJobUrl?: string; // Direct link to the specific CI/CD job or pipeline run
	ciCdAnalysis?: string; // AI-generated analysis of CI/CD failure logs (if applicable)
	ciCdProposedFix?: string; // AI-proposed code changes to fix a CI/CD failure (if applicable)
	createdAt: FieldValue | Date; // Timestamp when the session was created
	updatedAt: FieldValue | Date; // Timestamp when the session was last updated
	error?: string; // Optional field to store error messages if the status is 'error'
}

// --- Data Transfer Objects (DTOs) ---

// Data needed to create a new session (typically from user input)
export type CreateVibeSessionData = Omit<
	VibeSession,
	| 'id' // Generated by the system
	| 'userId' // Added by the backend based on authentication
	| 'status' // Initialized by the system
	| 'lastAgentActivity' // Initialized by the system
	| 'fileSelection' // Populated by agent
	| 'designAnswer' // Populated by agent
	| 'codeDiff' // Populated by agent
	| 'commitSha' // Populated by agent
	| 'pullRequestUrl' // Populated by agent
	| 'ciCdStatus' // Populated by monitoring
	| 'ciCdJobUrl' // Populated by monitoring
	| 'ciCdAnalysis' // Populated by agent
	| 'ciCdProposedFix' // Populated by agent
	| 'createdAt' // Set by the system
	| 'updatedAt' // Set by the system
	| 'error' // Set by the system on error
>;

// Data allowed for generic updates via the updateVibeSession method
// Excludes fields that should not be directly updated or are immutable
export type UpdateVibeSessionData = Partial<
	Omit<
		VibeSession,
		| 'id' // Cannot change ID
		| 'userId' // Cannot change owner
		| 'repositorySource' // Immutable after creation
		| 'repositoryId' // Immutable after creation
		| 'targetBranch' // Base branch is immutable after creation
		| 'workingBranch' // Working branch is immutable after creation/start
		| 'createWorkingBranch' // Flag is immutable after creation/start
		| 'createdAt' // Immutable
	>
>;

// Specific data structure for requesting an update to the design based on new instructions
export interface UpdateDesignInstructionsData {
	instructions: string; // User's feedback or new instructions for refining the design
}

// Specific data structure for requesting code revisions based on user review comments
export interface UpdateCodeReviewData {
	reviewComments: string; // User's comments or instructions for revising the code
}

// Specific data structure for the final commit action, providing commit details
export interface CommitChangesData {
	commitTitle: string; // The title for the git commit
	commitMessage: string; // The detailed message for the git commit
}

// --- End Definitions ---
