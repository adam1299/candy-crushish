export const regions = [
  { name: 'Thunderhead Isles', short: 'Thunderhead', color: '#a77bff', description: 'Wake the sleeping sky.' },
  { name: 'Frostbite Frontier', short: 'Frostbite', color: '#6ee7ff', description: 'Break through the deep freeze.' },
  { name: 'Monsoon Machine', short: 'Monsoon', color: '#49e9bf', description: 'Bring the rain. Bring the thunder.' },
  { name: 'Solar Surge', short: 'Solar', color: '#ffbd59', description: 'Turn the heat all the way up.' },
  { name: 'Eye of the Storm', short: 'The Eye', color: '#ff70b5', description: 'Become a force of nature.' },
];

// Configurations are deterministic; board randomness varies per attempt.
// ponytail: parameterized levels need a human balance pass before store release.
export const levels = Array.from({ length: 100 }, (_, index) => {
  const id = index + 1, region = Math.floor(index / 20), stage = index % 20;
  const relief = stage % 5 === 0 ? 0.85 : 1;
  return Object.freeze({
    id, region, name: ['First spark','Charge the clouds','Electric avenue','Skybreaker','Rolling thunder'][stage % 5],
    colors: id < 31 ? 5 : 6,
    moves: Math.max(20, 28 - region - Math.floor(stage / 7)),
    target: Math.round((1200 + index * 50) * relief / 50) * 50,
    collectKind: id >= 6 ? region % 6 : null,
    collect: id >= 6 ? Math.round((10 + region * 4 + stage * 0.35) * relief) : 0,
    frostCount: id >= 21 ? Math.min(24, 6 + region * 3 + Math.floor(stage / 3)) : 0,
    frostLayers: id >= 71 ? 2 : 1,
  });
});
export function getLevel(id) {
  if (!Number.isInteger(id) || id < 1 || id > 100) throw new RangeError('Level must be 1–100');
  return levels[id - 1];
}
