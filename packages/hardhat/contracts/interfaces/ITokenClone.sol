// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface ITokenClone {
  /**
   *
   * @notice Emitted when an amount deposited by mistake is recovered
   * @param account Address of depositor
   * @param amount Amount recovered
   */
  event DepositRecovered(address account, uint256 amount);

  /**
   *
   * @notice Allows a user to deposit underlying tokens and mint the corresponding number of cloned tokens.
   * @dev TokenClone must be approved to spend {amount}
   * @param amount Amount to be deposited
   * @return `true` if deposit is successful and `false` otherwise
   */
  function deposit(uint256 amount) external returns (bool);

  /**
   *
   * @notice Allows a user to burn a number of cloned tokens and withdraw the corresponding number of underlying tokens.
   * @param amount Amount to withdraw
   * @return `true` if withdrawal is successful and `false` otherwise
   */
  function withdraw(uint256 amount) external returns (bool);

  /**
   *
   * @notice Mints cloned token to cover any underlyingTokens that would have been transferred by mistake.
   * @dev Can only be called by cToken owner
   * @param account Address of asset owner
   * @return Amount recovered
   */
  function recover(address account) external returns (uint256);
}
