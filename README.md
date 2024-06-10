# OnChess

OnChess is an onchain chess game that is played on the [Base](https://base.org) chain. It is a decentralized application (dApp) built using the [Cartesi](http://cartesi.io) technology.

## How to Play

To play OnChess, you will need a wallet connected to the Base network. You can use MetaMask or any other compatible wallet to interact with the game.

1. Go to the [OnChess](https://onchess.xyz) website;
2. Connect your wallet;
3. Deposit tokens into the game to start playing;
4. Start a new game or join an existing game using tokens;
5. Make your moves by sending transactions to the Base chain;
6. Wait for your opponent to make their move;
7. Keep playing;
8. Winner takes all the pot of the game (aside from a small fee that goes to the developers);
9. Withdraw your winnings to your Base wallet at any time.

## Time controls

OnChess uses the following predetermined time controls:

-   15m
-   25m
-   45m
-   10m + 10s
-   15m + 10s
-   25m + 10s
-   45m + 10s

This is aligned with the [FIDE Online Arena time controls](https://handbook.fide.com/chapter/B11FOARatingRegulations).

## Ranking

OnChess uses the [ELO rating system](https://en.wikipedia.org/wiki/Elo_rating_system) to rank players. The ELO system is a method for calculating the relative skill levels of players in two-player games such as chess.

-   new players start with a 1000 rating;
-   K factor is 20.
-   ratings are rounded to nearest integer for display purposes only. The actual rating is stored as a float.

OnChess will try to abide to the [FILE Online Chess Regulations](https://handbook.fide.com/chapter/OnlineChessRegulations) as much as possible, but some rules may be adapted to the blockchain environment, or limitations of this implementation. Bugs are always possible, so please report any issues you find.
