type ParsedVcard = {
  name?: string;
  phones: string[];
};

const ALLOWED_VCARD_KEYS = new Set(["FN", "N", "TEL"]);

export function parseVcard(vcard?: string): ParsedVcard {
  if (!vcard) {
    return { phones: [] };
  }
  let nameFromN: string | undefined;
  let nameFromFn: string | undefined;
  const phones: string[] = [];
      continue;
    }
    if (colonIndex === -1) {
      continue;
    }
    if (!rawValue) {
      continue;
    }
    const baseKey = normalizeVcardKey(key);
    if (!baseKey || !ALLOWED_VCARD_KEYS.has(baseKey)) {
      continue;
    }
    const value = cleanVcardValue(rawValue);
    if (!value) {
      continue;
    }
    if (baseKey === "FN" && !nameFromFn) {
      nameFromFn = normalizeVcardName(value);
      continue;
    }
    if (baseKey === "N" && !nameFromN) {
      nameFromN = normalizeVcardName(value);
      continue;
    }
    if (baseKey === "TEL") {
      const phone = normalizeVcardPhone(value);
      if (phone) {
        phones.push(phone);
      }
    }
  }
  return { name: nameFromFn ?? nameFromN, phones };
}

function normalizeVcardKey(key: string): string | undefined {
  const [primary] = key.split(";");
  if (!primary) {
    return undefined;
  }
  const segments = primary.split(".");
  return segments[segments.length - 1] || undefined;
}

function cleanVcardValue(value: string): string {
  return value.replace(/\\n/gi, " ").replace(/\\,/g, ",").replace(/\\;/g, ";").trim();
}

function normalizeVcardName(value: string): string {
  return value.replace(/;/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeVcardPhone(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  if (trimmed.toLowerCase().startsWith("tel:")) {
    return trimmed.slice(4).trim();
  }
  return trimmed;
}
