import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadLang = (file) => {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, file), "utf-8")
  );
};

const languages = {
  en: loadLang("en.json"),
  hi: loadLang("hi.json"),
  de: loadLang("de.json"),
  fr: loadLang("fr.json"),
  es: loadLang("es.json"),
  it: loadLang("it.json"),
};

export const t = (lang = "en", key) => {
  return languages[lang]?.[key] || languages.en[key] || key;
};
