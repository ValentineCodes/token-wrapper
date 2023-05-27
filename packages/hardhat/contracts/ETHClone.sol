// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {IETHClone} from "./interfaces/IETHClone.sol";

error ETHClone__TransferFailed();

/**
 * @title ETH Cloner
 * @author Valentine Orga
 * @notice Clones ETH
 */
contract ETHClone is IETHClone, ERC20 {
  constructor() ERC20("ETH Clone", "ETHc") {}

  function deposit() public payable {
    _mint(msg.sender, msg.value);
  }

  function withdraw(uint256 amount) public {
    _burn(msg.sender, amount);

    (bool success, ) = msg.sender.call{value: amount}("");

    if (!success) revert ETHClone__TransferFailed();
  }

  receive() external payable {
    deposit();
  }
}
