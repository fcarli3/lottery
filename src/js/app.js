App = {

  web3Provider: null,
  contracts: {},
  url: 'http://localhost:6545',
  account: '0x0',
  balance: 0,
  lottery_balance: 0,
  account_operator: '0x0',
  account_type: 'operator',
  account_change: false,
  lottery_state: 'lottery created',
  lottery_round: 0,
  lottery_round_state: 0,
  token_to_mint: 1,
  price: 10, //wei

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

      return App.initDApp();
    });
  },


  // Initialize DApp content 
  initDApp: function () {

    console.log("Inside initDApp");

    //get the lottery operator
    getOperator();

    //get the balance of the lottery's smart contract
    getLotteryBalance();

    //get amount of minted NFTs by operator
    getNumNFT();

    //get amount of sold tickets by operator
    getNumTickets();

    //get list of sold tickets by operator
    getListSoldTickets();

    //get amount of bought tickets by user
    getNumBoughtTickets();

    //get list of tickets bought by a player
    getListBoughtTickets();

    //get lottery state
    getLotteryState();

    //get lottery round
    getLotteryRound();

    //get lottery round state
    getLotteryRoundState();

    //get drawn numbers by the operator
    getDrawnNumbers();

    //get assigned prizes by operator
    getListAssignedPrizes();

    return App.listenForEvents();
  },


  // Event listener to handle events of the lottery's smart contract
  listenForEvents: function () {

    console.log("Inside listenForEvents");

    App.contracts["Contract"].deployed().then(async (instance) => {

      // Round event
      instance.Round().on('data', function (event) {
        App.lottery_state = 'lottery created';
        App.lottery_round = event.returnValues.round_number;
        App.lottery_round_state = event.returnValues.round_state;

        $("#lottery_round").html("<strong>Lottery Round:</strong> " + event.returnValues.round_number);
        $("#lottery_round_player").html("<strong>Lottery Round:</strong> " + event.returnValues.round_number);

        if (App.lottery_round_state == 0) {
          $("#lottery_round_state").html("<strong>Lottery Round State:</strong> round not started");
          $("#lottery_round_state_player").html("<strong>Lottery Round State:</strong> round not started");
        }

        if (App.lottery_round_state == 1) {
          $("#lottery_round_state").html("<strong>Lottery Round State:</strong> round started");
          $("#lottery_round_state_player").html("<strong>Lottery Round State:</strong> round started");
        }

        if (App.lottery_round_state == 2) {
          $("#lottery_round_state").html("<strong>Lottery Round State:</strong> round finished");
          $("#lottery_round_state_player").html("<strong>Lottery Round State:</strong> round finished");
        }

        if (App.lottery_round_state == 3) {
          $("#lottery_round_state").html("<strong>Lottery Round State:</strong> round closed");
          $("#lottery_round_state_player").html("<strong>Lottery Round State:</strong> round closed");
        }

        console.log("Event Round catched!");

      });

      // RoundAfterClosing event
      instance.RoundAfterClosing().on('data', function (event) {
        App.lottery_state = 'lottery created';
        App.lottery_round = event.returnValues.round_num;
        App.lottery_round_state = event.returnValues.round_st;

        $("#lottery_round").html("<strong>Lottery Round:</strong> " + event.returnValues.round_num);
        $("#lottery_round_player").html("<strong>Lottery Round:</strong> " + event.returnValues.round_num);

        $('#sold_tickets').html("<strong>Amount of Sold Tickets:</strong> 0");
        $('#sold_tickets_list').html("<strong>List of Sold Tickets:</strong> - ");
        $('#drawn_numbers').html("<strong>Drawn Numbers:</strong> - ");
        $('#drawn_numbers_player').html("<strong>Drawn Numbers:</strong> - ");
        $("#assigned_prizes").html("<strong>Assigned Prizes:</strong> - ");

        if (App.lottery_round_state == 0) {
          $("#lottery_round_state").html("<strong>Lottery Round State:</strong> round not started");
          $("#lottery_round_state_player").html("<strong>Lottery Round State:</strong> round not started");
        }

        if (App.lottery_round_state == 1) {
          $("#lottery_round_state").html("<strong>Lottery Round State:</strong> round started");
          $("#lottery_round_state_player").html("<strong>Lottery Round State:</strong> round started");
        }

        if (App.lottery_round_state == 2) {
          $("#lottery_round_state").html("<strong>Lottery Round State:</strong> round finished");
          $("#lottery_round_state_player").html("<strong>Lottery Round State:</strong> round finished");
        }

        if (App.lottery_round_state == 3) {
          $("#lottery_round_state").html("<strong>Lottery Round State:</strong> round closed");
          $("#lottery_round_state_player").html("<strong>Lottery Round State:</strong> round closed");
        }

        console.log("Event RoundAfterClosing catched!");

      });

      // BalanceOpAfterClosing event
      instance.BalanceOpAfterClosing().on('data', function (event) {
        if (App.account_operator == event.returnValues.op) {
          $("#balance").html("<strong>Balance: </strong>" + event.returnValues.tot + " ETH");

          console.log("Event BalanceOpAfterClosing catched!");

        }
      });

      // BalanceContractAfterClosing event
      instance.BalanceContractAfterClosing().on('data', function (event) {
        $("#lottery_balance").html("<strong>Lottery Total Balance:</strong> " + event.returnValues.tot + " ETH");

        console.log("Event BalanceContractAfterClosing catched!");

      });

      // BalancePlayerAfterRefund event
      instance.BalancePlayerAfterRefund().on('data', function (event) {
        if (App.account == event.returnValues.player) {
          $("#balance").html("<strong>Balance:</strong> " + event.returnValues.tot + " ETH");
        }

        console.log("Event BalancePlayerAfterRefund catched!");

      });

      // WinningTicket event
      instance.WinningTicket().on('data', function (event) {
        App.lottery_round_state = 2;
        $("#lottery_round_state").html("<strong>Lottery Round State:</strong> round finished");
        $("#lottery_round_state_player").html("<strong>Lottery Round State:</strong> round finished");

        let drawn_numbers = getDrawnNumbers();
        $('#drawn_numbers').html("<strong>Drawn Numbers:</strong> " + drawn_numbers);
        $('#drawn_numbers_player').html("<strong>Drawn Numbers:</strong> " + drawn_numbers);

        console.log("Event WinningTicket catched!");

      });

      // Collectible event
      instance.Collectible().on('data', function (event) {
        $("#available_nft").html("<strong>Amount of Available NFTs:</strong> " + getNumNFT());

        console.log("Event Collectible catched!");

      });

      // AssignedPrize event
      instance.AssignedPrizes().on('data', function (event) {
        $("#assigned_prizes").html("<strong>Assigned Prizes:</strong> " + getListAssignedPrizes());
        $("#available_nft").html("<strong>Amount of Available NFTs:</strong> " + getNumNFT());

        console.log("Event AssignedPrize catched!");

      });

      // Ticket event
      instance.Ticket().on('data', function (event) {
        $("#num_tickets").html("<strong>Amount of Bought Tickets:</strong> " + getNumBoughtTickets());
        $("#list_tickets").html("<strong>List of Bought Tickets:</strong> " + getListBoughtTickets());
        $("#sold_tickets").html("<strong>Amount of Sold Tickets:</strong> " + getNumTickets());
        $("#sold_tickets_list").html("<strong>List of Sold Tickets:</strong> " + getListSoldTickets());

        console.log("Event Ticket catched!");

      });
    });

    //Handling a change of an account on MetaMask
    ethereum.on('accountsChanged', function (accounts) {
      console.log("Accounts changed");
      App.account_change = true;
      App.setAccount(App.account_change);
    });
  },


  //Set the account type of the current user and check if the page has been reloaded or has changed due to an account switch
  // account_change = 0 --> page loaded
  // account_change = 1 --> account switched
  setAccount: async function (account_change) {

    console.log("Inside setAccount");

    let account = await window.ethereum.request({ method: 'eth_requestAccounts' });
    App.account = account[0].toLowerCase();

    App.balance = await web3.utils.fromWei(await web3.eth.getBalance(account[0]));

    console.log("Account: " + App.account);
    console.log("Operator: " + App.account_operator);

    if (App.account == App.account_operator) {
      App.account_type = 'operator';
    } else {
      App.account_type = 'player';
    }

    console.log("Account type: " + App.account_type);

    $("#address").html("<strong>Address: </strong>" + App.account);
    $("#balance").html("<strong>Balance: </strong>" + App.balance + " ETH");

    renderUI(account_change);
  },


  //Call the smart contract's function to start a new lottery round
  startNewRound: function () {

    console.log("Inside startNewRound");

    App.contracts["Contract"].deployed().then(async (instance) => {

      try {

        await instance.startNewRound({ from: App.account });
        alert("New lottery round started!");
        console.log("New lottery round started!");
        $("sold_tickets").html("<strong>Amount of Sold Tickets:</strong> 0");
        $("sold_tickets_list").html("<strong>List of Sold Tickets:</strong> - ");

      } catch (error) {
        alert('Impossible to start a new round: the previous one is still running!');
      }

    });
  },


  //Call the smart contract's function to close the lottery round
  closeRound: function () {

    console.log("Inside closeRound");

    App.contracts["Contract"].deployed().then(async (instance) => {

      try {

        await instance.closeRound({ from: App.account });
        alert("Lottery round closed!");

      } catch (error) {
        console.log('Error in closeRound function!');
        alert('Error in closeRound function!');
      }

    });
  },


  //Call the smart contract's function to close the lottery
  closeLottery: function () {

    console.log("Inside closeLottery");

    App.contracts["Contract"].deployed().then(async (instance) => {

      try {

        await instance.resetLotteryRound({ from: App.account });
        alert("Lottery closed!");
        window.location.replace('index.html');

      } catch (error) {
        console.log('Error in closeLottery function!');
        alert('Error in closeLottery function!');
      }
    });
  },


  //Call the smart contract's function to draw the winning numbers
  drawNumbers: function () {

    console.log("Inside drawNumbers");

    App.contracts["Contract"].deployed().then(async (instance) => {

      try {

        await instance.drawNumbers({ from: App.account });
        alert("Winning numbers have been drawn!");
        console.log("Winning numbers have been drawn!");

      } catch (error) {
        console.log('Error in drawNumbers function!');
        alert('Impossible to draw numbers before the end of the lottery round!');
      }
    });
  },


  //Call the smart contract's function to mint new n collectibles
  mint: function () {

    console.log("Inside mint");

    App.contracts["Contract"].deployed().then(async (instance) => {

      try {

        await instance.mint(App.token_to_mint, { from: App.account });
        alert((App.token_to_mint * 8) + " new tokens have been mined!");

      } catch (error) {
        console.log('Error in mint function!');
        alert('Impossible to mint tokens!');
      }
    });
  },


  //Call the smart contract's function to assign prizes to the winners
  givePrizes: function () {

    console.log("Inside givePrizes");

    App.contracts["Contract"].deployed().then(async (instance) => {

      try {

        await instance.givePrizes({ from: App.account });

      } catch (error) {
        console.log('Error in givePrizes function!');
        alert('Impossible to assign prizes: the lottery round is still active!');
      }
    });
  },

  //Call the smart contract's function to buy a ticket
  buy: function () {

    console.log("Inside buy");

    App.contracts["Contract"].deployed().then(async (instance) => {

      try {

        let number1 = document.getElementById("num1").value;
        let number2 = document.getElementById("num2").value;
        let number3 = document.getElementById("num3").value;
        let number4 = document.getElementById("num4").value;
        let number5 = document.getElementById("num5").value;
        let number6 = document.getElementById("num6").value;

        await instance.buy(number1, number2, number3, number4, number5, number6, { from: App.account, value: App.price.toString() });
        alert("Ticket bought!");

      } catch (error) {
        console.log('Error in buy function!');
        alert('Impossible to buy a ticket, please try again!');
      }

      let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      App.balance = await web3.utils.fromWei(await web3.eth.getBalance(accounts[0]));
      $("#balance").html("<strong>Balance:</strong> " + App.balance + " ETH");
    });
  }
}


