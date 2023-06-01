// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {INativeTokenClone} from "../interfaces/INativeTokenClone.sol";

error NativeTokenClone__TransferFailed();

/**
 * @title Native Token Cloner
 * @author Valentine Orga
 * @notice Clones Native Tokens
 */
contract NativeTokenClone is INativeTokenClone, ERC20 {
  constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

  function deposit() public payable {
    _mint(msg.sender, msg.value);
  }

  function withdraw(uint256 amount) public {
    _burn(msg.sender, amount);

    (bool success, ) = msg.sender.call{value: amount}("");

    if (!success) revert NativeTokenClone__TransferFailed();
  }

  receive() external payable {
    deposit();
  }
}
