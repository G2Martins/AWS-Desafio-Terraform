import code from './data/code.json';

type File = { name: string; lines: [string, string][][]; index: Record<string, number> };
export const FILES = code as unknown as File[];
const MAIN = FILES.find((f) => f.name === 'main.tf')!;
export const INDEX = MAIN.index;

/** Line of a Terraform address in main.tf, e.g. `aws_vpc.main_vpc` or `aws_instance.debian_ec2:user_data`. */
export const at = (addr: string) => INDEX[addr] ?? 1;

/** Line anchor id: `L28` for main.tf, `<file>-L3` for any other file. */
export const anchor = (file: string, n: number) => (file === 'main.tf' ? 'L' : `${file}-L`) + n;
