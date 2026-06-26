# gstin-toolkit

> A zero-dependency TypeScript library for GSTIN validation, parsing, and checksum verification.

[![npm version](https://img.shields.io/npm/v/gstin-toolkit)](https://www.npmjs.com/package/gstin-toolkit)
[![bundle size](https://img.shields.io/bundlephobia/minzip/gstin-toolkit)](https://bundlephobia.com/package/gstin-toolkit)
[![license](https://img.shields.io/npm/l/gstin-toolkit)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-first-3178C6)](https://www.typescriptlang.org/)

---

## Why this package?

Every Indian business registered under GST has a **GSTIN** — a 15-character alphanumeric code that encodes a state, a PAN, an entity number, and a Luhn mod-36 checksum.

Validating a GSTIN correctly requires:

- Checking structural format (regex)
- Verifying the state code is a real, recognised code (01–38)
- Computing and verifying the Luhn mod-36 checksum
- Parsing all five encoded components from a single string

Most validators on npm only check the regex. This library does all four — offline, synchronously, with no network calls, in under 2 KB.

---

## Features

- ✅ Full validation — format, state code, and checksum
- ✅ Detailed error codes — know *why* a GSTIN is invalid, not just *that* it is
- ✅ Structural parsing — extract state, PAN, entity type, and checksum fields
- ✅ Offline — no network calls, no JSON fetches, works in edge runtimes
- ✅ Zero dependencies
- ✅ Tree-shakable ESM + CJS dual build
- ✅ Full TypeScript types included

---

## Installation

```bash
npm install gstin-toolkit
# or
pnpm add gstin-toolkit
# or
yarn add gstin-toolkit
```

---

## Quick Start

```typescript
import { isValidGSTIN, validateGSTIN, parseGSTIN } from 'gstin-toolkit';

// Simple boolean check
isValidGSTIN('27AABCU9603R1ZX');  // true
isValidGSTIN('27AABCU9603R1ZY');  // false (bad checksum)

// Full validation with error details
const result = validateGSTIN('99AABCU9603R1ZX');
// { valid: false, errors: ['INVALID_STATE_CODE'] }

// Parse a valid GSTIN into its components
const parsed = parseGSTIN('27AABCU9603R1ZX');
// {
//   raw:           '27AABCU9603R1ZX',
//   stateCode:     '27',
//   stateName:     'Maharashtra',
//   pan:           'AABCU9603R',
//   panHolderType: 'Company',
//   entityNumber:  '1',
//   defaultChar:   'Z',
//   checksum:      'X'
// }
```

---

## API

### `isValidGSTIN(value: string): boolean`

Returns `true` if the GSTIN is structurally valid, has a recognised state code, and passes the Luhn mod-36 checksum. Never throws.

```typescript
isValidGSTIN('27AABCU9603R1ZX');  // true
isValidGSTIN('');                 // false
isValidGSTIN('INVALID');          // false
```

---

### `validateGSTIN(value: string): ValidationResult`

Returns a `ValidationResult` with a `valid` boolean and an `errors` array. Collects **all** errors in a single pass — useful for showing complete form validation feedback.

```typescript
const result = validateGSTIN('27AABCU9603R1ZX');
// { valid: true, errors: [] }

const result2 = validateGSTIN('99AABCU9603R1ZY');
// { valid: false, errors: ['INVALID_STATE_CODE', 'INVALID_CHECKSUM'] }
```

**Error codes:**

| Code | Meaning |
|------|---------|
| `EMPTY` | Input is blank or whitespace-only |
| `INVALID_LENGTH` | Not exactly 15 characters |
| `INVALID_FORMAT` | Fails structural regex |
| `INVALID_STATE_CODE` | First 2 digits are not a recognised state code |
| `INVALID_CHECKSUM` | Luhn mod-36 checksum does not match |

---

### `parseGSTIN(value: string): ParsedGSTIN | null`

Decodes a valid GSTIN into its component parts. Returns `null` for any invalid input. Never throws.

```typescript
const parsed = parseGSTIN('27AABCU9603R1ZX');

parsed.stateCode;     // '27'
parsed.stateName;     // 'Maharashtra'
parsed.pan;           // 'AABCU9603R'
parsed.panHolderType; // 'Company'
parsed.entityNumber;  // '1'
parsed.defaultChar;   // 'Z'
parsed.checksum;      // 'X'
```

---

### `getStateByCode(code: string): StateInfo | null`

Look up a state by its 2-digit code.

```typescript
getStateByCode('27');
// { name: 'Maharashtra', legacy: false }

getStateByCode('99');
// null
```

---

### `getCodeByState(name: string): string | null`

Reverse lookup — state name to code.

```typescript
getCodeByState('Maharashtra'); // '27'
getCodeByState('Unknown');     // null
```

---

### `computeChecksum(gstin: string): string`

Compute the expected Luhn mod-36 checksum character for positions 1–14. Returns `''` if the input contains unmappable characters.

---

### `verifyChecksum(gstin: string): boolean`

Returns `true` if the 15th character matches the computed checksum.

---

## Examples

### Form validation

```typescript
import { validateGSTIN } from 'gstin-toolkit';

function onSubmit(gstinInput: string) {
  const { valid, errors } = validateGSTIN(gstinInput);

  if (!valid) {
    if (errors.includes('EMPTY'))              showError('GSTIN is required.');
    if (errors.includes('INVALID_LENGTH'))     showError('GSTIN must be exactly 15 characters.');
    if (errors.includes('INVALID_FORMAT'))     showError('GSTIN format is invalid.');
    if (errors.includes('INVALID_STATE_CODE')) showError('State code not recognised.');
    if (errors.includes('INVALID_CHECKSUM'))   showError('GSTIN checksum is incorrect — check for typos.');
  }
}
```

### Bulk validation

```typescript
import { isValidGSTIN } from 'gstin-toolkit';

const gstins = ['27AABCU9603R1ZX', '29AABCU9603R1ZX', 'INVALID'];
const valid = gstins.filter(isValidGSTIN);
```

### Extracting state from GSTIN

```typescript
import { parseGSTIN } from 'gstin-toolkit';

const parsed = parseGSTIN(userInput);
if (parsed) {
  console.log(`Registered in: ${parsed.stateName}`);
  console.log(`Entity type: ${parsed.panHolderType}`);
}
```

---

## PAN Holder Types

| PAN character | Type | Description |
|---------------|------|-------------|
| P | Individual | Natural person |
| C | Company | Incorporated company |
| H | HUF | Hindu Undivided Family |
| F | Firm | Partnership firm |
| A | AOP | Association of Persons |
| T | Trust | Charitable or private trust |
| B | BOI | Body of Individuals |
| L | LocalAuthority | Municipal body, panchayat |
| J | Government | Central/State Government |
| G | LLP | Limited Liability Partnership |

---

## Runtime Support

| Environment | Supported |
|-------------|-----------|
| Node.js 16+ | ✅ |
| Browser (modern) | ✅ |
| Bun | ✅ |
| Deno | ✅ |
| Cloudflare Workers | ✅ |
| Edge runtimes | ✅ |

---

## Documentation

- [Checksum Algorithm](./docs/checksum.md) — How the Luhn mod-36 checksum works
- [Parser](./docs/parser.md) — How a GSTIN is decoded into its parts
- [State Codes](./docs/state-codes.md) — All 38 state codes, including legacy codes
- [PAN Types](./docs/pan.md) — Entity type encoding in PAN
- [Full API Reference](./docs/api.md)

---

## License

MIT © gstin-toolkit contributors