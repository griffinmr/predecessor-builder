import Database       from 'better-sqlite3'
import { fileURLToPath } from 'node:url'
import path             from 'node:path'

// ── resolve DB path relative to this file, not CWD (critical on Windows) ─────
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH   = path.resolve(__dirname, '..', process.env.DB_PATH || 'data.db')

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

// ── schema ─────────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS characters (
    id    TEXT PRIMARY KEY,
    name  TEXT NOT NULL,
    roles TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS items (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    category    TEXT NOT NULL,
    price       INTEGER NOT NULL,
    description TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS build_history (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id TEXT NOT NULL,
    role         TEXT NOT NULL,
    enemy_ids    TEXT NOT NULL,
    items_json   TEXT NOT NULL,
    strategy     TEXT NOT NULL,
    created_at   TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS saved_builds (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    build_history_id INTEGER NOT NULL UNIQUE,
    name             TEXT,
    notes            TEXT,
    saved_at         TEXT NOT NULL
  );
`)

// ── seed data ──────────────────────────────────────────────────────────────────
// Mirrors client/src/data/mockData.js. INSERT OR IGNORE keeps it idempotent
// across restarts – update both files together if the roster changes.

const SEED_CHARACTERS = [
  { id: 'akeron',     name: 'Akeron',        roles: ['jungle', 'offlane'] },
  { id: 'argus',      name: 'Argus',         roles: ['support', 'mid'] },
  { id: 'aurora',     name: 'Aurora',        roles: ['jungle', 'offlane'] },
  { id: 'bayle',      name: 'Bayle',         roles: ['jungle', 'offlane'] },
  { id: 'boris',      name: 'Boris',         roles: ['jungle'] },
  { id: 'countess',   name: 'Countess',      roles: ['jungle', 'mid', 'offlane'] },
  { id: 'crunch',     name: 'Crunch',        roles: ['jungle', 'offlane'] },
  { id: 'dekker',     name: 'Dekker',        roles: ['support'] },
  { id: 'drongo',     name: 'Drongo',        roles: ['adc'] },
  { id: 'eden',       name: 'Eden',          roles: ['adc', 'mid', 'offlane'] },
  { id: 'fengmao',    name: 'Feng Mao',      roles: ['jungle', 'offlane'] },
  { id: 'gadget',     name: 'Gadget',        roles: ['mid'] },
  { id: 'gideon',     name: 'Gideon',        roles: ['mid'] },
  { id: 'greystone',  name: 'Greystone',     roles: ['jungle', 'offlane'] },
  { id: 'grimexe',    name: 'GRIM.exe',      roles: ['adc'] },
  { id: 'grux',       name: 'Grux',          roles: ['jungle', 'offlane'] },
  { id: 'howitzer',   name: 'Howitzer',      roles: ['mid'] },
  { id: 'iggyscorch', name: 'Iggy & Scorch', roles: ['mid', 'offlane'] },
  { id: 'kallari',    name: 'Kallari',       roles: ['jungle'] },
  { id: 'khaimera',   name: 'Khaimera',      roles: ['jungle', 'offlane'] },
  { id: 'kira',       name: 'Kira',          roles: ['adc'] },
  { id: 'kwang',      name: 'Kwang',         roles: ['jungle', 'offlane'] },
  { id: 'ltbelica',   name: 'Lt. Belica',    roles: ['support', 'mid'] },
  { id: 'maco',       name: 'Maco',          roles: ['support', 'mid', 'offlane'] },
  { id: 'morigesh',   name: 'Morigesh',      roles: ['mid'] },
  { id: 'mourn',      name: 'Mourn',         roles: ['support'] },
  { id: 'murdock',    name: 'Murdock',       roles: ['adc', 'offlane'] },
  { id: 'muriel',     name: 'Muriel',        roles: ['support'] },
  { id: 'narbash',    name: 'Narbash',       roles: ['support'] },
  { id: 'phase',      name: 'Phase',         roles: ['support'] },
  { id: 'rampage',    name: 'Rampage',       roles: ['jungle'] },
  { id: 'renna',      name: 'Renna',         roles: ['mid'] },
  { id: 'revenant',   name: 'Revenant',      roles: ['adc'] },
  { id: 'riktor',     name: 'Riktor',        roles: ['support'] },
  { id: 'serath',     name: 'Serath',        roles: ['jungle', 'offlane'] },
  { id: 'sevarog',    name: 'Sevarog',       roles: ['jungle', 'offlane'] },
  { id: 'shinbi',     name: 'Shinbi',        roles: ['jungle', 'offlane'] },
  { id: 'skylar',     name: 'Skylar',        roles: ['adc'] },
  { id: 'sparrow',    name: 'Sparrow',       roles: ['adc'] },
  { id: 'steel',      name: 'Steel',         roles: ['support', 'offlane'] },
  { id: 'terra',      name: 'Terra',         roles: ['jungle', 'offlane'] },
  { id: 'thefey',     name: 'The Fey',       roles: ['support', 'mid'] },
  { id: 'twinblast',  name: 'TwinBlast',     roles: ['adc'] },
  { id: 'wraith',     name: 'Wraith',        roles: ['adc', 'mid'] },
  { id: 'wukong',     name: 'Wukong',        roles: ['jungle', 'offlane'] },
  { id: 'yin',        name: 'Yin',           roles: ['jungle', 'offlane'] },
  { id: 'yurei',      name: 'Yurei',         roles: ['jungle', 'offlane'] },
  { id: 'zarus',      name: 'Zarus',         roles: ['jungle', 'offlane'] },
  { id: 'zinx',       name: 'Zinx',          roles: ['support', 'mid'] },
]

const SEED_ITEMS = [
  // ── A ──
  { id: 'abyssal_bracers',     name: 'Abyssal Bracers',     category: 'defense',  price: 1500, description: 'Defensive bracers for early trades.' },
  { id: 'abyssal_dart',        name: 'Abyssal Dart',        category: 'utility',  price: 2400, description: 'Mark and teleport to marked targets.' },
  { id: 'aegis_of_agawar',     name: 'Aegis Of Agawar',     category: 'defense',  price: 3200, description: 'Defensive item with stacking armor and CC resistance.' },
  { id: 'alchemical_rod',      name: 'Alchemical Rod',      category: 'magical',  price: 850,  description: 'Starter ability power rod for mages.' },
  { id: 'alternator',          name: 'Alternator',          category: 'magical',  price: 1200, description: 'Mid-tier magical power component.' },
  { id: 'amulet_of_chaos',     name: 'Amulet Of Chaos',     category: 'magical',  price: 2000, description: 'Chaotic magic item with burst potential.' },
  { id: 'ashbringer',          name: 'Ashbringer',          category: 'physical', price: 3200, description: 'Cooldown reduction on basic attacks.' },
  { id: 'astral_catalyst',     name: 'Astral Catalyst',     category: 'magical',  price: 2400, description: 'Amplifies ability damage with burst-on-cast.' },
  { id: 'augmentation',        name: 'Augmentation',        category: 'physical', price: 2800, description: 'Ability-triggered empowered attacks.' },
  { id: 'azure_core',          name: 'Azure Core',          category: 'magical',  price: 2200, description: 'Mana and ability-haste focused item.' },
  // ── B ──
  { id: 'banded_emerald',      name: 'Banded Emerald',      category: 'utility',  price: 800,  description: 'Grants health and modest movement speed.' },
  { id: 'barbed_pauldron',     name: 'Barbed Pauldron',     category: 'defense',  price: 1500, description: 'Armor that punishes melee attackers.' },
  { id: 'berserkers_axe',      name: "Berserker's Axe",     category: 'physical', price: 1400, description: 'Attack damage component item.' },
  { id: 'blood_tome',          name: 'Blood Tome',          category: 'magical',  price: 850,  description: 'Basic ability power tome for mages.' },
  { id: 'bloodletter',         name: 'Bloodletter',         category: 'physical', price: 3200, description: 'High physical damage with execute potential.' },
  { id: 'brutallax',           name: 'Brutallax',           category: 'utility',  price: 2800, description: 'Cleanse that purifies debuffs and grants tenacity.' },
  // ── C ──
  { id: 'caustica',            name: 'Caustica',            category: 'magical',  price: 2600, description: 'Magical armor penetration item.' },
  { id: 'champion_crest',      name: 'Champion Crest',      category: 'physical', price: 2000, description: 'Evolved warrior crest with bonus stats.' },
  { id: 'chronomatic_wand',    name: 'Chronomatic Wand',    category: 'magical',  price: 1200, description: 'Mage weapon with cooldown reduction.' },
  { id: 'claymore',            name: 'Claymore',            category: 'physical', price: 1000, description: 'Basic two-handed sword for early damage.' },
  { id: 'claw_of_hermes',      name: 'Claw Of Hermes',      category: 'physical', price: 2400, description: 'Movement and attack speed item.' },
  { id: 'combustion',          name: 'Combustion',          category: 'magical',  price: 2800, description: 'Magic damage spike on ability combos.' },
  { id: 'composite_bow',       name: 'Composite Bow',       category: 'physical', price: 1400, description: 'Balanced attack speed and damage.' },
  { id: 'consort_crest',       name: 'Consort Crest',       category: 'utility',  price: 1400, description: 'Support scaling crest item.' },
  { id: 'crescelia',           name: 'Crescelia',           category: 'magical',  price: 3000, description: 'Lunar-themed magical power item.' },
  { id: 'crimson_edge',        name: 'Crimson Edge',        category: 'physical', price: 3000, description: 'Sustain-focused attack item with lifesteal.' },
  { id: 'cursed_scroll',       name: 'Cursed Scroll',       category: 'magical',  price: 1800, description: 'Dark magic scroll with damage amp.' },
  // ── D ──
  { id: 'dawnstar',            name: 'Dawnstar',            category: 'magical',  price: 3200, description: 'Light-themed magical burst item.' },
  { id: 'demon_edge',          name: 'Demon Edge',          category: 'physical', price: 2600, description: 'Attack damage with lifesteal passive.' },
  { id: 'devotion',            name: 'Devotion',            category: 'utility',  price: 2200, description: 'Support item with ally-boosting effects.' },
  { id: 'diffusal_cane',       name: 'Diffusal Cane',       category: 'magical',  price: 2000, description: 'Drains mana on ability hit.' },
  { id: 'divine_potion',       name: 'Divine Potion',       category: 'utility',  price: 350,  description: 'Enhanced potion with mana restoration.' },
  { id: 'divine_pouch',        name: 'Divine Pouch',        category: 'utility',  price: 500,  description: 'Consumable pouch for potions.' },
  { id: 'draconum',            name: 'Draconum',            category: 'utility',  price: 3000, description: 'Healing boost with stacking mechanics.' },
  { id: 'dreambinder',         name: 'Dreambinder',         category: 'magical',  price: 3200, description: 'Crowd-control magic item.' },
  { id: 'dusk_stave',          name: 'Dusk Stave',          category: 'magical',  price: 1600, description: 'Core ability-power weapon.' },
  { id: 'dust_devil',          name: 'Dust Devil',          category: 'utility',  price: 1800, description: 'Movement speed utility item.' },
  // ── E ──
  { id: 'earth_spirit',        name: 'Earth Spirit',        category: 'utility',  price: 2800, description: 'Boulder transformation for crowd control.' },
  { id: 'enmas_blessing',      name: "Enma's Blessing",     category: 'utility',  price: 2400, description: 'Blessing with protective effects.' },
  { id: 'envy',                name: 'Envy',                category: 'physical', price: 3400, description: 'Guaranteed crits after dashes with silencing.' },
  { id: 'epoch',               name: 'Epoch',               category: 'utility',  price: 2800, description: 'Stasis for 2.5s defensive protection.' },
  { id: 'equinox',             name: 'Equinox',             category: 'utility',  price: 2600, description: 'Low-health shield generation.' },
  { id: 'essence_ring',        name: 'Essence Ring',        category: 'utility',  price: 1200, description: 'Ring with essence energy over time.' },
  { id: 'everbloom',           name: 'Everbloom',           category: 'utility',  price: 2800, description: 'Shield grants with mitigation aura.' },
  { id: 'eviscerator',         name: 'Eviscerator',         category: 'physical', price: 3400, description: 'Attack speed with omnivamp.' },
  { id: 'exodus',              name: 'Exodus',              category: 'utility',  price: 2800, description: 'Knockback grenade with damage amplification.' },
  // ── F ──
  { id: 'fist_of_razuul',      name: 'Fist Of Razuul',      category: 'physical', price: 3200, description: 'Heavy melee weapon with burst.' },
  { id: 'florescence',         name: 'Florescence',         category: 'utility',  price: 2400, description: 'Bouncy movement utility platform.' },
  { id: 'frosted_lure',        name: 'Frosted Lure',        category: 'utility',  price: 1600, description: 'Slow effect utility item.' },
  // ── G ──
  { id: 'gaussian_greaves',    name: 'Gaussian Greaves',    category: 'defense',  price: 2200, description: 'Boots with defensive stats.' },
  { id: 'gilded_pendant',      name: 'Gilded Pendant',      category: 'utility',  price: 600,  description: 'Gold generation pendant.' },
  { id: 'golems_gift',         name: "Golem's Gift",        category: 'defense',  price: 2800, description: 'Health and crowd control resistance.' },
  { id: 'gravitum',            name: 'Gravitum',            category: 'utility',  price: 2600, description: 'Ground effect projectile for disruption.' },
  // ── H ──
  { id: 'heroic_guard',        name: 'Heroic Guard',        category: 'defense',  price: 2400, description: 'Reduces damage taken by nearby allies.' },
  { id: 'hexbound_bracers',    name: 'Hexbound Bracers',    category: 'defense',  price: 1600, description: 'Magic-resist bracers.' },
  { id: 'honed_kris',          name: 'Honed Kris',          category: 'physical', price: 800,  description: 'Quick dagger for fast attacks.' },
  { id: 'hunt',                name: 'Hunt',                category: 'physical', price: 1000, description: 'Jungle starter item.' },
  // ── I ──
  { id: 'iceskorn_talons',     name: 'Iceskorn Talons',     category: 'physical', price: 3200, description: 'Ice sheet with team buffs and enemy slow.' },
  { id: 'imbued_amulet',       name: 'Imbued Amulet',       category: 'magical',  price: 1400, description: 'Magical power amulet component.' },
  { id: 'infernum',            name: 'Infernum',            category: 'magical',  price: 3200, description: 'Fire magic with burn stacking.' },
  { id: 'inquisition',         name: 'Inquisition',         category: 'magical',  price: 3000, description: 'Wave emission on ability cast.' },
  // ── J ──
  { id: 'judgement',           name: 'Judgement',           category: 'utility',  price: 2800, description: 'Area damage with healing on hero hits.' },
  // ── K ──
  { id: 'keeper_crest',        name: 'Keeper Crest',        category: 'utility',  price: 1400, description: 'Support crest with utility scaling.' },
  // ── L ──
  { id: 'leafsong',            name: 'Leafsong',            category: 'utility',  price: 2600, description: 'Movement speed aura with slow immunity.' },
  { id: 'leather_tunic',       name: 'Leather Tunic',       category: 'defense',  price: 500,  description: 'Basic armor tunic.' },
  { id: 'legacy',              name: 'Legacy',              category: 'utility',  price: 2800, description: 'Low-health self-cleanse with CC immunity.' },
  { id: 'liberator',           name: 'Liberator',           category: 'utility',  price: 2600, description: 'Cleanse with shield generation.' },
  { id: 'life_stream',         name: 'Life Stream',         category: 'utility',  price: 2200, description: 'Health regeneration item.' },
  { id: 'lifebinder',          name: 'Lifebinder',          category: 'magical',  price: 2800, description: 'Scaling magical power based on missing health.' },
  { id: 'lightning_hawk',      name: 'Lightning Hawk',      category: 'physical', price: 3000, description: 'Attack speed with chain-strike.' },
  { id: 'longbow',             name: 'Longbow',             category: 'physical', price: 900,  description: 'Basic attack speed item.' },
  { id: 'lunaria',             name: 'Lunaria',             category: 'utility',  price: 2800, description: 'Damage-to-charge healing conversion.' },
  // ── M ──
  { id: 'magician_crest',      name: 'Magician Crest',      category: 'magical',  price: 1000, description: 'Mage scaling crest item.' },
  { id: 'malady',              name: 'Malady',              category: 'magical',  price: 2400, description: 'Magic damage over time item.' },
  { id: 'marksman_crest',      name: 'Marksman Crest',      category: 'physical', price: 1000, description: 'ADC scaling crest item.' },
  { id: 'megacosm',            name: 'Megacosm',            category: 'magical',  price: 3200, description: 'Health-scaling ability damage.' },
  { id: 'mesmer',              name: 'Mesmer',              category: 'magical',  price: 2600, description: 'Crowd control magic item.' },
  { id: 'mistmeadow_buckler',  name: 'Mistmeadow Buckler',  category: 'defense',  price: 1200, description: 'Small defensive shield.' },
  { id: 'mutilator',           name: 'Mutilator',           category: 'physical', price: 3200, description: 'Max health damage on hits.' },
  { id: 'mystic_cane',         name: 'Mystic Cane',         category: 'magical',  price: 1400, description: 'Magical power cane component.' },
  // ── N ──
  { id: 'necrosis',            name: 'Necrosis',            category: 'magical',  price: 2800, description: 'Death-themed magic damage item.' },
  { id: 'nex',                 name: 'Nex',                 category: 'utility',  price: 2800, description: 'Dash with damage and slowdown.' },
  { id: 'nightfall',           name: 'Nightfall',           category: 'magical',  price: 3000, description: 'Ability healing with shield on takedown.' },
  { id: 'noxia',               name: 'Noxia',               category: 'magical',  price: 2600, description: 'Poison magic item.' },
  { id: 'nuclear_rounds',      name: 'Nuclear Rounds',      category: 'physical', price: 2800, description: 'Explosive ammo with AoE damage.' },
  { id: 'nyr_warboots',        name: 'Nyr Warboots',        category: 'utility',  price: 2000, description: 'Movement speed with health regeneration.' },
  // ── O ──
  { id: 'occult_crest',        name: 'Occult Crest',        category: 'magical',  price: 1000, description: 'Dark magic scaling crest.' },
  { id: 'orb_of_enlightenment',name: 'Orb Of Enlightenment',category: 'magical',  price: 1600, description: 'Magical power orb component.' },
  { id: 'orion',               name: 'Orion',               category: 'physical', price: 3400, description: 'Stellar-themed attack item.' },
  { id: 'overlord',            name: 'Overlord',            category: 'physical', price: 3600, description: 'Dominant late-game attack item.' },
  // ── P ──
  { id: 'pendant',             name: 'Pendant',             category: 'utility',  price: 400,  description: 'Basic pendant component.' },
  { id: 'plasma_blade',        name: 'Plasma Blade',        category: 'physical', price: 2000, description: 'Energy blade with bonus damage.' },
  { id: 'polar_treads',        name: 'Polar Treads',        category: 'defense',  price: 1800, description: 'Cold-themed defensive boots.' },
  { id: 'potent_staff',        name: 'Potent Staff',        category: 'magical',  price: 1200, description: 'Magical power staff component.' },
  { id: 'prophecy',            name: 'Prophecy',            category: 'magical',  price: 2800, description: 'Vision and magical power item.' },
  { id: 'pygmy_dust',          name: 'Pygmy Dust',          category: 'utility',  price: 600,  description: 'Stealth dust consumable.' },
  // ── R ──
  { id: 'rapid_rapier',        name: 'Rapid Rapier',        category: 'physical', price: 1600, description: 'Fast attack speed rapier.' },
  { id: 'razorback',           name: 'Razorback',           category: 'defense',  price: 2800, description: 'Armor boost with damage reflection.' },
  { id: 'razorclaw',           name: 'Razorclaw',           category: 'physical', price: 1800, description: 'Claw weapon with attack speed.' },
  { id: 'redwood_shortbow',    name: 'Redwood Shortbow',    category: 'physical', price: 1200, description: 'Basic shortbow component.' },
  { id: 'refillable_potion',   name: 'Refillable Potion',   category: 'utility',  price: 350,  description: 'Reusable health potion.' },
  { id: 'rejuvenation_robe',   name: 'Rejuvenation Robe',   category: 'utility',  price: 1400, description: 'Health regeneration robe.' },
  { id: 'resolution',          name: 'Resolution',          category: 'defense',  price: 2800, description: 'Tenacity and CC resistance.' },
  { id: 'rift_walkers',        name: 'Rift Walkers',        category: 'utility',  price: 2600, description: 'Dash pulling nearby enemies.' },
  { id: 'rogue_crest',         name: 'Rogue Crest',         category: 'physical', price: 1000, description: 'Assassin scaling crest.' },
  { id: 'rune_bow',            name: 'Rune Bow',            category: 'physical', price: 2200, description: 'Magical-infused bow.' },
  { id: 'runic_veil',          name: 'Runic Veil',          category: 'defense',  price: 2000, description: 'Magic resistance veil.' },
  { id: 'ruthless_broadsword', name: 'Ruthless Broadsword', category: 'physical', price: 1800, description: 'High damage broadsword.' },
  // ── S ──
  { id: 'sabre',               name: 'Sabre',               category: 'physical', price: 600,  description: 'Basic attack damage sword.' },
  { id: 'sai',                 name: 'Sai',                 category: 'physical', price: 1000, description: 'Dual weapon for attack speed.' },
  { id: 'salvation',           name: 'Salvation',           category: 'utility',  price: 2800, description: 'Healing and support item.' },
  { id: 'sanctification',      name: 'Sanctification',      category: 'utility',  price: 3000, description: 'Group shield with tenacity and vision.' },
  { id: 'saphirs_mantle',      name: "Saphir's Mantle",     category: 'defense',  price: 2400, description: 'Sapphire-themed defensive mantle.' },
  { id: 'scattershot',         name: 'Scattershot',         category: 'physical', price: 2600, description: 'Spread damage attack item.' },
  { id: 'sentry',              name: 'Sentry',              category: 'utility',  price: 0,    description: 'Ward revelation ability.' },
  { id: 'serrated_blade',      name: 'Serrated Blade',      category: 'physical', price: 1400, description: 'Serrated weapon component.' },
  { id: 'sharpshooter_crest',  name: 'Sharpshooter Crest',  category: 'physical', price: 2000, description: 'Evolved marksman crest.' },
  { id: 'skyplitter',          name: 'Skyplitter',          category: 'physical', price: 3400, description: 'Ranged burst physical item.' },
  { id: 'solaris',             name: 'Solaris',             category: 'magical',  price: 3000, description: 'Ability-triggered attacks with lifesteal.' },
  { id: 'solstice',            name: 'Solstice',            category: 'physical', price: 3200, description: 'Stack-based damage with healing conversion.' },
  { id: 'solstone',            name: 'Solstone',            category: 'utility',  price: 0,    description: 'Oracle ward with 3 charges.' },
  { id: 'soul_chalice',        name: 'Soul Chalice',        category: 'utility',  price: 1800, description: 'Mana to health conversion.' },
  { id: 'soulbinder',          name: 'Soulbinder',          category: 'magical',  price: 3000, description: 'Range-based damage bonus with scaling.' },
  { id: 'spear_of_desolation', name: 'Spear Of Desolation', category: 'magical',  price: 3200, description: 'Ultimate ability damage boost.' },
  { id: 'spectra',             name: 'Spectra',             category: 'magical',  price: 2800, description: 'Spectral magic damage item.' },
  { id: 'spell_slasher',       name: 'Spell Slasher',       category: 'physical', price: 2800, description: 'Attack procs on ability use.' },
  { id: 'spellbreaker',        name: 'Spellbreaker',        category: 'defense',  price: 2600, description: 'Magic resistance with spell-shield.' },
  { id: 'spirit_locket',       name: 'Spirit Locket',       category: 'utility',  price: 1600, description: 'Spirit-themed support item.' },
  { id: 'spirit_of_amir',      name: 'Spirit Of Amir',      category: 'utility',  price: 2400, description: 'Amir spirit blessing item.' },
  { id: 'stamina_tonic',       name: 'Stamina Tonic',       category: 'utility',  price: 500,  description: 'Temporary health boost tonic.' },
  { id: 'stealth_ward',        name: 'Stealth Ward',        category: 'utility',  price: 0,    description: 'Invisible ward for vision.' },
  { id: 'steel_mail',          name: 'Steel Mail',          category: 'defense',  price: 800,  description: 'Basic armor component.' },
  { id: 'stone_of_strength',   name: 'Stone Of Strength',   category: 'physical', price: 1000, description: 'Strength component item.' },
  { id: 'stonewall',           name: 'Stonewall',           category: 'defense',  price: 2800, description: 'Health and armor for frontline.' },
  { id: 'strength_tonic',      name: 'Strength Tonic',      category: 'utility',  price: 500,  description: 'Temporary attack damage tonic.' },
  { id: 'syonic_echo',         name: 'Syonic Echo',         category: 'physical', price: 2800, description: 'Attack speed on ability casting.' },
  // ── T ──
  { id: 'tainted_rounds',      name: 'Tainted Rounds',      category: 'physical', price: 2200, description: 'Corruption ammo with anti-heal.' },
  { id: 'tainted_scepter',     name: 'Tainted Scepter',     category: 'magical',  price: 2400, description: 'Magical damage with healing reduction.' },
  { id: 'tainted_trident',     name: 'Tainted Trident',     category: 'physical', price: 2600, description: 'Anti-heal trident weapon.' },
  { id: 'tempest',             name: 'Tempest',             category: 'physical', price: 3200, description: 'Damage aura with healing return.' },
  { id: 'temporal_ripper',     name: 'Temporal Ripper',     category: 'physical', price: 3400, description: 'Time-magic attack weapon.' },
  { id: 'tenacious_gem',       name: 'Tenacious Gem',       category: 'utility',  price: 1200, description: 'Tenacity gem component.' },
  { id: 'time_flux_band',      name: 'Time-Flux Band',      category: 'utility',  price: 2800, description: 'Teleportation with cooldown resets.' },
  { id: 'timewarp',            name: 'Timewarp',            category: 'utility',  price: 2600, description: 'Time manipulation utility.' },
  { id: 'transference',        name: 'Transference',        category: 'utility',  price: 2600, description: 'Shield-to-health conversion.' },
  { id: 'tranquility',         name: 'Tranquility',         category: 'utility',  price: 2800, description: 'Team healing with damage mitigation.' },
  { id: 'truesilver_bracelet', name: 'Truesilver Bracelet', category: 'utility',  price: 1400, description: 'Magic resist with mana regen.' },
  { id: 'typhoon',             name: 'Typhoon',             category: 'physical', price: 3400, description: 'Attack speed stacking with dash.' },
  // ── U ──
  { id: 'unbroken_will',       name: 'Unbroken Will',       category: 'defense',  price: 3000, description: 'Armor boost when immobilized.' },
  // ── V ──
  { id: 'vainglory',           name: 'Vainglory',           category: 'physical', price: 3600, description: 'Glory-themed legendary attack item.' },
  { id: 'vanguardian',         name: 'Vanguardian',         category: 'defense',  price: 2800, description: 'Ally armor sharing aura.' },
  { id: 'vanquisher',          name: 'Vanquisher',          category: 'physical', price: 3200, description: 'Execute ability at low health.' },
  { id: 'vigorous_amulet',     name: 'Vigorous Amulet',     category: 'utility',  price: 1000, description: 'Health amulet component.' },
  { id: 'violet_brooch',       name: 'Violet Brooch',       category: 'magical',  price: 1200, description: 'Ability haste brooch.' },
  { id: 'viper',               name: 'Viper',               category: 'physical', price: 2800, description: 'Stacking armor reduction effects.' },
  { id: 'void_crystal',        name: 'Void Crystal',        category: 'magical',  price: 1600, description: 'Magic penetration crystal.' },
  { id: 'void_helm',           name: 'Void Helm',           category: 'defense',  price: 2200, description: 'Magic resistance helm.' },
  { id: 'volcanica',           name: 'Volcanica',           category: 'magical',  price: 3000, description: 'Ability-cast cooldown reduction.' },
  { id: 'vyzar_carapace',      name: 'Vyzar Carapace',      category: 'defense',  price: 2800, description: 'Shield generation with stacking.' },
  // ── W ──
  { id: 'warden_crest',        name: 'Warden Crest',        category: 'defense',  price: 1000, description: 'Tank scaling crest item.' },
  { id: 'wardens_faith',       name: "Warden's Faith",      category: 'defense',  price: 3000, description: 'Holy armor with healing on block.' },
  { id: 'warlock_crest',       name: 'Warlock Crest',       category: 'magical',  price: 2000, description: 'Evolved occult crest.' },
  { id: 'warp_stream',         name: 'Warp Stream',         category: 'utility',  price: 2400, description: 'Quantum core utility item.' },
  { id: 'windcaller',          name: 'Windcaller',          category: 'utility',  price: 2400, description: 'Wind-themed movement item.' },
  { id: 'winters_fury',        name: "Winter's Fury",       category: 'magical',  price: 2800, description: 'Ice sphere with slow and magic amp.' },
  { id: 'witchstalker',        name: 'Witchstalker',        category: 'physical', price: 3000, description: 'Anti-magic physical item.' },
  { id: 'wizard_crest',        name: 'Wizard Crest',        category: 'magical',  price: 2000, description: 'Evolved magician crest.' },
  { id: 'world_breaker',       name: 'World Breaker',       category: 'magical',  price: 3400, description: 'Stacking magical damage with scaling.' },
  { id: 'wraith_leggings',     name: 'Wraith Leggings',     category: 'defense',  price: 2000, description: 'Ghost leggings with evasion.' },
  // ── X ──
  { id: 'xenia',               name: 'Xenia',               category: 'utility',  price: 2600, description: 'Proximity-based ally shielding.' },
  // ── Crests (additional) ──
  { id: 'warrior_crest',       name: 'Warrior Crest',       category: 'physical', price: 1000, description: 'Fighter scaling crest item.' },
  { id: 'assassin_crest',      name: 'Assassin Crest',      category: 'physical', price: 2000, description: 'Evolved rogue crest.' },
]

const insertCharacter = db.prepare(
  'INSERT OR IGNORE INTO characters (id, name, roles) VALUES (?, ?, ?)'
)
const insertItem = db.prepare(
  'INSERT OR IGNORE INTO items (id, name, category, price, description) VALUES (?, ?, ?, ?, ?)'
)

db.transaction(() => {
  for (const c of SEED_CHARACTERS) insertCharacter.run(c.id, c.name, JSON.stringify(c.roles))
  for (const i of SEED_ITEMS)      insertItem.run(i.id, i.name, i.category, i.price, i.description)
})()

export default db
