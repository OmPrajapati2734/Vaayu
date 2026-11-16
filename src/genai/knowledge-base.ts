import { IAQRemedy } from '@/types';

/**
 * Curated Scientific Knowledge Base: Indoor Air Quality & Winter Smog Protocols
 * Compiled from EPA, WHO 2021 Guidelines, ASHRAE 62.2, and UC Davis Aerosol Research.
 */
export const SCIENTIFIC_IAQ_HACKS: IAQRemedy[] = [
  {
    id: 'corsi-rosenthal-box',
    title: 'DIY Corsi-Rosenthal Box Air Purifier',
    category: 'diy_filter',
    costLevel: '$',
    efficiencyGainPercent: 88,
    difficulty: 'Medium (30 mins)',
    urgency: 'Immediate',
    materialsNeeded: [
      '1x Standard 20-inch Box Fan (3-speed)',
      '4x MERV 13 Air Filters (20" x 20" x 1" or 2")',
      '1x Heavy-Duty Duct Tape or Gaffer Tape',
      'Cardboard bottom plate and cardboard shroud'
    ],
    scientificMechanism:
      'Creates a 4-sided cube intake with massive surface area. By significantly lowering air face velocity across the media, static pressure resistance drops, allowing the box fan to deliver up to 200-250 CFM of clean air. Delivers comparable or superior CADR to $400 commercial HEPA units at 1/5th the initial cost and maintenance expense.',
    stepByStepGuide: [
      'Tape 4 MERV 13 filters together in a cube shape with airflow arrows pointing strictly INWARD towards the center.',
      'Cut a 20x20 inch cardboard square and tape it firmly to form the bottom seal.',
      'Place the 20-inch box fan on top, blowing air straight UPWARD out of the cube.',
      'Seal all corner edges and joints completely with duct tape so no unfiltered air bypasses the filters.',
      'Add a circular cardboard shroud on top of the fan to eliminate blade backflow vortexes (+15% airflow efficiency).'
    ],
    impactOnLungs:
      'Clears 85-90% of respirable PM2.5, allergen particles, and wildfire/smog soot within 25 minutes in a 30m2 living room.'
  },
  {
    id: 'micro-ventilation-timing',
    title: 'Thermal Boundary Layer Micro-Ventilation',
    category: 'ventilation',
    costLevel: '$',
    efficiencyGainPercent: 72,
    difficulty: 'Easy (5 mins)',
    urgency: 'Scheduled',
    materialsNeeded: [
      'Indoor CO2/PM2.5 monitor or smartphone app',
      'Opposing cross-ventilation windows'
    ],
    scientificMechanism:
      'During winter smog events, radiation inversions trap heavy soot close to the ground between dusk and mid-morning. Between 13:00 and 15:30, solar radiation warms the surface, lifting the planetary boundary layer (mixing height increases from 150m to >900m), reducing ground-level pollution concentrations by 40-60%.',
    stepByStepGuide: [
      'Keep all doors and windows tightly sealed between 18:00 and 11:00.',
      'Check the AeroSense AI forecast around 13:30 for the daily minimum pollution window.',
      'Open opposing windows 2-3 inches for exactly 15-20 minutes to flush out toxic indoor CO2 and metabolic VOCs without saturating furnishings with PM2.5.',
      'Close windows immediately after 20 minutes and pulse the air cleaner on High speed for 10 minutes.'
    ],
    impactOnLungs:
      'Prevents cognitive fatigue and headache from indoor CO2 buildup (>1500 ppm) while minimizing cumulative particulate lung deposition.'
  },
  {
    id: 'wet-mopping-suppression',
    title: 'Hygroscopic Wet Mopping & Resuspension Barrier',
    category: 'cleaning',
    costLevel: '$',
    efficiencyGainPercent: 65,
    difficulty: 'Easy (5 mins)',
    urgency: 'Immediate',
    materialsNeeded: [
      'Microfiber damp mop',
      'Water with mild biodegradable surfactant',
      'Avoid dry broom or non-HEPA vacuum'
    ],
    scientificMechanism:
      'Dry sweeping aerosolizes settled PM2.5 and PM10 particles through mechanical agitation, increasing indoor breathing zone concentrations by up to 300%. Damp microfiber uses surface tension and van der Waals forces to physically bind sub-micron soot particles to the mop textile.',
    stepByStepGuide: [
      'Never use dry nylon brooms or leaf blowers near living spaces during high AQI alerts.',
      'Dampen a high-density microfiber pad with lukewarm water.',
      'Mop hard floors in single-direction strokes from inner corners towards the entryway.',
      'Rinse microfiber pad in a separate rinse bucket to prevent redepositing carbon black soot.'
    ],
    impactOnLungs:
      'Eliminates indoor particle resuspension, drastically lowering nocturnal coughing fits for infants and toddlers playing on floor level.'
  },
  {
    id: 'kitchen-source-containment',
    title: 'Negative-Pressure Cooking & Combustion Barrier',
    category: 'source_control',
    costLevel: '$',
    efficiencyGainPercent: 82,
    difficulty: 'Easy (5 mins)',
    urgency: 'Immediate',
    materialsNeeded: [
      'Kitchen exhaust range hood',
      'Kitchen separation door or magnetic draft curtain',
      'Induction cooktop or lids for all cookware'
    ],
    scientificMechanism:
      'Cooking with unvented gas or high-heat frying produces massive indoor spikes of ultrafine particles (<0.1 um) and nitrogen dioxide (NO2), frequently reaching >400 ug/m3 PM2.5 within minutes. Operating an exhaust hood on high before turning on heat establishes negative pressure that vents pollutants outside before they diffuse into bedrooms.',
    stepByStepGuide: [
      'Turn on the kitchen exhaust hood 2 minutes BEFORE lighting any gas burner or heating oil.',
      'Close the kitchen door to isolate adjoining living areas and children bedrooms.',
      'Always cook with lids tightly secured on pots to suppress oil aerosolization.',
      'Leave the exhaust fan running for 5 minutes after cooking completes to evacuate residual VOCs.'
    ],
    impactOnLungs:
      'Prevents acute pediatric bronchial spasms caused by the toxic interplay of indoor cooking NO2 and outdoor atmospheric winter smog.'
  },
  {
    id: 'botanical-phytoremediation',
    title: 'Botanical Particulate & Benzene Absorption Matrix',
    category: 'botanical',
    costLevel: '$$',
    efficiencyGainPercent: 40,
    difficulty: 'Easy (5 mins)',
    urgency: 'Long-term',
    materialsNeeded: [
      'Snake Plant (Sansevieria trifasciata)',
      'Areca Palm (Dypsis lutescens)',
      'Spider Plant (Chlorophytum comosum)',
      'Glazed ceramic pots with moisture trays'
    ],
    scientificMechanism:
      'NASA Clean Air Study and subsequent aerobiological trials demonstrate that specific crassulacean acid metabolism (CAM) flora absorb gaseous pollutants (formaldehyde, benzene, trichloroethylene) through stomatic leaf exchange and nocturnal oxygen release. Furthermore, leafy surfaces electrostatically intercept fine airborne dust.',
    stepByStepGuide: [
      'Place 2-3 mature Snake Plants in bedrooms because they release oxygen at night through CAM photosynthesis.',
      'Wipe down plant leaves once a week with a damp cloth to prevent soot clogging leaf stomata.',
      'Maintain moist soil without overwatering to foster beneficial rhizosphere bacteria that metabolize VOCs.'
    ],
    impactOnLungs:
      'Improves nocturnal ambient relative humidity and reduces secondary gaseous irritants that exacerbate morning mucosal dryness.'
  }
];

