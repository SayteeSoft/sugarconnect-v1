'use server';
/**
 * @fileOverview Generates an introductory message from one user to another.
 *
 * - initiateConversation - A function that handles generating the message.
 * - InitiateConversationInput - The input type for the initiateConversation function.
 * - InitiateConversationOutput - The return type for the initiateConversation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InitiateConversationInputSchema = z.object({
  senderProfile: z.string().describe("JSON string of the sender's profile."),
  recipientProfile: z.string().describe("JSON string of the recipient's profile."),
  senderRole: z.enum(['Sugar Daddy', 'Sugar Baby']).describe("The role of the sender."),
});
export type InitiateConversationInput = z.infer<typeof InitiateConversationInputSchema>;

const InitiateConversationOutputSchema = z.object({
  message: z.string().describe('The generated introductory message.'),
});
export type InitiateConversationOutput = z.infer<typeof InitiateConversationOutputSchema>;

export async function initiateConversation(input: InitiateConversationInput): Promise<InitiateConversationOutput> {
  return initiateConversationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'initiateConversationPrompt',
  input: {schema: InitiateConversationInputSchema},
  output: {schema: InitiateConversationOutputSchema},
  prompt: `You are an AI assistant for a dating app called Sugar Connect. Your task is to generate a warm, engaging, and personalized introductory message from one user to another.

  You are generating a message from the perspective of a {{senderRole}}.

  Sender's Profile:
  {{{senderProfile}}}

  Recipient's Profile (the person receiving the message):
  {{{recipientProfile}}}

  Based on the profiles, write a short, friendly, and compelling introductory message (1-2 sentences). The message should reference a specific detail from the recipient's profile to make it feel personal.
  
  Example: "Hi [Name], I was so impressed by your passion for [Interest]. I'd love to hear more about it sometime."
  
  Generated Message:`,
});

const initiateConversationFlow = ai.defineFlow(
  {
    name: 'initiateConversationFlow',
    inputSchema: InitiateConversationInputSchema,
    outputSchema: InitiateConversationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
