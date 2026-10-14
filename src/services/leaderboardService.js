// Public leaderboard: collection "leaderboard" (one doc per player, no private data).
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export async function getTopPlayers(max = 20) {
  const q = query(collection(db, 'leaderboard'), orderBy('totalScore', 'desc'), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
