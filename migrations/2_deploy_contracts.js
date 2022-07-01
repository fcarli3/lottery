var NFT = artifacts.require("./LotteryGame.sol");
var Lottery = artifacts.require("./Lottery.sol");

const TICKET_PRICE = 10;
const M = 2;
const K = 2;

module.exports = function (deployer) {
    deployer.then(async () => {
        await deployer.deploy(NFT, { from: arguments[2][0] });
        await deployer.deploy(Lottery, TICKET_PRICE, M, K, NFT.address, { from: arguments[2][0] });
    });
}