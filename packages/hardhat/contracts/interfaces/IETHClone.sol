// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IETHClone is IERC20 {
  /**
   *
   * @notice Receives ETH deposit and mints it's equivalent in ETHClone
   */
  function deposit() external payable;

  /**
   *
   * @notice Transfers {amount} to owner and burns it's equivalent in ETHClone
   * @param amount Amount to withdraw
   */
  function withdraw(uint256 amount) external;
}
