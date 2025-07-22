
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || "3ee1a7f3-b3d8-4b7d-a39a-3f40659920cb";

  return (
    <form action="https://api.web3forms.com/submit" method="POST" className="space-y-6">
      <input type="hidden" name="access_key" value={ACCESS_KEY} />
      <input type="hidden" name="subject" value="New Contact Form Submission from Sugar Connect" />
      <input type="hidden" name="from_name" value="Sugar Connect" />

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input type="text" id="name" name="name" required placeholder="John Doe" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input type="email" id="email" name="email" required placeholder="your.email@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" required placeholder="Please write your message here..." rows={5} />
      </div>
      
      <input type="hidden" name="redirect" value={`${process.env.NEXT_PUBLIC_URL || 'http://localhost:9002'}/success`} />
      <input type="checkbox" name="botcheck" className="hidden" style={{display: 'none'}}></input>


      <Button type="submit" className="w-full">Send Message</Button>
    </form>
  );
}
