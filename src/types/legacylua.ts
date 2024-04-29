/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as gamesaveresults from 'legacylua/game-save'
import * as novelsaveresults from 'legacylua/novel-save'
import * as matchascriptresults from 'legacylua/matchascript'
import * as messagesresults from 'legacylua/messages'
import * as settingsresults from 'legacylua/game-settings'

export const gamesave: any = gamesaveresults.return_module()
export const novelsave: any = novelsaveresults.return_module()
export const matchascript: any = matchascriptresults.return_module()
export const messages: any = messagesresults.return_module()
export const gamesettings: any = settingsresults.return_module()
