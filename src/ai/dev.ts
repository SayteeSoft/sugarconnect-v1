import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-profile.ts';
import '@/ai/flows/ai-match-profiles.ts';
import '@/ai/flows/initiate-conversation.ts';
import '@/ai/flows/generate-reply.ts';
