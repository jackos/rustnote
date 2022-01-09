# Hackdown: Interactive Markdown Notebook 
## Quickstart
1) Create or open an existing markdown document
2) Right click the filename and select `Reopen Editor With...` and select `Hackdown`
3) At the top left press the `+ Code` button to create a code cell
4) Write some code like `println!("Wow it works!");` and run the cell

On first run `cargo` will install and run `rustkernel` on port `8787` in a task, so you can easily stop it from the terminal. This will also reset the program state.

### Markdown
All source code is in markdown so it can be directly uploaded to a blog site or used with a static site generator like `mdbook`, including output or errors from `rustc`.
1) Save a document that has some output from cells
2) Right click the filename and select `Reopen Editor With...` and select `Text Editor`
3) There are now `output` cells containing the results of each cell
4) Reopen with `Hackdown` and the outputs are retained.

### Viewing generated source code
The `rustkernel` task will contain output referencing `/tmp/main.rs` and `/tmp/Cargo.toml` (or whatever your system temp folder is). Ctrl+click to see the what code is being generated to return outputs.