// Function that retrieve the address of the lottery operator
function getOperator() {

  App.contracts["Contract"].deployed().then(async (instance) => {

    let op = await instance.getLotteryOperator({ from: App.accBalanceOpAfterClosingount });
    App.account_operator = op.toLowerCase();
    App.setAccount(App.account_change);

  });
}


// Function that retrieve the balance of the lottery smart contract
function getLotteryBalance() {

  App.contracts["Contract"].deployed().then(async (instance) => {

    App.lottery_balance = await instance.getLotteryBalance({ from: App.account });
    let eth_balance = Web3.utils.fromWei(App.lottery_balance, 'ether');
    $('#lottery_balance').html("<strong>Lottery Total Balance:</strong> " + eth_balance + " ETH");

  });
}


//Function that retrieve the lottery state
function getLotteryState() {

  console.log('inside getLotteryState');

  App.contracts["Contract"].deployed().then(async (instance) => {

    let res = await instance.getLotteryState({ from: App.account });

    $('#lottery_state').html("<strong>Lottery State:</strong> " + App.lottery_state);
    $('#lottery_state_player').html("<strong>Lottery State:</strong> " + App.lottery_state);

    if (res) {
      App.lottery_state = 'lottery created';
    } else {
      App.lottery_state = 'lottery not created';
    }
  });
}


