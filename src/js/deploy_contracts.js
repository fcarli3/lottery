App = {

    web3Provider: null,
    contracts: {},
    url: 'http://localhost:6545',
    account: '0x0',
    balance: 0,
    price: 10, //wei
    m: 2,
    k: 123,
    nft_addr: '0x0',

    init: function () {

        return App.initWeb3();

    },

    // Initialize web3 and set the provider to the RPC.
    initWeb3: function () {

        console.log("Inside initWeb3");

        if (typeof web3 != 'undefined') {
            App.web3Provider = window.ethereum;
            web3 = new Web3(App.web3Provider);

            try {
                ethereum.request({ method: 'eth_requestAccounts' }).then(async () => {
                    console.log("DApp connected to Metamask");
                });
            } catch (error) {
                console.log(error);
            }

        } else {
            App.web3Provider = new Web3.providers.HttpProvider(App.url);
            web3 = new Web3(App.web3Provider);
        }

        return App.initContract();
    },


    // Upload the contract's abstractions into the local App.contracts object.
    initContract: function () {

        console.log("Inside initContract");

        // Get current account
        web3.eth.getCoinbase(function (err, account) {
            if (err == null) {
                App.account = account.toLowerCase();
                $("#address").html("<strong>Address</strong>: " + account);
            }
        });

        // Load content's abstractions
        $.getJSON("Lottery.json").done(function (c) {
            App.contracts["Contract"] = TruffleContract(c);
            App.contracts["Contract"].setProvider(App.web3Provider);

            return App.setAccount();
        });
    },

    //Set the account of the current user
    setAccount: async function () {

        console.log("Inside setAccount");

        let account = await window.ethereum.request({ method: 'eth_requestAccounts' });
        App.account = account[0].toLowerCase();

        App.balance = await web3.utils.fromWei(await web3.eth.getBalance(account[0]));

        $("#address").html("<strong>Address: </strong>" + App.account);
        $("#balance").html("<strong>Balance: </strong>" + App.balance + " ETH");

    },

    //Deploy the NFT contract
    deploy: async function () {

        let instance;

        try {

            $.getJSON('LotteryGame.json').done(async function (c) {
                const contract = TruffleContract(c);
                contract.setProvider(App.web3Provider);
                instance = await contract.new({ from: App.account, data: c.bytecode, gas: '30000000' });
                App.nft_addr = instance.address;
                console.log('NFT Address: ' + App.nft_addr);
                console.log('NFT Contract: ' + instance);

                return App.createLottery();

            });


        } catch (error) {
            console.log(error);
        }

    },

    //Deploy the Lottery contract
    createLottery: async function () {

        try {

            $.getJSON('Lottery.json').done(async function (c) {

                const contract2 = TruffleContract(c);
                contract2.setProvider(App.web3Provider);
                const instance2 = await contract2.new(App.price, App.m, App.k, App.nft_addr, { from: App.account, data: c.bytecode, gas: '30000000' });
                console.log('Lottery Address: ' + instance2.address);
                console.log('Lottery Contract: ' + instance2);

                window.location.replace("lottery.html");

            });

        } catch (error) {
            console.log(error);
        }
    }
}

// Call init whenever the window loads
$(function () {
    $(window).on('load', function () {
        App.init();
    });
});

