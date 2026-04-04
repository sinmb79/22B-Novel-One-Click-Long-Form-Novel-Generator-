export function scheduleHooks(totalChapters: number, hookFrequency: number): number[] {
  const hooks: number[] = [];

  for (let chapter = Math.max(2, hookFrequency); chapter <= totalChapters; chapter += hookFrequency) {
    hooks.push(chapter);
  }

  if (!hooks.includes(totalChapters)) {
    hooks.push(totalChapters);
  }

  return hooks;
}
