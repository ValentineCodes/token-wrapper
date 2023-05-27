// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IClonedToken {
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
   * @dev ClonedToken must be approved to spend {amount}
   * @param account Address of depositor
   * @param amount Amount to be deposited
   */
  function depositFor(address account, uint256 amount) external;

  /**
   *
   * @notice Allows a user to burn a number of cloned tokens and withdraw the corresponding number of underlying tokens.
   * @param account Address of withdrawer
   * @param amount Amount to withdraw
   */
  function withdrawTo(address account, uint256 amount) external;

  /**
   *
   * @notice Mints cloned token to cover any underlyingTokens that would have been transferred by mistake.
   * @dev Can only be called by cToken owner
   * @param account Address of asset owner
   */
  function recover(address account) external;
}
