// Curated CVE → threat actor mappings sourced from CISA advisories,
// Microsoft MSTIC, Mandiant, and other public threat intelligence reports.

export type ActorCategory = 'nation-state' | 'ransomware' | 'criminal' | 'unknown';

export interface ThreatActor {
  name: string;
  category: ActorCategory;
  /** ISO 3166-1 alpha-2 country code for nation-state actors */
  country?: string;
}

// Known actor definitions
const ACTORS: Record<string, ThreatActor> = {
  // Chinese state
  'APT10':        { name: 'APT10',          category: 'nation-state', country: 'CN' },
  'APT27':        { name: 'APT27',          category: 'nation-state', country: 'CN' },
  'APT40':        { name: 'APT40',          category: 'nation-state', country: 'CN' },
  'APT41':        { name: 'APT41',          category: 'nation-state', country: 'CN' },
  'HAFNIUM':      { name: 'HAFNIUM',        category: 'nation-state', country: 'CN' },
  'Volt Typhoon': { name: 'Volt Typhoon',   category: 'nation-state', country: 'CN' },
  'Salt Typhoon': { name: 'Salt Typhoon',   category: 'nation-state', country: 'CN' },
  'UNC3886':      { name: 'UNC3886',        category: 'nation-state', country: 'CN' },
  'UNC2717':      { name: 'UNC2717',        category: 'nation-state', country: 'CN' },
  // Russian state
  'APT28':        { name: 'APT28',          category: 'nation-state', country: 'RU' },
  'APT29':        { name: 'APT29',          category: 'nation-state', country: 'RU' },
  'Sandworm':     { name: 'Sandworm',       category: 'nation-state', country: 'RU' },
  'Forest Blizzard': { name: 'Forest Blizzard', category: 'nation-state', country: 'RU' },
  // Iranian state
  'APT35':        { name: 'APT35',          category: 'nation-state', country: 'IR' },
  'MuddyWater':   { name: 'MuddyWater',     category: 'nation-state', country: 'IR' },
  'IRGC':         { name: 'IRGC',           category: 'nation-state', country: 'IR' },
  'Phosphorus':   { name: 'Phosphorus',     category: 'nation-state', country: 'IR' },
  'UTA0218':      { name: 'UTA0218',        category: 'nation-state', country: 'IR' },
  // North Korean state
  'Lazarus Group':{ name: 'Lazarus Group',  category: 'nation-state', country: 'KP' },
  'APT38':        { name: 'APT38',          category: 'nation-state', country: 'KP' },
  'Kimsuky':      { name: 'Kimsuky',        category: 'nation-state', country: 'KP' },
  // Ransomware / criminal
  'LockBit':      { name: 'LockBit',        category: 'ransomware' },
  'Conti':        { name: 'Conti',          category: 'ransomware' },
  'BlackCat':     { name: 'BlackCat/ALPHV', category: 'ransomware' },
  'Medusa':       { name: 'Medusa',         category: 'ransomware' },
  'AvosLocker':   { name: 'AvosLocker',     category: 'ransomware' },
  'Vice Society': { name: 'Vice Society',   category: 'ransomware' },
  'Magniber':     { name: 'Magniber',       category: 'ransomware' },
  'Cl0p':         { name: 'Cl0p',           category: 'ransomware' },
  'Akira':        { name: 'Akira',          category: 'ransomware' },
  'TA413':        { name: 'TA413',          category: 'criminal' },
  'UNC2447':      { name: 'UNC2447',        category: 'criminal' },
  'Prophet Spider': { name: 'Prophet Spider', category: 'criminal' },
};

