// src/services/mdrDetectionService.js
/**
 * MDR (Multi-Drug Resistant) Detection Service
 * Determines if an organism is MDR based on:
 * 1. Organism name (hard-coded list)
 * 2. Antibiotic resistance profile
 */

// ✅ List of known MDR organisms
const MDR_ORGANISMS = [
  'MRSA',           // Methicillin-resistant Staphylococcus aureus
  'VRE',            // Vancomycin-resistant Enterococcus
  'ESBL',           // Extended-spectrum beta-lactamase
  'CRE',            // Carbapenem-resistant Enterobacteriaceae
  'MDR-TB',         // Multi-drug resistant Tuberculosis
  'XDR-TB',         // Extensively drug-resistant TB
  'Acinetobacter baumannii',
  'Pseudomonas aeruginosa (resistant)',
  'Clostridium difficile'
];

// ✅ Antibiotic classes and their typical drugs
const ANTIBIOTIC_CLASSES = {
  BETA_LACTAMS: ['Ampicillin', 'Amoxicillin', 'Penicillin', 'Cephalexin', 'Ceftriaxone'],
  FLUOROQUINOLONES: ['Ciprofloxacin', 'Levofloxacin', 'Moxifloxacin'],
  MACROLIDES: ['Erythromycin', 'Azithromycin'],
  AMINOGLYCOSIDES: ['Gentamicin', 'Tobramycin', 'Streptomycin'],
  CARBAPENEMS: ['Imipenem', 'Meropenem', 'Ertapenem'],
  GLYCOPEPTIDES: ['Vancomycin', 'Teicoplanin'],
  CEPHALOSPORINS: ['Ceftazidime', 'Cefepime', 'Cephalosporin']
};

/**
 * ✅ Detect if organism is MDR
 * @param {string} organism - Organism name (e.g., "Staphylococcus aureus")
 * @param {object} antibioticProfile - Antibiotic susceptibilities (e.g., { "Ampicillin": "R", "Ciprofloxacin": "S" })
 * @returns {boolean} - true if MDR detected
 */
async function detectMDR(organism, antibioticProfile = {}) {
  try {
    // ✅ Check 1: Known MDR organism by name
    const organizationName = organism?.toLowerCase() || '';
    for (const mdrOrg of MDR_ORGANISMS) {
      if (organizationName.includes(mdrOrg.toLowerCase())) {
        console.log(`✅ MDR detected by organism name: ${organism}`);
        return true;
      }
    }

    // ✅ Check 2: Antibiotic resistance profile analysis
    // If resistant (R) to multiple classes of antibiotics → MDR
    if (Object.keys(antibioticProfile).length > 0) {
      const resistanceCount = Object.values(antibioticProfile).filter(v => v === 'R' || v === 'I').length;
      const totalTests = Object.keys(antibioticProfile).length;
      
      // If >30% of tested antibiotics are resistant → MDR
      const resistancePercentage = (resistanceCount / totalTests) * 100;
      
      // ✅ Check multi-class resistance
      let classesWithResistance = 0;
      
      for (const [className, drugs] of Object.entries(ANTIBIOTIC_CLASSES)) {
        const classResistance = drugs.filter(drug => antibioticProfile[drug] === 'R').length;
        if (classResistance > 0) {
          classesWithResistance++;
        }
      }

      // MDR = resistant to ≥3 different antibiotic classes
      if (classesWithResistance >= 3) {
        console.log(`✅ MDR detected: resistant to ${classesWithResistance} antibiotic classes`);
        return true;
      }

      // OR if >50% of tested antibiotics show resistance
      if (resistancePercentage > 50) {
        console.log(`✅ MDR detected: ${resistancePercentage.toFixed(2)}% antibiotic resistance`);
        return true;
      }
    }

    console.log(`❌ Not MDR: ${organism}`);
    return false;
  } catch (err) {
    console.error('MDR detection error:', err);
    return false;
  }
}

/**
 * ✅ Get MDR risk level
 * @param {string} organism
 * @param {object} antibioticProfile
 * @returns {string} - 'low', 'medium', 'high', 'critical'
 */
function getMDRRiskLevel(organism, antibioticProfile = {}) {
  const resistanceCount = Object.values(antibioticProfile).filter(v => v === 'R').length;
  
  if (resistanceCount >= 5) return 'critical';
  if (resistanceCount >= 3) return 'high';
  if (resistanceCount >= 1) return 'medium';
  return 'low';
}

module.exports = {
  detectMDR,
  getMDRRiskLevel,
  MDR_ORGANISMS,
  ANTIBIOTIC_CLASSES
};
