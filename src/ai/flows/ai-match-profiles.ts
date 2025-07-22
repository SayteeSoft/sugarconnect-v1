'use server';

/**
 * @fileOverview An AI agent for matching user profiles based on interests and preferences.
 *
 * - matchProfiles - A function that handles the profile matching process.
 * - MatchProfilesInput - The input type for the matchProfiles function.
 * - MatchProfilesOutput - The return type for the matchProfiles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MatchProfilesInputSchema = z.object({
  userProfileSummary: z
    .string()
    .describe('A summary of the current user profile, including interests and preferences.'),
  candidateProfileSummaries: z
    .array(z.string())
    .describe('An array of summaries for candidate profiles to match with the user.'),
  matchCriteria: z
    .string()
    .describe('Specific criteria or preferences for matching profiles.'),
});
export type MatchProfilesInput = z.infer<typeof MatchProfilesInputSchema>;

const MatchProfilesOutputSchema = z.object({
  matches: z
    .array(
      z.object({
        profileSummary: z.string().describe('A summary of the matched profile.'),
        matchScore: z.number().describe('A score indicating the quality of the match.'),
        reason: z.string().describe('The reason this profile was matched.'),
      })
    )
    .describe('An array of matched profiles with match scores and reasons.'),
});
export type MatchProfilesOutput = z.infer<typeof MatchProfilesOutputSchema>;

export async function matchProfiles(input: MatchProfilesInput): Promise<MatchProfilesOutput> {
  return matchProfilesFlow(input);
}

const matchProfilesPrompt = ai.definePrompt({
  name: 'matchProfilesPrompt',
  input: {schema: MatchProfilesInputSchema},
  output: {schema: MatchProfilesOutputSchema},
  prompt: `You are an AI matchmaker specializing in connecting users based on their interests and preferences.

  Given the following user profile summary:
  {{userProfileSummary}}

  And the following candidate profile summaries:
  {{#each candidateProfileSummaries}}
  - {{{this}}}
  {{/each}}

  Using the following match criteria:
  {{matchCriteria}}

  Determine the best matches from the candidate profiles for the user profile.  Provide a match score between 0 and 1 (inclusive) and a reason for the match for each profile.
  Return the matches in the following JSON format:
  {{json examples=[{matches: [{profileSummary: 'candidate profile summary', matchScore: 0.8, reason: 'because...'}]}]}}
  `,
});

const matchProfilesFlow = ai.defineFlow(
  {
    name: 'matchProfilesFlow',
    inputSchema: MatchProfilesInputSchema,
    outputSchema: MatchProfilesOutputSchema,
  },
  async input => {
    const {output} = await matchProfilesPrompt(input);
    return output!;
  }
);

