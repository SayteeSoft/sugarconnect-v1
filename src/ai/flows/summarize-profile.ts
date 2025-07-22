'use server';

/**
 * @fileOverview Summarizes profile details using AI to provide a quick understanding of potential matches.
 *
 * - summarizeProfile - A function that handles the profile summarization process.
 * - SummarizeProfileInput - The input type for the summarizeProfile function.
 * - SummarizeProfileOutput - The return type for the summarizeProfile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeProfileInputSchema = z.object({
  profileDetails: z
    .string()
    .describe('The detailed information of the user profile.'),
  userInterests: z
    .string()
    .describe('The interests of the current user for personalized summaries.'),
});
export type SummarizeProfileInput = z.infer<typeof SummarizeProfileInputSchema>;

const SummarizeProfileOutputSchema = z.object({
  summary: z.string().describe('A brief summary of the user profile.'),
});
export type SummarizeProfileOutput = z.infer<typeof SummarizeProfileOutputSchema>;

export async function summarizeProfile(input: SummarizeProfileInput): Promise<SummarizeProfileOutput> {
  return summarizeProfileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeProfilePrompt',
  input: {schema: SummarizeProfileInputSchema},
  output: {schema: SummarizeProfileOutputSchema},
  prompt: `You are an AI assistant designed to summarize user profiles for a dating app, Sugar Connect. Given the profile details and the current user's interests, create a concise and engaging summary highlighting the most relevant aspects.

Profile Details: {{{profileDetails}}}
User Interests: {{{userInterests}}}

Summary:`,
});

const summarizeProfileFlow = ai.defineFlow(
  {
    name: 'summarizeProfileFlow',
    inputSchema: SummarizeProfileInputSchema,
    outputSchema: SummarizeProfileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