//Function that retrieve the lottery round
function getLotteryRound() {

  App.contracts["Contract"].deployed().then(async (instance) => {

    App.lottery_round = await instance.getLotteryRound({ from: App.account });
    $('#lottery_round').html("<strong>Lottery Round:</strong> " + App.lottery_round);
    $('#lottery_round_player').html("<strong>Lottery Round:</strong> " + App.lottery_round);

  });
}


//Function that retrieve the lottery round state
function getLotteryRoundState() {

  App.contracts["Contract"].deployed().then(async (instance) => {


    let res = await instance.getLotteryRoundState({ from: App.account });

    App.lottery_round_state = res;

    if (App.lottery_round_state == 0) {
      $("#lottery_round_state").html("<strong>Lottery Round State:</strong> round not started");
      $("#lottery_round_state_player").html("<strong>Lottery Round State:</strong> round not started");
    }

    if (App.lottery_round_state == 1) {
      $("#lottery_round_state").html("<strong>Lottery Round State:</strong> round started");
      $("#lottery_round_state_player").html("<strong>Lottery Round State:</strong> round started");
    }

    if (App.lottery_round_state === 2) {
      $("#lottery_round_state").html("<strong>Lottery Round State:</strong> round finished");
      $("#lottery_round_state_player").html("<strong>Lottery Round State:</strong> round finished");
    }

    if (App.lottery_round_state == 3) {
      $("#lottery_round_state").html("<strong>Lottery Round State:</strong> round closed");
      $("#lottery_round_state_player").html("<strong>Lottery Round State:</strong> round closed");
    }

  });
}


