var LotteryGame = artifacts.require("./LotteryGame.sol");
var Deployer = artifacts.require("./Deployer.sol");

module.exports = function (deployer) {
    deployer.then(async () => {
        await deployer.deploy(LotteryGame, { from: arguments[2][0] });
        await deployer.deploy(Deployer, LotteryGame.address, arguments[2][0], { from: arguments[2][0] });
    });
}