/**
 * Peer-Reviewed Scientific Citations for GenAI Grounding
 */
export const SCIENTIFIC_CITATIONS = [
  {
    source: 'World Health Organization (WHO) Global Air Quality Guidelines 2021',
    doiOrUrl: 'https://iris.who.int/handle/10665/345329',
    keyTakeaway: 'No safe threshold exists for PM2.5. Recommended annual average limit tightened to 5 ug/m3 and 24-hr limit to 15 ug/m3.'
  },
  {
    source: 'UC Davis / Dr. Richard Corsi & Jim Rosenthal: DIY Air Cleaners Evaluation',
    doiOrUrl: 'https://doi.org/10.1080/02786826.2022.2054674',
    keyTakeaway: 'MERV 13 Corsi-Rosenthal boxes achieve up to 600 m3/h (350 CFM) CADR, removing over 85% of aerosolized particles at 80% lower cost than HEPA.'
  },
  {
    source: 'Berkeley Earth Atmospheric Research (Muller & Muller)',
    doiOrUrl: 'https://berkeleyearth.org/air-pollution-and-cigarette-equivalence/',
    keyTakeaway: 'Rule of thumb: 1 cigarette per day is equivalent to 22 ug/m3 24-hr PM2.5 exposure for an adult lung.'
  },
  {
    source: 'Harvard T.H. Chan School of Public Health: Fine Particulate Matter and Systemic Inflammation',
    doiOrUrl: 'https://doi.org/10.1056/NEJMoa1817364',
    keyTakeaway: 'Every 10 ug/m3 increase in PM2.5 exposure during inversion spikes is linked to an 8% increase in acute cardiopulmonary hospital admissions.'
  }
];

