// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface ITokenCloner {
  /**
   * @notice Emitted when a cloned token is generated
   * @param cToken Address of cloned token
   */
  event CloneCreated(address cToken);

  /**
   *
   * @notice Creates a new cloned token
   * @dev Restricted to contract owner
   * @param underlyingToken Address of underlying token
   * @param name Name of cloned token
   * @param symbol Symbol of cloned token
   */
  function createClone(address underlyingToken, string calldata name, string calldata symbol) external;

  /**
   *
   * @notice Specifies if token has been cloned
   * @param underlyingToken Address of underlying token
   * @return `true` if token has been cloned and `false` otherwise
   */
  function hasToken(address underlyingToken) external view returns (bool);

  /**
   *
   * @notice Specifies if name has been used
   * @param name Name of cloned token
   * @return `true` if name has been used and `false` otherwise
   */
  function hasName(string calldata name) external view returns (bool);

  /**
   *
   * @notice Specifies if symbol has been used
   * @param symbol Symbol of cloned token
   * @return `true` if symbol has been used and `false` otherwise
   */
  function hasSymbol(string calldata symbol) external view returns (bool);
}
