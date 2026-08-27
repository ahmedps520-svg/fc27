"""Builds js/data/careerDb.js — the real-football world of Manager Career.

Named clubs get their real players (the source json tags each player with the
club they were curated from); squads are then filled to 16 from the aggregate
pools (Curated / Additional / Other Europe / Famous additions) so every club
can field an XI plus a bench. Fill players are real footballers too — just not
necessarily at that club in real life. Assignment is deterministic: same file
in, same database out, so every machine agrees.
"""
import json, hashlib, re

SRC = 'tools/real-players-source.json'
OUT = 'js/data/careerDb.js'

players = json.load(open(SRC))
by_group = {}
for p in players:
    by_group.setdefault(p['group'], []).append(p)

def H(s):
    return int(hashlib.md5(s.encode()).hexdigest()[:8], 16)

# ---- clubs: [id, name, short, league, country, col1, col2, crest-shape]
CLUBS = [
    # Premier League
    ('mci','Manchester City','MCI','Premier League','England','#6cabdd','#1c2c5b','circle'),
    ('mun','Manchester United','MUN','Premier League','England','#da291c','#000000','shield'),
    ('ars','Arsenal','ARS','Premier League','England','#ef0107','#023474','shield'),
    ('liv','Liverpool','LIV','Premier League','England','#c8102e','#00b2a9','shield'),
    ('che','Chelsea','CHE','Premier League','England','#034694','#dba111','circle'),
    ('tot','Tottenham Hotspur','TOT','Premier League','England','#ffffff','#132257','shield'),
    ('new','Newcastle United','NEW','Premier League','England','#241f20','#ffffff','shield'),
    ('avl','Aston Villa','AVL','Premier League','England','#95bfe5','#670e36','circle'),
    # La Liga
    ('rma','Real Madrid','RMA','La Liga','Spain','#febe10','#00529f','circle'),
    ('bar','Barcelona','BAR','La Liga','Spain','#a50044','#004d98','shield'),
    ('atm','Atlético Madrid','ATM','La Liga','Spain','#cb3524','#262f61','shield'),
    ('rso','Real Sociedad','RSO','La Liga','Spain','#0067b1','#ffffff','circle'),
    ('vil','Villarreal','VIL','La Liga','Spain','#ffe667','#005187','circle'),
    ('ath','Athletic Club','ATH','La Liga','Spain','#ee2523','#ffffff','shield'),
    # Serie A
    ('int','Inter','INT','Serie A','Italy','#010e80','#000000','circle'),
    ('mil','AC Milan','MIL','Serie A','Italy','#fb090b','#000000','shield'),
    ('juv','Juventus','JUV','Serie A','Italy','#ffffff','#000000','shield'),
    ('nap','Napoli','NAP','Serie A','Italy','#12a0d7','#003c82','circle'),
    ('ata','Atalanta','ATA','Serie A','Italy','#2266a5','#000000','shield'),
    ('rom','Roma','ROM','Serie A','Italy','#8e1f2f','#f0bc42','circle'),
    # Bundesliga
    ('bay','Bayern Munich','BAY','Bundesliga','Germany','#dc052d','#0066b2','circle'),
    ('bvb','Borussia Dortmund','BVB','Bundesliga','Germany','#fde100','#000000','circle'),
    ('b04','Bayer Leverkusen','B04','Bundesliga','Germany','#e32221','#000000','shield'),
    ('rbl','RB Leipzig','RBL','Bundesliga','Germany','#dd013f','#ffffff','circle'),
    ('vfb','Stuttgart','VFB','Bundesliga','Germany','#ffffff','#e30013','shield'),
    # Ligue 1
    ('psg','Paris Saint-Germain','PSG','Ligue 1','France','#004170','#da291c','shield'),
    ('mar','Marseille','MAR','Ligue 1','France','#2faee0','#ffffff','circle'),
    ('lyo','Lyon','LYO','Ligue 1','France','#da001a','#153d8a','shield'),
    ('mon','Monaco','MON','Ligue 1','France','#e63312','#ffffff','shield'),
    # Saudi Pro League
    ('hil','Al Hilal','HIL','Saudi Pro League','Saudi Arabia','#2451a4','#ffffff','circle'),
    ('nas','Al Nassr','NAS','Saudi Pro League','Saudi Arabia','#ffd200','#00285e','shield'),
    ('itt','Al Ittihad','ITT','Saudi Pro League','Saudi Arabia','#f9c908','#000000','shield'),
    ('ahl','Al Ahli','AHL','Saudi Pro League','Saudi Arabia','#00723f','#ffffff','circle'),
    ('shb','Al Shabab','SHB','Saudi Pro League','Saudi Arabia','#e8e8e8','#231f20','shield'),
    ('ett','Al Ettifaq','ETT','Saudi Pro League','Saudi Arabia','#12704f','#c8a55f','circle'),
]

# anchors: source group -> club id (whole group)
GROUP_TO_CLUB = {
    'Man City':'mci','Man United':'mun','Arsenal':'ars','Liverpool':'liv','Chelsea':'che',
    'Tottenham':'tot','Real Madrid':'rma','Barcelona':'bar','Atletico':'atm','Inter':'int',
    'Milan':'mil','Juventus':'juv','Napoli':'nap','Atalanta':'ata','Bayern':'bay',
    'Leverkusen':'b04','PSG':'psg','Top LaLiga':'rso',
}
# the Saudi 17, by where they actually play
SAUDI = {
    'Yassine Bounou':'hil','Kalidou Koulibaly':'hil','João Cancelo':'hil','Rúben Neves':'hil',
    'Sergej Milinković-Savić':'hil','Aleksandar Mitrović':'hil','Malcom':'hil','Salem Al-Dawsari':'hil',
    'Aymeric Laporte':'nas','Marcelo Brozović':'nas','Sadio Mané':'nas','Cristiano Ronaldo':'nas',
    'Karim Benzema':'itt','N\'Golo Kanté':'itt','Fabinho':'itt','Moussa Diaby':'itt',
    'Edouard Mendy':'ahl','Riyad Mahrez':'ahl','Roberto Firmino':'ahl','Ivan Toney':'ahl','Franck Kessié':'ahl',
}
# Top Bundesliga split: the actual Dortmund players to BVB, the rest fill Bundesliga
BVB = {'Gregor Kobel','Nico Schlotterbeck','Serhou Guirassy','Karim Adeyemi','Julian Brandt',
       'Waldemar Anton','Pascal Groß','Emre Can','Julien Duranville','Maximilian Beier'}
