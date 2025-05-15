interface CustomRegexSetting {
  regex: string;
  languages: string[];
}

export type CustomRegexesSetting = Record<
  string,
  (string | CustomRegexSetting)[]
>;
