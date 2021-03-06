import { OnVoteEvent } from './../common/types/onVoteEvent';
import { OnStreamChangeEvent } from './../common/types/onStreamChangeEvent';
import { OnVoteEndEvent } from './../common/types/onVoteEndEvent';
import { OnVoteStartEvent } from './../common/types/onVoteStartEvent';
import throttledQueue from 'throttled-queue';
import { EventBus  } from '../events'
import { Fauna, Orbit } from '../integrations'
import {
  BotEvents,
  log, 
  LogLevel,
  OnChatMessageEvent,
  OnCheerEvent,
  OnFollowEvent,
  OnSubEvent,
  OnRaidEvent,
  Action,
  Activity,
  User,
  Credit,
  OnCreditRollEvent,
  OnStreamStartEvent
} from "../common"


export abstract class Logger {

  public static init(): void {
    EventBus.eventEmitter.addListener(BotEvents.OnChatMessage,
      (onChatMessageEvent: OnChatMessageEvent) => this.onChatMessage(onChatMessageEvent))
    EventBus.eventEmitter.addListener(BotEvents.OnCheer,
      (onCheerEvent: OnCheerEvent) => this.onCheer(onCheerEvent))
    EventBus.eventEmitter.addListener(BotEvents.OnFollow,
      (onFollowEvent: OnFollowEvent) => this.onFollow(onFollowEvent))
    EventBus.eventEmitter.addListener(BotEvents.OnSub,
      (onSubEvent: OnSubEvent) => this.onSub(onSubEvent))
    EventBus.eventEmitter.addListener(BotEvents.OnRaid,
      (onRaidEvent: OnRaidEvent) => this.onRaid(onRaidEvent))
    EventBus.eventEmitter.addListener(BotEvents.OnStreamChange, (onStreamChangeEvent: OnStreamChangeEvent) => this.onStreamChange(onStreamChangeEvent))
    EventBus.eventEmitter.addListener(BotEvents.OnStreamEnd, () => this.onStreamEnd())
    EventBus.eventEmitter.addListener(BotEvents.OnOrbit, (streamDate: string) => this.onOrbit(streamDate))
    EventBus.eventEmitter.addListener(BotEvents.OnFullOrbit, (streamDate: string) => this.onFullOrbit(streamDate))
    EventBus.eventEmitter.addListener(BotEvents.RequestCreditRoll, (streamDate: string) => this.requestCreditRoll(streamDate))
    EventBus.eventEmitter.addListener(BotEvents.OnVote, (onVoteEvent: OnVoteEvent) => this.onVote(onVoteEvent))
    EventBus.eventEmitter.addListener(BotEvents.OnVoteStart, (onVoteStartEvent: OnVoteStartEvent) => this.onVoteStart(onVoteStartEvent))
    EventBus.eventEmitter.addListener(BotEvents.OnVoteEnd, (onVoteEndEvent: OnVoteEndEvent) => this.onVoteEnd(onVoteEndEvent))
  
  }

  private static async onChatMessage(onChatMessageEvent: OnChatMessageEvent) {
    await Fauna.saveAction(new Action(
      new Date().toLocaleDateString('en-US'),
      onChatMessageEvent.user.id,
      onChatMessageEvent.user.display_name || onChatMessageEvent.user.login,
      onChatMessageEvent.user.avatar_url,
      BotEvents.OnChatMessage,
      onChatMessageEvent
    ))
  }

  private static async onCheer(onCheerEvent: OnCheerEvent) {
    const date = new Date()
    const streamDate = date.toLocaleDateString('en-US');

    await Fauna.saveAction(new Action(
      streamDate,
      onCheerEvent.user.id,
      onCheerEvent.user.display_name || onCheerEvent.user.login,
      onCheerEvent.user.avatar_url,
      BotEvents.OnCheer,
      onCheerEvent
    ))
    await Orbit.addActivity(
      new Activity(
        'Cheered on Twitch',
        `Cheered ${onCheerEvent.bits} on Twitch`,
        'twitch:cheer',
        `twitch-cheer-${onCheerEvent.user.login}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
        (new Date(streamDate)).toISOString()),
      onCheerEvent.user
    )
  }

  private static async onFollow(onFollowEvent: OnFollowEvent) {
    const date = new Date()
    const streamDate = date.toLocaleDateString('en-US');

    await Fauna.saveAction(new Action(
      streamDate,
      onFollowEvent.user.id,
      onFollowEvent.user.display_name || onFollowEvent.user.login,
      onFollowEvent.user.avatar_url,
      BotEvents.OnFollow,
      onFollowEvent
    ))

    await Orbit.addActivity(
      new Activity(
        'Followed on Twitch',
        `Followed on Twitch`,
        'twitch:follow',
        `twitch-follow-${onFollowEvent.user.login}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
        (new Date(streamDate)).toISOString()),
      onFollowEvent.user
    )
  }

