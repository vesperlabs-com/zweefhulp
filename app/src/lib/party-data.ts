export type PartyMetadata = {
  name: string
  shortName: string
  website: string
  logo: string
  program: {
    fileName: string
    year: number
  }
}

export const PARTIES: Record<string, PartyMetadata> = {
  '50PLUS': {
    name: '50PLUS',
    shortName: '50+',
    website: 'https://50pluspartij.nl',
    logo: 'logo_50plus.jpg',
    program: {
      fileName: 'Verkiezingsprogramma_2025-2029_50PLUS.pdf',
      year: 2025
    }
  },
  'BBB': {
    name: 'BBB',
    shortName: 'BBB',
    website: 'https://www.boerburgerbeweging.nl',
    logo: 'logo_bbb.jpg',
    program: {
      fileName: 'BBB Verkiezingsprogramma TK25 - versie 20250830 -.pdf',
      year: 2025
    }
  },
  'BIJ1': {
    name: 'BIJ1',
    shortName: 'BIJ1',
    website: 'https://bij1.org',
    logo: 'logo_bij1.jpg',
    program: {
      fileName: '20250925_Programma_BIJ1_Losse-Pagina-2.pdf',
      year: 2025
    }
  },
  'BVNL': {
    name: 'BVNL',
    shortName: 'BVNL',
    website: 'https://bvnl.nl',
    logo: 'logo_bvnl.jpg',
    program: {
      fileName: 'BVNL-verkiezingsprogramma-2025-2029.pdf',
      year: 2025
    }
  },
  'CDA': {
    name: 'CDA',
    shortName: 'CDA',
    website: 'https://www.cda.nl',
    logo: 'logo_cda.jpg',
    program: {
      fileName: 'CDA-Verkiezingsprogramma-TK2025-Digitaal-DEFINHOUD.pdf',
      year: 2025
    }
  },
  'ChristenUnie': {
    name: 'ChristenUnie',
    shortName: 'CU',
    website: 'https://www.christenunie.nl',
    logo: 'logo_cu.jpg',
    program: {
      fileName: 'CU_Verkiezingsprogramma_2025.pdf',
      year: 2025
    }
  },
  'D66': {
    name: 'D66',
    shortName: 'D66',
    website: 'https://d66.nl',
    logo: 'logo_d66.jpg',
    program: {
      fileName: 'D66-Concept-verkiezingsprogramma-2025-2030.pdf',
      year: 2025
    }
  },
  'DENK': {
    name: 'DENK',
    shortName: 'DENK',
    website: 'https://bewegingdenk.nl',
    logo: 'logo_denk.jpg',
    program: {
      fileName: 'Verkiezingsprogramma-DENK-2025.pdf',
      year: 2025
    }
  },
  'FVD': {
    name: 'FVD',
    shortName: 'FvD',
    website: 'https://www.fvd.nl',
    logo: 'logo_fvd.jpg',
    program: {
      fileName: 'verkiezingsprogramma-2025.pdf',
      year: 2025
    }
  },
  'GroenLinks-PvdA': {
    name: 'GroenLinks-PvdA',
    shortName: 'GL-PvdA',
    website: 'https://groenlinks-pvda.nl',
    logo: 'logo_glpvda.jpg',
    program: {
      fileName: 'Conceptverkiezingsprogramma-GroenLinks-PvdA-2025.pdf',
      year: 2025
    }
  },
  'JA21': {
    name: 'JA21',
    shortName: 'JA21',
    website: 'https://ja21.nl',
    logo: 'logo_ja21.jpg',
    program: {
      fileName: 'Verkiezingsprogramma_TK_25_A4_v15.pdf',
      year: 2025
    }
  },
  'NSC': {
    name: 'NSC',
    shortName: 'NSC',
    website: 'https://www.nieuwsociaalcontract.nl',
    logo: 'logo_nsc.jpg',
    program: {
      fileName: 'verkiezingsprogramma_1509_2_ca4765c16c.pdf',
      year: 2025
    }
  },
  'PvdD': {
    name: 'PvdD',
    shortName: 'PvdD',
    website: 'https://www.partijvoordedieren.nl',
    logo: 'logo_pvdd.jpg',
    program: {
      fileName: 'PVDD-programma-tweede-kamerverkiezingen-okt-2025.pdf',
      year: 2025
    }
  },
  'PVV': {
    name: 'PVV',
    shortName: 'PVV',
    website: 'https://www.pvv.nl',
    logo: 'logo_pvv.jpg',
    program: {
      fileName: 'PVV_Programma_Digi_2025.pdf',
      year: 2025
    }
  },
  'SGP': {
    name: 'SGP',
    shortName: 'SGP',
    website: 'https://www.sgp.nl',
    logo: 'logo_sgp.jpg',
    program: {
      fileName: 'Verkiezingsprogramma_SGP_2025 eindversie.pdf',
      year: 2025
    }
  },
  'SP': {
    name: 'SP',
    shortName: 'SP',
    website: 'https://www.sp.nl',
    logo: 'logo_sp.jpg',
    program: {
      fileName: 'SP_Concept_Verkiezingsprogramma.pdf',
      year: 2025
    }
  },
  'Volt': {
    name: 'Volt',
    shortName: 'Volt',
    website: 'https://www.voltnederland.org',
    logo: 'logo_volt.jpg',
    program: {
      fileName: 'volt_verkiezingsprogramma_2025.pdf',
      year: 2025
    }
  },
  'VVD': {
    name: 'VVD',
    shortName: 'VVD',
    website: 'https://www.vvd.nl',
    logo: 'logo_vvd.jpg',
    program: {
      fileName: 'Verkiezingsprogramma-TK-VVD-2025-DEF.pdf',
      year: 2025
    }
  },
}

// Helper to get party list in alphabetical order
export const getPartiesList = () => {
  return Object.keys(PARTIES).sort()
}

// Helper to get logo path
export const getPartyLogo = (partyName: string) => {
  return `/logos/${PARTIES[partyName]?.logo || 'logo_default.jpg'}`
}

