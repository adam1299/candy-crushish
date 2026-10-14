export const names=['Thunder bulb','Rain crystal','Sun core','Cyclone capsule','Frost prism','Aurora star'];
export const colors=['#ffce47','#4edcff','#ff8768','#be8aff','#a2f4e0','#fb85c8'];
const shapes=[
  '<path d="M37 5 15 34h15l-4 25 25-34H36z" fill="#ffe76b" stroke="#ffab2e" stroke-width="2"/><path d="m35 12-13 18h10" fill="none" stroke="#fff6c9" stroke-width="3" stroke-linecap="round"/>',
  '<path d="M32 5C25 17 13 27 13 40a19 19 0 0 0 38 0C51 27 39 17 32 5Z" fill="#43cfff" stroke="#98efff" stroke-width="2"/><path d="M26 24c-6 7-8 12-7 17" fill="none" stroke="#d6fbff" stroke-width="4" stroke-linecap="round"/>',
  '<g stroke="#ffb44b" stroke-width="4" stroke-linecap="round"><path d="M32 5v6m0 42v6M5 32h6m42 0h6M13 13l5 5m28 28 5 5M13 51l5-5m28-28 5-5"/></g><circle cx="32" cy="32" r="17" fill="#ff9151" stroke="#ffdc8b" stroke-width="3"/><path d="M23 27c2-5 6-7 11-7" fill="none" stroke="#fff0ba" stroke-width="4" stroke-linecap="round"/>',
  '<g fill="none" stroke-linecap="round"><path d="M13 16c8-7 34-6 39 1s-14 11-30 7S7 13 25 11M17 31c9 6 29 5 31-1M21 40c6 5 20 3 23-1M26 49c7 3 13 0 13-2M30 57l6-3" stroke="#ad80ff" stroke-width="6"/><path d="M17 14c7-3 21-3 29 0M20 29l11 3M25 39l8 2" stroke="#e3caff" stroke-width="2.5"/></g>',
  '<path d="m32 5 23 15v26L32 59 9 45V20Z" fill="#69d8db" stroke="#c4fff5" stroke-width="2"/><path d="m32 5-8 25 8 29 9-29Z" fill="#b5fff4"/><path d="m9 20 15 10L9 45m46-25L41 30l14 16M24 30h17" fill="none" stroke="#e4fffd" stroke-width="2"/>',
  '<path d="m32 4 8 18 20 4-15 14 3 20-16-10-18 10 4-20L3 26l21-4Z" fill="#ee7fc6" stroke="#ffc9ec" stroke-width="2"/><path d="m32 14-4 15-13 1 14 6 3 13 4-16 13-5-15-1Z" fill="#ffd6f2"/>',
];
export function icon(kind, className='') {
  return `<svg class="weather-icon ${className}" viewBox="0 0 64 64" aria-hidden="true">${shapes[kind]}</svg>`;
}
export const bolt='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 1 4 14h7l-1 9L21 9h-8z"/></svg>';
