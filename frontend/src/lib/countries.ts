export interface Country {
  iso: string;
  flag: string;
  name: { fr: string; en: string; ar: string };
  dialCode: string;
}

export const COUNTRIES: Country[] = [
  { iso: "TN", flag: "🇹🇳", name: { fr: "Tunisie",           en: "Tunisia",            ar: "تونس"          }, dialCode: "+216" },
  { iso: "DZ", flag: "🇩🇿", name: { fr: "Algérie",           en: "Algeria",            ar: "الجزائر"        }, dialCode: "+213" },
  { iso: "MA", flag: "🇲🇦", name: { fr: "Maroc",             en: "Morocco",            ar: "المغرب"         }, dialCode: "+212" },
  { iso: "EG", flag: "🇪🇬", name: { fr: "Égypte",            en: "Egypt",              ar: "مصر"            }, dialCode: "+20"  },
  { iso: "LY", flag: "🇱🇾", name: { fr: "Libye",             en: "Libya",              ar: "ليبيا"          }, dialCode: "+218" },
  { iso: "SA", flag: "🇸🇦", name: { fr: "Arabie Saoudite",   en: "Saudi Arabia",       ar: "المملكة العربية السعودية" }, dialCode: "+966" },
  { iso: "AE", flag: "🇦🇪", name: { fr: "Émirats arabes",    en: "UAE",                ar: "الإمارات"       }, dialCode: "+971" },
  { iso: "QA", flag: "🇶🇦", name: { fr: "Qatar",             en: "Qatar",              ar: "قطر"            }, dialCode: "+974" },
  { iso: "KW", flag: "🇰🇼", name: { fr: "Koweït",            en: "Kuwait",             ar: "الكويت"         }, dialCode: "+965" },
  { iso: "SN", flag: "🇸🇳", name: { fr: "Sénégal",           en: "Senegal",            ar: "السنغال"        }, dialCode: "+221" },
  { iso: "FR", flag: "🇫🇷", name: { fr: "France",            en: "France",             ar: "فرنسا"          }, dialCode: "+33"  },
  { iso: "BE", flag: "🇧🇪", name: { fr: "Belgique",          en: "Belgium",            ar: "بلجيكا"         }, dialCode: "+32"  },
  { iso: "CH", flag: "🇨🇭", name: { fr: "Suisse",            en: "Switzerland",        ar: "سويسرا"         }, dialCode: "+41"  },
  { iso: "DE", flag: "🇩🇪", name: { fr: "Allemagne",         en: "Germany",            ar: "ألمانيا"        }, dialCode: "+49"  },
  { iso: "GB", flag: "🇬🇧", name: { fr: "Royaume-Uni",       en: "United Kingdom",     ar: "المملكة المتحدة" }, dialCode: "+44"  },
  { iso: "IT", flag: "🇮🇹", name: { fr: "Italie",            en: "Italy",              ar: "إيطاليا"        }, dialCode: "+39"  },
  { iso: "ES", flag: "🇪🇸", name: { fr: "Espagne",           en: "Spain",              ar: "إسبانيا"        }, dialCode: "+34"  },
  { iso: "PT", flag: "🇵🇹", name: { fr: "Portugal",          en: "Portugal",           ar: "البرتغال"       }, dialCode: "+351" },
  { iso: "NL", flag: "🇳🇱", name: { fr: "Pays-Bas",          en: "Netherlands",        ar: "هولندا"         }, dialCode: "+31"  },
  { iso: "CA", flag: "🇨🇦", name: { fr: "Canada",            en: "Canada",             ar: "كندا"           }, dialCode: "+1"   },
  { iso: "US", flag: "🇺🇸", name: { fr: "États-Unis",        en: "United States",      ar: "الولايات المتحدة" }, dialCode: "+1"  },
  { iso: "BR", flag: "🇧🇷", name: { fr: "Brésil",            en: "Brazil",             ar: "البرازيل"       }, dialCode: "+55"  },
  { iso: "TR", flag: "🇹🇷", name: { fr: "Turquie",           en: "Turkey",             ar: "تركيا"          }, dialCode: "+90"  },
  { iso: "RU", flag: "🇷🇺", name: { fr: "Russie",            en: "Russia",             ar: "روسيا"          }, dialCode: "+7"   },
  { iso: "CN", flag: "🇨🇳", name: { fr: "Chine",             en: "China",              ar: "الصين"          }, dialCode: "+86"  },
  { iso: "IN", flag: "🇮🇳", name: { fr: "Inde",              en: "India",              ar: "الهند"          }, dialCode: "+91"  },
  { iso: "JP", flag: "🇯🇵", name: { fr: "Japon",             en: "Japan",              ar: "اليابان"        }, dialCode: "+81"  },
  { iso: "AU", flag: "🇦🇺", name: { fr: "Australie",         en: "Australia",          ar: "أستراليا"       }, dialCode: "+61"  },
];

export const DEFAULT_COUNTRY = COUNTRIES.find((c) => c.iso === "TN")!;
