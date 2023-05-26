// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ICETH is IERC20 {
  /**
   *
   * @notice Emitted ETH is deposited
   * @param owner Address of depositor
   * @param amount Amount deposited
   */
  event ETHDeposited(address indexed owner, uint256 indexed amount);

  /**
   *
   * @notice Emitted ETH is withdrawn
   * @param owner Address of withdrawer
   * @param amount Amount withdrawn
   */
  event ETHWithdrawn(address indexed owner, uint256 indexed amount);

  function deposit() external payable;

  function withdraw(uint256 amount) external;
}
