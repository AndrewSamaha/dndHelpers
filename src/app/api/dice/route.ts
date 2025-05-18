import { NextRequest, NextResponse } from 'next/server';
import { rollDice } from '@/tools/dice/dice';
import { z } from 'zod';

const diceSchema = z.object({
  numRolls: z.number().int().min(1),
  numSides: z.number().int().min(2),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log(`POST [Dice API] Body: ${JSON.stringify(body)}`);
    const parseResult = diceSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.flatten() },
        { status: 400 },
      );
    }
    const { numRolls, numSides, reason } = parseResult.data;
    if (typeof reason === 'string') {
      console.log(`[Dice API] Reason: ${reason}`);
    }
    const result = rollDice(numRolls, numSides);
    return NextResponse.json({ numRolls, numSides, reason, result });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request', cause: e }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  console.log(`GET [Dice API] Search params: ${JSON.stringify(searchParams)}`);
  const numRolls = Number(searchParams.get('numRolls'));
  const numSides = Number(searchParams.get('numSides'));
  const reason = searchParams.get('reason') || undefined;
  const parseResult = diceSchema.safeParse({ numRolls, numSides, reason });
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parseResult.error.flatten() },
      { status: 400 },
    );
  }
  if (typeof reason === 'string') {
    console.log(`[Dice API] Reason: ${reason}`);
  }
  const result = rollDice(numRolls, numSides);
  return NextResponse.json({ numRolls, numSides, reason, result });
}
