import json, re, sys

SRC='tools/real-players-source.json'
EXTRA='tools/real-players-extra.json'   # curated second wave, see REAL_PLAYERS_EXTRA
WAVE3='tools/real-players-wave3.json'   # third wave (v70): the two lower divisions and a wider free pool
WAVE4='tools/real-players-wave4.json'   # fourth wave (v71): divisions five and six
WAVE5='tools/real-players-wave5.json'   # fifth wave (v72): the hundred-club world
OUT='js/data/realPlayers.js'

# already on the roster as Icon or Star cards
TAKEN = {
 'Federico Valverde','Jude Bellingham','Raphinha','Lamine Yamal','Gianluigi Donnarumma',
 'Rodri','Kevin De Bruyne','Jeremy Doku','Erling Haaland','Alisson','Virgil van Dijk',
 'Mohamed Salah','William Saliba','Declan Rice','Bukayo Saka','Alphonso Davies',
 'Harry Kane','Achraf Hakimi','Cristiano Ronaldo','Lionel Messi',
}

# Flag colours: [primary, secondary], matching how ICONS/STARS state theirs.
COLORS = {
 'Albania':['#e41e20','#000000'], 'Algeria':['#006233','#ffffff'], 'Argentina':['#75aadb','#ffffff'],
 'Armenia':['#d90012','#0033a0'], 'Austria':['#ed2939','#ffffff'], 'Belgium':['#fdda24','#000000'],
 'Bosnia and Herzegovina':['#002395','#fecb00'], 'Brazil':['#009c3b','#ffdf00'],
 'Burkina Faso':['#ef2b2d','#009e49'], 'Cameroon':['#007a5e','#ce1126'], 'Canada':['#d80621','#ffffff'],
 'Colombia':['#fcd116','#003893'], 'Croatia':['#ff0000','#ffffff'], 'Czech Republic':['#11457e','#d7141a'],
 'Denmark':['#c60c30','#ffffff'], 'Ecuador':['#ffdd00','#034ea2'], 'Egypt':['#ce1126','#000000'],
 'England':['#ffffff','#ce1124'], 'Finland':['#003580','#ffffff'], 'France':['#002395','#ed2939'],
 'Georgia':['#ffffff','#ff0000'], 'Germany':['#000000','#dd0000'], 'Ghana':['#006b3f','#fcd116'],
 'Greece':['#0d5eaf','#ffffff'], 'Guinea':['#ce1126','#009460'], 'Hungary':['#436f4d','#cd2a3e'],
 'Iran':['#239f40','#da0000'], 'Ireland':['#169b62','#ff883e'], 'Italy':['#008c45','#0064aa'],
 'Ivory Coast':['#f77f00','#009e60'], 'Japan':['#bc002d','#ffffff'], 'Kosovo':['#244aa5','#d0a650'],
 'Mexico':['#006847','#ce1126'], 'Morocco':['#c1272d','#006233'], 'Mozambique':['#007168','#fce100'],
 'Netherlands':['#ff6c00','#21468b'], 'Nigeria':['#008751','#ffffff'], 'Northern Ireland':['#ffffff','#c8102e'],
 'Norway':['#ba0c2f','#00205b'], 'Paraguay':['#d52b1e','#0038a8'], 'Peru':['#d91023','#ffffff'],
 'Poland':['#ffffff','#dc143c'], 'Portugal':['#da291c','#046a38'], 'Romania':['#002b7f','#fcd116'],
 'Scotland':['#005eb8','#ffffff'], 'Senegal':['#00853f','#fdef42'], 'Serbia':['#c6363c','#0c4076'],
 'Slovakia':['#0b4ea2','#ee1c25'], 'Slovenia':['#005ce6','#ffffff'], 'South Korea':['#cd2e3a','#0047a0'],
 'Spain':['#c60b1e','#ffc400'], 'Sweden':['#006aa7','#fecc00'], 'Switzerland':['#d52b1e','#ffffff'],
 'Turkey':['#e30a17','#ffffff'], 'USA':['#3c3b6e','#b22234'], 'Ukraine':['#0057b7','#ffd700'],
 'Uruguay':['#7bafd4','#ffffff'], 'Uzbekistan':['#0099b5','#1eb53a'], 'Venezuela':['#ffcc00','#00247d'],
 'Wales':['#00ab39','#c8102e'],
 'Saudi Arabia':['#006c35','#ffffff'], 'Tunisia':['#e70013','#ffffff'], 'Chile':['#d52b1e','#0039a6'],
 'Jamaica':['#009b3a','#fed100'], 'Australia':['#00843d','#ffcd00'], 'New Zealand':['#000000','#ffffff'],
 # third wave
 'Angola':['#ce1126','#000000'], 'Central African Republic':['#003082','#ffce00'], 'Costa Rica':['#002b7f','#ce1126'],
 'DR Congo':['#007fff','#f7d618'], 'El Salvador':['#0f47af','#ffffff'], 'Estonia':['#0072ce','#000000'],
 'Gabon':['#009e60','#fcd116'], 'Gambia':['#ce1126','#0c1c8c'], 'Guinea-Bissau':['#ce1126','#fcd116'],
 'Honduras':['#0073cf','#ffffff'], 'Iceland':['#02529c','#dc1e35'], 'Israel':['#0038b8','#ffffff'],
 'Libya':['#239e46','#e70013'], 'Mali':['#14b53a','#fcd116'], 'Montenegro':['#c40308','#d4af3a'],
 'North Macedonia':['#d20000','#ffe600'], 'Panama':['#005293','#da121a'], 'Russia':['#ffffff','#d52b1e'],
 'South Africa':['#007a4d','#ffb612'], 'Suriname':['#377e3f','#b40a2d'], 'Syria':['#ce1126','#007a3d'],
 'Tanzania':['#1eb53a','#00a3dd'], 'Togo':['#006a4e','#ffce00'],
 # fourth wave
 'Qatar':['#8a1538','#ffffff'], 'Iraq':['#ce1126','#007a3d'], 'United Arab Emirates':['#00732f','#ff0000'],
 # fifth wave
 'Bolivia':['#d52b1e','#007934'], 'Cape Verde':['#003893','#cf2027'], 'Zambia':['#198a00','#ef7d00'], 'Jordan':['#007a3d','#ce1126'],
 'China':['#de2910','#ffde00'], 'India':['#ff9933','#138808'],
}

