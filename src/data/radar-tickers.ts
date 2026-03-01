export type RadarSector =
  | 'etf'
  | 'tech'
  | 'defense'
  | 'health'
  | 'energy'
  | 'finance'
  | 'industrials'
  | 'materials'
  | 'consumer'

export interface RadarTicker {
  ticker: string
  name: string
  sector: RadarSector
  type: 'etf' | 'stock'
}

export const RADAR_TICKERS: RadarTicker[] = [
  // ── ETFs: Broad market ────────────────────────────────────────────────────
  { ticker: 'SPY',  name: 'SPDR S&P 500 ETF',                  sector: 'etf', type: 'etf' },
  { ticker: 'QQQ',  name: 'Invesco QQQ Trust (Nasdaq-100)',     sector: 'etf', type: 'etf' },
  { ticker: 'IWM',  name: 'iShares Russell 2000 ETF',           sector: 'etf', type: 'etf' },
  { ticker: 'VTI',  name: 'Vanguard Total Stock Market ETF',    sector: 'etf', type: 'etf' },
  { ticker: 'VOO',  name: 'Vanguard S&P 500 ETF',              sector: 'etf', type: 'etf' },
  { ticker: 'DIA',  name: 'SPDR Dow Jones Industrial Avg ETF',  sector: 'etf', type: 'etf' },

  // ── ETFs: Sector SPDR ────────────────────────────────────────────────────
  { ticker: 'XLK',  name: 'Technology Select Sector SPDR',      sector: 'etf', type: 'etf' },
  { ticker: 'XLV',  name: 'Health Care Select Sector SPDR',     sector: 'etf', type: 'etf' },
  { ticker: 'XLE',  name: 'Energy Select Sector SPDR',          sector: 'etf', type: 'etf' },
  { ticker: 'XLF',  name: 'Financial Select Sector SPDR',       sector: 'etf', type: 'etf' },
  { ticker: 'XLI',  name: 'Industrial Select Sector SPDR',      sector: 'etf', type: 'etf' },
  { ticker: 'XLB',  name: 'Materials Select Sector SPDR',       sector: 'etf', type: 'etf' },
  { ticker: 'XLRE', name: 'Real Estate Select Sector SPDR',     sector: 'etf', type: 'etf' },
  { ticker: 'XLU',  name: 'Utilities Select Sector SPDR',       sector: 'etf', type: 'etf' },
  { ticker: 'XLP',  name: 'Consumer Staples Select Sector SPDR',sector: 'etf', type: 'etf' },
  { ticker: 'XLC',  name: 'Communication Services Select SPDR', sector: 'etf', type: 'etf' },

  // ── ETFs: Temáticos ───────────────────────────────────────────────────────
  { ticker: 'ARKK', name: 'ARK Innovation ETF',                 sector: 'etf', type: 'etf' },
  { ticker: 'SOXX', name: 'iShares Semiconductor ETF',          sector: 'etf', type: 'etf' },
  { ticker: 'BOTZ', name: 'Global X Robotics & AI ETF',         sector: 'etf', type: 'etf' },
  { ticker: 'HACK', name: 'ETFMG Prime Cyber Security ETF',     sector: 'etf', type: 'etf' },
  { ticker: 'ICLN', name: 'iShares Global Clean Energy ETF',    sector: 'etf', type: 'etf' },
  { ticker: 'LIT',  name: 'Global X Lithium & Battery Tech ETF',sector: 'etf', type: 'etf' },
  { ticker: 'IBB',  name: 'iShares Biotechnology ETF',          sector: 'etf', type: 'etf' },
  { ticker: 'XBI',  name: 'SPDR S&P Biotech ETF',               sector: 'etf', type: 'etf' },
  { ticker: 'JETS', name: 'U.S. Global Jets ETF',               sector: 'etf', type: 'etf' },
  { ticker: 'CIBR', name: 'First Trust Cybersecurity ETF',      sector: 'etf', type: 'etf' },
  { ticker: 'ARKG', name: 'ARK Genomic Revolution ETF',         sector: 'etf', type: 'etf' },

  // ── ETFs: Commodities / Bonds ─────────────────────────────────────────────
  { ticker: 'GLD',  name: 'SPDR Gold Shares',                   sector: 'etf', type: 'etf' },
  { ticker: 'SLV',  name: 'iShares Silver Trust',               sector: 'etf', type: 'etf' },
  { ticker: 'USO',  name: 'United States Oil Fund',             sector: 'etf', type: 'etf' },
  { ticker: 'TLT',  name: 'iShares 20+ Year Treasury Bond ETF', sector: 'etf', type: 'etf' },
  { ticker: 'HYG',  name: 'iShares iBoxx High Yield Corp Bond', sector: 'etf', type: 'etf' },
  { ticker: 'EEM',  name: 'iShares MSCI Emerging Markets ETF',  sector: 'etf', type: 'etf' },

  // ── Tech (24) ─────────────────────────────────────────────────────────────
  { ticker: 'AAPL',  name: 'Apple Inc.',                        sector: 'tech', type: 'stock' },
  { ticker: 'MSFT',  name: 'Microsoft Corp.',                   sector: 'tech', type: 'stock' },
  { ticker: 'NVDA',  name: 'NVIDIA Corp.',                      sector: 'tech', type: 'stock' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.',                     sector: 'tech', type: 'stock' },
  { ticker: 'META',  name: 'Meta Platforms Inc.',               sector: 'tech', type: 'stock' },
  { ticker: 'AMZN',  name: 'Amazon.com Inc.',                   sector: 'tech', type: 'stock' },
  { ticker: 'TSLA',  name: 'Tesla Inc.',                        sector: 'tech', type: 'stock' },
  { ticker: 'AMD',   name: 'Advanced Micro Devices Inc.',       sector: 'tech', type: 'stock' },
  { ticker: 'INTC',  name: 'Intel Corp.',                       sector: 'tech', type: 'stock' },
  { ticker: 'QCOM',  name: 'Qualcomm Inc.',                     sector: 'tech', type: 'stock' },
  { ticker: 'AVGO',  name: 'Broadcom Inc.',                     sector: 'tech', type: 'stock' },
  { ticker: 'TSM',   name: 'Taiwan Semiconductor Mfg. Co.',    sector: 'tech', type: 'stock' },
  { ticker: 'MU',    name: 'Micron Technology Inc.',            sector: 'tech', type: 'stock' },
  { ticker: 'AMAT',  name: 'Applied Materials Inc.',            sector: 'tech', type: 'stock' },
  { ticker: 'CRM',   name: 'Salesforce Inc.',                   sector: 'tech', type: 'stock' },
  { ticker: 'ADBE',  name: 'Adobe Inc.',                        sector: 'tech', type: 'stock' },
  { ticker: 'NOW',   name: 'ServiceNow Inc.',                   sector: 'tech', type: 'stock' },
  { ticker: 'SNOW',  name: 'Snowflake Inc.',                    sector: 'tech', type: 'stock' },
  { ticker: 'PLTR',  name: 'Palantir Technologies Inc.',        sector: 'tech', type: 'stock' },
  { ticker: 'SMCI',  name: 'Super Micro Computer Inc.',         sector: 'tech', type: 'stock' },
  { ticker: 'ARM',   name: 'Arm Holdings plc',                  sector: 'tech', type: 'stock' },
  { ticker: 'DELL',  name: 'Dell Technologies Inc.',            sector: 'tech', type: 'stock' },
  { ticker: 'UBER',  name: 'Uber Technologies Inc.',            sector: 'tech', type: 'stock' },
  { ticker: 'SHOP',  name: 'Shopify Inc.',                      sector: 'tech', type: 'stock' },

  // ── Defense & Aerospace (12) ──────────────────────────────────────────────
  { ticker: 'LMT',  name: 'Lockheed Martin Corp.',              sector: 'defense', type: 'stock' },
  { ticker: 'RTX',  name: 'RTX Corp.',                          sector: 'defense', type: 'stock' },
  { ticker: 'NOC',  name: 'Northrop Grumman Corp.',             sector: 'defense', type: 'stock' },
  { ticker: 'GD',   name: 'General Dynamics Corp.',             sector: 'defense', type: 'stock' },
  { ticker: 'BA',   name: 'Boeing Co.',                         sector: 'defense', type: 'stock' },
  { ticker: 'HII',  name: 'Huntington Ingalls Industries Inc.', sector: 'defense', type: 'stock' },
  { ticker: 'LHX',  name: 'L3Harris Technologies Inc.',         sector: 'defense', type: 'stock' },
  { ticker: 'AXON', name: 'Axon Enterprise Inc.',               sector: 'defense', type: 'stock' },
  { ticker: 'KTOS', name: 'Kratos Defense & Security Solutions',sector: 'defense', type: 'stock' },
  { ticker: 'LDOS', name: 'Leidos Holdings Inc.',               sector: 'defense', type: 'stock' },
  { ticker: 'CACI', name: 'CACI International Inc.',            sector: 'defense', type: 'stock' },
  { ticker: 'DRS',  name: 'Leonardo DRS Inc.',                  sector: 'defense', type: 'stock' },

  // ── Healthcare & Pharma (15) ──────────────────────────────────────────────
  { ticker: 'JNJ',  name: 'Johnson & Johnson',                  sector: 'health', type: 'stock' },
  { ticker: 'PFE',  name: 'Pfizer Inc.',                        sector: 'health', type: 'stock' },
  { ticker: 'MRK',  name: 'Merck & Co. Inc.',                   sector: 'health', type: 'stock' },
  { ticker: 'ABBV', name: 'AbbVie Inc.',                        sector: 'health', type: 'stock' },
  { ticker: 'LLY',  name: 'Eli Lilly and Co.',                  sector: 'health', type: 'stock' },
  { ticker: 'BMY',  name: 'Bristol-Myers Squibb Co.',           sector: 'health', type: 'stock' },
  { ticker: 'AMGN', name: 'Amgen Inc.',                         sector: 'health', type: 'stock' },
  { ticker: 'GILD', name: 'Gilead Sciences Inc.',               sector: 'health', type: 'stock' },
  { ticker: 'REGN', name: 'Regeneron Pharmaceuticals Inc.',     sector: 'health', type: 'stock' },
  { ticker: 'VRTX', name: 'Vertex Pharmaceuticals Inc.',        sector: 'health', type: 'stock' },
  { ticker: 'MRNA', name: 'Moderna Inc.',                       sector: 'health', type: 'stock' },
  { ticker: 'MDT',  name: 'Medtronic plc',                      sector: 'health', type: 'stock' },
  { ticker: 'ABT',  name: 'Abbott Laboratories',                sector: 'health', type: 'stock' },
  { ticker: 'ISRG', name: 'Intuitive Surgical Inc.',            sector: 'health', type: 'stock' },
  { ticker: 'SYK',  name: 'Stryker Corp.',                      sector: 'health', type: 'stock' },

  // ── Energy (12) ───────────────────────────────────────────────────────────
  { ticker: 'XOM',  name: 'Exxon Mobil Corp.',                  sector: 'energy', type: 'stock' },
  { ticker: 'CVX',  name: 'Chevron Corp.',                      sector: 'energy', type: 'stock' },
  { ticker: 'COP',  name: 'ConocoPhillips',                     sector: 'energy', type: 'stock' },
  { ticker: 'SLB',  name: 'SLB (Schlumberger)',                 sector: 'energy', type: 'stock' },
  { ticker: 'HAL',  name: 'Halliburton Co.',                    sector: 'energy', type: 'stock' },
  { ticker: 'OXY',  name: 'Occidental Petroleum Corp.',         sector: 'energy', type: 'stock' },
  { ticker: 'ENPH', name: 'Enphase Energy Inc.',                sector: 'energy', type: 'stock' },
  { ticker: 'FSLR', name: 'First Solar Inc.',                   sector: 'energy', type: 'stock' },
  { ticker: 'NEE',  name: 'NextEra Energy Inc.',                sector: 'energy', type: 'stock' },
  { ticker: 'BEP',  name: 'Brookfield Renewable Partners LP',   sector: 'energy', type: 'stock' },
  { ticker: 'PLUG', name: 'Plug Power Inc.',                    sector: 'energy', type: 'stock' },
  { ticker: 'LNG',  name: 'Cheniere Energy Inc.',               sector: 'energy', type: 'stock' },

  // ── Finance & Fintech (15) ────────────────────────────────────────────────
  { ticker: 'JPM',   name: 'JPMorgan Chase & Co.',              sector: 'finance', type: 'stock' },
  { ticker: 'BAC',   name: 'Bank of America Corp.',             sector: 'finance', type: 'stock' },
  { ticker: 'WFC',   name: 'Wells Fargo & Co.',                 sector: 'finance', type: 'stock' },
  { ticker: 'GS',    name: 'Goldman Sachs Group Inc.',          sector: 'finance', type: 'stock' },
  { ticker: 'MS',    name: 'Morgan Stanley',                    sector: 'finance', type: 'stock' },
  { ticker: 'C',     name: 'Citigroup Inc.',                    sector: 'finance', type: 'stock' },
  { ticker: 'V',     name: 'Visa Inc.',                         sector: 'finance', type: 'stock' },
  { ticker: 'MA',    name: 'Mastercard Inc.',                   sector: 'finance', type: 'stock' },
  { ticker: 'PYPL',  name: 'PayPal Holdings Inc.',              sector: 'finance', type: 'stock' },
  { ticker: 'SQ',    name: 'Block Inc.',                        sector: 'finance', type: 'stock' },
  { ticker: 'NU',    name: 'Nu Holdings Ltd.',                  sector: 'finance', type: 'stock' },
  { ticker: 'SOFI',  name: 'SoFi Technologies Inc.',            sector: 'finance', type: 'stock' },
  { ticker: 'BRK-B', name: 'Berkshire Hathaway Inc.',           sector: 'finance', type: 'stock' },
  { ticker: 'AXP',   name: 'American Express Co.',              sector: 'finance', type: 'stock' },
  { ticker: 'COF',   name: 'Capital One Financial Corp.',       sector: 'finance', type: 'stock' },

  // ── Industrials (12) ─────────────────────────────────────────────────────
  { ticker: 'CAT', name: 'Caterpillar Inc.',                    sector: 'industrials', type: 'stock' },
  { ticker: 'DE',  name: 'Deere & Co.',                         sector: 'industrials', type: 'stock' },
  { ticker: 'UPS', name: 'United Parcel Service Inc.',          sector: 'industrials', type: 'stock' },
  { ticker: 'FDX', name: 'FedEx Corp.',                         sector: 'industrials', type: 'stock' },
  { ticker: 'HON', name: 'Honeywell International Inc.',        sector: 'industrials', type: 'stock' },
  { ticker: 'GE',  name: 'GE Aerospace',                        sector: 'industrials', type: 'stock' },
  { ticker: 'ETN', name: 'Eaton Corp.',                         sector: 'industrials', type: 'stock' },
  { ticker: 'EMR', name: 'Emerson Electric Co.',                sector: 'industrials', type: 'stock' },
  { ticker: 'ROK', name: 'Rockwell Automation Inc.',            sector: 'industrials', type: 'stock' },
  { ticker: 'MMM', name: '3M Co.',                              sector: 'industrials', type: 'stock' },
  { ticker: 'PH',  name: 'Parker-Hannifin Corp.',               sector: 'industrials', type: 'stock' },
  { ticker: 'ITW', name: 'Illinois Tool Works Inc.',            sector: 'industrials', type: 'stock' },

  // ── Materials & Mining (10) ───────────────────────────────────────────────
  { ticker: 'FCX',  name: 'Freeport-McMoRan Inc.',              sector: 'materials', type: 'stock' },
  { ticker: 'NEM',  name: 'Newmont Corp.',                      sector: 'materials', type: 'stock' },
  { ticker: 'GOLD', name: 'Barrick Gold Corp.',                 sector: 'materials', type: 'stock' },
  { ticker: 'AA',   name: 'Alcoa Corp.',                        sector: 'materials', type: 'stock' },
  { ticker: 'NUE',  name: 'Nucor Corp.',                        sector: 'materials', type: 'stock' },
  { ticker: 'ALB',  name: 'Albemarle Corp.',                    sector: 'materials', type: 'stock' },
  { ticker: 'MP',   name: 'MP Materials Corp.',                 sector: 'materials', type: 'stock' },
  { ticker: 'DOW',  name: 'Dow Inc.',                           sector: 'materials', type: 'stock' },
  { ticker: 'LIN',  name: 'Linde plc',                          sector: 'materials', type: 'stock' },
  { ticker: 'APD',  name: 'Air Products & Chemicals Inc.',      sector: 'materials', type: 'stock' },

  // ── Consumer & Retail (12) ────────────────────────────────────────────────
  { ticker: 'COST', name: 'Costco Wholesale Corp.',             sector: 'consumer', type: 'stock' },
  { ticker: 'WMT',  name: 'Walmart Inc.',                       sector: 'consumer', type: 'stock' },
  { ticker: 'TGT',  name: 'Target Corp.',                       sector: 'consumer', type: 'stock' },
  { ticker: 'HD',   name: 'Home Depot Inc.',                    sector: 'consumer', type: 'stock' },
  { ticker: 'LOW',  name: 'Lowe\'s Companies Inc.',             sector: 'consumer', type: 'stock' },
  { ticker: 'SBUX', name: 'Starbucks Corp.',                    sector: 'consumer', type: 'stock' },
  { ticker: 'MCD',  name: 'McDonald\'s Corp.',                  sector: 'consumer', type: 'stock' },
  { ticker: 'NKE',  name: 'Nike Inc.',                          sector: 'consumer', type: 'stock' },
  { ticker: 'CMG',  name: 'Chipotle Mexican Grill Inc.',        sector: 'consumer', type: 'stock' },
  { ticker: 'YUM',  name: 'Yum! Brands Inc.',                   sector: 'consumer', type: 'stock' },
  { ticker: 'ULTA', name: 'Ulta Beauty Inc.',                   sector: 'consumer', type: 'stock' },
  { ticker: 'LULU', name: 'Lululemon Athletica Inc.',           sector: 'consumer', type: 'stock' },
]
