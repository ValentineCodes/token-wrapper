// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {INativeTokenClone} from "../../interfaces/INativeTokenClone.sol";

error MATICClone__TransferFailed();

/**
 * @title MATIC Cloner
 * @author Valentine Orga
 * @notice Clones MATIC
 */
contract MATICClone is INativeTokenClone, ERC20 {
  constructor() ERC20("MATIC Clone", "MATICc") {}

  function deposit() public payable {
    _mint(msg.sender, msg.value);
  }

  function withdraw(uint256 amount) public {
    _burn(msg.sender, amount);

    (bool success, ) = msg.sender.call{value: amount}("");

    if (!success) revert MATICClone__TransferFailed();
  }

  receive() external payable {
    deposit();
  }
}