  private static async onSub(onSubEvent: OnSubEvent) {
    const date = new Date()
    const streamDate = date.toLocaleDateString('en-US');

    await Fauna.saveAction(new Action(
      streamDate,
      onSubEvent.user.id,
      onSubEvent.user.display_name || onSubEvent.user.login,
      onSubEvent.user.avatar_url,
      BotEvents.OnSub,
      onSubEvent
    ))

    await Orbit.addActivity(
      new Activity(
        'Subscribed on Twitch',
        `Subscribed on Twitch`,
        'twitch:subscribe',
        `twitch-subscribe-${onSubEvent.user.login}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
        (new Date(streamDate)).toISOString()),
      onSubEvent.user
    )
  }

  private static async onRaid(onRaidEvent: OnRaidEvent) {
    const date = new Date()
    const streamDate = date.toLocaleDateString('en-US');

    await Fauna.saveAction(new Action(
      streamDate,
      onRaidEvent.user.id,
      onRaidEvent.user.display_name || onRaidEvent.user.login,
      onRaidEvent.user.avatar_url,
      BotEvents.OnRaid,
      onRaidEvent
    ))

    await Orbit.addActivity(
      new Activity(
        'Raided on Twitch',
        `Raided with ${onRaidEvent.viewers} on Twitch`,
        'twitch:raid',
        `twitch-raid-${onRaidEvent.user.login}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
        (new Date(streamDate)).toISOString()),
      onRaidEvent.user
    )
  }

  private static async onStreamChange(onStreamChangeEvent: OnStreamChangeEvent) {
    try {
      const stream = await Fauna.saveStream(onStreamChangeEvent.stream);
    }
    catch (err) {
      log(LogLevel.Error, `Logger: onStreamChange: ${err}`);
    }
  }

  private static async onStreamEnd() {
    try {
      const stream = await Fauna.getStream(new Date().toLocaleDateString('en-US'));
      if (stream) {
        stream.ended_at = new Date().toISOString();
        await Fauna.saveStream(stream);
        EventBus.eventEmitter.emit(BotEvents.OnOrbit, stream.streamDate);
      }
    }
    catch (err) {
      log(LogLevel.Error, `Logger: onStreamEnd: ${err}`);
    }
  }

