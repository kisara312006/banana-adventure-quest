// Banana API service - the ONLY file that talks to the external puzzle API.
// Docs: https://marcconrad.com/uob/banana/doc.php
//
// !! VERIFY AGAINST THE DOCS !!  The docs page blocked automated access while this
// project was generated, so this contract is written from the AI's recollection of
// the API, NOT from reading the page:
//   GET https://marcconrad.com/uob/banana/api.php
//   -> JSON { "question": "<image URL>", "solution": <digit 0-9> }
// If the real documentation differs, change ONLY API_URL and fetchPuzzle() below.
const API_URL = 'https://marcconrad.com/uob/banana/api.php';
const TIMEOUT_MS = 10000;

export class BananaApiError extends Error {}

export async function fetchPuzzle() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(API_URL, { signal: controller.signal, cache: 'no-store' });
    if (!res.ok) throw new BananaApiError(`The Banana API answered with status ${res.status}.`);
    let data;
    try { data = await res.json(); } catch { throw new BananaApiError('The Banana API sent a reply the game could not read.'); }
    const solution = Number(data.solution);
    if (typeof data.question !== 'string' || data.solution === '' || !Number.isInteger(solution)) {
      throw new BananaApiError('The Banana API reply was not in the expected format.');
    }
    return { imageUrl: data.question, solution };
  } catch (err) {
    if (err instanceof BananaApiError) throw err;
    if (err.name === 'AbortError') throw new BananaApiError('The Banana API took too long to answer.');
    throw new BananaApiError('Could not reach the Banana API (network or CORS problem).');
  } finally {
    clearTimeout(timer);
  }
}

// The API supplies the correct digit, so answers are checked here in the browser.
export function checkAnswer(puzzle, input) {
  const text = String(input).trim();
  return text !== '' && Number(text) === puzzle.solution;
}
