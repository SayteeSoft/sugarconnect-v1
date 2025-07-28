'use server';
/**
 * @fileOverview Generates a contextual reply in a conversation.
 *
 * - generateReply - A function that handles generating a reply.
 * - GenerateReplyInput - The input type for the generateReply function.
 * - GenerateReplyOutput - The return type for the generateReply function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
  senderId: z.string(),
  text: z.string(),
});

const GenerateReplyInputSchema = z.object({
  conversationHistory: z.array(MessageSchema).describe('The history of the conversation.'),
  responderProfile: z.string().describe('The profile of the user who is replying.'),
  recipientProfile: z.string().describe('The profile of the user who will receive the reply.'),
  responderRole: z.enum(['Sugar Daddy', 'Sugar Baby']).describe('The role of the user replying.'),
});
export type GenerateReplyInput = z.infer<typeof GenerateReplyInputSchema>;

const GenerateReplyOutputSchema = z.object({
  reply: z.string().describe('The generated reply.'),
});
export type GenerateReplyOutput = z.infer<typeof GenerateReplyOutputSchema>;

export async function generateReply(input: GenerateReplyInput): Promise<GenerateReplyOutput> {
  return generateReplyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReplyPrompt',
  input: {schema: GenerateReplyInputSchema},
  output: {schema: GenerateReplyOutputSchema},
  prompt: `You are an AI assistant for a dating app called Sugar Connect. Your task is to generate a realistic and contextually appropriate reply in an ongoing conversation.

  Here is the profile of the user you are acting as (the responder):
  {{{responderProfile}}}

  Here is the profile of the other user in the conversation (the recipient):
  {{{recipientProfile}}}

  Here is the conversation history so far:
  {{#each conversationHistory}}
    {{#if (eq senderId responderProfile.id)}}
      [You]: {{{text}}}
    {{else}}
      [Them]: {{{text}}}
    {{/if}}
  {{/each}}

  Based on the persona of a {{responderRole}}, the user profiles, and the conversation history, generate a natural, engaging, and short follow-up message. The reply should be in the first person, as if you are the responder.
  
  Reply:`,
});

const generateReplyFlow = ai.defineFlow(
  {
    name: 'generateReplyFlow',
    inputSchema: GenerateReplyInputSchema,
    outputSchema: GenerateReplyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
