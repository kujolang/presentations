# Financial model — proposed, USD, 2026-11-11

Canonical machine-readable inputs: financial-model.json; quarterly-budget.csv is the cash schedule. No revenue offsets, investment commitments, validated valuation, or promised hiring rates.

## Resolve compensation before agreeing terms
The earlier source used $150K annual cash base: $300K over two years, plus illustrative 25% burden = $375K employer cost. The new discussion input says $375K total over two years but does not specify cash versus fully loaded cost. Those are not equivalent. For sensitivity only, this budget uses $375K founder cash over two years ($15,625/month); overhead is separately budgeted. If $375K means fully loaded cost, $300K cash plus $75K burden is the alternative, freeing $75K from this cash scenario before any overhead reconciliation. Neither is approved. Confirm cash, benefits, payroll jurisdiction and total employer cost explicitly.

## 24-month spending schedule
All cells below are USD. Revenue is zero for runway purposes. Reserve is not counted as an expense. Total operating envelope $5.1M; reserve $900K. Operating average $212,500/month; actual burn ramps by quarter. Runway is a funded 24-month model, not an assurance against cost overruns.

| Category | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8 | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Founder total cash | 46,875 | 46,875 | 46,875 | 46,875 | 46,875 | 46,875 | 46,875 | 46,875 | 375,000 |
| Engineering | 75,000 | 100,000 | 150,000 | 180,000 | 210,000 | 235,000 | 250,000 | 300,000 | 1,500,000 |
| Product and developer experience | 20,000 | 40,000 | 60,000 | 75,000 | 85,000 | 90,000 | 90,000 | 90,000 | 550,000 |
| Customer development and distribution | 25,000 | 50,000 | 75,000 | 100,000 | 130,000 | 150,000 | 180,000 | 630,000 | 1,340,000 |
| Employer and contractor overhead | 15,000 | 25,000 | 40,000 | 50,000 | 60,000 | 70,000 | 80,000 | 85,000 | 425,000 |
| Cloud and model usage | 10,000 | 20,000 | 30,000 | 40,000 | 50,000 | 65,000 | 80,000 | 105,000 | 400,000 |
| Legal security compliance | 25,000 | 25,000 | 35,000 | 40,000 | 40,000 | 40,000 | 45,000 | 50,000 | 300,000 |
| Operations | 10,000 | 15,000 | 20,000 | 25,000 | 30,000 | 35,000 | 35,000 | 40,000 | 210,000 |
| Total spend | 226,875 | 321,875 | 456,875 | 556,875 | 651,875 | 731,875 | 806,875 | 1,346,875 | 5,100,000 |
| Cash remaining | 5,773,125 | 5,451,250 | 4,994,375 | 4,437,500 | 3,785,625 | 3,053,750 | 2,246,875 | 900,000 | — |

## Hiring and release gates
Q1: founder, one execution/reliability engineer, fractional design/DX and customer discovery. Q2: add a second engineer only after repeat local activation and qualified buyer incidents. Q3–4: expand integration/DX and customer engineering after 3 design partners and 2 paid pilots; security review before sensitive customer data. Q5–8: add commercial and support capacity only after retention and measured support costs. Role counts are conditional; quarterly envelopes, not employment offers, govern spend.

Engineering envelope covers staged international hiring and contracting. $50K–$60K annual roles are unvalidated discussion inputs, not assumed offers or compensation promises. Use jurisdiction-specific competitive salary quotes, employment classification, benefits, payroll/EOR and legal costs before hiring. Overhead is a separate cash envelope, not automatically 25% of every vendor invoice. Product/DX and customer development receive explicit allocations rather than treating engineering as the entire company.

## Revenue sensitivities, separate from cash runway
| Case | Price/month | Teams at month 24 | ARR | Monthly churn | Gross margin | First revenue | Sales cycle |
|---|---:|---:|---:|---:|---:|---|---|
| Conservative | $300 | 25 | $90K | 3% | 60% | month 9 | 2–4 months |
| Base | $500 | 60 | $360K | 1.5% | 75% | month 6 | 1–3 months |
| Upside | $500 | 200 | $1.2M | 1% | 80% | month 4 | 1–2 months |

All assumptions need customer evidence. Trial/paid conversion sensitivities are in JSON. Monthly teams = prior teams × (1 − churn) + gross additions. ARR = active teams × monthly price × 12; annualized run rate is not recognized revenue. Enterprise 100 × $24K = $2.4M is a separate hypothetical business, excluded above. 1,000 × $500 × 12 = $6M is a later scale case, not base month-24 revenue.

## Financing alternatives and dilution
| Raise | Post-money priced valuation or modeled cap | Simple ratio |
|---|---:|---:|
| $2M | $15M | 13.33% |
| $3M | $20M | 15% |
| $6M | $20M | 30% |
| $6M | $30M | 20% |
| $6M | $40M | 15% |

For a priced $6M round at $30M post-money, pre-money is $24M and simple new ownership is 20% before other dilution. A $30M post-money SAFE cap is a conversion term, not a priced valuation; actual ownership depends on the signed instrument, other securities and option-pool treatment. This is scenario arithmetic, not legal advice or negotiated terms. Counsel must model definitive documents. A further 20% dilution takes a 20% holding to 16%.

Recommendation: keep $6M as a proposed full commercialization plan while testing a $2M–$3M milestone round. A $2M envelope could reserve $300K and fund $1.7M operating spend over 18 months (~$94K/month); $3M could reserve $450K and fund $2.55M over 24 months (~$106K/month). Both require a smaller team, one evidence workflow and sequential rather than parallel commercial/integration work; neither simply funds the $6M schedule. $6M buys commercial, DX, security and integration capacity alongside engineering. Technical achievement alone does not establish a $30M cap. Compare dilution, financing risk and evidence needed for the next raise; founder selects terms.
