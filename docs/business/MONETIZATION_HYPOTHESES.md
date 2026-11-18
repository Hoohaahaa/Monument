# Monument Monetization Hypotheses

- Status: Discovery hypotheses; no pricing or entitlement approved
- Date: 2026-11-18

## 1. Principle

Do not sell unrestricted ownership of physical space. Monetize the digital resources, capabilities, reach, collaboration, and services Monument provides. Spatial presence does not confer land rights, advertising rights, or exclusivity over a real-world place.

Price separately by segment and output type. Do not force individual creators, collectives, advertisers, and tourism operators into one plan.

## 2. Segment hypotheses

| Segment | Job to be done | Candidate value metric | Possible model | Main risk |
|---|---|---|---|---|
| Individual creator | Place personal/artistic Moments | active Moments, geometry/media budget, private storage | Free entry + creator subscription or publishing credits | Paywall blocks discovery and experimentation |
| Collective/community | Co-create a place or event | seats, collaborators, Sessions, moderation tools | workspace subscription, event pass, pooled credits | Governance and ownership disputes |
| Cultural institution/venue | Publish durable interpretation and guided experiences | sites, exhibits, analytics, languages, content volume | annual site licence or managed service | Long sales cycle and maintenance |
| Tourism/destination | Create discoverable routes and experiences | destinations, routes, visits, languages, campaign period | B2B subscription, commissioned installation, booking referral | Seasonality, attribution, rights and accessibility |
| Brand/advertiser | Sponsor a spatial activation | qualified impressions/visits, campaign area, duration, interaction | labelled campaign package or verified engagement | Spatial spam and trust erosion |
| Education/research | Publish fieldwork and learning layers | cohorts, datasets, field sites, exports | institution licence or research grant | Privacy and data stewardship |

These are hypotheses, not validated demand.

## 3. Charge by resource/output type

A single area-on-Earth price is not enough. A large flat polygon, vertical curtain, underground volume, and high-detail 3D mesh have different technical costs and risks.

Candidate entitlement dimensions:
- spatial footprint (m²/km²), geometry type, and vertical extent;
- mesh complexity / vertex or triangle budget;
- media storage and delivery bandwidth;
- number of published Moments and versions;
- collaborators and concurrent Sessions;
- Session duration and message/fan-out budget;
- private/public visibility and moderation requirements;
- analytics, export, API access, and support;
- campaign duration and verified reach for sponsored content.

Do not charge solely by raw polygon area if rendering/service cost is mostly geometry complexity, media delivery, or realtime fan-out. Combine simple plan allowances with transparent usage limits.

## 4. Candidate plan shape, not final pricing

- Personal: small number of public/private Moments, basic geometry, standard media, low Session capacity.
- Creator: larger geometry/media budgets, more Moments, version history, basic analytics.
- Collective: shared workspace, roles, co-authoring, group Sessions, moderation.
- Institution/Tourism: multiple locations, routes, multilingual publishing, scheduled content, analytics, support.
- Campaign: time-bound sponsored activation, strict labeling, placement review, frequency caps, transparent reporting.
- Enterprise/API: custom quotas and integrations only after operational maturity.

Exact numeric limits and prices require cost measurement and customer discovery.

## 5. Large-surface policy

Large surfaces should be technically bounded and progressively priced:
- base plan includes a modest footprint/complexity allowance;
- higher tiers unlock larger geometry and more concurrent viewers;
- exceptionally large or high-impact placements require manual review;
- geometry complexity, terrain-follow sampling, media, and delivery count separately;
- global-scale overlays are a special product class, not a default creator entitlement.

A global-scale surface should be partitioned into tiles/chunks with level-of-detail, spatial indexing, caching, and explicit rendering budgets. Never transmit one giant mesh to every phone.

## 6. Advertising trust model

Advertising must be opt-in at publisher/campaign level, clearly labelled, and distinguishable from organic Moments. No pay-to-override safety, land rights, moderation, or privacy. Do not sell precise user movement histories. Measure only consented, minimized, aggregated campaign outcomes.

Possible sponsored outputs: sponsored Moment or route, event activation, venue/destination layer, or sponsored discovery placement with explicit label.

Do not introduce a global ad auction before there is meaningful organic inventory and user trust.

## 7. Cost and margin model

For each output type, estimate storage per Moment/version, map/terrain/AR provider calls, tile and media egress, geometry generation/rendering complexity, concurrent Session connections and event fan-out, moderation/support labour, payment fees, refunds, taxes, and chargebacks.

Define gross-margin floor and quota/overage behavior before selling a capability. Never silently degrade a paid experience.

## 8. Validation plan

Interview at least five potential users per initial segment before pricing. Test willingness to pay for a concrete outcome, not abstract space on Earth. Run small paid pilots for one individual creator, one collective, and one tourism/cultural partner.

Measure time to create and publish first Moment, discovery-to-experience conversion, repeat visits and creator retention, Session join/completion rates, support/moderation load, cost per active Moment and per Session participant-minute, revenue, and contribution margin by segment/output.

## 9. Open decisions

- Is a Moment permanent by default or does the publisher choose a lifecycle?
- What is the free public discovery policy?
- Are private Moments stored in a private workspace or hidden on the shared index?
- How are ownership disputes and duplicate claims handled?
- Which surfaces/volumes require human review?
- How are sponsored Moments ranked without undermining discovery?
- Which resource metric is easiest to understand: footprint, complexity, media, audience, or a blended allowance?
