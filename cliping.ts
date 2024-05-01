const HELP = `
Usage: cliping [options] [clip-name]
  -h, --help               display help for command
  -l, --list               list all clips
  -a, --add <clip-name>    add a new clip, Open Vim to write a new clip.
  -r, --remove <clip-name> remove a clip

Example:
  cliping <clip-name>
  cliping --list
  cliping --add <clip-name>
  cliping --remove <clip-name>

Description:
  Cliping is a command line tool to manage your clipboard.
  You can copy a text to clipboard from a file.
  You add a new clip by cliping --add <clip-name> command. Then open Vim to write a new clip.

  You can see all clips in the list/ directory.
`;

import { parse } from "https://deno.land/std@0.202.0/flags/mod.ts";
import $ from "https://deno.land/x/dax@0.38.0/mod.ts";

const args = parse(Deno.args, {
  alias: {
    h: "help",
    l: "list",
    a: "add",
    r: "remove",
  },
  boolean: ["help", "list", "add", "remove"],
});

const clipName = args._[0] as string | undefined;

const done = () => {
  Deno.exit(0);
};

const addClip = (clipName: string) => {
  const command = new Deno.Command("vim", { args: [`list/${clipName}`] });
  command.spawn();
};

const clip = async (clipName: string) => {
  const text = await Deno.readTextFile(`list/${clipName}`);
  await $`echo ${text}`.pipe($`tr -d '\n'`).pipe($`pbcopy`);
  done();
};

if (args.help || Deno.args.length === 0) {
  console.log(HELP);
  done();
}

if (args.list) {
  for await (const entry of Deno.readDir("list/")) {
    console.log(entry.name);
  }
  done();
}

if (args.add) {
  if (!clipName) {
    console.log("Please provide a clip name");
    Deno.exit(1);
  }

  console.log("Add a new clip");
  addClip(clipName);
}

if (args.remove && clipName) {
  console.log("Remove a clip");
  await Deno.remove(`list/${clipName}`);
  done();
}

if (clipName && Deno.args.length === 1) {
  console.log("Copy a clip to clipboard");
  await clip(clipName);
  done();
}