PARTICLES = {'de','del','della','di','da','dos','das','van','von','le','la','el','al','ben','mac','mc',"o'",'ter','ten'}

def short(name):
    parts = name.split()
    if len(parts) == 1:
        return name
    rest = parts[1:]
    # drop a middle given name, but never a nobiliary particle ("de Jong", "van Dijk")
    while len(rest) > 1 and rest[0].lower() not in PARTICLES and rest[0][0].isupper() and rest[1].lower() not in PARTICLES:
        rest = rest[1:]
    return f"{parts[0][0]}. {' '.join(rest)}"

pack = [p for p in json.load(open(SRC)) if p['name'] not in TAKEN]
extra = [{'name': n, 'country': c, 'position': pos} for n, c, pos in json.load(open(EXTRA))]
seen = {p['name'] for p in pack} | TAKEN
extra = [p for p in extra if p['name'] not in seen]
# dealt in list order, so a list grouped by country would hand one club a whole
# nation's squad; a fixed-seed shuffle spreads them and stays reproducible
import random
random.Random(66).shuffle(extra)
# third wave: same treatment, deduped against everything already on a card
# (the source list, the second wave, the Icons/Stars and the SBC legends)
LEGENDS = {
 'Thierry Henry','Ronaldinho','Andrés Iniesta','Andres Iniesta','Andrea Pirlo','Steven Gerrard',
 'Sergio Agüero','Sergio Aguero','Didier Drogba','Iker Casillas','Wayne Rooney','Frank Lampard',
 'Philipp Lahm','Carles Puyol',
}
seen3 = seen | {p['name'] for p in extra} | LEGENDS
wave3 = [{'name': n, 'country': c, 'position': pos} for n, c, pos in json.load(open(WAVE3))]
w3seen = set()
kept = []
for p in wave3:
    if p['name'] in seen3 or p['name'] in w3seen: continue
    w3seen.add(p['name']); kept.append(p)
