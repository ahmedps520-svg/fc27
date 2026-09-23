/**
 * The street (v82): six original venues, the tour, the avatar and its
 * cosmetics. Every name here is invented.
 *
 * A venue is a stadium definition the renderers understand (`street: true`
 * makes it a cage: no stands, walls all round, a court surface instead of
 * grass) plus what the mode needs: its format (3v3, 4v4, 5v5 or futsal).
 */
export const STREET_VENUES = [
  { id: 'st-rooftop', name: 'Rooftop Cage', city: 'Riyadh', blurb: 'Twelve floors up, the city lit below. Walls all round.',
    field: 'street3', time: 'dusk', landscape: 'city',
    surface: { base: '#2f6b58', alt: '#2a604f', line: '#f4f1de', grain: 0.06 }, cage: { h: 4.2, post: '#20252c', mesh: '#b7c0cc', neon: null } },
  { id: 'st-dune', name: 'Dune Edge Court', city: 'the Empty Quarter road', blurb: 'Hard court at the edge of the sand. Low boards, big sky.',
    field: 'street4', time: 'day', landscape: 'desert',
    surface: { base: '#b9774a', alt: '#ad6e44', line: '#fff7e6', grain: 0.08 }, cage: { h: 1.1, post: '#6b4a2e', mesh: '#e6d2b0', neon: null } },
  { id: 'st-harbour', name: 'Harbourside Pitch', city: 'the old port', blurb: 'Artificial turf on the quay; the boats go by behind the fence.',
    field: 'street5', time: 'day', landscape: 'coast',
    surface: { base: '#3f9f5a', alt: '#379150', line: '#ffffff', grain: 0.03 }, cage: { h: 3.2, post: '#2b3440', mesh: '#9fb3c8', neon: null } },
  { id: 'st-neon', name: 'Neon Hall', city: 'downtown', blurb: 'An indoor court after midnight. Futsal rules, futsal ball.',
    field: 'futsal', time: 'night', landscape: 'city',
    surface: { base: '#2a4f8f', alt: '#27497f', line: '#ffd166', grain: 0.02 }, cage: { h: 2.4, post: '#12121a', mesh: '#ff3fa4', neon: '#19e3ff' } },
  { id: 'st-underpass', name: 'Underpass Cage', city: 'under the ring road', blurb: 'Asphalt, painted lines, traffic overhead.',
    field: 'street4', time: 'night', landscape: 'city',
    surface: { base: '#3b3f46', alt: '#373a41', line: '#f8f8f2', grain: 0.12 }, cage: { h: 4, post: '#1b1d22', mesh: '#8c95a3', neon: '#ff7a1a' } },
  { id: 'st-beach', name: 'Beach Court', city: 'the corniche', blurb: 'Sand underfoot: the ball dies where it lands.',
    field: 'street5', time: 'day', landscape: 'coast', sand: true,
    surface: { base: '#e2c48a', alt: '#dcbd80', line: '#1f6f8b', grain: 0.1 }, cage: { h: 0.8, post: '#1f6f8b', mesh: '#f5f0e6', neon: null } },
];
export const streetVenue = (id) => STREET_VENUES.find((v) => v.id === id) || STREET_VENUES[0];

/** As a stadium definition for the renderers (data/stadiums.js shape). */
export function venueDef(v) {
  return { id: v.id, name: v.name, capacity: 0, size: 0, tiers: 1, roof: 'none', bowl: false, seats: ['#222222', '#333333'], facade: '#222222', pattern: 'plain',
    pylons: 'side', fill: 0, street: true, surface: v.surface, cage: v.cage, landscape: v.landscape, sand: !!v.sand };
}

export const FORMATS = { street3: '3 v 3', street4: '4 v 4', street5: '5 v 5', futsal: 'Futsal 5 v 5' };
