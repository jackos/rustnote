__Deprecated for https://github.com/jackos/hackdown__

# Rustnote: Interactive Markdown Notebook 
## Quickstart
- Create or open an existing markdown document
- Right click the filename and select `Reopen Editor With...` and select `Rustnote`
- At the top left press the `+ Code` button to create a code cell
- Write some code like `println!("Wow it works!");` and run the cell

## Base Path
Base path is where you can store searchable notes, it defaults to `~/rustnote`.

You can change it in File > Preferences > Settings > 'rustnote'

## Keybindings
- `alt + f` add rustnote base path folder to workspace and open search
- `alt + o` Open `main.rs` in next tab using `rust-analyzer` for language server support
- `alt + p` Preview notes in `base path` as a static website using mdbook. See https://rust-lang.github.io/mdBook/guide/creating.html for how this works

On first run `cargo` will install and run `rustkernel` on port `8787` in a task, so you can easily stop it from the terminal, which will also reset the program state.

### Markdown
All source code is in markdown (CommonMark) and will render on Github
- Save a document that has some output from cells
- Right click the filename and select `Reopen Editor With...` and select `Text Editor`
- There are now `output` cells containing the results of each cell
- Reopen with `Rustnote` and the outputs are retained.

### Viewing generated source code

