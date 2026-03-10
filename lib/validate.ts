/** Shared validation helpers for API routes */

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidDate(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(Date.parse(dateStr));
}

// Canonical allowed values — single source of truth for server-side validation
export const ALLOWED_TOWNS = [
  'Oak Harbor', 'Coupeville', 'Langley', 'Freeland',
  'Greenbank', 'Clinton', 'Bayview', 'Maxwelton', 'Other',
] as const;

export const ALLOWED_EVENT_CATEGORIES = [
  'Nature & Wildlife', 'Arts & Culture', 'Farmers Market',
  'Music & Performance', 'Outdoors & Recreation', 'Film & Media',
  'Community & Social', 'Classes & Workshops', 'Food & Drink',
  'Sports & Fitness', 'Other',
] as const;

export const ALLOWED_EVENT_TAGS = [
  'Kids Event', 'Family Event', 'Adult Event', 'Live Music',
  'Festival', 'Karaoke', 'Class', 'Visual Art', 'Just Fun', 'Market',
  'Visitor Friendly',
] as const;

export const ALLOWED_CONTACT_TOPICS = [
  'event', 'news', 'listing', 'advertising', 'general',
] as const;

export const ALLOWED_LISTING_CATEGORIES = [
  'Furniture', 'Tools & Equipment', 'Clothing & Accessories',
  'Electronics', 'Books & Media', 'Sports & Outdoors',
  'Garden & Plants', 'Home & Kitchen', 'Kids & Toys',
  'Vehicles & Boats', 'Farm & Animals', 'Art & Collectibles',
  'Services', 'Free Stuff', 'Other',
] as const;

type ValidationError = { field: string; message: string };

export class Validator {
  private errors: ValidationError[] = [];

  required(value: unknown, label: string): this {
    if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) {
      this.errors.push({ field: label, message: `${label} is required` });
    }
    return this;
  }

  minLength(value: string | undefined, min: number, label: string): this {
    if (value && value.trim().length < min) {
      this.errors.push({ field: label, message: `${label} must be at least ${min} characters` });
    }
    return this;
  }

  maxLength(value: string | undefined | null, max: number, label: string): this {
    if (value && value.length > max) {
      this.errors.push({ field: label, message: `${label} must be ${max} characters or fewer` });
    }
    return this;
  }

  email(value: string | undefined, label: string): this {
    if (value && !isValidEmail(value.trim())) {
      this.errors.push({ field: label, message: `${label} must be a valid email address` });
    }
    return this;
  }

  date(value: string | undefined, label: string): this {
    if (value && !isValidDate(value)) {
      this.errors.push({ field: label, message: `${label} must be a valid date (YYYY-MM-DD)` });
    }
    return this;
  }

  oneOf(value: string | undefined, allowed: readonly string[], label: string): this {
    if (value && !allowed.includes(value)) {
      this.errors.push({ field: label, message: `${label} contains an unrecognised value` });
    }
    return this;
  }

  eachOneOf(values: unknown, allowed: readonly string[], label: string): this {
    if (Array.isArray(values)) {
      const invalid = values.filter(v => !allowed.includes(v as string));
      if (invalid.length > 0) {
        this.errors.push({ field: label, message: `${label} contains unrecognised values` });
      }
    }
    return this;
  }

  maxItems(values: unknown, max: number, label: string): this {
    if (Array.isArray(values) && values.length > max) {
      this.errors.push({ field: label, message: `${label} may have at most ${max} items` });
    }
    return this;
  }

  ok(): boolean { return this.errors.length === 0; }
  firstError(): string { return this.errors[0]?.message ?? 'Invalid input'; }
}
