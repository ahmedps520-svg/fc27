/**
 * Which build this is, and the App Store build's original names.
 *
 * The web game names real footballers and real clubs. The App Store build
 * cannot (Apple guideline 5.2: other people's names, likenesses and marks need
 * their permission), so the iOS shell sets `window.APEX_APP_STORE = true`
 * before any module loads, and the data modules swap every real person, club
 * and league for an original one through the helpers here. The web build
 * leaves the flag unset and nothing changes.
 *
 * People are renamed from one table built over every real name in the game in
 * a fixed (sorted) order, so a name maps to the same invented one everywhere it
 * appears — a Career squad finds its card by name — and no two people share
 * one. Invented names are built from regional first names and surname roots
 * and endings, and never equal a real name from the lists.
 *
 * This module imports nothing, so any data module can use it at load time.
 */
export const APP_STORE = typeof globalThis !== 'undefined' && globalThis.APEX_APP_STORE === true;

/**
 * v187: which App Store build this is — the version and build number TestFlight
 * shows, and the commit it was built from — stamped into the page by
 * app/build-www.mjs. Null on the web.
 */
export const APP_BUILD = APP_STORE && globalThis.APEX_IOS && typeof globalThis.APEX_IOS === 'object'
  ? { version: String(globalThis.APEX_IOS.version || '?'), build: String(globalThis.APEX_IOS.build || '?'), commit: String(globalThis.APEX_IOS.commit || '') }
  : null;

/** Where the app finds the online server (the shell may name another with `APEX_SERVER`). */
export const APP_SERVER = APP_STORE ? String(globalThis.APEX_SERVER || 'https://fc27.onrender.com').replace(/\/$/, '') : '';

const hashOf = (str) => { let h = 2166136261; for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; };

/* Each region: first names and surnames. 40 × 60-odd is 2,000+ names a region,
   more than the largest group of real players from it. */
