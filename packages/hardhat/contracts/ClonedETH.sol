// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {IClonedETH} from "./interfaces/IClonedETH.sol";

error ClonedETH__TransferFailed();

/**
 * @title ETH Wrapper
 * @author Valentine Orga
 * @notice Wraps ETH
 */
contract ClonedETH is IClonedETH, ERC20 {
  constructor() ERC20("Cloned ETH", "ClonedETH") {}

  function deposit() public payable {
    _mint(msg.sender, msg.value);
    emit ETHDeposited(msg.sender, msg.value);
  }

  function withdraw(uint256 amount) public {
    _burn(msg.sender, amount);

    (bool success, ) = msg.sender.call{value: amount}("");

    if (!success) revert ClonedETH__TransferFailed();

    emit ETHWithdrawn(msg.sender, amount);
  }

  receive() external payable {
    deposit();
  }
}