//Function that reset the lottery round after calling closeLottery
function resetLotteryRound() {

  App.contracts["Contract"].deployed().then(async (instance) => {

    await instance.resetLotteryRound({ from: App.account });

  });
}


//Function that retrieve the number of available NFTs
function getNumNFT() {

  App.contracts["Contract"].deployed().then(async (instance) => {

    try {

      let numNFT = await instance.getNumNFT({ from: App.account });
      $('#available_nft').empty();
      $('#available_nft').html("<strong>Amount of available NFTs:</strong> " + numNFT);

    } catch {
      $('#available_nft').html("<strong>Amount of available NFTs:</strong> there are no minted NFTs at the moment!");
    }

  });
}


//Function that retrieve the amount of sold tickets in a lottery round
function getNumTickets() {

  App.contracts["Contract"].deployed().then(async (instance) => {

    try {
      let numTickets = await instance.getNumTickets({ from: App.account });
      $('#sold_tickets').empty();
      $('#sold_tickets').html("<strong>Amount of Sold Tickets:</strong> " + numTickets);
    } catch {
      $('#sold_tickets').html("<strong>Amount of Sold Tickets:</strong> there are no sold tickets at the moment!");
    }

  });
}


//Function that retrieve the list of sold tickets in a lottery round
function getListSoldTickets() {

  console.log('Inside list of sold tickets');

  let res;

  App.contracts["Contract"].deployed().then(async (instance) => {

    try {

      let n = await instance.getNumTickets({ from: App.account });

      $('#sold_tickets_list').empty();
      $('#sold_tickets_list').html("<strong>List of Sold Tickets:</strong><br>");

      if (n > 0) {

        for (let i = 0; i < n; i++) {

          res = await instance.getTicket(i, { from: App.account });

          if (res[2] != 0) {
            $('#sold_tickets_list').append("<br> &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <i>Ticket " + (i + 1) + "</i> ==> Player: " + res[0].toLowerCase() + " - Numbers: " + res[1][0] + " " + res[1][1] + " " + res[1][2] + " " + res[1][3] + " " + res[1][4] + " " + res[2]);
          }
        }

      } else {
        $("#sold_tickets_list").html("<strong>List of Sold Tickets:</strong> - ");
      }

    } catch {
      $('#sold_tickets_list').html("<strong>List of Sold Tickets:</strong> there are no sold tickets at the moment!");
    }

  });
}


//Function that retrieve the amount of bought tickets in a lottery round by a given player
function getNumBoughtTickets() {

  App.contracts["Contract"].deployed().then(async (instance) => {

    try {

      let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      App.account = accounts[0].toLowerCase();

      let numBoughtTickets = await instance.getNumBoughtTickets(App.account, { from: App.account });
      $('#num_tickets').empty();
      $('#num_tickets').html("<strong>Amount of Bought Tickets:</strong> " + numBoughtTickets);
      
    } catch {
      $('#num_tickets').html("<strong>Amount of Bought Tickets:</strong> there are no bought tickets at the moment!");
    }

  });
}


