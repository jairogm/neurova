export type Country = {
  iso: string;
  name: string;
  phoneCode: string;
  flag: string;
};

export const COUNTRIES: Country[] = [
  {
    iso: "US",
    name: "United States",
    phoneCode: "+1",
    flag: "🇺🇸"
  },
  {
    iso: "GB",
    name: "United Kingdom",
    phoneCode: "+44",
    flag: "🇬🇧"
  },
  {
    iso: "CO",
    name: "Colombia",
    phoneCode: "+57",
    flag: "🇨🇴"
  },
  {
    iso: "IN",
    name: "India",
    phoneCode: "+91",
    flag: "🇮🇳"
  },
  {
    iso: "CA",
    name: "Canada",
    phoneCode: "+1",
    flag: "🇨🇦"
  },
  {
    iso: "AU",
    name: "Australia",
    phoneCode: "+61",
    flag: "🇦🇺"
  },
  {
    iso: "DE",
    name: "Germany",
    phoneCode: "+49",
    flag: "🇩🇪"
  },
  {
    iso: "FR",
    name: "France",
    phoneCode: "+33",
    flag: "🇫🇷"
  },
  {
    iso: "JP",
    name: "Japan",
    phoneCode: "+81",
    flag: "🇯🇵"
  },
  {
    iso: "BR",
    name: "Brazil",
    phoneCode: "+55",
    flag: "🇧🇷"
  },
  {
    iso: "MX",
    name: "Mexico",
    phoneCode: "+52",
    flag: "🇲🇽"
  },
  {
    iso: "ES",
    name: "Spain",
    phoneCode: "+34",
    flag: "🇪🇸"
  }
];