# SwLeaderboard
> A discord.js bot that reads the game leaderboard from skillwarz.com and sends an embed to authorized channels.

## Getting Started
1. As stated, this is a discord.js bot, so Node.js is required to run it  
    * Please reference this page for instructions on installing [Node.js v12.19](https://discordjs.guide/preparations/#installing-node-js) for your system
0. Either download the bot's code from Github or use some version control system to clone it
0. while in the SwLeaderboard directory, run `npm install` to install dependencies
   * Note: if you run into issues here on Linux systems; npm is not include with the Node.js install.
0. Follow the directions [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) to set up a bot in Discord
0. create a file named `.env` and create a single line  
    `AUTH_TOKEN=ENTER-YOUR-TOKEN-HERE`
    with the token from the last step
0. Now just invite your bot to your server; [directions](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links)
0. Make sure to create a **#leaderboard** channel (this can be changed in the `index.js` file if desired and could be made into a config option)
1. On running, `node index.js`, your bot should say hello in **#leaderboard** :D