// CVE ID → array of actor keys
const CVE_ACTOR_MAP: Record<string, string[]> = {
  // EternalBlue / MS17-010
  'CVE-2017-0143': ['Lazarus Group', 'APT28', 'Sandworm'],
  'CVE-2017-0144': ['Lazarus Group', 'APT28', 'Sandworm'],
  'CVE-2017-0145': ['Lazarus Group'],
  // BlueKeep
  'CVE-2019-0708': ['Lazarus Group'],
  // Pulse VPN
  'CVE-2019-11510': ['APT29', 'Sandworm'],
  // ZeroLogon
  'CVE-2020-1472': ['APT28', 'IRGC'],
  // Oracle WebLogic
  'CVE-2020-14882': ['APT41'],
  // F5 BIG-IP
  'CVE-2020-5902': ['Sandworm', 'APT38'],
  // SonicWall
  'CVE-2021-20016': ['UNC2447'],
  // VMware vCenter
  'CVE-2021-21985': ['APT40', 'UNC2717'],
  // Pulse Connect Secure
  'CVE-2021-22893': ['APT40'],
  // Confluence Server
  'CVE-2021-26084': ['APT10'],
  // ProxyLogon
  'CVE-2021-26855': ['HAFNIUM', 'APT27'],
  'CVE-2021-26857': ['HAFNIUM'],
  'CVE-2021-26858': ['HAFNIUM', 'APT27'],
  'CVE-2021-27065': ['HAFNIUM'],
  // ProxyShell
  'CVE-2021-34473': ['LockBit', 'Conti', 'APT27', 'APT35'],
  'CVE-2021-34523': ['Conti', 'APT27'],
  'CVE-2021-31207': ['Conti'],
  // PrintNightmare
  'CVE-2021-34527': ['Vice Society', 'Magniber'],
  // Zoho ManageEngine
  'CVE-2021-40539': ['APT27', 'APT41'],
  // Apache HTTP Server
  'CVE-2021-41773': ['AvosLocker'],
  // Log4Shell
  'CVE-2021-44228': ['Lazarus Group', 'APT41', 'Conti', 'APT10', 'APT35', 'Prophet Spider'],
  'CVE-2021-45046': ['APT41', 'Conti'],
  // F5 BIG-IP (2022)
  'CVE-2022-1388':  ['MuddyWater', 'APT35'],
  // VMware Workspace ONE
  'CVE-2022-22954': ['APT41'],
  // Confluence RCE
  'CVE-2022-26134': ['AvosLocker'],
  // Follina (MSDT)
  'CVE-2022-30190': ['TA413', 'APT28'],
  // Fortinet auth bypass
  'CVE-2022-40684': ['IRGC', 'Phosphorus'],
  // Fortra GoAnywhere
  'CVE-2023-0669':  ['Cl0p'],
  // Citrix Bleed
  'CVE-2023-4966':  ['LockBit', 'Medusa', 'BlackCat'],
  // MOVEit
  'CVE-2023-34362': ['Cl0p'],
  // FortiGate SSL-VPN
  'CVE-2023-27997': ['Volt Typhoon'],
  // Outlook NTLM theft
  'CVE-2023-23397': ['APT28', 'Forest Blizzard'],
  // Cisco IOS XE
  'CVE-2023-20198': ['Salt Typhoon'],
  'CVE-2023-20273': ['Salt Typhoon'],
  // VMware vCenter (2023)
  'CVE-2023-34048': ['UNC3886'],
  // Ivanti Connect Secure
  'CVE-2023-46805': ['Volt Typhoon', 'APT28'],
  'CVE-2024-21887': ['Volt Typhoon'],
  // PAN-OS GlobalProtect
  'CVE-2024-3400':  ['UTA0218'],
  // Fortinet (2024)
  'CVE-2024-21762': ['Volt Typhoon', 'IRGC'],
  'CVE-2024-55591': ['Volt Typhoon'],
  // Ivanti (2024)
  'CVE-2024-21893': ['Volt Typhoon'],
  // Progress Telerik
  'CVE-2024-6327':  ['APT40'],
  // Palo Alto Expedition
  'CVE-2024-9463':  ['UTA0218'],
  // BeyondTrust
  'CVE-2024-12356': ['Salt Typhoon'],
  // Cisco Smart Licensing
  'CVE-2024-20439': ['Salt Typhoon'],
  // Fortinet FortiManager
  'CVE-2024-47575': ['APT41'],
  // Barracuda ESG
  'CVE-2023-2868':  ['UNC4841'],
  // WinRAR
  'CVE-2023-38831': ['APT28', 'APT40', 'Sandworm'],
};

export function getThreatActors(cveId: string): ThreatActor[] {
  const keys = CVE_ACTOR_MAP[cveId] ?? [];
  return keys.map((k) => ACTORS[k] ?? { name: k, category: 'unknown' });
}

const CATEGORY_STYLES: Record<ActorCategory, string> = {
  'nation-state': 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  'ransomware':   'bg-red-500/15 text-red-400 border-red-500/30',
  'criminal':     'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'unknown':      'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

export function actorBadgeStyle(category: ActorCategory): string {
  return CATEGORY_STYLES[category];
}

const COUNTRY_FLAG: Record<string, string> = {
  CN: '🇨🇳', RU: '🇷🇺', IR: '🇮🇷', KP: '🇰🇵',
};

export function actorFlag(actor: ThreatActor): string {
  return actor.country ? (COUNTRY_FLAG[actor.country] ?? '') : '';
}