//Function that retrieve the list of bought tickets in a lottery round by a given player
function getListBoughtTickets() {

  console.log('Inside list of bought tickets');

  let res;

  App.contracts["Contract"].deployed().then(async (instance) => {

    try {

      let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      App.account = accounts[0].toLowerCase();

      let n = await instance.getNumTickets({ from: App.account });

      $('#list_tickets').empty();
      $('#list_tickets').html("<strong>List of Bought Tickets:</strong><br>");

      if (n > 0) {

        for (let i = 0; i < n; i++) {

          res = await instance.getTicket(i, { from: App.account });

          if (App.account == res[0].toLowerCase()) {
            $('#list_tickets').append("<br> &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <i>Ticket " + (i + 1) + "</i> ==> " + res[1][0] + " " + res[1][1] + " " + res[1][2] + " " + res[1][3] + " " + res[1][4] + " " + res[2]);
          }
        }

      } else {
        $("#list_tickets").html("<strong>List of Bought Tickets:</strong> - ");
      }

    } catch {
      $('#list_tickets').html("<strong>List of Bought Tickets:</strong> there are no bought tickets at the moment!");
    }
  });
}


//Function that retrieve the winning numbers of a lottery round
function getDrawnNumbers() {

  App.contracts["Contract"].deployed().then(async (instance) => {

    try {

      let drawnNumbers = await instance.getDrawnNumbers({ from: App.account });
      $('#drawn_numbers').empty();
      $('#drawn_numbers_player').empty();

      if (drawnNumbers[0] == 0) {
        $('#drawn_numbers').html("<strong>Drawn Numbers:</strong> - ");
        $('#drawn_numbers_player').html("<strong>Drawn Numbers:</strong> - ");
      } else {
        $('#drawn_numbers').html("<strong>Drawn Numbers:</strong> " + drawnNumbers[0] + " " + drawnNumbers[1] + " " + drawnNumbers[2] + " " + drawnNumbers[3] + " " + drawnNumbers[4] + " " + drawnNumbers[5]);
        $('#drawn_numbers_player').html("<strong>Drawn Numbers:</strong> " + drawnNumbers[0] + " " + drawnNumbers[1] + " " + drawnNumbers[2] + " " + drawnNumbers[3] + " " + drawnNumbers[4] + " " + drawnNumbers[5]);
      }

    } catch {

      console.log('Error getting drawn numbers');
      $('#drawn_numbers').html("<strong>Drawn Numbers:</strong> there are no drawn numbers at the moment!");
      $('#drawn_numbers_player').html("<strong>Drawn Numbers:</strong> there are no drawn numbers at the moment!");

    }
  });
}


//Function that retrieve the amount of assigned prizes in a lottery round
function getNumAssignedPrizes() {

  App.contracts["Contract"].deployed().then(async (instance) => {

    try {

      await instance.getNumAssignedPrizes({ from: App.account });

    } catch {

      console.log('Error getting number of assigned prizes');
    }

  });
}


//Function that retrieve the list of assigned prizes in a lottery round
function getListAssignedPrizes() {

  console.log('Inside list of assigned prizes');

  App.contracts["Contract"].deployed().then(async (instance) => {

    try {

      let n = await instance.getNumAssignedPrizes({ from: App.account });

      $('#assigned_prizes').empty();
      $('#assigned_prizes').html("<strong>Assigned Prizes:</strong><br>");

      if (n > 0) {

        for (let i = 0; i < n; i++) {

          let res = await instance.getAssignedPrize(i, { from: App.account });

          if (res[1] != 0 && res[2] != 0) {
            $('#assigned_prizes').append("<br> &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <i>Player</i>: " + res[0].toLowerCase() + " ==> Prize " + res[2] + " of rank " + res[1]);
          }
        }

      } else {
        $('#assigned_prizes').html("<strong>Assigned Prizes:</strong> - ");
      }

    } catch {

      console.log('Error getting assigned prizes');
      $('#assigned_prizes').html("<strong>Assigned Prizes:</strong> there are no assigned prizes at the moment!");

    }
  });
}


//Function that show the appropriate UI based on the type of account and the action occurred (load/change account)
function renderUI(account_change) {

  console.log("Inside renderUI");

  if (App.account_type == 'operator') {
    document.getElementById("op_interface").style.display = "block";
    document.getElementById("player_interface").style.display = "none";
  }

  if (App.account_type == 'player') {
    document.getElementById("op_interface").style.display = "none";
    document.getElementById("player_interface").style.display = "block";
  }

  if (account_change == true) {
    getLotteryRound();
    getLotteryRoundState();
    getLotteryBalance();
    getNumNFT();
    getNumTickets();
    getListSoldTickets();
    getNumBoughtTickets();
    getListBoughtTickets();
    getListAssignedPrizes();
  }
}


// Call init whenever the window loads
$(function () {
  $(window).on('load', function () {
    App.init();
  });
});
