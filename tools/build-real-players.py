import json, re, sys

SRC='tools/real-players-source.json'
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
missing = sorted({p['country'] for p in pack} - set(COLORS))
if missing:
    sys.exit('no colours for: ' + ', '.join(missing))

rows = ',\n'.join(
    "  ['%s', '%s', '%s', '%s']" % (p['name'].replace("'", "\\'"), short(p['name']).replace("'", "\\'"),
                                    p['country'], p['position'])
    for p in pack)
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

/** Flag colours per country, in the same [primary, secondary] shape ICONS use. */
export const NATION_COLORS = {{
{cols},
}};
''')
print('wrote', OUT, len(pack), 'players,', len(COLORS), 'countries')
