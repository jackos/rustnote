import { spawnSync } from "child_process"
import { existsSync, mkdirSync, writeFileSync } from "fs"
import { sep } from "path"

export const executeGo = (dest: string, program: string) => {
	const destGo = dest + sep + "go"
	if (!existsSync(destGo)) {
		mkdirSync(destGo, { recursive: true })
	}
	writeFileSync(destGo + sep + "main.go", program)
	const cmd = spawnSync("go", ["run", "main.go"], { cwd: destGo })
	return cmd
}