wave3 = kept
random.Random(70).shuffle(wave3)
seen4 = seen3 | set(w3seen)
wave4 = [{'name': n, 'country': c, 'position': pos} for n, c, pos in json.load(open(WAVE4))]
w4seen = set(); kept = []
for p in wave4:
    if p['name'] in seen4 or p['name'] in w4seen: continue
    w4seen.add(p['name']); kept.append(p)
wave4 = kept
random.Random(71).shuffle(wave4)
seen5 = seen4 | set(w4seen)
wave5 = [{'name': n, 'country': c, 'position': pos} for n, c, pos in json.load(open(WAVE5))]
w5seen = set(); kept = []
for p in wave5:
    if p['name'] in seen5 or p['name'] in w5seen: continue
    w5seen.add(p['name']); kept.append(p)
wave5 = kept
random.Random(72).shuffle(wave5)
missing = sorted({p['country'] for p in pack + extra + wave3 + wave4 + wave5} - set(COLORS))
if missing:
    sys.exit('no colours for: ' + ', '.join(missing))

def emit(lst):
    return ',\n'.join(
        "  ['%s', '%s', '%s', '%s']" % (p['name'].replace("'", "\\'"), short(p['name']).replace("'", "\\'"),
                                        p['country'], p['position'])
        for p in lst)
rows = emit(pack)
extra_rows = emit(extra)
wave3_rows = emit(wave3)
wave4_rows = emit(wave4)
wave5_rows = emit(wave5)
cols = ',\n'.join("  '%s': ['%s', '%s']" % (k, v[0], v[1]) for k, v in sorted(COLORS.items()))

open(OUT, 'w').write(f'''/**
 * Real footballers, for the cards that used to carry invented names.
 *
 * Every player in the world is a real person now: the name, the country and the
 * flag colours come from here, and everything that decides how a card *plays* —
 * rating, stats, position, club, age, value — is still generated exactly as it
 * was. That is deliberate. Swapping the identities on top of the same numbers
 * means nobody's squad changed rating overnight; only the names on the cards
 * did. See `nameTheWorld` in generator.js for how they are matched up.
 *
 * The clubs and leagues stay fictional. This lists people, not teams, and no
 * club badge, kit or competition name is taken from the real game.
 *
 * There are no photographs. The list this was built from carried image *search
 * links* rather than pictures, and player headshots belong to whoever shot
 * them, so the cards keep their drawn faces.
 *
 * Generated — see tools/build-real-players.py. {len(pack)} players, which is
 * exactly the number of generated cards in the world that are not already an
 * Icon or a Star (those 35 name real players too, and the 20 of them that also
 * appeared in this list were dropped from it so nobody is on two cards).
 *
 * Each row is [name, short, country, position].
 */
export const REAL_PLAYERS = [
{rows},
];

/**
 * The second wave: {len(extra)} more, curated by hand (tools/real-players-extra.json)
 * for the cards the world grew after v65. Kept as its own list on purpose —
 * `nameTheWorld` deals the first list to the original cards and this one to
 * the new ones, so adding a name here can never re-deal a name that is
 * already on someone's card. Same rule as above: append, never re-sort.
 */
export const REAL_PLAYERS_EXTRA = [
{extra_rows},
];

/**
 * The third wave: {len(wave3)} more (tools/real-players-wave3.json), for the two
 * lower divisions and the wider free pool the world grew in v70. Its own list
 * for the same reason as the second: dealt only to the v70 cards, so nothing
 * older is ever re-named. Append, never re-sort.
 */
export const REAL_PLAYERS_WAVE3 = [
{wave3_rows},
];

/**
 * The fourth wave: {len(wave4)} more (tools/real-players-wave4.json), for the fifth
 * and sixth divisions and the free pool the world grew in v71. Same rules.
 */
export const REAL_PLAYERS_WAVE4 = [
{wave4_rows},
];

/**
 * The fifth wave: {len(wave5)} more (tools/real-players-wave5.json), for the
 * forty clubs and the wider pool of the hundred-club world (v72). Same rules.
 */
export const REAL_PLAYERS_WAVE5 = [
{wave5_rows},
];

/** Flag colours per country, in the same [primary, secondary] shape ICONS use. */
export const NATION_COLORS = {{
{cols},
}};
''')
print('wrote', OUT, len(pack), '+', len(extra), '+', len(wave3), '+', len(wave4), '+', len(wave5), 'players,', len(COLORS), 'countries')
