// Hue (HSL degrees) per subject code. Drives the colored subject pills on
// the Questions page so every subject is distinguishable at a glance.
// Hues are spread ~33deg apart around the wheel for maximum separation;
// styles.css derives the pill background/text from this single hue.
export const SUBJECT_HUES = {
  // SPOL
  MPI: 264, // violet
  VSM: 231, // indigo
  KOP: 198, // azure
  PDP: 132, // green
  // ZI
  UMI: 33, // orange
  PDD: 330, // pink
  MVI: 297, // purple
  ADM: 99, // chartreuse
  BML: 0, // red
  PON: 66, // yellow-green
  SCR: 165, // teal
};

// Resolve a subject code to its pill hue. Unknown codes get a stable hue
// hashed from the string, so a newly added subject still renders with a
// consistent color without needing a map entry.
export function subjectHue(code) {
  if (code && Object.prototype.hasOwnProperty.call(SUBJECT_HUES, code)) {
    return SUBJECT_HUES[code];
  }
  let hash = 0;
  for (let i = 0; i < (code ? code.length : 0); i += 1) {
    hash = (hash * 31 + code.charCodeAt(i)) % 360;
  }
  return hash;
}
