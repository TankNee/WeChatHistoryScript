<h2 align="center">Note Dispose Manager</h2>

> A simple cli for note create

### Help Infomation

```bash
  Usage: ndm [options] [command]

  Commands:
    Create     Create a note by template in current folder or the folder specified by config file (.ndmrc)
    config     Config local .ndmrc file by command line interface
    flomo      Save message to flomo
    help       Display help
    init       Initialize the note folder, providing a simple configuration file with .ndmrc
    lint       Lint markdown note files using the remark cli
    templates  Show all templates that have installed
    upload     Upload local images which are found in note file
    version    Display version

  Options:
    -a, --all               Upload all images of a folder
    -e, --ext [value]       Extension of note file, md,txt etc. (defaults to "md")
    -g, --global            Set global .ndmrc file
    -h, --help              Output usage information
    -l, --language [value]  Choose the language of note template, en-us,zh-cn etc. -l or --language (defaults to "zh-cn")
    -r, --recursion         Recursively call the input to file path
    -t, --type [value]      Choose the type of note template. leetcode, plain note or costum template from internet(https://...) etc. -t or --type <type name> (defaults to "leetcode")
    -v, --version           Output the version number

  Examples:
    - Create a markdown note in relative path ./note which name is test.md and apply template by zh-cn
    $ ndm create ./note/test.md -l zh-cn -t leetcode -e md

    - Send message to flomo app!
    $ ndm flomo 'Hello Flomo!'

    - Config your .ndmrc file which is found on the local scale or global.
    $ ndm config --flomourl=123123
```

