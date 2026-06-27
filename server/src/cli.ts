import { validateGSTIN, parseGSTIN } from "gstin-toolkit";


const GREEN = (s: string) => `\x1b[32m${s}\x1b[0m`;
const RED   = (s: string) => `\x1b[31m${s}\x1b[0m`;
const BOLD   = (s: string) => `\x1b[1m${s}\x1b[0m`;
const DIM    = (s: string) => `\x1b[2m${s}\x1b[0m`;

function printUsage(): void {
  console.log(`
${BOLD("Usage:")} gstin-toolkit check <GSTIN>

${BOLD("Examples:")}
  gstin-toolkit check 27AABCU9603R1ZX
  npx gstin-toolkit check 07AAACR5055K1Z9

${BOLD("Exit codes:")}
  0 — valid GSTIN
  1 — invalid GSTIN
  2 — usage error
`.trimStart());
}

function printValid(gstin: string): void {
  const parsed = parseGSTIN(gstin);

  if (!parsed) {
    
    console.error("Unexpected: parseGSTIN returned null for a valid GSTIN.");
    process.exit(1);
  }

  console.log(`\n${GREEN(BOLD("✓ Valid GSTIN"))}\n`);
  console.log(`  ${"State Code  ".padEnd(14)}: ${parsed.stateCode}`);
  console.log(`  ${"State Name  ".padEnd(14)}: ${parsed.stateName ?? DIM("(unknown)")}`);
  console.log(`  ${"PAN         ".padEnd(14)}: ${parsed.pan}`);
  console.log(`  ${"Holder Type ".padEnd(14)}: ${parsed.panHolderType ?? DIM("(unknown)")}`);
  console.log(`  ${"Entity No.  ".padEnd(14)}: ${parsed.entityNumber}`);
  console.log(`  ${"Default Char".padEnd(14)}: ${parsed.defaultChar}`);
  console.log(`  ${"Checksum    ".padEnd(14)}: ${parsed.checksum}`);
  console.log();
}

function printInvalid(errors: string[]): void {
  console.log(`\n${RED(BOLD("✗ Invalid GSTIN"))}\n`);
  console.log("  Errors:");
  errors.forEach((code) => console.log(`    · ${code}`));
  console.log();
}


function handleCheck(gstin: string): void {
  const { valid, errors } = validateGSTIN(gstin);

  if (valid) {
    printValid(gstin.trim().toUpperCase());
    process.exit(0);
  } else {
    printInvalid(errors);
    process.exit(1);
  }
}


function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printUsage();
    process.exit(2);
  }

  const [command, value] = args;

  if (command !== "check") {
    console.error(`Unknown command: "${command}"`);
    console.error('Run "gstin-toolkit" for usage.');
    process.exit(2);
  }

  if (!value) {
    console.error("Missing argument: <GSTIN>");
    printUsage();
    process.exit(2);
  }

  handleCheck(value);
}

main();