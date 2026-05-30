function getWoundTrack(size: number) {
  // Each further +1 size adds +1 to each wound range. 
  // Minimum increment is 1 for very small creatures.
  const increment = Math.max(1, 5 + size);

  return {
    light: { min: 1, max: increment },
    medium: { min: increment + 1, max: increment * 2 },
    heavy: { min: (increment * 2) + 1, max: increment * 3 },
    incapacitated: { min: (increment * 3) + 1, max: increment * 4 },
    dead: { min: (increment * 4) + 1 }
  };
}