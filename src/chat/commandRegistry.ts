import { 
  attention,
  azure,
  blog,
  conduct,
  discord,
  gitHub,
  giving,
  help,
  hype,
  instagram,
  patreon,
  shoutOut, 
  store, 
  stop,
  theme, 
  twitter, 
  uses,
  vote,
  youtube}
   from "./commands";
import { Command } from "../common";

export abstract class CommandRegistry {
  private static commands: [Command?] = []

  public static init(): void {
    this.commands = []

    this.commands.push(new Command('attention', attention))
    this.commands.push(new Command('azure', azure))
    this.commands.push(new Command('blog', blog))
    this.commands.push(new Command('conduct', conduct))
    this.commands.push(new Command('discord', discord))
    this.commands.push(new Command('github', gitHub))
    this.commands.push(new Command('giving', giving))
    this.commands.push(new Command('uses', uses))
    this.commands.push(new Command('help', help))
    this.commands.push(new Command('hype', hype))
    this.commands.push(new Command('instagram', instagram))
    this.commands.push(new Command('patreon', patreon))
    this.commands.push(new Command('so', shoutOut))
    this.commands.push(new Command('stop', stop))
    this.commands.push(new Command('store', store))
    this.commands.push(new Command('theme', theme))
    this.commands.push(new Command('twitter', twitter))
    this.commands.push(new Command('vote', vote))
    this.commands.push(new Command('youtube', youtube))
  }

  public static getCommand(commandName: string): Command | undefined {
    return this.commands.find(f => f.commandName === commandName)
  }

  public static getCommands(): Command[] {
    return this.commands
  }
}