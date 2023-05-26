// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {ICETH} from "./interfaces/ICETH.sol";

error cETH__InsufficientFunds();
error cETH__TransferFailed();
error cETH__InvalidAmount();

/**
 * @title ETH Wrapper
 * @author Valentine Orga
 * @notice Wraps ETH
 */
contract cETH is ICETH, ERC20 {
  constructor() ERC20("Cloned ETH", "cETH") {}

  function deposit() public payable {
    if (msg.value <= 0) revert cETH__InvalidAmount();
    _mint(msg.sender, msg.value);
    emit ETHDeposited(msg.sender, msg.value);
  }

  function withdraw(uint256 amount) public {
    if (balanceOf(msg.sender) < amount) revert cETH__InsufficientFunds();

    _burn(msg.sender, amount);

    (bool success, ) = msg.sender.call{value: amount}("");

    if (!success) revert cETH__TransferFailed();

    emit ETHWithdrawn(msg.sender, amount);
  }

  receive() external payable {
    deposit();
  }
}
