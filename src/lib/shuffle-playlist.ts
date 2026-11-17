/** Fisher-Yates: a fresh order without mutating the source playlist. */
export function shufflePlaylist<T>(tracks: readonly T[], random = Math.random): T[] {
  const shuffled = [...tracks];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return shuffled;
}
