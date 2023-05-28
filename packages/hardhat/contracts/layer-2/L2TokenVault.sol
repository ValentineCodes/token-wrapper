// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

error L2TokenVault__TransferFailed();
error L2TokenVault__ZeroAddress();
error L2TokenVault__InsufficientFunds();
error L2TokenVault__InsufficientAmount();
error L2TokenVault__InsufficientFees();
error L2TokenVault__NonceAlreadyProcessed();

contract L2TokenVault is Ownable {
  event Transfer(address to, uint256 amount);
  event Deposit(address depositor, uint256 amount, uint256 nonce);

  uint256 private constant DEPOSIT_FEE = 0.01 ether;
  uint256 private s_fees;
  uint256 public nonce;

  mapping(address owner => uint256 amount) private s_balances;
  mapping(address owner => mapping(uint256 nonce => bool)) private s_processedNonce;

  function transfer(address to, uint256 amount, uint256 otherChainNonce) public onlyOwner {
    if (to == address(0)) revert L2TokenVault__ZeroAddress();
    if (s_processedNonce[to][otherChainNonce]) revert L2TokenVault__NonceAlreadyProcessed();

    s_processedNonce[to][otherChainNonce] = true;

    uint256 toBalance = s_balances[to];

    if (toBalance < amount) revert L2TokenVault__InsufficientFunds();

    unchecked {
      s_balances[to] = toBalance - amount;
    }

    (bool success, ) = payable(to).call{value: amount}("");
    if (!success) revert L2TokenVault__TransferFailed();

    emit Transfer(to, amount);
  }

  function withdrawFees() public {
    uint256 fees = s_fees;

    if (fees == 0) revert L2TokenVault__InsufficientFees();

    s_fees = 0;

    address owner = owner();

    (bool success, ) = owner.call{value: fees}("");
    if (!success) revert L2TokenVault__TransferFailed();

    emit Transfer(owner, fees);
  }

  function balanceOf(address owner) public view returns (uint256) {
    return s_balances[owner];
  }

  function getFees() public view returns (uint256) {
    return s_fees;
  }

  receive() external payable {
    if (msg.value <= DEPOSIT_FEE) revert L2TokenVault__InsufficientAmount();

    uint256 amount = msg.value - DEPOSIT_FEE;

    s_fees += DEPOSIT_FEE;
    s_balances[msg.sender] += amount;

    nonce++;

    emit Deposit(msg.sender, amount, nonce);
  }
}
