// // app/api/chat/route.ts
// import { groq } from '@ai-sdk/groq';
// import { streamText } from 'ai';
// import { NextRequest, NextResponse } from 'next/server';

// export async function POST(req: NextRequest) {
//   try {
//     const { messages, model } = await req.json();

//     if (!messages || !Array.isArray(messages)) {
//       return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
//     }

//     // Default to a supported model (as of Oct 2025)
//     const safeModel = model || 'llama-3.1-8b-instant';
//     const groqModel = groq(safeModel);

//     const result = await streamText({
//       model: groqModel,
//       messages: messages.map((msg: any) => ({
//         role: msg.role,
//         content: msg.content,
//       })),
//     });

//     // Use toTextStreamResponse for Next.js compatibility
//     return result.toTextStreamResponse();
//   } catch (error: any) {
//     console.error('Groq API Error:', error);

//     if (error?.statusCode === 400 && error?.data?.error?.code === 'model_decommissioned') {
//       return NextResponse.json(
//         { error: 'Model deprecated. Try llama-3.1-8b-instant.' },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json(
//       { error: `Internal server error: ${error.message || 'Unknown'}` },
//       { status: 500 }
//     );
//   }
// }

// app/api/chat/route.ts
import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, model } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }

    const safeModel = model || 'llama-3.1-8b-instant';
    const groqModel = groq(safeModel);

    const systemPrompt = `
      You are a helpful AI assistant. Format all responses in Markdown with:
      - A main heading (#) for the topic.
      - A brief, engaging introduction.
      - A section (##) for key points or features, using bullet points (-) for clarity.
      - A section (##) for use cases or applications, if relevant, with bullet points.
      - A closing section (##) with a call-to-action (e.g., "Want to learn more?").
      - Keep the tone concise, enthusiastic, and beginner-friendly.
      - Avoid repetition and ensure clarity.
    `;

    const result = await streamText({
      model: groqModel,
      system: systemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.role || msg.from,
        content: msg.content || msg.versions?.[0]?.content || '',
      })),
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('Groq API Error:', error);
    if (error?.statusCode === 400 && error?.data?.error?.code === 'model_decommissioned') {
      return NextResponse.json(
        { error: 'Model deprecated. Try llama-3.1-8b-instant.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: `Internal server error: ${error.message || 'Unknown'}` },
      { status: 500 }
    );
  }
}