# Top Ligue 1 split between Marseille and Lyon by hash

assign = {}     # player name -> club id
pool = []       # unassigned, for filling
for p in players:
    g, n = p['group'], p['name']
    if n in SAUDI: assign[n] = SAUDI[n]
    elif g in GROUP_TO_CLUB: assign[n] = GROUP_TO_CLUB[g]
    elif g == 'Saudi Pro League': assign[n] = ['hil','nas','itt','ahl'][H(n) % 4]
    elif g == 'Top Bundesliga': assign[n] = 'bvb' if n in BVB else ('bvb' if H(n)%2 else 'b04')
    elif g == 'Top Ligue 1': assign[n] = 'mar' if H(n) % 2 else 'lyo'
    else: pool.append(p)

by_name = {p['name']: p for p in players}
squads = {c[0]: [] for c in CLUBS}
for n, cid in assign.items():
    if n in by_name: squads[cid].append(by_name[n])

# fill every squad to 16, positions balanced (2 GK, 5 DF, 5 MF, 4 FW target)
GROUPS = {'GK':'GK','CB':'DF','LB':'DF','RB':'DF','CDM':'MF','CM':'MF','CAM':'MF',
          'LM':'MF','RM':'MF','LW':'FW','RW':'FW','ST':'FW'}
TARGET = {'GK':2,'DF':5,'MF':5,'FW':4}
pool.sort(key=lambda p: H(p['name']))                # deterministic shuffle
for cid, squad in squads.items():
    while len(squad) < 16 and pool:
        have = {}
        for p in squad: have[GROUPS.get(p['position'],'MF')] = have.get(GROUPS.get(p['position'],'MF'),0)+1
        # the most under-target group first
        need = sorted(TARGET, key=lambda g: have.get(g,0)-TARGET[g])[0]
        pick = next((p for p in pool if GROUPS.get(p['position'],'MF') == need), pool[0])
        pool.remove(pick)
        squad.append(pick)

# curated ratings for the 20 names that exist in-game only as 99/92 Icon/Star
# cards — a career wants a footballer, not a trading card
STARS = {
  'Lionel Messi':88,'Cristiano Ronaldo':86,'Erling Haaland':91,'Kevin De Bruyne':87,
  'Mohamed Salah':89,'Virgil van Dijk':89,'Jude Bellingham':90,'Harry Kane':90,
  'Lamine Yamal':89,'Rodri':90,'Federico Valverde':88,'Raphinha':88,
  'Gianluigi Donnarumma':88,'Jeremy Doku':85,'Alisson':88,'William Saliba':87,
  'Declan Rice':87,'Bukayo Saka':88,'Alphonso Davies':85,'Achraf Hakimi':87,
}

# One real manager for release: Pep. The rest of the touchlines are custom
# managers — this is where the licensed-likeness caution actually bites, so it
# stays one name until someone decides otherwise.
MANAGERS = [
  ('Pep Guardiola','Spain',54),
]

js_clubs = ',\n'.join(
    "  { id:'%s', name:'%s', short:'%s', league:'%s', country:'%s', colors:['%s','%s'], shape:'%s' }"
    % c for c in CLUBS)
def esc(s): return s.replace("\\","\\\\").replace("'","\\'")
js_squads = ',\n'.join(
    "  %s: [%s]" % (cid, ', '.join("['%s','%s','%s']" % (esc(p['name']), p['position'], esc(p['country']))
                                    for p in squad))
    for cid, squad in squads.items())
js_stars = ',\n'.join("  '%s': %d" % (esc(n), r) for n, r in STARS.items())
js_mgrs = ',\n'.join("  { name:'%s', nation:'%s', age:%d }" % (esc(n), c, a) for n, c, a in MANAGERS)

open(OUT,'w').write(f'''/**
 * The real-football world of Manager Career. GENERATED — edit
 * tools/build-career-db.py, not this file.
 *
 * Every named squad player is a real footballer; the named clubs carry the
 * players actually curated for them, filled to sixteen from the wider pool so
 * every club fields an XI and a bench (fill players are real people who may
 * not be at that club in reality). Ratings and stats come from the same
 * generated card each name already has in the rest of the game — one player,
 * one set of numbers everywhere — except the twenty who exist only as Icon and
 * Star trading cards, whose career ratings are stated in CAREER_RATINGS
 * because a career wants a footballer, not a 99.
 *
 * Badges are drawn by the game's own crest generator in each club's colours:
 * real names, real colours, original artwork.
 */
export const CAREER_CLUBS = [
{js_clubs},
];

/** Each row: [name, position, country]. Resolved to live stats at runtime. */
export const CAREER_SQUADS = {{
{js_squads},
}};

export const CAREER_RATINGS = {{
{js_stars},
}};

export const REAL_MANAGERS = [
{js_mgrs},
];
''')
sizes = {cid: len(s) for cid, s in squads.items()}
print('clubs:', len(CLUBS), 'squad sizes:', sizes, 'pool left:', len(pool))
