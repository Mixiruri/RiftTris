<div align="center">

# RiftTris

**Modern Tetris inside the League of Legends client. Built for champ select.**

A [Pengu Loader](https://pengu.lol) plugin · 5 game modes · 25 achievements · 5 skins · zero setup

<img src="assets/game.png" width="420" alt="RiftTris in-game">

</div>

---

## Why?

Champ select lasts about 90 seconds and you spend most of it staring at a timer. **RiftTris** gives you a full Tetris game in a floating window inside the client. The **Rapid** mode lasts exactly 90 seconds, and the plugin pauses your game when it's your turn to ban or pick.

## Features

- **Modern Tetris engine:** SRS rotation with wall kicks, 7-bag randomizer, hold, 5-piece preview, ghost piece, lock delay, T-Spins (including minis), back-to-back, combos and Perfect Clears.
- **5 game modes:** a 90-second score attack, a 40-line sprint, a marathon, a garbage dig and a no-pressure zen mode.
- **Champ select integration:**
  - The Tetris icon starts a Rapid game with one click.
  - The phase timer shows in the title bar.
  - The game pauses and a big alert shows up when it's your turn to ban or pick.
  - The window closes on its own when the match loads.
- **Floating, resizable window:** drag it by the title bar and resize it from the corner. The client stays visible and usable behind it, so you can still search for your champ while you play.
- **5 skins:** Hextech, Retro, 3D, Neon and Pastel. Each one restyles the board *and* the whole interface.
- **25 achievements** named after League moments (First Blood, Pentakill, Ace, Outplayed…), plus lifetime stats and your recent games.
- **Progress that sticks around:** records, achievements, settings and even unfinished games survive client restarts. You can move your save to another PC with a backup code.
- **Tunable handling:** DAS, ARR and soft drop speed, for people who take their Tetris seriously.

## Skins

<img src="assets/skins.png" alt="Hextech, Retro, 3D, Neon and Pastel skins">

| Skin | Look |
|---|---|
| **Hextech** | Gold and blue, matches the client |
| **Retro** | Four shades of green, pixel font and scanlines, like a Game Boy |
| **3D** | Extruded blocks on a tilted board |
| **Neon** | Glowing outlines on pure black |
| **Pastel** | Soft candy blocks on a light theme |

Switch skins in **Settings**, or press **V** at any time.

## Game modes

<img src="assets/menu.png" width="420" align="right" alt="Mode select">

| Mode | Goal |
|---|---|
| **Rapid** | 90-second score attack. The speed goes up every 10 s. |
| **Sprint** | Clear 40 lines as fast as possible. |
| **Classic** | Marathon. You level up every 10 lines until you top out. |
| **Dig** | Clear 10 rows of garbage from the bottom of the board. |
| **Zen** | No game over. Good for waiting in queue. |

Sprint, Classic, Dig and Zen autosave while you play, so you can close the client and continue later.

<br clear="right">

## Installation

1. Install [Pengu Loader](https://pengu.lol) if you don't have it yet.
2. Download `rifttris.zip` from the [latest release](../../releases/latest).
3. Extract it into your Pengu Loader `plugins` folder, so that you end up with `plugins/rifttris/index.js`.
4. Restart the League client.
5. Click the **Tetris icon** in the bottom-right corner, or press **Alt+T** / **F8**.

## Controls

| Action | Keys |
|---|---|
| Move | `←` `→` |
| Soft drop / Hard drop | `↓` / `Space` |
| Rotate right / left / 180° | `↑` or `X` / `Z` or `Ctrl` / `A` |
| Hold | `C` or `Shift` |
| Pause · Restart | `Esc` or `P` · `R` |
| Change skin | `V` |
| Open / close | `Alt+T` or `F8` |
| Quick start a mode | `1` – `5` |

When you click anywhere in the client, the game pauses and stops capturing your keyboard, so typing in the client is never blocked. Click the window to keep playing.

<details>
<summary><b>All 25 achievements</b></summary>

| Achievement | How to unlock |
|---|---|
| First Blood | Clear your first line |
| Tetris | Clear 4 lines at once |
| Pentakill | 5 Tetrises in a single game |
| Juke | Clear lines with a T-Spin |
| Flash + Ignite | Land a T-Spin Double |
| Outplayed | Land a T-Spin Triple |
| Ace | Perfect Clear the board |
| Killing Spree | Chain a 5 combo |
| Legendary | Chain a 10 combo |
| Snowball | 4 back-to-backs in a row |
| Fast Rotation | Sprint in under 2:00 |
| Challenger | Sprint in under 1:00 |
| No Flash | Finish Sprint without using Hold |
| Decent Farm | 10,000 points in Rapid |
| 10 CS per Minute | 30,000 points in Rapid |
| Multitasker | Finish a Rapid game during champ select |
| Mid Game | Reach level 10 in Classic |
| Late Game | Reach level 15 in Classic |
| Miner | Complete Dig |
| Mole | Complete Dig in under 45 s |
| Inner Peace | 100 lines in one Zen session |
| Veteran | 1,000 lines in total |
| Addicted | Play 25 games |
| Fill Player | Finish a game in every mode |
| Skin Collector | Finish a game with every skin |

</details>

## Troubleshooting

- **Nothing happens when I click the icon.** Try **F8** or **Alt+T**. If that doesn't work either, open DevTools (`Ctrl+Shift+I`) and run `RiftTris.open()` in the console. Any error will show up there.
- **The window is off-screen.** Go to Settings → **Reset window size**.
- **A "duplicate install" notice showed up.** There's an older copy of the plugin in your `plugins` folder. Delete it and restart the client.

## Credits

Made by **Cami**

[![GitHub](https://img.shields.io/badge/GitHub-Mixiruri-181717?logo=github&logoColor=white)](https://github.com/Mixiruri)
[![Discord](https://img.shields.io/badge/Discord-@soriita-5865F2?logo=discord&logoColor=white)](https://discord.com/users/1544366048889798709)

If you like it, a star on the repo helps a lot.

<sub>RiftTris isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. It's a purely visual client mod: it doesn't touch the game itself.</sub>
