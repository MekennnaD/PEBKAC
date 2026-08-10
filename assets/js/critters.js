/* PEBKAC — critters.
 *
 * Dogs and cats, all of them on assignment. Original designs, deliberately
 * not anybody else's characters.
 *
 * Every animal is a 64×64 SVG on the same head-and-body frame, so they read as
 * one squad and differ only in ears, muzzle and markings. Each one gets issued
 * kit: a suit and tie, plus shades or an earpiece.
 *
 * Colours come from CSS custom properties on the wrapper, so they re-tint for
 * light and dark themes without a second set of drawings.
 */
(function () {
  'use strict';

  /* Warm rather than black — hard black on pastel reads as a printing error. */
  var INK = '#6b5560';

  /* ---- shared frame ---- */

  function legs() {
    return '<ellipse cx="25" cy="58" rx="4.8" ry="3" fill="var(--c-dark)"/>' +
           '<ellipse cx="39" cy="58" rx="4.8" ry="3" fill="var(--c-dark)"/>';
  }

  function torso() {
    return '<ellipse cx="32" cy="49" rx="14" ry="11.5" fill="var(--c-body)"/>';
  }

  function head() {
    return '<circle cx="32" cy="29" r="16.5" fill="var(--c-body)"/>';
  }

  function eyes(cy, cx1, cx2, r) {
    cy = cy || 28; cx1 = cx1 || 26; cx2 = cx2 || 38; r = r || 3;
    return '<circle cx="' + cx1 + '" cy="' + cy + '" r="' + r + '" fill="' + INK + '"/>' +
           '<circle cx="' + cx2 + '" cy="' + cy + '" r="' + r + '" fill="' + INK + '"/>' +
           '<circle cx="' + (cx1 + 1) + '" cy="' + (cy - 1.1) + '" r="1" fill="#fff"/>' +
           '<circle cx="' + (cx2 + 1) + '" cy="' + (cy - 1.1) + '" r="1" fill="#fff"/>';
  }

  function blush(cy) {
    cy = cy || 33;
    return '<ellipse cx="19" cy="' + cy + '" rx="3.4" ry="2.1" fill="var(--c-blush)" opacity=".7"/>' +
           '<ellipse cx="45" cy="' + cy + '" rx="3.4" ry="2.1" fill="var(--c-blush)" opacity=".7"/>';
  }

  /* Broad muzzle for the dogs. */
  function snout(cy) {
    cy = cy || 36;
    return '<ellipse cx="32" cy="' + cy + '" rx="9" ry="6.5" fill="var(--c-belly)"/>' +
           '<ellipse cx="32" cy="' + (cy - 3) + '" rx="2.9" ry="2.2" fill="' + INK + '"/>' +
           '<path d="M32 ' + (cy - 1) + ' v2.6 M32 ' + (cy + 1.6) + ' q-2.6 2.6-4.6.4 M32 ' + (cy + 1.6) +
             ' q2.6 2.6 4.6.4" stroke="' + INK + '" stroke-width="1.5" fill="none" stroke-linecap="round"/>';
  }

  /* Neater muzzle for the cats, with whiskers. */
  function catFace(cy) {
    cy = cy || 34.5;
    return '<ellipse cx="32" cy="' + cy + '" rx="7" ry="5" fill="var(--c-belly)"/>' +
           '<path d="M32 ' + (cy - 2) + ' l-2.2 1.8 h4.4z" fill="' + INK + '"/>' +
           '<path d="M32 ' + cy + ' v1.6 M32 ' + (cy + 1.6) + ' q-2.4 2.4-4.2.3 M32 ' + (cy + 1.6) +
             ' q2.4 2.4 4.2.3" stroke="' + INK + '" stroke-width="1.5" fill="none" stroke-linecap="round"/>' +
           '<path d="M12 32 h7 M12 36 h7 M45 32 h7 M45 36 h7" stroke="' + INK +
             '" stroke-width="1.1" stroke-linecap="round" opacity=".45"/>';
  }

  /* ---- issued kit ---- */

  /* Jacket, shirt and tie. The single strongest "agent" signal available. */
  function suit(y) {
    y = y || 42;
    return '<path d="M22 ' + (y + 2) + ' L32 ' + (y + 9) + ' L42 ' + (y + 2) +
             ' L43 ' + (y + 17) + ' L21 ' + (y + 17) + ' Z" fill="var(--c-gear)"/>' +
           '<path d="M26 ' + y + ' L32 ' + (y + 10) + ' L38 ' + y + ' L36 ' + (y - 1) +
             ' L32 ' + (y + 5) + ' L28 ' + (y - 1) + ' Z" fill="#fff" opacity=".92"/>' +
           '<path d="M32 ' + (y + 5) + ' l-2.1 2.2 2.1 7.6 2.1-7.6z" fill="var(--c-tie)"/>';
  }

  function shades(y) {
    y = y || 24;
    return '<path d="M15 ' + (y + 1.5) + ' h34" stroke="var(--c-gear)" stroke-width="2.2" stroke-linecap="round"/>' +
           '<rect x="17" y="' + y + '" width="13.5" height="9.5" rx="4.2" fill="var(--c-gear)"/>' +
           '<rect x="33.5" y="' + y + '" width="13.5" height="9.5" rx="4.2" fill="var(--c-gear)"/>' +
           '<path d="M20 ' + (y + 2.5) + ' l3.5 3.5" stroke="#fff" stroke-width="1.4" opacity=".5" stroke-linecap="round"/>' +
           '<path d="M36.5 ' + (y + 2.5) + ' l3.5 3.5" stroke="#fff" stroke-width="1.4" opacity=".5" stroke-linecap="round"/>';
  }

  function earpiece(cx, cy) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="3.2" fill="var(--c-gear)"/>' +
           '<circle cx="' + cx + '" cy="' + cy + '" r="1.1" fill="#fff" opacity=".75"/>' +
           '<path d="M' + cx + ' ' + (cy + 3.2) + ' q2.6 6-1.4 9.5" stroke="var(--c-gear)" stroke-width="1.5" fill="none" stroke-linecap="round"/>';
  }

  function fedora(y) {
    y = y || 16;
    return '<ellipse cx="32" cy="' + y + '" rx="20" ry="4.2" fill="var(--c-gear)"/>' +
           '<path d="M22 ' + y + ' q-.5-11 10-11 q10.5 0 10 11 z" fill="var(--c-gear)"/>' +
           '<path d="M22.4 ' + (y - 3.2) + ' q9.6 2.6 19.2 0 l-.2 3 q-9.4 2.4-18.8 0z" fill="var(--c-tie)" opacity=".85"/>';
  }

  function wrap(inner) {
    return '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      inner + '</svg>';
  }

  var CRITTERS = {

    /* ---------------------------------------------------------- dogs ---- */

    /* Big upright ears. The one who runs the op. */
    shepherd: wrap(
      '<path d="M17 23 L19.5 3 L31 15 Z" fill="var(--c-body)"/>' +
      '<path d="M47 23 L44.5 3 L33 15 Z" fill="var(--c-body)"/>' +
      '<path d="M20.5 20 L21.8 9 L28 15.5 Z" fill="var(--c-dark)"/>' +
      '<path d="M43.5 20 L42.2 9 L36 15.5 Z" fill="var(--c-dark)"/>' +
      legs() + torso() + head() + eyes() + blush() + snout(36) +
      suit(42) + shades(23)
    ),

    /* Wide low ears, short in the leg, entirely undeterred by it. */
    corgi: wrap(
      '<path d="M15 24 Q13.5 7 23 6.5 Q31 9 30.5 19 Z" fill="var(--c-body)"/>' +
      '<path d="M49 24 Q50.5 7 41 6.5 Q33 9 33.5 19 Z" fill="var(--c-body)"/>' +
      '<path d="M18.5 21 Q17.8 11 23.5 10.5 Q28 12.5 28 18 Z" fill="var(--c-blush)" opacity=".55"/>' +
      '<path d="M45.5 21 Q46.2 11 40.5 10.5 Q36 12.5 36 18 Z" fill="var(--c-blush)" opacity=".55"/>' +
      legs() + torso() + head() + eyes() + blush() + snout(36) +
      suit(42) + earpiece(48.5, 29)
    ),

    /* Long floppy ears. Follows the paper trail. */
    beagle: wrap(
      '<ellipse cx="14.5" cy="33" rx="5.8" ry="12.5" fill="var(--c-dark)" transform="rotate(9 14.5 33)"/>' +
      '<ellipse cx="49.5" cy="33" rx="5.8" ry="12.5" fill="var(--c-dark)" transform="rotate(-9 49.5 33)"/>' +
      legs() + torso() + head() +
      '<path d="M18 22 q14-8 28 0 q-6-9-14-9 q-8 0-14 9z" fill="var(--c-dark)" opacity=".55"/>' +
      eyes() + blush() + snout(36) +
      suit(42) + fedora(15)
    ),

    /* Flat face, folded ears, permanently unimpressed. */
    pug: wrap(
      '<path d="M17 20 q-1-9 6-9 q5 1 6 8 z" fill="var(--c-dark)"/>' +
      '<path d="M47 20 q1-9-6-9 q-5 1-6 8 z" fill="var(--c-dark)"/>' +
      legs() + torso() + head() +
      '<ellipse cx="32" cy="34" rx="11" ry="8.5" fill="var(--c-belly)"/>' +
      '<ellipse cx="32" cy="31.5" rx="3.1" ry="2.4" fill="' + INK + '"/>' +
      '<path d="M32 34 v2 M32 36 q-3 2.8-5.4.4 M32 36 q3 2.8 5.4.4" stroke="' + INK +
        '" stroke-width="1.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M22 24 q4-2.5 8 0 M34 24 q4-2.5 8 0" stroke="' + INK +
        '" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".5"/>' +
      eyes(26, 25.5, 38.5, 3.2) + blush(31) +
      suit(42) + shades(22)
    ),

    /* Masked markings. Was going to wear shades anyway. */
    husky: wrap(
      '<path d="M17 22 L19 4 L30.5 15 Z" fill="var(--c-body)"/>' +
      '<path d="M47 22 L45 4 L33.5 15 Z" fill="var(--c-body)"/>' +
      '<path d="M20.5 19.5 L21.5 10 L27.5 15.5 Z" fill="var(--c-blush)" opacity=".55"/>' +
      '<path d="M43.5 19.5 L42.5 10 L36.5 15.5 Z" fill="var(--c-blush)" opacity=".55"/>' +
      legs() + torso() + head() +
      '<path d="M32 13 q-9 3-11 15 q5 4 11 4 q6 0 11-4 q-2-12-11-15z" fill="var(--c-belly)"/>' +
      eyes() + blush() + snout(36) +
      suit(42) + earpiece(48.5, 28)
    ),

    /* Long and low, ears to match. Gets into places others cannot. */
    dachshund: wrap(
      '<ellipse cx="15" cy="32" rx="5" ry="13" fill="var(--c-dark)" transform="rotate(7 15 32)"/>' +
      '<ellipse cx="49" cy="32" rx="5" ry="13" fill="var(--c-dark)" transform="rotate(-7 49 32)"/>' +
      legs() + torso() + head() + eyes() + blush() +
      '<ellipse cx="32" cy="37" rx="7.5" ry="6" fill="var(--c-belly)"/>' +
      '<ellipse cx="32" cy="34" rx="2.7" ry="2.1" fill="' + INK + '"/>' +
      '<path d="M32 36 v2 M32 38 q-2.4 2.4-4.2.3 M32 38 q2.4 2.4 4.2.3" stroke="' + INK +
        '" stroke-width="1.5" fill="none" stroke-linecap="round"/>' +
      suit(42) + earpiece(48, 30)
    ),

    /* ---------------------------------------------------------- cats ---- */

    /* Stripes and shades. Reads the threat model for fun. */
    tabby: wrap(
      '<path d="M18 21 L19.5 5 L31 15 Z" fill="var(--c-body)"/>' +
      '<path d="M46 21 L44.5 5 L33 15 Z" fill="var(--c-body)"/>' +
      '<path d="M21 18.5 L22 10 L28 15.5 Z" fill="var(--c-blush)" opacity=".6"/>' +
      '<path d="M43 18.5 L42 10 L36 15.5 Z" fill="var(--c-blush)" opacity=".6"/>' +
      legs() + torso() + head() +
      '<path d="M28 15 v5 M32 14 v5.5 M36 15 v5" stroke="var(--c-dark)" stroke-width="2" stroke-linecap="round"/>' +
      eyes() + blush() + catFace(34.5) +
      suit(42) + shades(23)
    ),

    /* Dark points, earpiece in. Says very little. */
    siamese: wrap(
      '<path d="M18 21 L19.5 5 L31 15 Z" fill="var(--c-dark)"/>' +
      '<path d="M46 21 L44.5 5 L33 15 Z" fill="var(--c-dark)"/>' +
      legs() + torso() + head() +
      '<ellipse cx="32" cy="33" rx="12" ry="11" fill="var(--c-dark)" opacity=".45"/>' +
      eyes() + blush(30) + catFace(34.5) +
      suit(42) + earpiece(48.5, 28)
    ),

    /* Patches. The one who notices what everyone else missed. */
    calico: wrap(
      '<path d="M18 21 L19.5 5 L31 15 Z" fill="var(--c-body)"/>' +
      '<path d="M46 21 L44.5 5 L33 15 Z" fill="var(--c-dark)"/>' +
      '<path d="M21 18.5 L22 10 L28 15.5 Z" fill="var(--c-blush)" opacity=".6"/>' +
      legs() + torso() + head() +
      '<path d="M32 12.5 a16.5 16.5 0 0 1 15 13 a16.5 16.5 0 0 1-8 8 z" fill="var(--c-dark)" opacity=".55"/>' +
      '<circle cx="21" cy="38" r="4.5" fill="var(--c-dark)" opacity=".4"/>' +
      eyes() + blush() + catFace(34.5) +
      suit(42) + fedora(15)
    ),

    /* Off duty. Not a failure state — just not on shift. */
    offduty: wrap(
      '<path d="M18 21 L19.5 5 L31 15 Z" fill="var(--c-body)"/>' +
      '<path d="M46 21 L44.5 5 L33 15 Z" fill="var(--c-body)"/>' +
      '<path d="M21 18.5 L22 10 L28 15.5 Z" fill="var(--c-blush)" opacity=".6"/>' +
      '<path d="M43 18.5 L42 10 L36 15.5 Z" fill="var(--c-blush)" opacity=".6"/>' +
      legs() + torso() + head() +
      '<path d="M21.5 28 q4.5-4 9 0" stroke="' + INK + '" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
      '<path d="M33.5 28 q4.5-4 9 0" stroke="' + INK + '" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
      blush() + catFace(34.5) +
      suit(42) +
      '<text x="46" y="18" font-size="11" fill="var(--c-dark)" font-family="ui-sans-serif,system-ui,sans-serif">z</text>' +
      '<text x="53" y="10" font-size="8" fill="var(--c-dark)" opacity=".7" font-family="ui-sans-serif,system-ui,sans-serif">z</text>'
    ),
  };

  var TINTS = ['blossom', 'mint', 'butter', 'sky', 'lilac', 'peach'];

  /* Deterministic tint from a string, so a given exam or sprint always gets the
   * same colour. Random re-tinting on every render would be maddening. */
  function tintFor(seed) {
    var total = 0;
    for (var i = 0; i < String(seed).length; i++) total += String(seed).charCodeAt(i);
    return TINTS[total % TINTS.length];
  }

  /* size: 'sm' | 'md' | 'lg'. bob: gentle idle animation. */
  PEBKAC.critter = function (name, opts) {
    opts = opts || {};
    var svg = CRITTERS[name] || CRITTERS.corgi;
    var tint = opts.tint || tintFor(opts.seed || name);
    var classes = ['critter', 'critter--' + tint, 'critter--' + (opts.size || 'md')];
    if (opts.bob) classes.push('is-bobbing');
    return '<span class="' + classes.join(' ') + '">' + svg + '</span>';
  };

  PEBKAC.critterNames = Object.keys(CRITTERS);
  PEBKAC.critterTint = tintFor;
})();