  public static async onOrbit(streamDate: string): Promise<void> {
    try {
      const stream = await Fauna.getStream(streamDate)
      const date = new Date(streamDate)

      if (stream) {
        // Get all actions that occurred
        const actions = await Fauna.getAllActions(streamDate);

        // Aggregate actions
        const chatMessages = actions.filter(f => f[3] === 'onChatMessage');
        const uniqueChatters = chatMessages.map(m => m[1]).filter((v, i, s) => {
          return s.indexOf(v) === i;
        });

        // Store in Orbit
        const throttle = throttledQueue(120, 60 * 1000, true)

        throttle(async () => {
          for (const chatter of uniqueChatters) {
            await Orbit.addActivity(
              new Activity(
                'Chat on Twitch',
                `Chatted on Twitch`,
                'twitch:chat',
                `twitch-chat-${chatter}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
                (new Date(streamDate)).toISOString(),
                "0.2"),
              new User(chatter, '', '', chatter, date, '')
            )
          }
        })
      }
    } 
    catch (err) {
      log(LogLevel.Error, `Logger: onOrbit: ${err}`)
    }
  }

  public static async onFullOrbit(streamDate: string): Promise<void> {
    try {
      const stream = await Fauna.getStream(streamDate)
      const date = new Date(streamDate)

      if (stream) {
        // Get all actions that occurred
        const actions = await Fauna.getAllActions(streamDate);

        // Aggregate actions
        const chatMessages = actions.filter(f => f[3] === 'onChatMessage');
        const follows = actions.filter(f => f[3] === 'onFollow');
        const raids = actions.filter(f => f[3] === 'onRaid');
        const subs = actions.filter(f => f[3] === 'onSub');
        const donations = actions.filter(f => f[3] === 'onDonation');
        const cheers = actions.filter(f => f[3] === 'onCheer');
        const uniqueChatters = chatMessages.map(m => m[1]).filter((v, i, s) => {
          return s.indexOf(v) === i;
        });

        // Store in Orbit
        const throttle = throttledQueue(120, 60 * 1000, true)

        throttle(async () => {
          for (const follower of follows) {
            await Orbit.addActivity(
              new Activity(
                'Follow on Twitch',
                `Followed on Twitch`,
                'twitch:follow',
                `twitch-follow-${follower[1]}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
                (new Date(streamDate)).toISOString(),
                "1"),
              new User(follower[1], '', '', follower[1], date, '')
            )
          }

          for (const cheerer of cheers) {
            await Orbit.addActivity(
              new Activity(
                'Cheer on Twitch',
                `Cheered on Twitch`,
                'twitch:cheer',
                `twitch-cheer-${cheerer[1]}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
                (new Date(streamDate)).toISOString(),
                "0.5"),
              new User(cheerer[1], '', '', cheerer[1], date, '')
            )
          }

          for (const donor of donations) {
            await Orbit.addActivity(
              new Activity(
                'Donate on Twitch',
                `Donated on Twitch`,
                'twitch:donation',
                `twitch-donation-${donor[1]}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
                (new Date(streamDate)).toISOString(),
                "2"),
              new User(donor[1], '', '', donor[1], date, '')
            )
          }

          for (const sub of subs) {
            await Orbit.addActivity(
              new Activity(
                'Subscribed on Twitch',
                `Subscribed on Twitch`,
                'twitch:sub',
                `twitch-sub-${sub[1]}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
                (new Date(streamDate)).toISOString(),
                "1.5"),
              new User(sub[1], '', '', sub[1], date, '')
            )
          }
          for (const raider of raids) {
            await Orbit.addActivity(
              new Activity(
                'Raided on Twitch',
                `Raided on Twitch`,
                'twitch:raid',
                `twitch-raid-${raider[1]}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
                (new Date(streamDate)).toISOString(),
                "1"),
              new User(raider[1], '', '', raider[1], date, '')
            )
          }

          for (const chatter of uniqueChatters) {
            await Orbit.addActivity(
              new Activity(
                'Chat on Twitch',
                `Chatted on Twitch`,
                'twitch:chat',
                `twitch-chat-${chatter}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
                (new Date(streamDate)).toISOString(),
                "0.2"),
              new User(chatter, '', '', chatter, date, '')
            )
          }

         log(LogLevel.Info, `Logger: onFullOrbit ${streamDate} completed`);
        })
      }
    }
    catch (err) {
      log(LogLevel.Error, `Logger: onFullOrbit: ${err}`)
    }
  }

  private static async requestCreditRoll(streamDate: string): Promise<void> {
    try {
      const actions: [string[]] = await Fauna.getCredits(streamDate);

      const distinctCredits: Credit[] = [];

      const credits: Credit[] = actions.map((payload: string[]) => {
        return new Credit(payload[1], payload[2]);
      });

      credits.forEach((credit: Credit) => {
        if (!distinctCredits.find(f => f.displayName === credit.displayName)) {
          distinctCredits.push(credit);
        }
      });

      distinctCredits.forEach((credit) => {
        credit.onRaid = actions.some(a => a[1] === credit.displayName && a[3] === 'onRaid');
        credit.onCheer = actions.some(a => a[1] === credit.displayName && a[3] === 'onCheer');
        credit.onSub = actions.some(a => a[1] === credit.displayName && a[3] === 'onSub');
        credit.onDonation = actions.some(a => a[1] === credit.displayName && a[3] === 'onDonation');
        const sponsor = actions.find(a => a[1] === credit.displayName && a[3] === 'onSponsor');
        if (sponsor) {
          credit.onSponsor = true;
          credit.tier = parseInt(sponsor[4]);
        }
      });

      const onCreditRollEvent = new OnCreditRollEvent(distinctCredits);
      EventBus.eventEmitter.emit(BotEvents.OnCreditRoll, onCreditRollEvent);
    } catch (err) {
      log(LogLevel.Error, `State: requestCreditRoll: ${err}`);
    }
  }
  
  private static async onVoteStart(onVoteStartEvent: OnVoteStartEvent) {
    try {
      let poll = await Fauna.getPoll(onVoteStartEvent.pollId)

      if (poll) {
        poll.started_at = onVoteStartEvent.started_at
        poll = await Fauna.savePoll(poll)
      }
    }
    catch (err) {
      log(LogLevel.Error, `Logger: onVoteStart: ${err}`);
    }
  }

  private static async onVoteEnd(onVoteEndEvent: OnVoteEndEvent) {
    try {
      let poll = await Fauna.getPoll(onVoteEndEvent.pollId)

      if (poll) {
        poll.ended_at = onVoteEndEvent.ended_at
        poll = await Fauna.savePoll(poll)
      }
    }
    catch (err) {
      log(LogLevel.Error, `Logger: onVoteEnd: ${err}`);
    }
  }
  
  private static async onVote(onVoteEvent: OnVoteEvent) {
    const date = new Date()
    const streamDate = date.toLocaleDateString('en-US');

    await Fauna.saveAction(new Action(
      streamDate,
      onVoteEvent.user.id,
      onVoteEvent.user.display_name || onVoteEvent.user.login,
      onVoteEvent.user.avatar_url,
      BotEvents.OnVote,
      onVoteEvent
    ))

    await Orbit.addActivity(
      new Activity(
        'Voted in poll on Twitch',
        `Voted in poll on Twitch`,
        'twitch:vote',
        `twitch-vote-${onVoteEvent.user.login}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
        (new Date(streamDate)).toISOString()),
      onVoteEvent.user
    )
  }

}