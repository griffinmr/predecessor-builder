import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()                                          // reads ANTHROPIC_API_KEY automatically
const MODEL  = process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929'

const SYSTEM_PROMPT = `You are a Predecessor game build advisor.
Given a character, their chosen role, the enemy team, and the available item pool, recommend an optimal build.

Respond with ONLY a valid JSON object — no markdown code fences, no commentary, nothing else.
The object must have exactly these three keys:

{
  "items":    ["item_id_1", "item_id_2", "item_id_3", "item_id_4", "item_id_5"],
  "strategy": "2–4 sentence tactical overview for this matchup.",
  "tips":     "1–2 specific, actionable tips."
}

Rules:
- items must contain exactly 5 item IDs chosen from the provided pool. Each ID may appear only once.
- Order the items as a build path: first item purchased → last.
- strategy should cover the overall game plan, accounting for the enemy composition when enemies are listed.
- tips should be concrete advice (e.g. specific item timings, positioning, or target priority).`

/**
 * Call Claude and return a validated build recommendation.
 * @param {{ character: object, role: string, enemies: object[], items: object[] }} ctx
 * @returns {Promise<{ itemIds: string[], strategy: string, tips: string|null }>}
 */
export async function generateBuildFromClaude({ character, role, enemies, items }) {
  const enemyLine = enemies.length
    ? enemies.map((e) => e.name).join(', ')
    : 'None selected'

  const itemPool = items
    .map((i) => `- ${i.id}: ${i.name} [${i.category}] — ${i.description}`)
    .join('\n')

  const userMessage =
    `Character: ${character.name} (id: ${character.id})\n` +
    `Role: ${role}\n` +
    `Enemy team: ${enemyLine}\n\n` +
    `Available items:\n${itemPool}\n\n` +
    `Pick exactly 5 items from the pool above. Order them as a build path (first purchase → last). Write a short strategy and tips.`

  const response = await client.messages.create({
    model:      MODEL,
    max_tokens: 1024,
    system:     SYSTEM_PROMPT,
    messages:   [{ role: 'user', content: userMessage }],
  })

  // extract text content
  const raw = response.content
    .filter((block) => block.type === 'text')
    .map((block)  => block.text)
    .join('')
    .trim()

  // strip markdown code fences when Claude ignores the "no fences" instruction
  const stripped = raw.replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/, '$1').trim()

  // ── parse ──
  let parsed
  try {
    parsed = JSON.parse(stripped)
  } catch {
    throw new Error(`Claude returned invalid JSON:\n${raw}`)
  }

  // ── validate ──
  if (!Array.isArray(parsed.items) || parsed.items.length !== 5) {
    throw new Error(
      `Expected exactly 5 items, got ${Array.isArray(parsed.items) ? parsed.items.length : 'non-array'}`
    )
  }

  const validIds = new Set(items.map((i) => i.id))
  const badIds   = parsed.items.filter((id) => !validIds.has(id))
  if (badIds.length) {
    throw new Error(`Claude returned invalid item IDs: ${badIds.join(', ')}`)
  }

  if (typeof parsed.strategy !== 'string' || !parsed.strategy.trim()) {
    throw new Error('Claude returned empty or missing strategy')
  }

  return {
    itemIds:  parsed.items,
    strategy: parsed.strategy.trim(),
    tips:     typeof parsed.tips === 'string' && parsed.tips.trim() ? parsed.tips.trim() : null,
  }
}