const R = {
  italian: [
    ['Luca', 'Matteo', 'Lorenzo', 'Riccardo', 'Tommaso', 'Gianluca', 'Davide', 'Federico', 'Samuele', 'Nicolò', 'Alessio', 'Stefano', 'Emanuele', 'Gabriele', 'Pietro', 'Fabio', 'Michele', 'Simone', 'Andrea', 'Giacomo', 'Daniele', 'Mattia', 'Edoardo', 'Filippo', 'Marco', 'Giulio', 'Leonardo', 'Raffaele', 'Christian', 'Manuel', 'Cristiano', 'Elia', 'Diego', 'Alberto', 'Salvatore', 'Vincenzo', 'Antonio', 'Paolo', 'Enrico', 'Massimo'],
    ['Ferrante', 'Bellotti', 'Caruso', 'Gallo', 'Marchetti', 'Pellegrino', 'Santoro', 'Vitale', 'Colombo', 'Rinaldi', 'Mazzola', 'Bernardi', 'Lombardo', 'Castelli', 'Fontana', 'Tedeschi', 'Valentini', 'Grimaldi', 'Baldini', 'Sorrentino', 'Montanari', 'Pagano', 'Ricciardi', 'Benedetti', 'Cattaneo', 'De Luca', 'Ferraro', 'Gentile', 'Guerra', 'Longo', 'Martinelli', 'Messina', 'Monti', 'Morelli', 'Orlando', 'Palumbo', 'Parisi', 'Piras', 'Riva', 'Ruggiero', 'Sala', 'Serra', 'Silvestri', 'Testa', 'Villa', 'Zanetti', 'Fabbri', 'Bassi', 'Amato', 'Cirillo', 'D\'Angelo', 'Farina', 'Galli', 'Leone', 'Marini', 'Neri', 'Pace', 'Rizzi', 'Sartori', 'Volpe'],
  ],
  iberian: [
    ['Hugo', 'Mateo', 'Íker', 'Rodrigo', 'Tiago', 'Martín', 'Álvaro', 'Nuno', 'Diego', 'Pablo', 'Gonçalo', 'Adrián', 'Sergio', 'Raúl', 'Javier', 'Marcos', 'Rubén', 'Iván', 'Miguel', 'Bruno', 'Duarte', 'Rafael', 'Unai', 'Aitor', 'Óscar', 'Daniel', 'Héctor', 'Joel', 'Alejandro', 'Carlos', 'Mario', 'Jorge', 'Fernando', 'Ricardo', 'Pedro', 'André', 'Vasco', 'Gerard', 'Asier', 'Nacho'],
    ['Serrano', 'Ortega', 'Pires', 'Valverde', 'Castaño', 'Moreira', 'Navarro', 'Figueira', 'Ibarra', 'Quintana', 'Escobar', 'Lagos', 'Barros', 'Soldado', 'Alba', 'Garrido', 'Ribeiro', 'Tavares', 'Fuentes', 'Llorente', 'Arrieta', 'Medina', 'Vela', 'Cabrera', 'Domínguez', 'Esteban', 'Ferreira', 'Gallego', 'Herrera', 'Iglesias', 'Jiménez', 'Lozano', 'Marín', 'Nogueira', 'Pacheco', 'Ramos', 'Salgado', 'Teixeira', 'Ugarte', 'Vidal', 'Zamora', 'Aguado', 'Bermejo', 'Campos', 'Delgado', 'Estrada', 'Guerrero', 'Hidalgo', 'León', 'Mendes', 'Montoya', 'Peña', 'Rojo', 'Santos', 'Toledo', 'Varela', 'Cordero', 'Bravo', 'Correia', 'Pinto'],
  ],
  latin: [
    ['Thiago', 'Lautaro', 'Matías', 'Gabriel', 'Enzo', 'Kauã', 'Bruno', 'Facundo', 'Joaquín', 'Davi', 'Nicolás', 'Leandro', 'Rodrigo', 'Santiago', 'Vinícius', 'Emiliano', 'Cristian', 'Franco', 'Gustavo', 'Renan', 'Agustín', 'Maximiliano', 'Felipe', 'Caio', 'Ezequiel', 'Valentín', 'Guilherme', 'Ramiro', 'Juan', 'Ignacio', 'Luciano', 'Murilo', 'Germán', 'Julián', 'Lucas', 'Pedro', 'Rafael', 'Kevin', 'Brian', 'Alexis', 'Tomás', 'Benjamín', 'Wesley', 'Matheus', 'Diego'],
    ['Salvatierra', 'Rocha', 'Benítez', 'Almeida', 'Cardozo', 'Pereyra', 'Monteiro', 'Acuña', 'Barbosa', 'Villalba', 'Quiroga', 'Torres', 'Aguirre', 'Esquivel', 'Lima', 'Faria', 'Godoy', 'Ojeda', 'Sosa', 'Medina', 'Cabral', 'Paz', 'Miranda', 'Arévalo', 'Bustos', 'Carvalho', 'Duarte', 'Escobar', 'Figueroa', 'Gaitán', 'Ibáñez', 'Ledesma', 'Maidana', 'Núñez', 'Ortiz', 'Pinheiro', 'Quintero', 'Ríos', 'Sanabria', 'Tapia', 'Valdés', 'Zapata', 'Araújo', 'Bentancur', 'Coelho', 'Domingues', 'Espinoza', 'Ferraz', 'Gómez', 'Herrera', 'Leiva', 'Moraes', 'Nascimento', 'Oliveira', 'Prado', 'Rezende', 'Silveira', 'Toledo', 'Vargas', 'Rojas', 'Cáceres', 'Montiel', 'Paredes', 'Insúa', 'Fagundes', 'Guedes'],
  ],
  english: [
    ['Jack', 'Harry', 'Oliver', 'Callum', 'Reece', 'Tyler', 'Lewis', 'Mason', 'Owen', 'Kieran', 'Ethan', 'Jordan', 'Liam', 'Connor', 'Jamie', 'Ryan', 'Dominic', 'Aaron', 'Ben', 'Sam', 'Charlie', 'Josh', 'Alfie', 'Toby', 'Nathan', 'Elliot', 'Rory', 'Declan', 'George', 'James', 'Joe', 'Luke', 'Adam', 'Dan', 'Matt', 'Chris', 'Tom', 'Will', 'Max', 'Finley'],
    ['Ashworth', 'Pennock', 'Hartley', 'Brierley', 'Whitfield', 'Oakes', 'Rowntree', 'Tanner', 'Fenwick', 'Aldridge', 'Bradshaw', 'Calloway', 'Dalton', 'Holloway', 'Marsden', 'Stanton', 'Thornton', 'Woodley', 'Brookes', 'Cranfield', 'Hampton', 'Langley', 'Preston', 'Shelton', 'Atherton', 'Barlow', 'Chadwick', 'Draper', 'Ellison', 'Fletcher', 'Gibbons', 'Hollis', 'Ingram', 'Jennings', 'Kendall', 'Lockwood', 'Mercer', 'Norris', 'Osborne', 'Pickering', 'Radcliffe', 'Sutcliffe', 'Tindall', 'Underwood', 'Varley', 'Webster', 'Yates', 'Buckley', 'Crowther', 'Denton', 'Easton', 'Farrow', 'Garside', 'Haworth', 'Kershaw', 'Lowe', 'Moss', 'Naylor', 'Parr', 'Ridley'],
  ],
  french: [
    ['Théo', 'Lucas', 'Enzo', 'Kylian', 'Mathis', 'Noah', 'Rayan', 'Axel', 'Nolan', 'Yanis', 'Hugo', 'Maxence', 'Bastien', 'Clément', 'Florian', 'Romain', 'Quentin', 'Jérémy', 'Adrien', 'Moussa', 'Ibrahima', 'Amadou', 'Mamadou', 'Cheikh', 'Yves', 'Arnaud', 'Loïc', 'Sacha', 'Antoine', 'Benjamin', 'Corentin', 'Damien', 'Étienne', 'Gaëtan', 'Julien', 'Kévin', 'Mathieu', 'Nicolas', 'Olivier', 'Thomas'],
    ['Morel', 'Dubreuil', 'Lacaze', 'Fournier', 'Perrin', 'Marchand', 'Leblanc', 'Tessier', 'Duval', 'Garnier', 'Rocher', 'Boucher', 'Coulibaly', 'Ferrand', 'Laurent', 'Michaud', 'Renaud', 'Vallet', 'Bernier', 'Chevalier', 'Girard', 'Lemaire', 'Poirier', 'Thibault', 'Arnaud', 'Barbier', 'Carré', 'Delorme', 'Faure', 'Gautier', 'Hamel', 'Joly', 'Lambert', 'Mallet', 'Noël', 'Picard', 'Rivière', 'Simon', 'Vasseur', 'Aubert', 'Bonnet', 'Collin', 'Dumont', 'Fontaine', 'Guérin', 'Huet', 'Leroy', 'Masson', 'Ndiaye', 'Traoré', 'Sylla', 'Keita', 'Camara', 'Diarra', 'Konaté', 'Sangaré', 'Bamba', 'Dembélé', 'Fofana', 'Cissoko'],
  ],
  german: [
    ['Lukas', 'Jonas', 'Finn', 'Leon', 'Niklas', 'Moritz', 'Paul', 'Felix', 'Jannik', 'Tim', 'Daan', 'Sem', 'Lars', 'Mikkel', 'Emil', 'Oskar', 'Jesper', 'Ruben', 'Bram', 'Jakob', 'Maximilian', 'Florian', 'Tobias', 'Sander', 'Henrik', 'Nils', 'Fabian', 'Joost', 'Julian', 'Kai', 'Marvin', 'Robin', 'Sebastian', 'Stefan', 'Thijs', 'Wout', 'Anders', 'Magnus', 'Kasper', 'Viktor'],
    ['Brandt', 'Kessler', 'Vogt', 'Hartmann', 'Reuter', 'Lindner', 'Wagner', 'Seidel', 'Kraus', 'Haber', 'Bergmann', 'Holmberg', 'Steiner', 'Waldner', 'Feldmann', 'Dahlgren', 'Brugman', 'Velder', 'Kamphuis', 'Roster', 'Schell', 'Langer', 'Horstmann', 'Mohr', 'Albers', 'Baumann', 'Dietrich', 'Engel', 'Fischer', 'Graf', 'Hoffmann', 'Jansen', 'Keller', 'Lorenz', 'Möller', 'Nowitzki', 'Pohl', 'Richter', 'Schuster', 'Thiel', 'Ulrich', 'Weber', 'Ziegler', 'de Vries', 'Bakker', 'Visser', 'Smit', 'Mulder', 'van Dam', 'Kuiper', 'Lund', 'Nyberg', 'Strand', 'Eklund', 'Sørensen', 'Holm', 'Berg', 'Krüger', 'Winter', 'Sommer'],
  ],
  arab: [
    ['Faisal', 'Salem', 'Nawaf', 'Abdulrahman', 'Turki', 'Hamad', 'Yazeed', 'Rakan', 'Majed', 'Ziyad', 'Omar', 'Khalid', 'Saud', 'Fahad', 'Sultan', 'Mansour', 'Bandar', 'Hattan', 'Youssef', 'Karim', 'Achraf', 'Hakim', 'Amine', 'Tarek', 'Mostafa', 'Nabil', 'Walid', 'Ziad', 'Abdullah', 'Ahmed', 'Ali', 'Hassan', 'Ibrahim', 'Mohammed', 'Nasser', 'Rayan', 'Saleh', 'Waleed', 'Yasser', 'Hamza'],
    ['Al-Harbi', 'Al-Qahtani', 'Al-Otaibi', 'Al-Shammari', 'Al-Ghamdi', 'Al-Zahrani', 'Al-Mutairi', 'Al-Dosari', 'Al-Anazi', 'Al-Shehri', 'Al-Juhani', 'Al-Rashidi', 'Al-Subaie', 'Al-Hamdan', 'Al-Ruwaili', 'Al-Fajri', 'Al-Amri', 'Al-Bishi', 'Al-Dawsari', 'Al-Enezi', 'Al-Faraj', 'Al-Hazmi', 'Al-Jaber', 'Al-Khaldi', 'Al-Malki', 'Al-Nemer', 'Al-Obaid', 'Al-Saadi', 'Al-Tamimi', 'Al-Yami', 'Bensalah', 'El Mansouri', 'El Karimi', 'Benali', 'Haddad', 'Mahrous', 'Fathi', 'Gharib', 'Hamdi', 'Kamal', 'Lahlou', 'Mekki', 'Nasri', 'Ouali', 'Rahmani', 'Saidi', 'Tahiri', 'Zaki', 'Bouzid', 'Chaouchi', 'Darwish', 'Fares', 'Halabi', 'Idrissi', 'Jaziri', 'Khoury', 'Mansour', 'Nassar', 'Sabri', 'Taha'],
  ],
  african: [
    ['Chidi', 'Kwame', 'Emeka', 'Kofi', 'Tunde', 'Yaw', 'Obinna', 'Seun', 'Kelechi', 'Kwabena', 'Ifeanyi', 'Sadio', 'Bakary', 'Lamine', 'Ousmane', 'Babajide', 'Femi', 'Nnamdi', 'Kojo', 'Moses', 'Samuel', 'Daniel', 'Victor', 'Joseph', 'Thomas', 'Emmanuel', 'Isaac', 'Ebuka', 'Kwesi', 'Tobi'],
    ['Okafor', 'Adeyemi', 'Mensah', 'Boateng', 'Owusu', 'Nwosu', 'Okonkwo', 'Asamoah', 'Ofori', 'Agyemang', 'Danquah', 'Eze', 'Onuoha', 'Koroma', 'Ansah', 'Appiah', 'Babatunde', 'Chukwu', 'Darko', 'Egwu', 'Fofanah', 'Gyamfi', 'Ihekwe', 'Kamara', 'Lartey', 'Mbah', 'Nnadi', 'Obi', 'Oduya', 'Quaye', 'Sesay', 'Tetteh', 'Uche', 'Wiredu', 'Yeboah', 'Zungu', 'Acheampong', 'Bello', 'Ekong', 'Ndlovu', 'Mokoena', 'Phiri', 'Banda', 'Okeke', 'Ugwu', 'Amadi', 'Ogbu', 'Afolabi'],
  ],
  slavic: [
    ['Luka', 'Ivan', 'Marko', 'Filip', 'Jakub', 'Mateusz', 'Petar', 'Nikola', 'Dominik', 'Tomáš', 'Andrej', 'Bartosz', 'Stefan', 'Mihai', 'Dmytro', 'Oleksandr', 'Ante', 'Josip', 'Milan', 'Vladimir', 'Kamil', 'Szymon', 'Adam', 'Ondřej', 'Bogdan', 'Darko', 'Goran', 'Igor', 'Lukáš', 'Patrik', 'Radu', 'Sava', 'Viktor', 'Yuriy', 'Dimitris', 'Giorgos'],
    ['Kovač', 'Petrović', 'Milić', 'Janković', 'Novak', 'Horvat', 'Wiśniewski', 'Kowalczyk', 'Zając', 'Pavlović', 'Marić', 'Radić', 'Babić', 'Král', 'Dvořák', 'Lisowski', 'Sokolov', 'Bogdan', 'Vuković', 'Stanić', 'Andrić', 'Božić', 'Čolak', 'Dragić', 'Filipović', 'Grbić', 'Ilić', 'Jurić', 'Kalinić', 'Lovrić', 'Matić', 'Nikolić', 'Obradović', 'Perić', 'Ristić', 'Simić', 'Tomić', 'Urban', 'Vlašić', 'Zelenko', 'Bondar', 'Kravets', 'Melnyk', 'Shevchuk', 'Popescu', 'Ionescu', 'Nagy', 'Szabó', 'Papadopoulos', 'Georgiou', 'Hoxha', 'Krasniqi', 'Svoboda', 'Černý', 'Mazur', 'Kaczmarek', 'Wójcik', 'Lewandowicz'],
  ],
  turkish: [
    ['Emre', 'Burak', 'Mert', 'Kerem', 'Arda', 'Cenk', 'Ozan', 'Yusuf', 'Hakan', 'Okay', 'Kaan', 'Barış', 'Efe', 'Tolga', 'Serkan', 'Umut', 'Can', 'Onur', 'Selim', 'Deniz', 'Furkan', 'Halil', 'İsmail', 'Orkun', 'Salih'],
    ['Yıldız', 'Kaya', 'Demirel', 'Çelik', 'Şahin', 'Aydın', 'Öztürk', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özdemir', 'Acar', 'Bulut', 'Erdem', 'Güler', 'Polat', 'Tekin', 'Uçar', 'Yavuz', 'Akın', 'Başaran', 'Coşkun', 'Ekinci'],
  ],
  asian: [
    ['Haruto', 'Ren', 'Sota', 'Yuto', 'Kaito', 'Riku', 'Daiki', 'Takumi', 'Kenta', 'Shota', 'Min-jun', 'Ji-ho', 'Seung-woo', 'Hyun-jin', 'Tae-yang', 'Jae-won', 'Wei', 'Hao', 'Arjun', 'Reza', 'Mehdi', 'Sardor', 'Yuki', 'Kenji'],
    ['Takahashi', 'Nakamura', 'Yamada', 'Matsuda', 'Kawaguchi', 'Hashimoto', 'Morita', 'Fujiwara', 'Ishikawa', 'Satoh', 'Kim', 'Park', 'Choi', 'Jung', 'Kang', 'Han', 'Zhang', 'Rahimi', 'Karimi', 'Ogawa', 'Endo', 'Inoue', 'Kimura', 'Saito', 'Tanabe', 'Ueda', 'Yoon', 'Lim', 'Seo', 'Hwang', 'Liu', 'Chen', 'Hosseini', 'Tashkentov'],
  ],
};
const REGION_OF = {
  Italy: 'italian', 'San Marino': 'italian',
  Spain: 'iberian', Portugal: 'iberian', Andorra: 'iberian',
  Brazil: 'latin', Argentina: 'latin', Uruguay: 'latin', Colombia: 'latin', Mexico: 'latin', Chile: 'latin', Ecuador: 'latin', Paraguay: 'latin', Peru: 'latin', Venezuela: 'latin', Bolivia: 'latin', 'Costa Rica': 'latin', Panama: 'latin', Honduras: 'latin',
  England: 'english', USA: 'english', Scotland: 'english', Wales: 'english', Ireland: 'english', 'Northern Ireland': 'english', Australia: 'english', Canada: 'english', 'New Zealand': 'english', Jamaica: 'english',
  France: 'french', Belgium: 'french', Senegal: 'french', 'Ivory Coast': 'french', Cameroon: 'french', Mali: 'french', Guinea: 'french', 'DR Congo': 'french', Gabon: 'french', 'Burkina Faso': 'french', Haiti: 'french', Luxembourg: 'french',
  Germany: 'german', Austria: 'german', Switzerland: 'german', Netherlands: 'german', Denmark: 'german', Sweden: 'german', Norway: 'german', Finland: 'german', Iceland: 'german',
  'Saudi Arabia': 'arab', Qatar: 'arab', 'United Arab Emirates': 'arab', Egypt: 'arab', Morocco: 'arab', Algeria: 'arab', Tunisia: 'arab', Iraq: 'arab', Jordan: 'arab', Oman: 'arab', Kuwait: 'arab', Bahrain: 'arab', Syria: 'arab', Lebanon: 'arab', Libya: 'arab', Palestine: 'arab',
  Nigeria: 'african', Ghana: 'african', Kenya: 'african', 'South Africa': 'african', Zambia: 'african', Gambia: 'african', 'Sierra Leone': 'african', Angola: 'african', 'Cape Verde': 'african', Togo: 'african', Benin: 'african', Zimbabwe: 'african',
  Croatia: 'slavic', Poland: 'slavic', Serbia: 'slavic', Ukraine: 'slavic', 'Czech Republic': 'slavic', Slovakia: 'slavic', Slovenia: 'slavic', 'Bosnia and Herzegovina': 'slavic', Montenegro: 'slavic', 'North Macedonia': 'slavic', Bulgaria: 'slavic', Romania: 'slavic', Russia: 'slavic', Georgia: 'slavic', Hungary: 'slavic', Kosovo: 'slavic', Albania: 'slavic', Greece: 'slavic',
  Turkey: 'turkish', Azerbaijan: 'turkish',
  Japan: 'asian', 'South Korea': 'asian', 'Korea Republic': 'asian', China: 'asian', Iran: 'asian', India: 'asian', Uzbekistan: 'asian',
};
const regionOf = (nation) => REGION_OF[nation] || 'english';

const people = new Map();      // real name -> invented name
const used = new Set();
const real = new Set();

/** Every real name in the game, so an invented one never lands on one of them. */
export function registerRealNames(names) { for (const n of names) real.add(n); }

function invent(name, nation) {
  const [firsts, lasts] = R[regionOf(nation)];
  const size = firsts.length * lasts.length;
  let k = hashOf(name) % size;
  for (let tries = 0; tries < size; tries++, k = (k + 7919) % size) {
    const full = `${firsts[k % firsts.length]} ${lasts[Math.floor(k / firsts.length) % lasts.length]}`;
    if (!used.has(full) && !real.has(full)) return full;
  }
  // a region spent: borrow the English names rather than repeat one
  const [f2, l2] = R.english;
  for (let i = 0; i < f2.length * l2.length; i++) { const full = `${f2[(k + i) % f2.length]} ${l2[Math.floor((k + i) / f2.length) % l2.length]}`; if (!used.has(full) && !real.has(full)) return full; }
  return `${firsts[0]} ${lasts[0]} ${used.size}`;
}

/**
 * Build the table over every real person in the game: [name, nation] pairs.
 * Called once, by data/fictional.js, before anything reads a name. Sorted
 * first, so the table does not depend on which list happened to come first.
 */
export function buildPeople(pairs) {
  const seen = new Map();
  for (const [n, nat] of pairs) if (n && !seen.has(n)) seen.set(n, nat);
  for (const n of [...seen.keys()].sort()) {
    if (people.has(n)) continue;
    const f = invent(n, seen.get(n));
    people.set(n, f); used.add(f);
  }
}

/** The App Store name for a real person (the name itself on the web). */
export function personName(name, nation) {
  if (!APP_STORE || !name) return name;
  if (!people.has(name)) { const f = invent(name, nation); people.set(name, f); used.add(f); }
  return people.get(name);
}

/**
 * v186: the name a card had before the App Store rename — for rules that
 * decide which cards exist, never for display. The two builds play each
 * other online, a squad travels as card ids, and a rule that read the shown
 * name (the National Day pack's) let the app own cards the web could not
 * build, so the web side dropped that squad and the two machines played
 * different teams. Identity on the web.
 */
let original = null;
export function originalName(name) {
  if (!APP_STORE) return name;
  if (!original) { original = new Map(); for (const [real, f] of people) original.set(f, real); }
  return original.get(name) ?? name;
}
export const shortOf = (full) => {
  const parts = String(full).split(' ');
  return parts.length > 1 ? `${parts[0][0]}. ${parts.slice(1).join(' ')}` : full;
};

/* ------------------------------- clubs and leagues ------------------------------- */
const LEAGUE_NAMES = {
  'Premier League': 'English First Division', 'La Liga': 'Spanish First Division', 'Serie A': 'Italian First Division',
  Bundesliga: 'German First Division', 'Ligue 1': 'French First Division', 'Saudi Pro League': 'Saudi First Division',
};
export function leagueName(name) {
  if (!APP_STORE || !name) return name;
  const tier2 = / 2$/.test(name);
  const base = LEAGUE_NAMES[name.replace(/ 2$/, '')] || name;
  return tier2 ? base.replace('First', 'Second') : base;
}

/* Town plus a word: invented clubs that read like clubs from that country. */
const CLUB_PARTS = {
  England: [['Ashford', 'Brayton', 'Calderbridge', 'Dunmere', 'Eastmoor', 'Fairhaven', 'Glenholt', 'Harrowgate', 'Kingsmere', 'Lowfield', 'Northcliff', 'Redmarsh', 'Stoneleigh', 'Westbury'], ['United', 'City', 'Athletic', 'Rovers', 'Town', 'Albion', 'Wanderers', 'Borough']],
  Spain: [['Alcora', 'Benalto', 'Castellar', 'Valdemora', 'Sierra Norte', 'Puerto Real', 'Montalbo', 'Riberal', 'Torrenova', 'Las Pinas', 'Almedra', 'Vegaluz'], ['CF', 'Atlético', 'Deportivo', 'Real Club', 'Unión', 'CD']],
  Italy: [['Valdora', 'Montecaro', 'Pietralta', 'Borgonuovo', 'Castelvento', 'Fiumara', 'Lagomare', 'Rocca Bianca', 'Serravalle', 'Torrelunga', 'Vigna', 'Campodoro'], ['Calcio', 'AC', 'FC', 'Sporting', 'Atletico', 'US']],
  Germany: [['Rheinfeld', 'Altenburg', 'Waldheim', 'Steinbach', 'Kirchau', 'Neustein', 'Hohenwald', 'Lindau-Ost', 'Moorbach', 'Brunnfeld', 'Grauberg', 'Talheim'], ['SV', 'FC', 'Borussia', 'Eintracht', 'TSV', 'SC']],
  France: [['Montclair', 'Rivenoire', 'Beauvent', 'Saint-Arlan', 'Valmont', 'Clairbourg', 'Pontrieux', 'Mirecourt', 'Bellerive', 'Châteaumer', 'Lunel-Haut', 'Varennes'], ['FC', 'Olympique', 'AS', 'Stade', 'Racing', 'US']],
  'Saudi Arabia': [['Al-Rimal', 'Al-Wadi', 'Al-Nakheel', 'Al-Sahel', 'Al-Jabal', 'Al-Najm', 'Al-Fajr', 'Al-Shams', 'Al-Bahr', 'Al-Qamar', 'Al-Sakhr', 'Al-Hilaliya'], ['Club', 'FC', 'SC']],
};
const clubs = new Map();
const townsUsed = new Map();   // country -> towns taken
const PREFIX = /^(CF|AC|FC|SV|SC|AS|US|CD|TSV|Club)$/;
/** The App Store name for a real club, from the country it plays in: one town, one club. */
export function clubName(name, country) {
  if (!APP_STORE || !name) return name;
  if (clubs.has(name)) return clubs.get(name);
  const [towns, words] = CLUB_PARTS[country] || CLUB_PARTS.England;
  const taken = townsUsed.get(country) || new Set(); townsUsed.set(country, taken);
  const h = hashOf(name);
  let t = towns[h % towns.length];
  for (let i = 0; i < towns.length && taken.has(t); i++) t = towns[(h + i + 1) % towns.length];
  taken.add(t);
  const w = words[Math.floor(h / towns.length) % words.length];
  const out = PREFIX.test(w) && country !== 'England' && country !== 'Saudi Arabia' ? `${w} ${t}` : `${t} ${w}`;
  clubs.set(name, out);
  return out;
}
/** Three letters for a club, from its town. */
export const clubShort = (name) => {
  const town = String(name).split(' ').filter((w) => !PREFIX.test(w) && !['Real', 'Club'].includes(w)).join(' ').replace(/^Al-/, '');
  return town.normalize('NFD').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase().padEnd(3, 'X');
};

/** Career's real-football world, renamed in place (careerDb.js calls this at load). */
export function fictionalCareer(clubList, squads, ratings, managers) {
  if (!APP_STORE) return;
  const countryOf = Object.fromEntries(clubList.map((c) => [c.id, c.country]));
  for (const c of clubList) { c.name = clubName(c.name, c.country); c.short = clubShort(c.name); c.league = leagueName(c.league); }
  for (const [id, rows] of Object.entries(squads)) for (const r of rows) r[0] = personName(r[0], r[2] || countryOf[id]);
  for (const k of Object.keys(ratings)) { const v = ratings[k]; delete ratings[k]; ratings[personName(k)] = v; }
  for (const m of managers) m.name = personName(m.name, m.nation);
}
