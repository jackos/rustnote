import { spawnSync } from "child_process"
import { existsSync, mkdirSync, writeFileSync } from "fs"
import { sep } from "path"

export const executeRust = (dest: string, program: string) => {
	const destRust = dest + sep + "rust"
	if (!existsSync(destRust)) {
		mkdirSync(destRust, { recursive: true })
	}
	writeFileSync(destRust + sep + "src" + sep + "main.rs", program)
	writeFileSync(destRust + sep + "Cargo.toml", `[package]\nname = "hackdown"\nversion = "0.0.1"\n`)
	const cmd = spawnSync("cargo", ["run"], { cwd: destRust })
	return cmd
}